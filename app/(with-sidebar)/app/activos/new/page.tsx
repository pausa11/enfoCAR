import { CreateAssetForm } from "@/components/create-asset-form";

export const dynamic = "force-dynamic";

export default function NewAssetPage() {
    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16 items-center justify-center">
            <CreateAssetForm />
        </div>
    );
}
