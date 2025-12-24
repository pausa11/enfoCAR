import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/layout/back-button";

export default function Loading() {
    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div id="header" className="flex flex-col gap-4">
                <BackButton />
                <div>
                    <Skeleton className="h-10 w-3/4 sm:w-1/2 mb-2" />
                    <Skeleton className="h-5 w-2/3 sm:w-1/3" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border rounded-lg overflow-hidden h-[200px]">
                            <div className="p-4 flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-full mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
