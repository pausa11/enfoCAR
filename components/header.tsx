
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

export function Header() {
    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14 sm:h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-2 px-3 sm:p-3 sm:px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"} className="text-base sm:text-lg">enfoCAR</Link>
                </div>
                <Suspense>
                    <AuthButton />
                </Suspense>
            </div>
        </nav>
    );
}
