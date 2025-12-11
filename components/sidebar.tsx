"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import { Home, LayoutDashboard, Package, Menu, X, ChevronLeft, ChevronRight, } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
    {
        name: "Inicio",
        href: "/",
        icon: Home,
    },
    {
        name: "Panel de Control",
        href: "/app",
        icon: LayoutDashboard,
    },
    {
        name: "Activos",
        href: "/app/activos",
        icon: Package,
    },
];

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsExpanded(!isExpanded);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            <Button id="sidebar-toggle" variant="ghost" size="icon" className="fixed top-4 left-4 z-50 lg:hidden" onClick={toggleMobileSidebar} >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            <aside id="sidebar" className={cn("fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 flex flex-col", isExpanded ? "w-64" : "w-16", "translate-x-0 max-lg:-translate-x-full", isMobileOpen && "max-lg:translate-x-0")} >

                <div id="sidebar-header" className="h-16 flex items-center justify-between px-4 border-b border-border">
                    {isExpanded && (
                        <Link href="/" className="text-xl font-bold">
                            enfoCAR
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="hidden lg:flex ml-auto"
                    >
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </Button>
                </div>

                <nav id="sidebar-nav" className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                            !isExpanded && "justify-center"
                                        )}
                                    >
                                        <Icon size={20} />
                                        {isExpanded && <span>{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div id="sidebar-footer" className="border-t border-border p-4 space-y-4">
                    <div className={cn("flex items-center", !isExpanded && "justify-center")}>
                        <ThemeSwitcher />
                        {isExpanded && <span className="ml-2 text-sm text-muted-foreground">Tema</span>}
                    </div>
                    <div className={cn(!isExpanded && "flex justify-center")}>
                        <AuthButton />
                    </div>
                </div>

            </aside>

            <div id="sidebar-spacer" className={cn("transition-all duration-300 hidden lg:block", isExpanded ? "w-64" : "w-16")} />
        </>
    );
}
