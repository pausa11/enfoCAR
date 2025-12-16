import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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

        // Fetch all assets for the user
        const assetsRaw = await prisma.asset.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Convert Decimal fields to plain numbers for JSON serialization
        const assets = assetsRaw.map(asset => ({
            ...asset,
            value: asset.value ? asset.value.toNumber() : null,
        }));

        return NextResponse.json(assets);
    } catch (error) {
        console.error("Error fetching assets:", error);
        return NextResponse.json(
            { error: "Error al obtener los activos" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
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

        // Ensure user exists in database with correct Supabase ID
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                // Update email if it changed
                email: user.email || "",
            },
            create: {
                id: user.id,
                email: user.email || "",
            },
        });

        // Parse request body
        const body = await request.json();
        const { name, type, customAttributes, imageUrl, ownershipPercentage, value } = body;

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

        // Create asset
        const assetRaw = await prisma.asset.create({
            data: {
                name,
                type,
                imageUrl,
                customAttributes: customAttributes || null,
                userId: user.id,
                ownershipPercentage: ownershipPercentage ? parseFloat(ownershipPercentage) : 100.0,
                value: value ? parseFloat(value) : null,
            },
        });

        // Convert Decimal fields to plain numbers for JSON serialization
        const asset = {
            ...assetRaw,
            value: assetRaw.value ? assetRaw.value.toNumber() : null,
        };

        return NextResponse.json(asset, { status: 201 });
    } catch (error) {
        console.error("Error creating asset:", error);
        return NextResponse.json(
            { error: "Error al crear el activo" },
            { status: 500 }
        );
    }
}
