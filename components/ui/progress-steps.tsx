import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    number: number;
    title: string;
    description?: string;
}

interface ProgressStepsProps {
    steps: Step[];
    currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
    return (
        <div className="w-full py-6">
            {/* Mobile: Simple text indicator */}
            <div className="md:hidden text-center mb-4">
                <p className="text-sm text-muted-foreground">
                    Paso {currentStep} de {steps.length}
                </p>
                <p className="font-medium">{steps[currentStep - 1].title}</p>
            </div>

            {/* Desktop: Full progress indicator */}
            <div className="hidden md:block">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;
                        const isUpcoming = stepNumber > currentStep;

                        return (
                            <React.Fragment key={step.number}>
                                {/* Step Circle */}
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                            isCompleted && "bg-green-500 border-green-500 text-white",
                                            isCurrent && "bg-blue-500 border-blue-500 text-white",
                                            isUpcoming && "bg-muted border-muted-foreground/30 text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <span className="font-semibold">{stepNumber}</span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p
                                            className={cn(
                                                "text-sm font-medium",
                                                (isCompleted || isCurrent) && "text-foreground",
                                                isUpcoming && "text-muted-foreground"
                                            )}
                                        >
                                            {step.title}
                                        </p>
                                        {step.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "h-0.5 flex-1 mx-2 transition-all",
                                            stepNumber < currentStep ? "bg-green-500" : "bg-muted"
                                        )}
                                        style={{ marginTop: "-2rem" }}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

import React from "react";
