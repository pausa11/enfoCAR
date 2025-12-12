import { Sidebar } from "@/components/sidebar";
import { InstallPrompt } from "@/components/install-prompt";
import { UpdatePrompt } from "@/components/update-prompt";

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
            <InstallPrompt />
            <UpdatePrompt />
        </div>
    );
}
