import { Sidebar } from "@/components/sidebar";

export default function WithSidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div id="root" className="flex min-h-screen">
            <Sidebar />
            <main id="main" className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
