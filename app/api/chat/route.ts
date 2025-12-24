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
${assetContext}\n\nInstrucciones:\n1. Responde de manera concisa y amigable.\n2. Si el usuario te pide registrar un gasto o ingreso (ej. \"mi jeep rojo hizo 300mil\"), usa la herramienta 'addFinancialRecord'.\n   - Intenta inferir el 'assetId' basándote en el nombre o tipo que menciona el usuario.\n   - Si dice \"hizo\" o \"produjo\", es un INGRESO (INCOME).\n   - Si dice \"gastó\", \"tanqueó\", \"pagó\", es un GASTO (EXPENSE).\n3. Usa formato markdown para tus respuestas (bullet points, negrita).\n4. Hoy es ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n`;

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

        if (formattedMessages.length === 0) {
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
                    return `✅ Registrado: ${recordType === 'INCOME' ? 'Ingreso' : 'Gasto'} de $${amount.toLocaleString('es-CO')} - ${description}`;
                } catch (error) {
                    console.error('[Tool] Error:', error);
                    return "❌ Error al registrar.";
                }
            },
        } as any);

        const result = streamText({
            model: google('gemini-2.5-flash'),
            messages: formattedMessages,
            system: systemPrompt,
            tools: {
                addFinancialRecord: addFinancialRecordTool,
            },
            // @ts-expect-error maxSteps is supported in newer versions but types might be outdated in this env
            maxSteps: 5,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('[API] Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
