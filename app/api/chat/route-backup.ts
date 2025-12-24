import { google } from '@ai-sdk/google';
import { streamText, tool, type CoreMessage } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Validate messages array
        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: 'No messages provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Authenticate user via Supabase
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Build asset context for the authenticated user
        let assetContext = '';
        try {
            const assets = await prisma.asset.findMany({
                where: { userId: user.id },
                select: { id: true, name: true, type: true, isBusinessAsset: true },
                take: 50,
            });
            if (assets.length > 0) {
                assetContext = `\n\nContexto de Naves (Vehículos/Activos) del usuario:\n` +
                    assets.map(a => `- ${a.name} (${a.type}, ${a.isBusinessAsset ? 'Negocio' : 'Personal'}, ID: ${a.id})`).join('\n');
            }
        } catch (dbError) {
            console.warn('[API] Could not fetch assets from DB:', dbError);
        }

        const systemPrompt = `\nEres un asistente virtual inteligente integrado en una aplicación de gestión de vehículos y finanzas.
Tu objetivo es ayudar al usuario a responder preguntas sobre sus datos y realizar acciones automáticas.
${assetContext}\n\nInstrucciones:
1. Responde de manera concisa y amigable.
2. Si el usuario te pide registrar un gasto o ingreso (ej. "mi jeep rojo hizo 300mil"), usa la herramienta 'addFinancialRecord'.
   - Intenta inferir el 'assetId' basándote en el nombre o tipo que menciona el usuario.
   - Si dice "hizo" o "produjo", es un INGRESO (INCOME).
   - Si dice "gastó", "tanqueó", "pagó", es un GASTO (EXPENSE).
3. IMPORTANTE: Cuando uses una herramienta, SIEMPRE debes generar una respuesta de texto confirmando la acción al usuario (ej. "Listo, registré el ingreso de..."). El usuario NO ve el resultado técnico de la herramienta, solo tu respuesta.
4. Usa formato markdown para tus respuestas (bullet points, negrita).
5. Hoy es ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n`;

        // Normalise messages to {role, content} format expected by @ai-sdk
        const formattedMessages = messages
            .map((msg: any) => {
                if (typeof msg === 'string') {
                    return { role: 'user', content: msg };
                }
                const content = msg.content ?? msg.text;
                if (!content || typeof content !== 'string' || content.trim() === '') {
                    return null; // Filter out empty messages
                }
                return {
                    role: msg.role ?? 'user',
                    content: content,
                };
            })
            .filter((msg) => msg !== null) as CoreMessage[];

        // Additional check: remove any assistant messages with empty content
        const cleanedMessages = formattedMessages.filter((msg, index) => {
            if (msg.role === 'assistant' && (!msg.content || (typeof msg.content === 'string' && msg.content.trim() === ''))) {
                console.log(`[API] Filtering out empty assistant message at index ${index}`);
                return false;
            }
            return true;
        });

        if (cleanedMessages.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid messages provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const financialRecordSchema = z.object({
            assetId: z.string().describe('El ID de la nave (asset).'),
            type: z.enum(['INCOME', 'EXPENSE']).describe('Tipo de registro: INCOME para ingresos, EXPENSE para gastos.'),
            amount: z.number().describe('Monto del registro.'),
            description: z.string().describe('Descripción breve del movimiento.'),
        });

        const addFinancialRecordTool = tool({
            description: 'Registra un ingreso o gasto financiero para una nave.',
            parameters: financialRecordSchema,
            execute: async (params: z.infer<typeof financialRecordSchema>) => {
                const { assetId, type, amount, description } = params;
                // Fallback for type if undefined (Gemini 2.5 sometimes misses it)
                const recordType = type || (description?.toLowerCase().includes('gasto') ? 'EXPENSE' : 'INCOME');

                try {
                    await prisma.financialRecord.create({
                        data: {
                            assetId,
                            type: recordType as 'INCOME' | 'EXPENSE',
                            amount,
                            description,
                            date: new Date(),
                        },
                    });
                    const resultMsg = `✅ Registrado: ${recordType === 'INCOME' ? 'Ingreso' : 'Gasto'} de $${amount.toLocaleString('es-CO')} - ${description}`;
                    console.log('[Tool Execute Result]', resultMsg);
                    return resultMsg;
                } catch (error) {
                    console.error('[Tool] Error:', error);
                    return "❌ Error al registrar.";
                }
            },
        } as any);

        console.log('[API] Formatted messages:', JSON.stringify(cleanedMessages, null, 2));
        console.log('[API] System prompt length:', systemPrompt.length);

        let result;
        try {
            result = streamText({
                model: google('gemini-2.5-flash'),
                messages: cleanedMessages,
                system: systemPrompt,
                tools: {
                    addFinancialRecord: addFinancialRecordTool,
                },
            });
        } catch (error) {
            console.error('[API] streamText error:', error);
            throw error;
        }

        // Use fullStream to get all events including tool calls and results
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let textCount = 0;
                    let lastToolResult: string | null = null;

                    for await (const part of result.fullStream) {
                        console.log('[Stream Event]', part.type, part);

                        if (part.type === 'text-delta') {
                            textCount++;
                            console.log(`[Text Delta #${textCount}]`, part.text);
                            // Send text deltas with prefix "0:"
                            controller.enqueue(encoder.encode(`0:${JSON.stringify(part.text)}\n`));
                        } else if (part.type === 'tool-call') {
                            // Tool calls can be logged but we don't need to send them to client
                            console.log('[Tool Call]', part.toolName, part.input);
                        } else if (part.type === 'tool-result') {
                            // Tool results - save for potential manual confirmation
                            console.log('[Tool Result]', part.toolName, part.output);
                            lastToolResult = part.output as string;
                        } else if (part.type === 'error') {
                            console.error('[Stream Error]', part.error);
                            // Send error as text to user
                            const errorMsg = 'Lo siento, ocurrió un error al procesar tu solicitud.';
                            for (const char of errorMsg) {
                                controller.enqueue(encoder.encode(`0:${JSON.stringify(char)}\n`));
                            }
                        } else if (part.type === 'finish') {
                            console.log('[Finish Event]', part);
                        }
                    }

                    console.log(`[Stream Complete] Total text deltas: ${textCount}`);

                    // If no text was generated but we have a tool result, send it as confirmation
                    if (textCount === 0 && lastToolResult) {
                        console.log('[Manual Confirmation] Sending tool result as message:', lastToolResult);
                        // Split the result into characters and send as deltas for smooth rendering
                        for (const char of lastToolResult) {
                            controller.enqueue(encoder.encode(`0:${JSON.stringify(char)}\n`));
                        }
                    }

                    controller.close();
                } catch (error) {
                    console.error('[Stream Error]', error);
                    // Try to send error message to user
                    try {
                        const errorMsg = 'Error: ' + (error instanceof Error ? error.message : String(error));
                        for (const char of errorMsg) {
                            controller.enqueue(encoder.encode(`0:${JSON.stringify(char)}\n`));
                        }
                    } catch (e) {
                        // If we can't send the error, just close
                    }
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[API] Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
