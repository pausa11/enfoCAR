import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Dashboard Analysis Skeleton */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-64 bg-blue-200/50 dark:bg-blue-800/50" />
                    </div>
                    <Skeleton className="h-8 w-8 bg-blue-200/50 dark:bg-blue-800/50" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-full bg-blue-200/50 dark:bg-blue-800/50" />
                        <Skeleton className="h-4 w-3/4 bg-blue-200/50 dark:bg-blue-800/50" />
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards Skeleton */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-1" />
                            {i === 1 && <Skeleton className="h-3 w-40" />}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Net Income Highlight Skeleton */}
            <div className="grid gap-4 grid-cols-1">
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-64" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Skeleton */}
            <Skeleton className="h-7 w-48 mt-2" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Skeleton className="h-[300px] w-[300px] rounded-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Breakdown Table Skeleton */}
            <div className="flex flex-col gap-4">
                <Skeleton className="h-7 w-48 mt-4" />
                <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-4 p-4 border-b bg-muted/50">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-4 p-4 border-b last:border-0">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
