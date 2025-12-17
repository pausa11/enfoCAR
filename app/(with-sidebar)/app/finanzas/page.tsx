import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FinanceVehicleList } from "@/components/finance-vehicle-list";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // Fetch all assets for the user
    // We reuse the logic from assets page to get the list
    const assetsRaw = await prisma.asset.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Convert Decimal fields to plain numbers for Client Component serialization
    const assets = assetsRaw.map(asset => ({
        ...asset,
        value: asset.value ? asset.value.toNumber() : null,
    }));

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Mis Finanzas</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Selecciona una nave para ver y gestionar sus movimientos financieros.
                </p>
            </div>

            <FinanceVehicleList assets={assets} />
        </div>
    );
}
