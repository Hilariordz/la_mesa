// ============================================
// SISTEMA DE DATOS OFFLINE
// LocalStorage, Cola de Sincronización y Cache
// ============================================

const PENDING_QUEUE_KEY = 'eterna-huella-pending-queue';
const LOCAL_DATA_PREFIX = 'eterna-huella-data-';

// ---------- OPERACIONES CON LOCALSTORAGE ----------

export const localData = {
  set: <T>(key: string, data: T): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(`${LOCAL_DATA_PREFIX}${key}`, JSON.stringify({ data, timestamp: Date.now() }));
      return true;
    } catch (error) {
      console.error('Error guardando datos locales:', error);
      return false;
    }
  },

  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`${LOCAL_DATA_PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item).data as T;
    } catch {
      return null;
    }
  },

  getWithMeta: <T>(key: string): { data: T; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`${LOCAL_DATA_PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item);
    } catch {
      return null;
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${LOCAL_DATA_PREFIX}${key}`);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LOCAL_DATA_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  getUsedSpace: (): number => {
    if (typeof window === 'undefined') return 0;
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LOCAL_DATA_PREFIX)) total += localStorage.getItem(key)?.length || 0;
    }
    return total;
  },
};

// ---------- COLA DE OPERACIONES PENDIENTES ----------

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  docId?: string;
  data?: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

export const pendingQueue = {
  add: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): string => {
    const queue = pendingQueue.getAll();
    const id = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    queue.push({ ...operation, id, timestamp: Date.now(), retries: 0 });
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    return id;
  },

  getAll: (): PendingOperation[] => {
    if (typeof window === 'undefined') return [];
    try {
      const queue = localStorage.getItem(PENDING_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  },

  remove: (id: string): void => {
    const queue = pendingQueue.getAll().filter(op => op.id !== id);
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  },

  incrementRetries: (id: string): void => {
    const queue = pendingQueue.getAll().map(op =>
      op.id === id ? { ...op, retries: op.retries + 1 } : op
    );
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  },

  cleanup: (maxAge = 7 * 24 * 60 * 60 * 1000, maxRetries = 5): void => {
    const now = Date.now();
    const queue = pendingQueue.getAll().filter(op =>
      (now - op.timestamp) < maxAge && op.retries < maxRetries
    );
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  },

  count: (): number => pendingQueue.getAll().length,

  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PENDING_QUEUE_KEY);
  },
};

// ---------- SINCRONIZACIÓN ----------

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export const syncPendingOperations = async (
  handler: (operation: PendingOperation) => Promise<boolean>
): Promise<SyncResult> => {
  const operations = pendingQueue.getAll();
  const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

  for (const operation of operations) {
    try {
      const success = await handler(operation);
      if (success) {
        pendingQueue.remove(operation.id);
        result.synced++;
      } else {
        pendingQueue.incrementRetries(operation.id);
        result.failed++;
        result.success = false;
      }
    } catch (error) {
      pendingQueue.incrementRetries(operation.id);
      result.failed++;
      result.success = false;
      result.errors.push({
        id: operation.id,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  pendingQueue.cleanup();
  return result;
};

// ---------- HELPER: DATOS CON FALLBACK ----------

export const fetchWithOfflineFallback = async <T>(
  key: string,
  remoteFetch: () => Promise<T>,
  options: { cacheTime?: number; forceRefresh?: boolean } = {}
): Promise<{ data: T | null; source: 'remote' | 'local' | 'none'; stale: boolean }> => {
  const { cacheTime = 5 * 60 * 1000, forceRefresh = false } = options;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = localData.getWithMeta<T>(key);
    if (cached) {
      return { data: cached.data, source: 'local', stale: Date.now() - cached.timestamp > cacheTime };
    }
    return { data: null, source: 'none', stale: true };
  }

  if (!forceRefresh) {
    const cached = localData.getWithMeta<T>(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return { data: cached.data, source: 'local', stale: false };
    }
  }

  try {
    const data = await remoteFetch();
    localData.set(key, data);
    return { data, source: 'remote', stale: false };
  } catch {
    const cached = localData.getWithMeta<T>(key);
    if (cached) return { data: cached.data, source: 'local', stale: true };
    return { data: null, source: 'none', stale: true };
  }
};

// ---------- HELPER: OPERACIÓN CON RETRY OFFLINE ----------

export const executeWithOfflineQueue = async <T>(
  operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>,
  execute: () => Promise<T>
): Promise<{ success: boolean; queued: boolean; result?: T }> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    pendingQueue.add(operation);
    return { success: false, queued: true };
  }

  try {
    const result = await execute();
    return { success: true, queued: false, result };
  } catch {
    pendingQueue.add(operation);
    return { success: false, queued: true };
  }
};
