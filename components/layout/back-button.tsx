'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
}

export function BackButton({ label = "Volver" }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            className="self-start gap-2 -ml-2 hover:bg-transparent"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}
