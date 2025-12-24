'use client';

import { Sparkles, Send, X, Loader2, DollarSign, Wrench, Ship, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

// Custom MontoIA Avatar Component
function MontoIAAvatar({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <div className={cn('relative', sizeClasses[size], className)}>
            <div className="absolute inset-0 bg-blue-600 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="text-white fill-white" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
            </div>
            <motion.div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </div>
    );
}

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [localInput, setLocalInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                        .filter(m => {
                            // Filter out empty assistant messages
                            if (m.role === 'assistant' && (!m.content || m.content.trim() === '')) {
                                return false;
                            }
                            return true;
                        })
                        .map(m => ({
                            role: m.role,
                            content: m.content,
                        })),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }
            const decoder = new TextDecoder();
            let assistantMessage = '';
            const assistantId = 'assistant-temp';

            // Add empty assistant message
            setMessages(prev => [...prev, {
                id: assistantId,
                role: 'assistant',
                content: '',
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMessage += chunk;

                // Update the assistant message in real-time
                setMessages(prev => {
                    const withoutTemp = prev.filter(m => m.id !== assistantId);
                    return [
                        ...withoutTemp,
                        {
                            id: assistantId,
                            role: 'assistant',
                            content: assistantMessage,
                        },
                    ];
                });
            }


            // Finalize with permanent ID
            setMessages(prev => {
                const withoutTemp = prev.filter(m => m.id !== assistantId);
                return [
                    ...withoutTemp,
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: assistantMessage,
                    },
                ];
            });
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-4 right-4 left-4 md:bottom-24 md:right-6 md:left-auto z-50 md:w-[400px] h-[calc(100vh-2rem)] md:h-[650px] max-h-[calc(100vh-2rem)] shadow-2xl rounded-3xl overflow-hidden border border-blue-200 bg-background flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <MontoIAAvatar size="md" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-lg tracking-tight">MontoIA</p>
                                    </div>
                                    <p className="text-xs text-white/90 font-medium">
                                        Tu copiloto de F1
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-white/20 text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 bg-blue-50/30" ref={scrollRef}>
                            <div className="flex flex-col gap-4 min-h-full">
                                {messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center flex-1 h-full text-center mt-10"
                                    >
                                        <MontoIAAvatar size="lg" className="mb-4" />
                                        <p className="text-lg font-bold text-blue-600 mb-2">
                                            ¡Hola! Soy MontoIA
                                        </p>
                                        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                                            Tu asistente inteligente para que coja bien esas curvas. Puedo ayudarte a registrar gastos,
                                            consultar mantenimientos, y mucho más.
                                        </p>
                                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                            {[
                                                { icon: DollarSign, label: 'Registrar gasto' },
                                                { icon: Wrench, label: 'Ver mantenimientos' },
                                                { icon: Ship, label: 'Mis naves' }
                                            ].map((suggestion, i) => (
                                                <motion.button
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    onClick={() => {
                                                        setLocalInput(suggestion.label);
                                                    }}
                                                    className="px-3 py-1.5 text-xs rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all font-medium flex items-center gap-1.5"
                                                >
                                                    <suggestion.icon className="w-3.5 h-3.5" />
                                                    {suggestion.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {messages.map((m, index) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex w-full gap-2",
                                            m.role === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {m.role === 'assistant' && (
                                            <MontoIAAvatar size="sm" className="mt-1 flex-shrink-0" />
                                        )}
                                        <div
                                            className={cn(
                                                "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-lg",
                                                m.role === 'user'
                                                    ? "bg-blue-600 text-white rounded-br-md font-medium"
                                                    : "bg-white border border-blue-100 rounded-bl-md text-gray-800"
                                            )}
                                        >
                                            {m.role === 'assistant' ? (
                                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:font-bold prose-strong:text-gray-900">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                            ul: ({ children }) => <ul className="list-disc ml-4 mb-2 last:mb-0">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 last:mb-0">{children}</ol>,
                                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                                            strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                                                            em: ({ children }) => <em className="italic">{children}</em>,
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span className="whitespace-pre-wrap">{m.content}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start w-full gap-2"
                                    >
                                        <MontoIAAvatar size="sm" className="mt-1" />
                                        <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <motion.div
                                                    className="w-2 h-2 bg-blue-500 rounded-full"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                />
                                                <motion.div
                                                    className="w-2 h-2 bg-blue-400 rounded-full"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                />
                                                <motion.div
                                                    className="w-2 h-2 bg-blue-600 rounded-full"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                />
                                            </div>
                                            <span className="text-xs text-blue-600 font-medium ml-1">Pensando...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-blue-100">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!localInput?.trim() || isLoading) return;

                                    const userMessage = localInput;
                                    setLocalInput('');
                                    await sendMessage(userMessage);
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={localInput}
                                    onChange={(e) => setLocalInput(e.target.value)}
                                    placeholder="Escribe tu mensaje..."
                                    className="rounded-full bg-blue-50 border-blue-200 focus:border-blue-400 focus:bg-white transition-all placeholder:text-blue-300"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !localInput?.trim()}
                                    className="rounded-full w-11 h-11 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/50 flex items-center justify-center overflow-hidden transition-colors"
                >

                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="relative z-10"
                    >
                        <MontoIAAvatar size="md" className="scale-90" />
                    </motion.div>

                    {/* Pulse ring effect */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-blue-400"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.button>
            )}
        </>
    );
}
