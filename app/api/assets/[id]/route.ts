import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify authentication
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Parse request body
        const body = await request.json();
        const { name, type, customAttributes } = body;

        // Validate required fields
        if (!name || !type) {
            return NextResponse.json(
                { error: "El nombre y tipo son obligatorios" },
                { status: 400 }
            );
        }

        // Validate type is one of the allowed values
        const validTypes = ["CARRO", "JEEP", "BUSETA", "TURBO"];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Tipo de vehículo inválido" },
                { status: 400 }
            );
        }

        // Check if asset exists and belongs to user
        const existingAsset = await prisma.asset.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existingAsset) {
            return NextResponse.json(
                { error: "Activo no encontrado" },
                { status: 404 }
            );
        }

        // Update asset
        const assetRaw = await prisma.asset.update({
            where: { id },
            data: {
                name,
                type,
                customAttributes: customAttributes || null,
            },
        });

        // Convert Decimal fields to plain numbers for JSON serialization
        const asset = {
            ...assetRaw,
            value: assetRaw.value ? assetRaw.value.toNumber() : null,
        };

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Error updating asset:", error);
        return NextResponse.json(
            { error: "Error al actualizar el activo" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify authentication
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if asset exists and belongs to user
        const existingAsset = await prisma.asset.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existingAsset) {
            return NextResponse.json(
                { error: "Activo no encontrado" },
                { status: 404 }
            );
        }

        // Delete asset (will cascade delete financial records)
        await prisma.asset.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting asset:", error);
        return NextResponse.json(
            { error: "Error al eliminar el activo" },
            { status: 500 }
        );
    }
}
