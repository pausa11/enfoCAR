import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DocumentsOverview } from "@/components/documents-overview";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDocuments(userId: string) {
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

    // Get all documents for these assets
    const documents = await prisma.assetDocument.findMany({
        where: {
            assetId: {
                in: assetIds,
            },
            isActive: true,
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
                expirationDate: "asc",
            },
        ],
    });

    // Sort documents: expired first, then by expiration date
    const now = new Date();
    const sortedDocuments = documents.sort((a, b) => {
        if (!a.expirationDate && !b.expirationDate) return 0;
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;

        const aExpired = new Date(a.expirationDate) < now;
        const bExpired = new Date(b.expirationDate) < now;

        if (aExpired && !bExpired) return -1;
        if (!aExpired && bExpired) return 1;

        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

    return sortedDocuments;
}

export default async function DocumentosPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const documents = await getDocuments(user.id);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <DocumentsOverview documents={documents} />
        </div>
    );
}
