'use client';

import { useState, useEffect } from 'react';

// VAPID public key — needs to be generated and set in env
// For now uses a placeholder — user must add NEXT_PUBLIC_VAPID_KEY to Vercel
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || '';

// Motivational messages that rotate
const WALL_NUDGES = [
  "Someone just turned their darkest moment into light on the Wall. 🔥",
  "You're not alone right now. The Wall has new miracles waiting.",
  "3AM thoughts hitting hard? The Guardian is always on. No judgment.",
  "Someone who felt like you do right now just shared something real. Come see.",
  "You showed up today. That's everything. The Wall sees you. 🌑→🌟",
  "New shadows turned miracles on the Wall. Real humans, real stories.",
  "Your silence is valid. But so is your voice. The Wall is here.",
];

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);
    if (Notification.permission === 'granted') setSubscribed(true);

    // Show prompt after 30 seconds on first visit
    const seen = localStorage.getItem('ryvynn-push-prompted');
    if (!seen && Notification.permission === 'default') {
      setTimeout(() => setShowing(true), 30000);
    }
  }, []);

  const subscribe = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') { setShowing(false); return; }

      // Register service worker
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (VAPID_KEY) {
          await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
          });
        }
      }
      setSubscribed(true);
      setShowing(false);
      localStorage.setItem('ryvynn-push-prompted', 'true');

      // Send a welcome notification immediately
      if (Notification.permission === 'granted') {
        new Notification('🔥 RYVYNN', {
          body: "You're in. We'll remind you when something real happens on the Wall.",
          icon: '/assets/dual-flame-logo.png',
          badge: '/assets/dual-flame-logo.png',
        });
      }
    } catch (err) {
      console.error('Push subscription failed:', err);
      setShowing(false);
    }
  };

  const dismiss = () => {
    setShowing(false);
    localStorage.setItem('ryvynn-push-prompted', 'true');
  };

  // Also expose a method to send local notifications (no server needed)
  // Called from other components when wall updates etc.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as Window & { ryvynnNotify?: (msg: string) => void }).ryvynnNotify = (msg: string) => {
      if (Notification.permission === 'granted') {
        new Notification('🔥 RYVYNN', {
          body: msg,
          icon: '/assets/dual-flame-logo.png',
        });
      }
    };
  }, []);

  if (!showing || subscribed) return null;

  return (
    <div className="fixed bottom-40 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-gray-900 border-2 border-ryvynn-purple rounded-2xl p-4 shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="text-3xl">🔥</span>
        <div className="flex-1">
          <p className="font-bold text-white text-sm mb-1">Stay connected to the flame</p>
          <p className="text-xs text-gray-400 mb-3">
            Get notified when new miracles land on the Wall or when it&apos;s time to check in. No spam — only what matters.
          </p>
          <div className="flex gap-2">
            <button onClick={subscribe} className="flex-1 py-2 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white text-xs font-bold hover:opacity-90 transition-all">
              Yes, notify me
            </button>
            <button onClick={dismiss} className="px-3 py-2 bg-gray-800 rounded-xl text-gray-400 text-xs hover:bg-gray-700 transition-all">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export nudge messages for use elsewhere
export { WALL_NUDGES };
