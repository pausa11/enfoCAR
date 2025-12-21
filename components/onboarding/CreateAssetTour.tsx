"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { createAssetSteps } from "./create-asset-steps";

export function CreateAssetTour() {
    const driverObj = useRef<any>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { getOnboardingStatus, completeAssetOnboardingAction } = await import("@/app/actions/user");
                const status = await getOnboardingStatus();

                if (!status.hasCompletedAssetOnboarding) {
                    driverObj.current = driver({
                        showProgress: true,
                        steps: createAssetSteps as any,
                        animate: true,
                        allowClose: true,
                        doneBtnText: "¡Entendido!",
                        nextBtnText: "Siguiente",
                        prevBtnText: "Atrás",
                        onDestroyStarted: () => {
                            if (!driverObj.current.hasNextStep() || confirm("¿Seguro que quieres saltar la ayuda?")) {
                                completeAssetOnboardingAction(); // Update DB
                                driverObj.current.destroy();
                            }
                        },
                    });

                    setTimeout(() => {
                        driverObj.current.drive();
                    }, 1000);
                }
            } catch (error) {
                console.error("Error checking asset onboarding status:", error);
            }
        };

        checkStatus();
    }, []);

    return null;
}
