"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import { Home, LayoutDashboard, Car, Menu, X, ChevronLeft, ChevronRight, DollarSign, } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
    {
        name: "Inicio",
        href: "/",
        icon: Home,
    },
    {
        name: "Mi Tablero",
        href: "/app",
        icon: LayoutDashboard,
    },
    {
        name: "Mis Naves",
        href: "/app/activos",
        icon: Car,
    },
    {
        name: "Mis Finanzas",
        href: "/app/finanzas",
        icon: DollarSign,
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
            {!isMobileOpen && (
                <Button
                    id="sidebar-toggle"
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 left-4 z-50 lg:hidden"
                    onClick={toggleMobileSidebar}
                >
                    <Menu size={24} />
                </Button>
            )}

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            <aside id="sidebar" className={cn("fixed left-0 top-0 z-40 h-screen bg-primary text-primary-foreground border-r border-primary/20 transition-all duration-300 flex flex-col", isExpanded ? "w-64" : "w-16", "translate-x-0 max-lg:-translate-x-full", isMobileOpen && "max-lg:translate-x-0")} >

                <div id="sidebar-header" className="h-16 flex items-center justify-between px-4 border-b border-primary-foreground/10">
                    {isExpanded && (
                        <Link href="/" className="text-xl font-bold text-primary-foreground hover:text-white transition-colors">
                            enfoCAR
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={isMobileOpen ? toggleMobileSidebar : toggleSidebar}
                        className={cn(
                            isMobileOpen ? "lg:hidden" : "hidden lg:flex",
                            "ml-auto text-primary-foreground hover:text-white hover:bg-primary-foreground/10"
                        )}
                    >
                        {isMobileOpen ? <X size={24} /> : isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
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
                                                ? "bg-white/20 text-white font-semibold border-l-4 border-white ml-[-4px] pl-[12px]"
                                                : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
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

                <div id="sidebar-footer" className="border-t border-primary-foreground/10 p-4 space-y-4">
                    <div className={cn("flex items-center", !isExpanded && "justify-center")}>
                        <ThemeSwitcher />
                        {isExpanded && <span className="ml-2 text-sm text-primary-foreground/70">Tema</span>}
                    </div>
                    <div className={cn(!isExpanded && "flex justify-center")}>
                        <AuthButton isExpanded={isExpanded} />
                    </div>
                </div>

            </aside>

            <div id="sidebar-spacer" className={cn("transition-all duration-300 hidden lg:block", isExpanded ? "w-64" : "w-16")} />
        </>
    );
}
