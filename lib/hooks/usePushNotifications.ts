'use client';

import { useState, useEffect, useCallback } from 'react';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

interface UsePushNotificationsReturn {
  permission: NotificationPermissionState;
  isSupported: boolean;
  isSubscribed: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendLocalNotification: (title: string, options?: NotificationOptions) => void;
}

async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 5000)),
    ]) as ServiceWorkerRegistration;
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission as NotificationPermissionState);
    getSWRegistration().then((reg) => {
      if (!reg) return;
      reg.pushManager.getSubscription().then((sub) => setIsSubscribed(!!sub));
    });
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    return result === 'granted';
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    let perm = permission;
    if (perm !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
      perm = 'granted';
    }

    const reg = await getSWRegistration();
    if (!reg) return false;

    try {
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      // Registrar en el servidor
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
            auth: arrayBufferToBase64(sub.getKey('auth')!),
          },
          isAdmin: false,
        }),
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Error al suscribir push:', err);
      return false;
    }
  }, [isSupported, permission, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    const reg = await getSWRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) { setIsSubscribed(false); return true; }
    const result = await sub.unsubscribe();
    if (result) setIsSubscribed(false);
    return result;
  }, []);

  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    getSWRegistration().then((reg) => {
      if (reg) {
        reg.showNotification(title, { icon: '/lamesaicon.jpg', badge: '/lamesaicon.jpg', ...options });
      } else {
        new Notification(title, options);
      }
    });
  }, [isSupported, permission]);

  return { permission, isSupported, isSubscribed, requestPermission, subscribe, unsubscribe, sendLocalNotification };
}
