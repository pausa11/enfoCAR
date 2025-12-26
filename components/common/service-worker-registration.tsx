'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw-custom.js')
                .then((registration) => {
                    console.log('[SW] Service Worker registered:', registration);
                })
                .catch((error) => {
                    console.error('[SW] Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}
