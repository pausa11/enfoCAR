"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SplitText from "@/components/SplitText";
import { MaintenanceList } from "@/components/maintenance-list";
import { useEffect, useState } from "react";
import { MaintenanceType } from "@prisma/client";

type Asset = {
    id: string;
    name: string;
    [key: string]: any;
};

type MaintenanceRecord = {
    id: string;
    type: MaintenanceType;
    description: string | null;
    cost: number;
    date: Date;
    mileage: number | null;
    nextServiceDate: Date | null;
    nextServiceMileage: number | null;
    notes: string | null;
    assetId: string;
    createdAt: Date;
    updatedAt: Date;
};

export default function AssetMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const { id } = await params;

            // Fetch asset
            const assetRes = await fetch(`/api/assets/${id}`);
            if (!assetRes.ok) {
                router.push("/app/activos");
                return;
            }
            const assetData = await assetRes.json();
            setAsset(assetData);

            // Fetch maintenance records
            const maintenanceRes = await fetch(`/api/assets/${id}/maintenance`);
            if (maintenanceRes.ok) {
                const maintenanceData = await maintenanceRes.json();
                setMaintenanceRecords(maintenanceData);
            }

            setLoading(false);
        }

        loadData();
    }, [params, router]);

    if (loading) {
        return (
            <div className="flex-1 w-full flex items-center justify-center p-8">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (!asset) {
        return null;
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div id="header" className="flex flex-col gap-4">
                <Button variant="ghost" className="gap-2 -ml-2 w-fit hover:bg-muted/50 hover:text-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>
                <div>
                    <SplitText
                        text={`Mantenimientos de ${asset.name}`}
                        tag="h1"
                        className="text-3xl sm:text-4xl font-bold"
                        delay={100}
                        duration={0.6}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="left"
                    />
                    <p className="text-muted-foreground mt-1">
                        Lleva un registro completo de los mantenimientos y recibe alertas oportunas
                    </p>
                </div>
            </div>

            <MaintenanceList assetId={asset.id} maintenanceRecords={maintenanceRecords} />
        </div>
    );
}
