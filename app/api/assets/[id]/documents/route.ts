import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Get documents
    const documents = await prisma.assetDocument.findMany({
        where: {
            assetId: id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json(documents);
}
