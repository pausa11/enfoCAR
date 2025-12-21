"use client";

import { Asset } from "@prisma/client";
import { DollarSign, Briefcase, User, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Plate, getPlateType } from "colombian-plates";
import { ParticleCard } from "@/components/MagicBento";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Type for asset with Decimal converted to number for client components
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface FinanceVehicleListProps {
    assets: SerializedAsset[];
    showViewToggle?: boolean;
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
    CARRO: "Carro",
    JEEP: "Jeep",
    BUSETA: "Buseta",
    TURBO: "Turbo",
};

type ViewMode = "card" | "list";

export function FinanceVehicleList({ assets, showViewToggle = true }: FinanceVehicleListProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("card");
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
        <>
            {/* View Toggle */}
            {showViewToggle && assets.length > 0 && (
                <div className="flex justify-end mb-4">
                    <div className="inline-flex rounded-lg border p-1 gap-1">
                        <Button
                            variant={viewMode === "card" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("card")}
                            className="gap-2"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="hidden sm:inline">Tarjetas</span>
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="gap-2"
                        >
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">Lista</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Card View */}
            {viewMode === "card" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {assets.map((asset) => {
                        const customAttrs = asset.customAttributes as Record<string, string> | null;

                        // Determine glow color based on asset type (Business = Green, Personal = Blue)
                        const glowColor = asset.isBusinessAsset ? "34, 197, 94" : "59, 130, 246"; // emerald-500 : blue-500

                        // Determine background style based on asset type
                        const cardStyle = asset.isBusinessAsset
                            ? "bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20"
                            : "bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20";

                        return (
                            <ParticleCard
                                key={asset.id}
                                className={`finance-vehicle-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${cardStyle}`}
                                particleCount={0}
                                glowColor={glowColor}
                                enableTilt={false}
                                clickEffect={true}
                                enableMagnetism={true}
                            >
                                <Link
                                    href={`/app/activos/${asset.id}`}
                                    className="block group"
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

                                        {/* Business/Personal Badge - Top Left */}
                                        <div className="absolute top-2 left-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${asset.isBusinessAsset
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-blue-500 text-white'
                                                }`}>
                                                {asset.isBusinessAsset ? (
                                                    <>
                                                        <Briefcase className="h-3 w-3" />
                                                        <span>Negocio</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="h-3 w-3" />
                                                        <span>Personal</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        {/* Finance Icon Badge - Top Right */}
                                        <div className="absolute top-2 right-2">
                                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-sm">
                                                <DollarSign className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col h-full">
                                        {/* Title and Type Badge */}
                                        <div className="space-y-2 mb-3">
                                            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{asset.name}</h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {VEHICLE_TYPE_LABELS[asset.type] || asset.type}
                                            </span>
                                        </div>

                                        {/* Custom Attributes - Fixed height section */}
                                        <div className="min-h-[120px] mb-3">
                                            {customAttrs && Object.keys(customAttrs).length > 0 ? (
                                                <div className="text-sm space-y-1.5 text-muted-foreground">
                                                    {customAttrs.marca && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-foreground">Marca:</span>
                                                            <span>{customAttrs.marca}</span>
                                                        </div>
                                                    )}
                                                    {customAttrs.modelo && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-foreground">Modelo:</span>
                                                            <span>{customAttrs.modelo}</span>
                                                        </div>
                                                    )}
                                                    {customAttrs.año && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-foreground">Año:</span>
                                                            <span>{customAttrs.año}</span>
                                                        </div>
                                                    )}
                                                    {customAttrs.color && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-foreground">Color:</span>
                                                            <span>{customAttrs.color}</span>
                                                        </div>
                                                    )}
                                                    {customAttrs.kilometraje && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-foreground">Kilometraje:</span>
                                                            <span>{customAttrs.kilometraje} km</span>
                                                        </div>
                                                    )}
                                                    {customAttrs.conductor && (
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-foreground">Conductor:</span>
                                                            <span>{customAttrs.conductor}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">Sin detalles adicionales</p>
                                            )}
                                        </div>

                                        {/* Plate Section - Fixed position */}
                                        {customAttrs?.placa && (
                                            <div className="mb-3 pb-3 border-b">
                                                <div className="w-full flex items-center justify-center">
                                                    <Plate
                                                        plate={customAttrs.placa}
                                                        type={asset.serviceType === "PUBLICO" ? "public" as any : (getPlateType(customAttrs.placa) || undefined)}
                                                        width={"60%"}
                                                        style={{ transform: "scale(0.75)", transformOrigin: "center" }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Call to Action - Always at bottom */}
                                        <div className="mt-auto pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                                            <span>Ver finanzas</span>
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </div>
                                    </div>
                                </Link>
                            </ParticleCard>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="space-y-3">
                    {assets.map((asset) => {
                        const customAttrs = asset.customAttributes as Record<string, string> | null;
                        const borderColor = asset.isBusinessAsset ? "border-emerald-500/20" : "border-blue-500/20";
                        const bgColor = asset.isBusinessAsset
                            ? "bg-gradient-to-r from-emerald-500/5 to-transparent"
                            : "bg-gradient-to-r from-blue-500/5 to-transparent";

                        return (
                            <Link
                                key={asset.id}
                                href={`/app/activos/${asset.id}`}
                                className={`block border rounded-lg p-4 hover:shadow-md transition-shadow ${borderColor} ${bgColor}`}
                            >
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    {/* Image Thumbnail */}
                                    <div className="flex-shrink-0 w-full sm:w-24 h-24 rounded-md overflow-hidden bg-muted">
                                        {/* @ts-ignore - imageUrl exists after migration */}
                                        {asset.imageUrl ? (
                                            <img
                                                /* @ts-ignore */
                                                src={asset.imageUrl}
                                                alt={asset.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                <span className="text-2xl font-bold uppercase">{asset.name.substring(0, 2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* Header: Name, Type, and Business/Personal Badge */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-lg">{asset.name}</h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {VEHICLE_TYPE_LABELS[asset.type] || asset.type}
                                            </span>
                                            {asset.isBusinessAsset ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <Briefcase className="h-3 w-3" />
                                                    <span>Negocio</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    <User className="h-3 w-3" />
                                                    <span>Personal</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                                            {customAttrs?.marca && (
                                                <div>
                                                    <span className="font-medium text-foreground">Marca:</span>{" "}
                                                    <span className="text-muted-foreground">{customAttrs.marca}</span>
                                                </div>
                                            )}
                                            {customAttrs?.modelo && (
                                                <div>
                                                    <span className="font-medium text-foreground">Modelo:</span>{" "}
                                                    <span className="text-muted-foreground">{customAttrs.modelo}</span>
                                                </div>
                                            )}
                                            {customAttrs?.año && (
                                                <div>
                                                    <span className="font-medium text-foreground">Año:</span>{" "}
                                                    <span className="text-muted-foreground">{customAttrs.año}</span>
                                                </div>
                                            )}
                                            {customAttrs?.color && (
                                                <div>
                                                    <span className="font-medium text-foreground">Color:</span>{" "}
                                                    <span className="text-muted-foreground">{customAttrs.color}</span>
                                                </div>
                                            )}
                                            {customAttrs?.kilometraje && (
                                                <div>
                                                    <span className="font-medium text-foreground">Kilometraje:</span>{" "}
                                                    <span className="text-muted-foreground">{customAttrs.kilometraje} km</span>
                                                </div>
                                            )}
                                            {customAttrs?.conductor && (
                                                <div>
                                                    <span className="font-medium text-foreground">Conductor:</span>{" "}
                                                    <span className="text-muted-foreground">{customAttrs.conductor}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* License Plate */}
                                        {customAttrs?.placa && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-foreground">Placa:</span>
                                                <div className="flex items-center justify-center" style={{ width: "120px" }}>
                                                    <Plate
                                                        plate={customAttrs.placa}
                                                        type={asset.serviceType === "PUBLICO" ? "public" as any : (getPlateType(customAttrs.placa) || undefined)}
                                                        width={"100%"}
                                                        style={{ transform: "scale(0.75)", transformOrigin: "center" }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Finance Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}
