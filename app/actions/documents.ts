"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DocumentType } from "@prisma/client";

export type CreateDocumentData = {
    type: DocumentType;
    identifier?: string;
    expirationDate?: Date;
    isActive: boolean;
    assetId: string;
};

export type UpdateDocumentData = {
    id: string;
    identifier?: string;
    expirationDate?: Date;
    isActive?: boolean;
};

export async function createMyAssetDocument(data: CreateDocumentData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify ownership of the asset
    const asset = await prisma.asset.findUnique({
        where: { id: data.assetId },
    });

    if (!asset || asset.userId !== user.id) {
        throw new Error("Unauthorized or asset not found");
    }

    const document = await prisma.assetDocument.create({
        data: {
            type: data.type,
            identifier: data.identifier,
            expirationDate: data.expirationDate,
            isActive: data.isActive,
            assetId: data.assetId,
        },
    });

    revalidatePath(`/app/activos/${data.assetId}`);
    return document;
}

export async function updateMyAssetDocument(data: UpdateDocumentData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const document = await prisma.assetDocument.findUnique({
        where: { id: data.id },
        include: { asset: true },
    });

    if (!document || document.asset.userId !== user.id) {
        throw new Error("Unauthorized or document not found");
    }

    const updatedDocument = await prisma.assetDocument.update({
        where: { id: data.id },
        data: {
            identifier: data.identifier,
            expirationDate: data.expirationDate,
            isActive: data.isActive,
        },
    });

    revalidatePath(`/app/activos/${document.assetId}`);
    return updatedDocument;
}

export async function deleteMyAssetDocument(documentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const document = await prisma.assetDocument.findUnique({
        where: { id: documentId },
        include: { asset: true },
    });

    if (!document || document.asset.userId !== user.id) {
        throw new Error("Unauthorized or document not found");
    }

    await prisma.assetDocument.delete({
        where: { id: documentId },
    });

    revalidatePath(`/app/activos/${document.assetId}`);
}
