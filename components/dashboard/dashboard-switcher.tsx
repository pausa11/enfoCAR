"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User } from "lucide-react";

interface DashboardSwitcherProps {
    businessDashboard: React.ReactNode;
    personalDashboard: React.ReactNode;
    hasBusinessVehicles: boolean;
    hasPersonalVehicles: boolean;
}

export function DashboardSwitcher({
    businessDashboard,
    personalDashboard,
    hasBusinessVehicles,
    hasPersonalVehicles,
}: DashboardSwitcherProps) {
    // Default to business if available, otherwise personal
    const defaultTab = hasBusinessVehicles ? "business" : "personal";
    const [activeTab, setActiveTab] = useState(defaultTab);

    // If only one type exists, show it directly without tabs
    // if (hasBusinessVehicles && !hasPersonalVehicles) {
    //     return <>{businessDashboard}</>;
    // }

    // if (!hasBusinessVehicles && hasPersonalVehicles) {
    //     return <>{personalDashboard}</>;
    // }

    // If neither exists, show business dashboard (empty state)
    // if (!hasBusinessVehicles && !hasPersonalVehicles) {
    //     return <>{businessDashboard}</>;
    // }

    // Both types exist, show tabs
    return (
        <Tabs id="dashboard-tabs" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
                <TabsTrigger
                    value="business"
                    className="gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-800 dark:data-[state=active]:text-emerald-100 data-[state=active]:border-emerald-400 dark:data-[state=active]:border-emerald-600 transition-all duration-300"
                >
                    <Briefcase className="h-4 w-4" />
                    <span><span className="hidden sm:inline">Vehículos de </span>Negocio</span>
                </TabsTrigger>
                <TabsTrigger
                    value="personal"
                    className="gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-800 dark:data-[state=active]:text-blue-100 data-[state=active]:border-blue-400 dark:data-[state=active]:border-blue-600 transition-all duration-300"
                >
                    <User className="h-4 w-4" />
                    <span><span className="hidden sm:inline">Vehículos </span>Personales</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="mt-0">
                {businessDashboard}
            </TabsContent>

            <TabsContent value="personal" className="mt-0">
                {personalDashboard}
            </TabsContent>
        </Tabs>
    );
}
