import { redirect } from "next/navigation";
import { BackButton } from "@/components/layout/back-button";
import SplitText from "@/components/reactBits/SplitText";
import { DocumentsList } from "@/components/documents/documents-list";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function AssetDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { id } = await params;

    // Fetch asset
    const asset = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!asset) {
        redirect("/app/activos");
    }

    // Fetch documents
    const documents = await prisma.assetDocument.findMany({
        where: {
            assetId: id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div id="header" className="flex flex-col gap-4">
                <BackButton />
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
