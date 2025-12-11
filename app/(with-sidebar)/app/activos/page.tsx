import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssetsTable } from "@/components/assets-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">Mis Naves</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Tus máquinas organizadas y al día.
                    </p>
                </div>
                <Link href="/app/activos/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Nave
                    </Button>
                </Link>
            </div>

            <AssetsTable assets={assets} />
        </div>
    );
}
