"use client";

import StaggeredMenu from './StaggeredMenu';
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navigationItems = [
    {
        name: "Inicio",
        href: "/",
    },
    {
        name: "Mi Tablero",
        href: "/app",
    },
    {
        name: "Mis Naves",
        href: "/app/activos",
    },
    {
        name: "Vehículos Personales",
        href: "/app/vehiculos-personales",
    },
    {
        name: "Mis Finanzas",
        href: "/app/finanzas",
    },
];

export function Sidebar() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Convert navigation items to StaggeredMenu format
    const menuItems = navigationItems.map((item) => ({
        label: item.name,
        ariaLabel: `Ir a ${item.name}`,
        link: item.href,
    }));

    const footerContent = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ThemeSwitcher />
                <span style={{ color: 'white', fontSize: '0.875rem' }}>Tema</span>
            </div>

            <AuthButton isExpanded={true} />
        </div >
    );

    // Determine button color based on theme
    // Default to white for better visibility on dark backgrounds (like landing page)
    if (!mounted) {
        return (
            <StaggeredMenu
                position="left"
                items={menuItems}
                socialItems={[]}
                displaySocials={false}
                displayItemNumbering={true}
                menuButtonColor="#fff"
                openMenuButtonColor="#fff"
                changeMenuColorOnOpen={true}
                colors={['hsl(217 91% 50%)', 'hsl(217 91% 60%)']}
                logoUrl="/logo.svg"
                accentColor="hsl(217 91% 70%)"
                isFixed={true}
                closeOnClickAway={true}
                footerContent={footerContent}
            />
        );
    }

    const currentTheme = resolvedTheme || theme;
    const buttonColor = currentTheme === 'dark' ? '#fff' : '#000';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            <StaggeredMenu
                key={currentTheme}
                position="left"
                items={menuItems}
                socialItems={[]}
                displaySocials={false}
                displayItemNumbering={true}
                menuButtonColor={buttonColor}
                openMenuButtonColor="#fff"
                changeMenuColorOnOpen={true}
                colors={['hsl(217 91% 50%)', 'hsl(217 91% 60%)']}
                logoUrl="/logo.svg"
                accentColor="hsl(217 91% 70%)"
                isFixed={false}
                closeOnClickAway={true}
                footerContent={footerContent}
            />
        </div>
    );
}
