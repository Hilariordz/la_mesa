'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import {
  localData,
  pendingQueue,
  fetchWithOfflineFallback,
  executeWithOfflineQueue,
  type PendingOperation,
} from '../offline-data';

// ---------- useOfflineData ----------

interface UseOfflineDataOptions<T> {
  key: string;
  initialData?: T;
  cacheTime?: number;
  fetcher?: () => Promise<T>;
}

interface UseOfflineDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  source: 'remote' | 'local' | 'none';
  error: Error | null;
  refetch: () => Promise<void>;
  setData: (data: T) => void;
}

export function useOfflineData<T>({
  key,
  initialData,
  cacheTime = 5 * 60 * 1000,
  fetcher,
}: UseOfflineDataOptions<T>): UseOfflineDataReturn<T> {
  const { isOnline } = useOnlineStatus();
  const [data, setDataState] = useState<T | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [source, setSource] = useState<'remote' | 'local' | 'none'>('none');
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!fetcher) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWithOfflineFallback(key, fetcher, { cacheTime, forceRefresh });
      setDataState(result.data);
      setSource(result.source);
      setIsStale(result.stale);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cacheTime]);

  useEffect(() => {
    const cached = localData.get<T>(key);
    if (cached) {
      setDataState(cached);
      setSource('local');
    }
    fetchData();
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isOnline && isStale && fetcher) fetchData(true);
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const setData = useCallback((newData: T) => {
    setDataState(newData);
    localData.set(key, newData);
    setSource('local');
  }, [key]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, isLoading, isStale, source, error, refetch, setData };
}

// ---------- useOfflineMutation ----------

interface UseOfflineMutationOptions<T> {
  collection: string;
  createFn?: (data: T) => Promise<void>;
  updateFn?: (docId: string, data: T) => Promise<void>;
  deleteFn?: (docId: string) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseOfflineMutationReturn<T> {
  mutate: (data: T, docId?: string) => Promise<{ success: boolean; queued: boolean }>;
  remove: (docId: string) => Promise<{ success: boolean; queued: boolean }>;
  isLoading: boolean;
  pendingCount: number;
}

export function useOfflineMutation<T extends Record<string, unknown>>(
  options: UseOfflineMutationOptions<T>
): UseOfflineMutationReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setPendingCount(pendingQueue.count());
  }, []);

  const mutate = useCallback(async (data: T, docId?: string) => {
    setIsLoading(true);
    const operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'> = {
      type: docId ? 'update' : 'create',
      collection: options.collection,
      docId,
      data,
    };
    try {
      const result = await executeWithOfflineQueue(operation, async () => {
        if (docId && options.updateFn) await options.updateFn(docId, data);
        else if (options.createFn) await options.createFn(data);
      });
      if (result.success) options.onSuccess?.();
      setPendingCount(pendingQueue.count());
      return result;
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Error'));
      return { success: false, queued: true };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const remove = useCallback(async (docId: string) => {
    setIsLoading(true);
    const operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'> = {
      type: 'delete',
      collection: options.collection,
      docId,
    };
    try {
      const result = await executeWithOfflineQueue(operation, async () => {
        if (options.deleteFn) await options.deleteFn(docId);
      });
      if (result.success) options.onSuccess?.();
      setPendingCount(pendingQueue.count());
      return result;
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Error'));
      return { success: false, queued: true };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return { mutate, remove, isLoading, pendingCount };
}

export { useOnlineStatus } from './useOnlineStatus';
