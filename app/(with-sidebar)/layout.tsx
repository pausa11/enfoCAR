import { Sidebar } from "@/components/layout/sidebar";
import { InstallPrompt } from "@/components/common/install-prompt";
import { UpdatePrompt } from "@/components/common/update-prompt";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { ChatAssistant } from "@/components/ai/chat-assistant";

export default function WithSidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div id="root" className="min-h-screen">
            <Sidebar />
            <main id="main" className="w-full overflow-auto">
                {children}
            </main>
            <InstallPrompt />
            <UpdatePrompt />
            <OnboardingTour />
            <ChatAssistant />
        </div>
    );
}
