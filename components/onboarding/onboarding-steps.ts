export const onboardingSteps = [
    {
        element: "#header",
        popover: {
            title: "¡Bienvenido a enfoCAR! 🚗",
            description: "¡Qué más! Nos alegra tenerte por acá. Vamos a darte un tour rápido para que le saques el jugo a la app. Es breve, fresco.",
            side: "bottom",
            align: "center",
        },
    },
    {
        element: "#dashboard-tabs",
        popover: {
            title: "Tu Garaje Personal y de Negocio 🏠💼",
            description: "Aquí puedes cambiar entre tus carros de 'Uso Personal' (los de la familia, paseos) y los de 'Negocio' (los que producen plata). ¡Separaditos se ven más bonitos!",
            side: "bottom",
            align: "center",
        },
    },
    {
        element: "#view-assets-button",
        popover: {
            title: "Gestiona tus Naves 🚙",
            description: "En 'Ver mis Naves' o 'Activos' es donde creas tus carros. Allá podrás definir si son personales o de negocio, quién los maneja y cuánto te pertenecen.",
            side: "bottom",
            align: "center",
        },
    },
    {
        element: "#stats-total-assets",
        popover: {
            title: "Tus Activos 📊",
            description: "Aquí ves cuántos carros tienes rodando. Si das clic en crear uno nuevo, recuerda configurar el 'Porcentaje de Propiedad' (¿es todo tuyo o vas a medias?) y el conductor.",
            side: "top",
            align: "center",
        },
    },
    {
        element: "#net-income-card",
        popover: {
            title: "La Plata Clara 💰",
            description: "Lo más importante: ¿Cuánto queda libre? Aquí verás tu utilidad neta después de restar gastos a los ingresos. ¡La meta es tener esto siempre en verde!",
            side: "top",
            align: "center",
        },
    },
    {
        popover: {
            title: "¡Listo el Pollo! 🍗",
            description: "Ya sabes lo básico. Explora, crea tus carros y empieza a registrar gastos e ingresos. Si te pierdes, busca el botón de ayuda para repetir este tour.",
            side: "center",
            align: "center",
        },
    },
] as const;
