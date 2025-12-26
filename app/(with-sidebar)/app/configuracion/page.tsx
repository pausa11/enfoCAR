import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationSettings } from "@/components/notifications/notification-settings";
import { Bell, User, Shield, Palette, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2">Configuración</h1>
                    <p className="text-lg text-muted-foreground">
                        Personaliza tu experiencia en enfoCAR
                    </p>
                </div>

                {/* Tabs for different settings sections */}
                <Tabs defaultValue="notifications" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notificaciones</span>
                        </TabsTrigger>
                        <TabsTrigger value="account" className="gap-2" disabled>
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Cuenta</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="gap-2" disabled>
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Privacidad</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2" disabled>
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Apariencia</span>
                        </TabsTrigger>
                        <TabsTrigger value="language" className="gap-2" disabled>
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">Idioma</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="mt-6">
                        <NotificationSettings />
                    </TabsContent>

                    <TabsContent value="account" className="mt-6">
                        <div className="text-center py-12 text-muted-foreground">
                            Configuración de cuenta - Próximamente
                        </div>
                    </TabsContent>

                    <TabsContent value="privacy" className="mt-6">
                        <div className="text-center py-12 text-muted-foreground">
                            Configuración de privacidad - Próximamente
                        </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-6">
                        <div className="text-center py-12 text-muted-foreground">
                            Configuración de apariencia - Próximamente
                        </div>
                    </TabsContent>

                    <TabsContent value="language" className="mt-6">
                        <div className="text-center py-12 text-muted-foreground">
                            Configuración de idioma - Próximamente
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Info footer */}
                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        💡 <strong>Tip:</strong> Más opciones de configuración estarán disponibles próximamente.
                        Por ahora puedes personalizar tus notificaciones y preferencias de alertas.
                    </p>
                </div>
            </div>
        </div>
    );
}
