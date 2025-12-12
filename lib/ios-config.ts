/**
 * iOS Detection and PWA Utilities
 */

export function isIOS(): boolean {
    if (typeof window === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isInStandaloneMode(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
}

export function isSafari(): boolean {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
}

export function canInstallPWA(): boolean {
    if (typeof window === "undefined") return false;

    // Already installed
    if (isInStandaloneMode()) return false;

    // iOS can always "install" via Add to Home Screen
    if (isIOS()) return true;

    // Android/Desktop will trigger beforeinstallprompt
    return true;
}

export function getIOSVersion(): number | null {
    if (!isIOS()) return null;

    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match ? parseInt(match[1], 10) : null;
}

export function supportsServiceWorker(): boolean {
    if (typeof window === "undefined") return false;
    return "serviceWorker" in navigator;
}

export function isPWAInstalled(): boolean {
    return isInStandaloneMode();
}

/**
 * Get optimal viewport configuration for iOS
 */
export function getIOSViewportConfig() {
    return {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: "cover",
    };
}

/**
 * Check if the device supports PWA features
 */
export function getPWACapabilities() {
    return {
        serviceWorker: supportsServiceWorker(),
        notifications: "Notification" in window,
        pushManager: "PushManager" in window,
        standalone: isInStandaloneMode(),
        installable: canInstallPWA(),
        ios: isIOS(),
        safari: isSafari(),
    };
}
