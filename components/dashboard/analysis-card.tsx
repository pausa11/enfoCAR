'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Brain } from 'lucide-react';
import ShinyText from '@/components/reactBits/ShinyText';
import { Button } from '@/components/ui/button';

interface AnalysisCardProps {
    title: string;
    analysis: string;
    isLoading: boolean;
    error: boolean;
    usingCache: boolean;
    onRefresh: () => void;
    loadingText?: string;
    cardClassName?: string;
    titleClassName?: string;
    refreshButtonClassName?: string;
}

export function AnalysisCard({
    title,
    analysis,
    isLoading,
    error,
    usingCache,
    onRefresh,
    loadingText = "Analizando...",
    cardClassName = "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800",
    titleClassName = "text-blue-800 dark:text-blue-300",
    refreshButtonClassName = "hover:bg-blue-100 dark:hover:bg-blue-900"
}: AnalysisCardProps) {
    return (
        <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-lg font-medium flex items-center gap-2 ${titleClassName}`}>
                    <ShinyText
                        text={title}
                        className=""
                        speed={3}
                    />
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className={`h-8 w-8 ${refreshButtonClassName}`}
                    title={usingCache ? "Actualizar análisis (usando cache)" : "Actualizar análisis"}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {analysis ? (
                    <div className="text-sm sm:text-base leading-relaxed">
                        {analysis.split('\n').map((line, i) => {
                            // Handle bold text with **
                            const parts = line.split('**');
                            const formattedLine = parts.map((part, index) =>
                                index % 2 === 1 ? <strong key={index} className="font-bold">{part}</strong> : part
                            );

                            // Handle bullet points
                            if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                                return (
                                    <div key={i} className="flex gap-2 ml-4 mb-1 last:mb-0">
                                        <span className="text-primary">•</span>
                                        <div className='flex-1'>{
                                            parts.map((part, index) => {
                                                // Clean the first part if it has the bullet
                                                if (index === 0) return part.replace(/^[\*\-]\s*/, '');
                                                return index % 2 === 1 ? <strong key={index} className="font-bold text-foreground">{part}</strong> : part
                                            })
                                        }</div>
                                    </div>
                                );
                            }

                            // Handle numbered lists
                            if (/^\d+\./.test(line.trim())) {
                                return (
                                    <div key={i} className="flex gap-2 ml-4 mb-1 last:mb-0">
                                        <span className="font-bold text-primary">{line.trim().split('.')[0]}.</span>
                                        <div className='flex-1'>{
                                            parts.map((part, index) => {
                                                if (index === 0) return part.replace(/^\d+\.\s*/, '');
                                                return index % 2 === 1 ? <strong key={index} className="font-bold text-foreground">{part}</strong> : part
                                            })
                                        }</div>
                                    </div>
                                );
                            }

                            // Empty lines - skip them to avoid double spacing with margins
                            if (!line.trim()) return null;

                            // Regular paragraphs
                            return <p key={i} className="mb-2 last:mb-0">{formattedLine}</p>;
                        })}

                        {usingCache && (
                            <div className="mt-2 flex justify-end" title="Análisis en memoria">
                                <Brain className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center gap-2 text-sm">
                        <ShinyText
                            text={loadingText}
                            className="animate-pulse"
                            speed={2}
                        />
                    </div>
                ) : error ? (
                    <ShinyText
                        text="No se pudo cargar el análisis. Intenta de nuevo."
                        className="text-sm text-red-600 dark:text-red-400"
                        speed={3}
                    />
                ) : null}
            </CardContent>
        </Card>
    );
}
