import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssetsTable } from "@/components/assets-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SplitText from "@/components/SplitText";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // Ensure user exists in Prisma database (important for OAuth users)
    const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
    });

    if (!existingUser) {
        // Only create if user doesn't exist by ID
        try {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email || "",
                },
            });
        } catch (error) {
            // If email already exists, that's okay
            console.log("User creation skipped - email may already exist with different auth method");
        }
    }

    // Fetch all vehicles for the user
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <SplitText
                        text="Mis Naves"
                        tag="h1"
                        className="text-4xl font-bold"
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
                    <p className="text-base sm:text-lg text-muted-foreground">
                        Tus máquinas organizadas y al día.
                    </p>
                </div>
                <Link href="/app/activos/new">
                    <Button id="create-asset-button" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Nave
                    </Button>
                </Link>
            </div>

            <AssetsTable assets={assets} />
        </div>
    );
}
