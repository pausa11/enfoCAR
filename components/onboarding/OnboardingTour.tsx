"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter, usePathname } from "next/navigation";
import { tourChapters } from "./tour-steps";

export function OnboardingTour() {
    const driverObj = useRef<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initTour = async () => {
            // 1. Check if global onboarding is done
            const { getOnboardingStatus, completeOnboardingAction } = await import("@/app/actions/user");
            const status = await getOnboardingStatus();

            if (status.hasCompletedOnboarding && !localStorage.getItem("manual-tour-active")) {
                return;
            }

            // 2. Find current chapter based on path
            const currentChapter = tourChapters.find(c => c.path === pathname);

            if (!currentChapter) return;

            // 3. Configure Driver
            driverObj.current = driver({
                showProgress: true,
                steps: currentChapter.steps as any,
                animate: true,
                allowClose: true,
                doneBtnText: currentChapter.nextRoute ? "Siguiente Sección →" : "¡Terminar Tour!",
                nextBtnText: "Siguiente",
                prevBtnText: "Atrás",
                onDestroyStarted: async () => {
                    const isLastStep = !driverObj.current.hasNextStep();

                    if (isLastStep) {
                        driverObj.current.destroy();

                        if (currentChapter.nextRoute) {
                            // Navigate to next chapter
                            router.push(currentChapter.nextRoute);
                        } else {
                            // Final chapter finished
                            await completeOnboardingAction();
                            localStorage.removeItem("manual-tour-active");
                            window.dispatchEvent(new Event("onboarding-completed-event")); // Optional: for UI updates
                        }
                    } else {
                        // User clicked "X" or clicked out
                        if (confirm("¿Quieres salir del tour? Podrás reiniciarlo desde el menú.")) {
                            // If it was a manual run, just clear the flag
                            localStorage.removeItem("manual-tour-active");
                            // If it was auto-run, we might want to mark as skipped or just let it reappear
                            // For now, let's say skipping marks it as done to not annoy? 
                            // Or maybe just destroy and it will come back on refresh until completed.
                            // User request says "Un solo flag". Let's assume skipping = done to be safe/annoyance-free, 
                            // OR we can leave it false so it prompts again. 
                            // Let's mark as done to avoid getting stuck if they really hate it.
                            if (!localStorage.getItem("manual-tour-active")) {
                                await completeOnboardingAction();
                            }
                            driverObj.current.destroy();
                        }
                    }
                },
            });

            setTimeout(() => {
                driverObj.current.drive();
            }, 1000);
        };

        initTour();

        // Manual Restart Handler
        const handleRestart = () => {
            localStorage.setItem("manual-tour-active", "true");
            // Start from the beginning
            if (pathname !== "/app") {
                router.push("/app");
            } else {
                window.location.reload(); // Simple reload to trigger the effect again on the Dashboard
            }
        };

        window.addEventListener("restart-onboarding", handleRestart);
        return () => {
            window.removeEventListener("restart-onboarding", handleRestart);
            if (driverObj.current) driverObj.current.destroy();
        };

    }, [pathname, router]);

    return null;
}

// Helper to trigger the tour manually
export const restartOnboarding = () => {
    window.dispatchEvent(new Event("restart-onboarding"));
};
