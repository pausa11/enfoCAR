import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all assets for the user
    const assets = await prisma.asset.findMany({
        where: {
            userId: user.id,
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

    return NextResponse.json(sortedDocuments);
}
