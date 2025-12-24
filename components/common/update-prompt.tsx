"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpdatePrompt() {
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            return;
        }

        const handleControllerChange = () => {
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

        const checkForUpdates = async () => {
            const registration = await navigator.serviceWorker.getRegistration();

            if (!registration) return;

            // Check if there's a waiting service worker
            if (registration.waiting) {
                setWaitingWorker(registration.waiting);
                setShowUpdatePrompt(true);
            }

            // Listen for new service worker installing
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;

                if (!newWorker) return;

                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                        setWaitingWorker(newWorker);
                        setShowUpdatePrompt(true);
                    }
                });
            });
        };

        checkForUpdates();

        // Check for updates every 60 seconds
        const interval = setInterval(checkForUpdates, 60000);

        return () => {
            clearInterval(interval);
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        };
    }, []);

    const handleUpdate = () => {
        if (!waitingWorker) return;

        // Tell the waiting service worker to skip waiting
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
        setShowUpdatePrompt(false);
    };

    const handleDismiss = () => {
        setShowUpdatePrompt(false);
    };

    if (!showUpdatePrompt) return null;

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-5 duration-500">
            <div className="bg-gradient-to-br from-accent to-accent/90 text-accent-foreground rounded-lg shadow-2xl p-4 border border-accent-foreground/20">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Nueva versión disponible</h3>
                            <p className="text-sm text-accent-foreground/80">
                                Actualiza para obtener las últimas mejoras
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="text-accent-foreground hover:bg-white/10 -mt-1 -mr-1"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleUpdate}
                        className="flex-1 bg-white text-accent hover:bg-white/90 font-semibold"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button
                        onClick={handleDismiss}
                        variant="ghost"
                        className="text-accent-foreground hover:bg-white/10"
                    >
                        Después
                    </Button>
                </div>
            </div>
        </div>
    );
}
