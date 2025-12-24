'use client';

import { Bot, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};

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
                    messages: [...messages, userMessage].map(m => ({
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
                        className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] shadow-2xl rounded-2xl overflow-hidden border border-border bg-background flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary-foreground/20 rounded-full">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Asistente Virtual</h3>
                                    <p className="text-xs text-primary-foreground/80">
                                        Pregunta sobre tus naves o finanzas
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-primary-foreground/20 text-primary-foreground"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-muted/30" ref={scrollRef}>
                            <div className="flex flex-col gap-4 min-h-full">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center flex-1 h-full text-center text-muted-foreground mt-10">
                                        <Bot className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="text-sm">
                                            Hola! Soy tu copiloto. <br />
                                            Puedo ayudarte a registrar gastos, <br />
                                            consultar mantenimientos y más.
                                        </p>
                                    </div>
                                )}

                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "flex w-full",
                                            m.role === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap",
                                                m.role === 'user'
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-background border border-border rounded-bl-none"
                                            )}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start w-full">
                                        <div className="bg-background border border-border rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Procesando...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-background border-t border-border">
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
                                    placeholder="Escribe un mensaje..."
                                    className="rounded-full bg-muted/50 border-transparent focus:bg-background transition-colors"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !localInput?.trim()}
                                    className="rounded-full w-10 h-10 shrink-0"
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center overflow-hidden hover:bg-primary/90 transition-colors"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                        >
                            <MessageSquare className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
}
