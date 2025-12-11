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
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left p-3 sm:p-4 font-medium text-sm">Nombre</th>
                                <th className="text-left p-3 sm:p-4 font-medium text-sm">Tipo</th>
                                <th className="text-left p-3 sm:p-4 font-medium text-sm">Detalles</th>
                                <th className="text-left p-3 sm:p-4 font-medium text-sm">Fecha de Creación</th>
                                <th className="text-right p-3 sm:p-4 font-medium text-sm">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => {
                                const customAttrs = asset.customAttributes as Record<string, string> | null;
                                return (
                                    <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                                        <td className="p-3 sm:p-4">
                                            <div className="font-medium">{asset.name}</div>
                                        </td>
                                        <td className="p-3 sm:p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {VEHICLE_TYPE_LABELS[asset.type] || asset.type}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4">
                                            {customAttrs && Object.keys(customAttrs).length > 0 ? (
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    {customAttrs.marca && (
                                                        <div><span className="font-medium">Marca:</span> {customAttrs.marca}</div>
                                                    )}
                                                    {customAttrs.modelo && (
                                                        <div><span className="font-medium">Modelo:</span> {customAttrs.modelo}</div>
                                                    )}
                                                    {customAttrs.año && (
                                                        <div><span className="font-medium">Año:</span> {customAttrs.año}</div>
                                                    )}
                                                    {customAttrs.placa && (
                                                        <div><span className="font-medium">Placa:</span> {customAttrs.placa}</div>
                                                    )}
                                                    {customAttrs.color && (
                                                        <div><span className="font-medium">Color:</span> {customAttrs.color}</div>
                                                    )}
                                                    {customAttrs.kilometraje && (
                                                        <div><span className="font-medium">Kilometraje:</span> {customAttrs.kilometraje} km</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Sin detalles</span>
                                            )}
                                        </td>
                                        <td className="p-3 sm:p-4 text-sm text-muted-foreground">
                                            {new Date(asset.createdAt).toLocaleDateString("es-CO", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                        <td className="p-3 sm:p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingAsset(asset)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeletingAsset(asset)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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
