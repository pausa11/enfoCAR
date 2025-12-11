import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateAssetForm } from "@/components/create-asset-form";
import { AssetsTable } from "@/components/assets-table";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // Fetch all assets for the user
    const assets = await prisma.asset.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Activos</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Administra tus vehículos y su información
                    </p>
                </div>
                <CreateAssetForm />
            </div>

            <AssetsTable assets={assets} />
        </div>
    );
}
