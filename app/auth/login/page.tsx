"use client";

import { LoginForm } from "@/components/auth/login-form";
import Hyperspeed from "@/components/reactBits/Hyperspeed";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

export default function Page() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0" id="lights">
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => { },
            onSlowDown: () => { },
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 50,
            lightPairsPerRoadWay: 50,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.05, 400 * 0.15],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.2, 0.2],
            carFloorSeparation: [0.05, 1],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0x131318,
              brokenLines: 0x131318,
              leftCars: [0x10b981, 0x14b8a6, 0x06b6d4], // verde-azul
              rightCars: [0x0ea5e9, 0x3b82f6, 0x06b6d4], // azul-cyan
              sticks: 0x14b8a6 // teal
            }
          }}
        />
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Main Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6 pointer-events-none">
        {/* Theme Switcher - Top Right */}
        <div className="absolute top-6 right-6 pointer-events-auto">
          <ThemeSwitcher />
        </div>

        <div className="w-full max-w-md pointer-events-auto">


          {/* Login Form Card */}
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-lime-500/20 rounded-3xl blur-xl" />

            {/* Card */}
            <div className="relative bg-card/80 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl p-8">
              <LoginForm />
            </div>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-muted-foreground text-xs">
            Mantén el control total de tus vehículos en un solo lugar
          </p>
        </div>
      </div>
    </div>
  );
}
