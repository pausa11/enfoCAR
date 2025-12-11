import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        // Ensure user exists in database (upsert)
        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                email: user.email || "",
            },
            create: {
                id: user.id,
                email: user.email || "",
            },
        });

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

        // Create asset
        const asset = await prisma.asset.create({
            data: {
                name,
                type,
                customAttributes: customAttributes || null,
                userId: user.id,
            },
        });

        return NextResponse.json(asset, { status: 201 });
    } catch (error) {
        console.error("Error creating asset:", error);
        return NextResponse.json(
            { error: "Error al crear el activo" },
            { status: 500 }
        );
    }
}
