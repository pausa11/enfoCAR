"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Detect if already installed (standalone mode)
        const standalone = window.matchMedia("(display-mode: standalone)").matches;
        setIsStandalone(standalone);

        // Android install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Don't show if already dismissed in this session
            const dismissed = sessionStorage.getItem("pwa-install-dismissed");
            if (!dismissed) {
                setShowInstallPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // For iOS, show prompt after a delay if not installed
        if (iOS && !standalone) {
            const dismissed = sessionStorage.getItem("pwa-install-dismissed");
            if (!dismissed) {
                setTimeout(() => {
                    setShowInstallPrompt(true);
                }, 3000); // Show after 3 seconds
            }
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        sessionStorage.setItem("pwa-install-dismissed", "true");
    };

    // Don't show if already installed
    if (isStandalone) return null;

    // Don't show if dismissed
    if (!showInstallPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-lg shadow-2xl p-4 border border-primary-foreground/20">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Instalar enfoCAR</h3>
                            <p className="text-sm text-primary-foreground/80">
                                {isIOS ? "Agregar a pantalla de inicio" : "Instalar como aplicación"}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="text-primary-foreground hover:bg-white/10 -mt-1 -mr-1"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {isIOS ? (
                    <div className="space-y-3 text-sm">
                        <p className="text-primary-foreground/90">
                            Para instalar esta app en tu iPhone/iPad:
                        </p>
                        <ol className="space-y-2 text-primary-foreground/80">
                            <li className="flex items-start gap-2">
                                <span className="font-semibold min-w-[20px]">1.</span>
                                <span>
                                    Toca el botón <Share className="w-4 h-4 inline mx-1" /> <strong>Compartir</strong> en la barra inferior
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold min-w-[20px]">2.</span>
                                <span>
                                    Selecciona <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold min-w-[20px]">3.</span>
                                <span>Toca <strong>&quot;Agregar&quot;</strong></span>
                            </li>
                        </ol>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-primary-foreground/90">
                            Accede más rápido y usa la app sin conexión
                        </p>
                        <Button
                            onClick={handleInstallClick}
                            className="w-full bg-white text-primary hover:bg-white/90 font-semibold"
                            size="lg"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Instalar Ahora
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
