import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, FileText, DollarSign, ChartNoAxesCombined } from "lucide-react";
import HyperspeedClient from "@/components/reactBits/HyperspeedClient";
import SplitText from "@/components/reactBits/SplitText";
import { RestartTourButton } from "@/components/common/RestartTourButton";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">

      <div id="hypeerspeed-bg" className="absolute inset-0 z-0">
        <HyperspeedClient />
      </div>

      <div id="gradient-overlay" className="absolute inset-0 z-[1] bg-gradient-to-br from-background/40 via-transparent to-background/60 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">

        <div id="header" className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SplitText
            text="¡BIENVENIDO A enfoCAR!"
            tag="h1"
            className="text-5xl md:text-7xl font-bold text-foreground mb-4"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
            Tu plataforma para gestionar tus carros de forma bacana
          </p>
        </div>

        <div id="quick-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto">
          <Link
            href="/app/activos"
            className="bg-emerald-100/80 dark:bg-emerald-900/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400 dark:border-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-xl">
                <Car className="w-8 h-8 text-emerald-700 dark:text-emerald-200" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Mis Naves</h3>
            </div>
            <p className="text-foreground/80">Gestiona todos tus vehículos en un solo lugar</p>
          </Link>

          <Link
            href="/app/documentos"
            className="bg-cyan-100/80 dark:bg-cyan-900/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400 dark:border-cyan-600 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-cyan-200 dark:bg-cyan-800 rounded-xl">
                <FileText className="w-8 h-8 text-cyan-700 dark:text-cyan-200" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Mis Papeles</h3>
            </div>
            <p className="text-foreground/80">Mantén todo organizado y al día</p>
          </Link>

          <Link
            href="/app/finanzas"
            className="bg-violet-100/80 dark:bg-violet-900/60 backdrop-blur-xl rounded-2xl p-6 border border-violet-400 dark:border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-violet-200 dark:bg-violet-800 rounded-xl">
                <DollarSign className="w-8 h-8 text-violet-700 dark:text-violet-200" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Finanzas</h3>
            </div>
            <p className="text-foreground/80">Visualiza el estado de tu flota</p>
          </Link>

          <Link
            href="/app"
            className="bg-pink-100/80 dark:bg-pink-900/60 backdrop-blur-xl rounded-2xl p-6 border border-pink-400 dark:border-pink-600 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-pink-200 dark:bg-pink-800 rounded-xl">
                <ChartNoAxesCombined className="w-8 h-8 text-pink-700 dark:text-pink-200" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Análisis</h3>
            </div>
            <p className="text-foreground/80">Obtén insights de tu flota</p>
          </Link>
        </div>

        <div id="user-info" className="text-center mt-12 animate-in fade-in duration-700 delay-700">
          <p className="text-foreground/60 text-sm">
            Conectado como <span className="font-semibold text-foreground">{user.email}</span>
          </p>
          <div className="mt-4 flex justify-center">
            <RestartTourButton />
          </div>
        </div>
      </div>
    </div>
  );
}
