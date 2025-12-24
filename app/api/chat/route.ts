import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        console.log('[API] Received messages:', JSON.stringify(messages, null, 2));

        // Validate messages
        if (!messages || messages.length === 0) {
            return new Response(JSON.stringify({ error: 'No messages provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get authenticated user from Supabase
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Try to fetch assets context for THIS user only
        let assetContext = '';
        try {
            const assets = await prisma.asset.findMany({
                where: {
                    userId: user.id,
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    isBusinessAsset: true,
                },
                take: 50,
            });

            if (assets.length > 0) {
                assetContext = `\n\nContexto de Naves (Vehículos/Activos) del usuario:\n` +
                    assets.map(a => `- ${a.name} (${a.type}, ${a.isBusinessAsset ? 'Negocio' : 'Personal'}, ID: ${a.id})`).join('\n');
            }
        } catch (dbError) {
            console.warn('[API] Could not fetch assets from database:', dbError);
        }

        const systemPrompt = `
Eres un asistente virtual inteligente integrado en una aplicación de gestión de vehículos y finanzas.
Tu objetivo es ayudar al usuario a responder preguntas sobre sus datos y realizar acciones automáticas.
${assetContext}

Instrucciones:
1. Responde de manera concisa y amigable.
2. Si el usuario te pide registrar un gasto o ingreso (ej. "mi jeep rojo hizo 300mil"), usa la herramienta 'addFinancialRecord'.
   - Intenta inferir el 'assetId' basándote en el nombre o tipo que menciona el usuario.
   - Si dice "hizo" o "produjo", es un INGRESO (INCOME).
   - Si dice "gastó", "tanqueó", "pagó", es un GASTO (EXPENSE).
3. Si el usuario pregunta detalles de una nave, usa 'getAssetDetails'.
4. Si no estás seguro de a qué nave se refiere, pregunta para aclarar.
5. Usa formato markdown para tus respuestas (bullet points, negrita).
6. Hoy es ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
`;

        const result = streamText({
            model: google('gemini-2.0-flash-exp'),
            messages,
            system: systemPrompt,
            // TODO: Re-enable tools once we fix the schema issue
            /*
            tools: {
                addFinancialRecord: tool({
                    description: 'Registra un ingreso o gasto financiero para una nave (vehículo/activo). IMPORTANTE: Siempre debes proporcionar TODOS los campos.',
                    parameters: z.object({
                        assetId: z.string().describe('El ID del activo/nave al que asociar el registro. Busca en la lista de naves del usuario.'),
                        type: z.enum(['INCOME', 'EXPENSE']).describe('Tipo de registro: INCOME si el usuario dice "hizo", "produjo", "ganó". EXPENSE si dice "gastó", "pagó", "tanqueó".'),
                        amount: z.number().describe('Monto del registro financiero en pesos colombianos.'),
                        description: z.string().describe('Descripción del movimiento. Ejemplos: "Tiquetería", "Gasolina", "Mantenimiento". Si el usuario no especifica, inventa una descripción relevante basada en el contexto.'),
                        date: z.string().describe('Fecha en formato YYYY-MM-DD. Si el usuario dice "hoy", usa la fecha actual. Si no especifica, usa la fecha actual.'),
                    }),
                    execute: async (params: {
                        assetId: string;
                        type: 'INCOME' | 'EXPENSE';
                        amount: number;
                        description: string;
                        date: string;
                    }) => {
                        try {
                            // Validate date format
                            let parsedDate: Date;
                            try {
                                parsedDate = new Date(params.date);
                                if (isNaN(parsedDate.getTime())) {
                                    parsedDate = new Date();
                                }
                            } catch {
                                parsedDate = new Date();
                            }

                            const record = await prisma.financialRecord.create({
                                data: {
                                    assetId: params.assetId,
                                    type: params.type,
                                    amount: params.amount,
                                    description: params.description || (params.type === 'INCOME' ? 'Ingreso' : 'Gasto'),
                                    date: parsedDate,
                                },
                            });
                            return `✅ Registro creado exitosamente: ${params.type === 'INCOME' ? 'Ingreso' : 'Gasto'} de $${params.amount.toLocaleString('es-CO')} para la nave. Descripción: ${params.description}`;
                        } catch (error) {
                            console.error('[Tool] addFinancialRecord error:', error);
                            return "❌ Hubo un error al intentar crear el registro financiero. Verifica que el assetId sea correcto.";
                        }
                    },
                }),
                getAssetDetails: tool({
                    description: 'Obtiene detalles completos de una nave, incluyendo sus últimos mantenimientos y balance financiero reciente.',
                    parameters: z.object({
                        assetId: z.string().describe('El ID de la nave a consultar.'),
                    }),
                    execute: async (params: { assetId: string }) => {
                        try {
                            const asset = await prisma.asset.findUnique({
                                where: {
                                    id: params.assetId,
                                    userId: user.id, // Security: ensure user owns this asset
                                },
                                include: {
                                    maintenanceRecords: {
                                        take: 5,
                                        orderBy: { date: 'desc' }
                                    },
                                    financialRecords: {
                                        take: 10,
                                        orderBy: { date: 'desc' }
                                    }
                                }
                            });

                            if (!asset) return "❌ No se encontró información para esta nave o no tienes acceso a ella.";

                            // Calculate totals
                            const totalIncome = asset.financialRecords
                                .filter(r => r.type === 'INCOME')
                                .reduce((sum, r) => sum + Number(r.amount), 0);

                            const totalExpenses = asset.financialRecords
                                .filter(r => r.type === 'EXPENSE')
                                .reduce((sum, r) => sum + Number(r.amount), 0);

                            return `
**${asset.name}** (${asset.type})
- **Tipo**: ${asset.isBusinessAsset ? 'Negocio' : 'Personal'}
- **Balance reciente**: $${(totalIncome - totalExpenses).toLocaleString('es-CO')}
  - Ingresos: $${totalIncome.toLocaleString('es-CO')}
  - Gastos: $${totalExpenses.toLocaleString('es-CO')}
- **Últimos mantenimientos**: ${asset.maintenanceRecords.length} registros
- **Últimos movimientos financieros**: ${asset.financialRecords.length} registros
`;
                        } catch (error) {
                            console.error('[Tool] getAssetDetails error:', error);
                            return "❌ Hubo un error al consultar los detalles de la nave.";
                        }
                    },
                }),
            },
            */
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
