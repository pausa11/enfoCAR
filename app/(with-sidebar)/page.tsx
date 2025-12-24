import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, FileText, BarChart3, ArrowRight } from "lucide-react";
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
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0" id="lights-home">
        <HyperspeedClient />
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-background/40 via-transparent to-background/60 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">

        <div id="header" className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SplitText
            text="¡Bienvenido a enfoCAR!"
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

        <div id="quick-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Car className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Mis Naves</h3>
            </div>
            <p className="text-foreground/80">Gestiona todos tus vehículos en un solo lugar</p>
          </div>

          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Mis Papeles</h3>
            </div>
            <p className="text-foreground/80">Mantén todo organizado y al día</p>
          </div>

          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-foreground">Estadísticas</h3>
            </div>
            <p className="text-foreground/80">Visualiza el estado de tu flota</p>
          </div>
        </div>

        <div id="actions" className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <Link
            href="/app"
            className="group bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 flex items-center gap-2"
          >
            Ir al Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/app/activos"
            className="group bg-card/60 backdrop-blur-xl hover:bg-card/80 text-foreground font-bold py-4 px-8 rounded-xl border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-2"
          >
            Ver Mis Naves
            <Car className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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
