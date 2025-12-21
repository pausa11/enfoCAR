"use client";

import { Asset } from "@prisma/client";
import { Edit, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAssetDialog } from "@/components/edit-asset-dialog"
import { DeleteAssetDialog } from "@/components/delete-asset-dialog"
import { useState } from "react";
import Link from "next/link";
import { Plate, getPlateType } from "colombian-plates";
import { ParticleCard } from "@/components/MagicBento";

// Type for asset with Decimal converted to number for client components
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface AssetsTableProps {
    assets: SerializedAsset[];
    hideFinances?: boolean;
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
    CARRO: "Carro",
    JEEP: "Jeep",
    BUSETA: "Buseta",
    TURBO: "Turbo",
};

export function AssetsTable({ assets, hideFinances = false }: AssetsTableProps) {
    const [editingAsset, setEditingAsset] = useState<SerializedAsset | null>(null);
    const [deletingAsset, setDeletingAsset] = useState<SerializedAsset | null>(null);

    if (assets.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <p className="text-lg">No tienes activos registrados aún.</p>
                <p className="text-sm mt-2">Crea tu primer activo usando el botón de arriba.</p>
            </div>
        );
    }

    return (
        <>
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
                            className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${cardStyle}`}
                            particleCount={0}
                            glowColor={glowColor}
                            enableTilt={false}
                            clickEffect={true}
                            enableMagnetism={true}
                        >
                            {/* Image Section */}
                            <div className="relative aspect-video bg-muted">
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
                                        <span className="text-4xl font-bold uppercase">{asset.name.substring(0, 2)}</span>
                                    </div>
                                )}

                                {/* Action Buttons Overlay */}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setEditingAsset(asset)}
                                        className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setDeletingAsset(asset)}
                                        className="h-8 w-8 p-0 bg-background/90 hover:bg-background text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex flex-col h-full">
                                {/* Title and Type Badge */}
                                <div className="space-y-2 mb-3">
                                    <h3 className="font-semibold text-lg leading-tight">{asset.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            {VEHICLE_TYPE_LABELS[asset.type] || asset.type}
                                        </span>
                                        {asset.isBusinessAsset ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                Negocio
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                Personal
                                            </span>
                                        )}
                                    </div>
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
                                                type={getPlateType(customAttrs.placa) || undefined}
                                                width={"60%"}
                                                style={{ transform: "scale(0.75)", transformOrigin: "center" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Financial Quick Summary - Will be populated via client component */}
                                {!hideFinances && (
                                    <div className="mb-3">
                                        <Link href={`/app/activos/${asset.id}`}>
                                            <Button variant="outline" size="sm" className="view-finances-button w-full gap-2">
                                                <span>Ver Finanzas</span>
                                                <DollarSign className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Creation Date - Always at bottom */}
                                <div className="mt-auto pt-2 border-t text-xs text-muted-foreground">
                                    Creado: {new Date(asset.createdAt).toLocaleDateString("es-CO", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>
                        </ParticleCard>
                    );
                })}
            </div>

            {editingAsset && (
                <EditAssetDialog
                    asset={editingAsset}
                    open={!!editingAsset}
                    onOpenChange={(open: boolean) => !open && setEditingAsset(null)}
                />
            )}

            {deletingAsset && (
                <DeleteAssetDialog
                    asset={deletingAsset}
                    open={!!deletingAsset}
                    onOpenChange={(open: boolean) => !open && setDeletingAsset(null)}
                />
            )}
        </>
    );
}
