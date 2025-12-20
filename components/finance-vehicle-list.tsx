"use client";

import { Asset } from "@prisma/client";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Plate, getPlateType } from "colombian-plates";
import { ParticleCard } from "@/components/MagicBento";

// Type for asset with Decimal converted to number for client components
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface FinanceVehicleListProps {
    assets: SerializedAsset[];
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
    CARRO: "Carro",
    JEEP: "Jeep",
    BUSETA: "Buseta",
    TURBO: "Turbo",
};

export function FinanceVehicleList({ assets }: FinanceVehicleListProps) {
    if (assets.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <p className="text-lg">No tienes naves registradas aún.</p>
                <p className="text-sm mt-2">Ve a "Mis Naves" para agregar tu primer vehículo.</p>
                <Link href="/app/activos/new" className="mt-4 inline-block text-primary hover:underline">
                    Agregar Nave
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {assets.map((asset) => {
                const customAttrs = asset.customAttributes as Record<string, string> | null;
                const plate = customAttrs?.placa;

                return (
                    <ParticleCard
                        key={asset.id}
                        className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card active:scale-[0.98]"
                        particleCount={0}
                        glowColor="0, 112, 243"
                        enableTilt={true}
                        clickEffect={true}
                        enableMagnetism={true}
                    >
                        <Link
                            href={`/app/activos/${asset.id}`}
                            className="block"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-video bg-muted group-hover:opacity-90 transition-opacity">
                                {/* @ts-ignore - imageUrl exists after migration */}
                                {asset.imageUrl ? (
                                    <img
                                        /* @ts-ignore */
                                        src={asset.imageUrl}
                                        alt={asset.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-primary/5">
                                        <span className="text-4xl font-bold uppercase text-primary/20">{asset.name.substring(0, 2)}</span>
                                    </div>
                                )}

                                {/* Overlay Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-sm">
                                        <DollarSign className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                                {/* Title and Type Badge */}
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                            {asset.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {VEHICLE_TYPE_LABELS[asset.type] || asset.type}
                                        </p>
                                    </div>
                                    {plate && (
                                        <div className="scale-75 origin-top-right">
                                            <Plate
                                                plate={plate}
                                                type={getPlateType(plate) || undefined}
                                                width={80}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Hint Text */}
                                <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                                    <span>Ver finanzas</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </Link>
                    </ParticleCard>
                );
            })}
        </div>
    );
}
