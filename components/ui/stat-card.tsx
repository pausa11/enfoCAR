import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    colorClass: string;
    bgClass: string;
    delay?: number;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    colorClass,
    bgClass,
}: StatCardProps) {
    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-transparent hover:-translate-y-1"
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${bgClass}`} />

            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${bgClass} bg-opacity-10 dark:bg-opacity-20`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${colorClass}`}>
                            {value}
                        </span>
                    </div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground/80 mt-1 font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
