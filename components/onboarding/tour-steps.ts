export type TourStep = {
    element?: string;
    popover: {
        title: string;
        description: string;
        side?: "top" | "bottom" | "left" | "right" | "center";
        align?: "start" | "center" | "end";
    };
};

export type TourChapter = {
    id: string;
    path: string;
    steps: TourStep[];
    nextRoute?: string;
};

export const tourChapters: TourChapter[] = [
    {
        id: "dashboard",
        path: "/app",
        nextRoute: "/app/activos",
        steps: [
            {
                element: "#header",
                popover: {
                    title: "¡Bienvenido a enfoCAR! 🚗",
                    description: "Vamos a darte un tour completo para que domines tu negocio de transporte.",
                    side: "bottom",
                    align: "center",
                },
            },
            {
                element: "#dashboard-tabs",
                popover: {
                    title: "Todo en su lugar 🏠💼",
                    description: "Aquí separas lo personal de lo del negocio. ¡Cuentas claras, amistades largas!",
                    side: "bottom",
                    align: "center",
                },
            },
            {
                element: "#view-assets-button",
                popover: {
                    title: "Tus Naves 🚛",
                    description: "Aquí es donde empieza la magia. Vamos a ver dónde gestionas tus vehículos.",
                    side: "bottom",
                    align: "center",
                },
            },
        ],
    },
    {
        id: "assets-list",
        path: "/app/activos",
        nextRoute: "/app/activos/new",
        steps: [
            {
                popover: {
                    title: "El Garaje 🔧",
                    description: "Aquí verás la lista de todas tus máquinas produciendo plata.",
                    side: "center",
                    align: "center",
                },
            },
            {
                element: "#create-asset-button",
                popover: {
                    title: "Nueva Adquisición 🆕",
                    description: "Vamos a agregar tu primer vehículo para que veas cómo es.",
                    side: "bottom",
                    align: "center",
                },
            },
        ],
    },
    {
        id: "create-asset",
        path: "/app/activos/new",
        nextRoute: "/app/finanzas",
        steps: [
            {
                popover: {
                    title: "Registra tu Nave 📝",
                    description: "Formulario simple. Nombre, tipo y si es para camellar o pasear.",
                    side: "center",
                    align: "center",
                },
            },
            {
                element: "#asset-type-switch",
                popover: {
                    title: "El Switch Mágico ⚡",
                    description: "Si lo apagas, es vehículo personal. Si lo prendes, es negocio. ¡Ojo ahí!",
                    side: "bottom",
                    align: "center",
                },
            },
            {
                element: "#asset-name-input",
                popover: {
                    title: "Identidad 🆔",
                    description: "Ponle un nombre único. 'El Consentido', 'La Bestia'...",
                    side: "bottom",
                    align: "center",
                },
            },
        ],
    },
    {
        id: "finances",
        path: "/app/finanzas",
        nextRoute: "/app/vehiculos-personales",
        steps: [
            {
                popover: {
                    title: "La Billetera 💰",
                    description: "Aquí es donde duele o se goza. Ingresos y Gastos de todo el negocio.",
                    side: "center",
                    align: "center",
                },
            },
            {
                element: ".finance-vehicle-card",
                popover: {
                    title: "Gestiona tu Nave 📉",
                    description: "Haz clic en tu nave para registrar ingresos, tanqueadas, mantenimientos y más.",
                    side: "bottom",
                    align: "center",
                },
            },
        ],
    },
    {
        id: "personal-vehicles",
        path: "/app/vehiculos-personales",
        // No nextRoute means end of tour
        steps: [
            {
                popover: {
                    title: "Lo Tuyo ❤️",
                    description: "Aquí van los juguetes de la casa. Sin estrés de rentabilidad, solo control de gastos.",
                    side: "center",
                    align: "center",
                },
            },
            {
                popover: {
                    title: "¡Graduado! 🎓",
                    description: "Ya sabes lo básico. ¡A rodar se dijo!",
                    side: "center",
                    align: "center",
                },
            },
        ],
    },
];
