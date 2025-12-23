import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MaintenanceOverview } from "@/components/maintenance-overview";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getMaintenanceRecords(userId: string) {
    // Get all assets for the user
    const assets = await prisma.asset.findMany({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            name: true,
            type: true,
            customAttributes: true,
        },
    });

    const assetIds = assets.map(asset => asset.id);

    // Get all maintenance records for these assets
    const maintenanceRecordsRaw = await prisma.maintenanceRecord.findMany({
        where: {
            assetId: {
                in: assetIds,
            },
        },
        include: {
            asset: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                    customAttributes: true,
                },
            },
        },
        orderBy: [
            {
                date: "desc",
            },
        ],
    });

    // Convert Decimal to number for client component
    const maintenanceRecords = maintenanceRecordsRaw.map(record => ({
        ...record,
        cost: record.cost.toNumber(),
    }));

    // Sort maintenance records: overdue first, then upcoming, then recent
    const now = new Date();
    const sortedRecords = maintenanceRecords.sort((a, b) => {
        const aHasNext = a.nextServiceDate !== null;
        const bHasNext = b.nextServiceDate !== null;

        if (!aHasNext && !bHasNext) {
            // Both don't have next service, sort by date descending
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (!aHasNext) return 1;
        if (!bHasNext) return -1;

        const aOverdue = new Date(a.nextServiceDate!) < now;
        const bOverdue = new Date(b.nextServiceDate!) < now;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Both overdue or both upcoming, sort by next service date
        return new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime();
    });

    return { maintenanceRecords: sortedRecords, assets };
}

export default async function MantenimientosPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const { maintenanceRecords, assets } = await getMaintenanceRecords(user.id);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <MaintenanceOverview maintenanceRecords={maintenanceRecords} assets={assets} />
        </div>
    );
}
