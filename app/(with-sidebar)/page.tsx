import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, FileText, ArrowRight, Wrench, DollarSign } from "lucide-react";
import HyperspeedClient from "@/components/HyperspeedClient";
import SplitText from "@/components/SplitText";
import { RestartTourButton } from "@/components/RestartTourButton";

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
            Tu plataforma parcera para gestionar tus carros de forma bacana
          </p>
        </div>

        <div id="quick-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          {/* Mis Carros Card */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Car className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Mis Naves</h3>
              </div>
              <p className="text-foreground/80 mb-6">Gestiona todos tus vehículos en un solo lugar</p>
            </div>
            <Link
              href="/app/activos"
              className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between group-hover:bg-emerald-500/30"
            >
              Ver mis Naves
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Documentos Card */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <FileText className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Mis Papeles</h3>
              </div>
              <p className="text-foreground/80 mb-6">Mantén todo organizado y al día</p>
            </div>
            <Link
              href="/app/documentos"
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between group-hover:bg-cyan-500/30"
            >
              Ver m|is Papeles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mantenimientos Card */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Wrench className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Taller</h3>
              </div>
              <p className="text-foreground/80 mb-6">Registra y consulta el historial</p>
            </div>
            <Link
              href="/app/mantenimientos"
              className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between group-hover:bg-orange-500/30"
            >
              Ver mantenimientos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Finanzas Card */}
          <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-violet-500/20 rounded-xl">
                  <DollarSign className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Finanzas</h3>
              </div>
              <p className="text-foreground/80 mb-6">Controla gastos e ingresos</p>
            </div>
            <Link
              href="/app/finanzas"
              className="w-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-between group-hover:bg-violet-500/30"
            >
              Ver finanzas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
