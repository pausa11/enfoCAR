"use client";

import { Asset } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAssetDialog } from "@/components/edit-asset-dialog"
import { DeleteAssetDialog } from "@/components/delete-asset-dialog"
import { useState } from "react";

interface AssetsTableProps {
    assets: Asset[];
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
    CARRO: "Carro",
    JEEP: "Jeep",
    BUSETA: "Buseta",
    TURBO: "Turbo",
};

export function AssetsTable({ assets }: AssetsTableProps) {
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

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
                    return (
                        <div
                            key={asset.id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card"
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
                            <div className="p-4 space-y-3">
                                {/* Title and Type Badge */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg leading-tight">{asset.name}</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {VEHICLE_TYPE_LABELS[asset.type] || asset.type}
                                    </span>
                                </div>

                                {/* Custom Attributes */}
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
                                        {customAttrs.placa && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-foreground">Placa:</span>
                                                <span className="uppercase">{customAttrs.placa}</span>
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
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Sin detalles adicionales</p>
                                )}

                                {/* Creation Date */}
                                <div className="pt-2 border-t text-xs text-muted-foreground">
                                    Creado: {new Date(asset.createdAt).toLocaleDateString("es-CO", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>
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
