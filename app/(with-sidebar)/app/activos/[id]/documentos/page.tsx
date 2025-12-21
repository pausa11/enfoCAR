"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SplitText from "@/components/SplitText";
import { DocumentsList } from "@/components/documents-list";
import { useEffect, useState } from "react";
import { DocumentType } from "@prisma/client";


type Asset = {
    id: string;
    name: string;
    [key: string]: any;
};

type Document = {
    id: string;
    type: DocumentType;
    identifier: string | null;
    expirationDate: Date | null;
    isActive: boolean;
    assetId: string;
    createdAt: Date;
    updatedAt: Date;
};

export default function AssetDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const { id } = await params;

            // Fetch asset
            const assetRes = await fetch(`/api/assets/${id}`);
            if (!assetRes.ok) {
                router.push("/app/activos");
                return;
            }
            const assetData = await assetRes.json();
            setAsset(assetData);

            // Fetch documents
            const docsRes = await fetch(`/api/assets/${id}/documents`);
            if (docsRes.ok) {
                const docsData = await docsRes.json();
                setDocuments(docsData);
            }

            setLoading(false);
        }

        loadData();
    }, [params, router]);

    if (loading) {
        return (
            <div className="flex-1 w-full flex items-center justify-center p-8">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (!asset) {
        return null;
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div id="header" className="flex flex-col gap-4">
                <Button variant="ghost" className="gap-2 -ml-2 w-fit hover:bg-muted/50 hover:text-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>
                <div>
                    <SplitText
                        text={`Documentos de ${asset.name}`}
                        tag="h1"
                        className="text-3xl sm:text-4xl font-bold"
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
                    <p className="text-muted-foreground mt-1">
                        Gestiona los documentos y mantente al día con sus vencimientos
                    </p>
                </div>
            </div>

            <DocumentsList assetId={asset.id} documents={documents} />
        </div>
    );
}
