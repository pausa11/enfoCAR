"use client";

import { restartOnboarding } from "@/components/onboarding/OnboardingTour";
import { RotateCw } from "lucide-react";

export function RestartTourButton() {
    return (
        <button
            onClick={restartOnboarding}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors border border-transparent hover:border-foreground/10"
            aria-label="Reiniciar tour de bienvenida"
        >
            <RotateCw className="w-4 h-4" />
            <span>Reiniciar Tour</span>
        </button>
    );
}
