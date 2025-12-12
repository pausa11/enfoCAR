import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, FileText, BarChart3, ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground dark:text-white mb-4">
            ¡Bienvenido a <span className="text-primary dark:text-blue-400">enfo</span><span className="text-green-500 dark:text-green-400">CAR</span>!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Tu plataforma parcera para gestionar tus carros de forma bacana
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="bg-primary dark:bg-primary/90 rounded-2xl p-6 border border-primary/20 dark:border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Mis Carros</h3>
            </div>
            <p className="text-white/90">Gestiona todos tus vehículos en un solo lugar</p>
          </div>

          <div className="bg-primary dark:bg-primary/90 rounded-2xl p-6 border border-primary/20 dark:border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Documentos</h3>
            </div>
            <p className="text-white/90">Mantén todo organizado y al día</p>
          </div>

          <div className="bg-primary dark:bg-primary/90 rounded-2xl p-6 border border-primary/20 dark:border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Estadísticas</h3>
            </div>
            <p className="text-white/90">Visualiza el estado de tu flota</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <Link
            href="/app"
            className="group bg-green-400 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-600 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-2"
          >
            Ir al Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/app/assets"
            className="group bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-primary dark:text-blue-400 font-bold py-4 px-8 rounded-xl border-2 border-primary dark:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-2"
          >
            Ver Mis Carros
            <Car className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* User Info */}
        <div className="text-center mt-12 animate-in fade-in duration-700 delay-700">
          <p className="text-muted-foreground dark:text-gray-400 text-sm">
            Conectado como <span className="font-semibold text-foreground dark:text-white">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

