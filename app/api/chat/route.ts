import { google } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
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
        const assets = await prisma.asset.findMany({
            where: { userId: user.id },
            select: { id: true, name: true, type: true, isBusinessAsset: true },
            take: 50,
        });
        if (assets.length > 0) {
            assetContext = `\n\nContexto de Naves (Vehículos/Activos) del usuario:\n` +
                assets.map(a => `- ${a.name} (${a.type}, ${a.isBusinessAsset ? 'Negocio' : 'Personal'}, ID: ${a.id})`).join('\n');
        }

        const systemPrompt = `\nEres un asistente virtual inteligente integrado en una aplicación de gestión de vehículos y finanzas.
Tu objetivo es ayudar al usuario a responder preguntas sobre sus datos y realizar acciones automáticas.
${assetContext}\n\nInstrucciones:\n1. Responde de manera concisa y amigable.\n2. Usa formato markdown para tus respuestas (bullet points, negrita).\n3. Hoy es ${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.\n`;

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        const userText = lastMessage?.content || '';

        // Check if user wants to register a financial record
        const lowerText = userText.toLowerCase();
        let toolExecutionResult = '';

        // Check for confirmation responses
        const confirmationKeywords = ['sí', 'si', 'yes', 'ok', 'dale', 'confirmo', 'confirmar', 'claro', 'por supuesto'];
        const negationKeywords = ['no', 'nope', 'nah', 'cancelar', 'mejor no'];

        const isConfirmation = confirmationKeywords.some(keyword => lowerText === keyword || lowerText.includes(keyword));
        const isNegation = negationKeywords.some(keyword => lowerText === keyword || lowerText.includes(keyword));

        // Expanded keyword detection
        const incomeKeywords = ['hizo', 'produjo', 'generó', 'ganó', 'ingresó'];
        const expenseKeywords = ['gastó', 'tanqueó', 'pagó', 'compré', 'compre', 'le eché', 'le puse', 'se gastó', 'gasto', 'mantenimiento', 'reparación', 'arreglo'];

        const hasIncomeKeyword = incomeKeywords.some(keyword => lowerText.includes(keyword));
        const hasExpenseKeyword = expenseKeywords.some(keyword => lowerText.includes(keyword));

        if (hasIncomeKeyword || hasExpenseKeyword) {
            // Try to extract amount (supports formats like: 1millon, 100mil, 100k, 100000)
            const amountMatch = userText.match(/(\d+(?:[.,]\d+)?)\s*(?:mill[oó]n|mil|k)?/i);
            if (amountMatch) {
                let amount = parseFloat(amountMatch[1].replace(',', '.'));

                // Check what multiplier to use
                if (lowerText.includes('millon') || lowerText.includes('millón')) {
                    amount = amount * 1000000;
                } else if (lowerText.includes('mil') || lowerText.includes('k')) {
                    amount = amount * 1000;
                } else {
                    // Colombian convention: if no suffix and number is small (< 10000), assume thousands
                    // e.g., "se hizo 300" = 300,000 not 300
                    if (amount < 10000) {
                        amount = amount * 1000;
                    }
                }

                // Determine if it's income or expense (expense takes priority if both keywords present)
                const isIncome = hasIncomeKeyword && !hasExpenseKeyword;
                const type = isIncome ? 'INCOME' : 'EXPENSE';

                // Try to find matching asset
                let matchedAsset = null;
                for (const asset of assets) {
                    if (lowerText.includes(asset.name.toLowerCase()) || lowerText.includes(asset.type.toLowerCase())) {
                        matchedAsset = asset;
                        break;
                    }
                }

                if (matchedAsset) {
                    // For expenses, ask if it should also be registered as maintenance
                    if (!isIncome) {
                        toolExecutionResult = `\n\n[CONFIRMACIÓN REQUERIDA] 💬 Detecté un gasto de $${amount.toLocaleString('es-CO')} para ${matchedAsset.name}.\n\n¿Quieres que también lo registre como un mantenimiento? (La mayoría de gastos son mantenimientos)\n\nResponde "sí" para confirmar o "no" para solo registrar el gasto.`;
                    } else {
                        // For income, just create it directly
                        try {
                            await prisma.financialRecord.create({
                                data: {
                                    assetId: matchedAsset.id,
                                    type: type as 'INCOME' | 'EXPENSE',
                                    amount,
                                    description: userText,
                                    date: new Date(),
                                },
                            });
                            toolExecutionResult = `\n\n[ACCIÓN COMPLETADA] ✅ Registré un ingreso de $${amount.toLocaleString('es-CO')} para ${matchedAsset.name}.`;
                            console.log('[Tool Executed]', toolExecutionResult);
                        } catch (error) {
                            console.error('[Tool Error]', error);
                            toolExecutionResult = '\n\n[ERROR] ❌ No pude registrar la transacción.';
                        }
                    }
                }
            }
        } else if (isConfirmation || isNegation) {
            // Check if the previous user message was about an expense
            // Find all user messages
            const userMessages = messages.filter((m: any) => m.role === 'user');

            console.log('[DEBUG] isConfirmation:', isConfirmation, 'isNegation:', isNegation);
            console.log('[DEBUG] User messages count:', userMessages.length);

            if (userMessages.length >= 2) {
                // Get the message before the current one
                const previousUserMessage = userMessages[userMessages.length - 2];
                const prevText = (previousUserMessage.content || '').toLowerCase();

                console.log('[DEBUG] Previous user message:', previousUserMessage.content);

                // Check if it was an expense
                const hadExpenseKeyword = expenseKeywords.some(keyword => prevText.includes(keyword));

                if (hadExpenseKeyword) {
                    // Re-extract the amount and asset from the previous message
                    const amountMatch = previousUserMessage.content?.match(/(\d+(?:[.,]\d+)?)\s*(?:mill[oó]n|mil|k)?/i);

                    if (amountMatch) {
                        let amount = parseFloat(amountMatch[1].replace(',', '.'));

                        // Apply multipliers
                        if (prevText.includes('millon') || prevText.includes('millón')) {
                            amount = amount * 1000000;
                        } else if (prevText.includes('mil') || prevText.includes('k')) {
                            amount = amount * 1000;
                        } else if (amount < 10000) {
                            amount = amount * 1000;
                        }

                        // Find matching asset
                        let matchedAsset = null;
                        for (const asset of assets) {
                            if (prevText.includes(asset.name.toLowerCase()) || prevText.includes(asset.type.toLowerCase())) {
                                matchedAsset = asset;
                                break;
                            }
                        }

                        if (matchedAsset) {
                            console.log('[DEBUG] Re-matched asset:', matchedAsset.name, 'amount:', amount);

                            try {
                                if (isConfirmation) {
                                    // Determine maintenance type based on keywords
                                    let maintenanceType = 'OTRO';

                                    if (prevText.includes('aceite') && prevText.includes('motor')) {
                                        maintenanceType = 'CAMBIO_ACEITE_MOTOR';
                                    } else if (prevText.includes('aceite') && (prevText.includes('transmision') || prevText.includes('transmisión'))) {
                                        maintenanceType = 'CAMBIO_ACEITE_TRANSMISION';
                                    } else if (prevText.includes('llanta')) {
                                        maintenanceType = 'CAMBIO_LLANTAS';
                                    } else if (prevText.includes('filtro')) {
                                        maintenanceType = 'CAMBIO_FILTROS';
                                    } else if (prevText.includes('freno')) {
                                        maintenanceType = 'REVISION_FRENOS';
                                    } else if (prevText.includes('alineacion') || prevText.includes('alineación') || prevText.includes('balanceo')) {
                                        maintenanceType = 'ALINEACION_BALANCEO';
                                    } else if (prevText.includes('bateria') || prevText.includes('batería')) {
                                        maintenanceType = 'BATERIA';
                                    } else if (prevText.includes('repuesto')) {
                                        maintenanceType = 'REPUESTOS';
                                    }

                                    // Create maintenance record first
                                    const maintenanceRecord = await prisma.maintenanceRecord.create({
                                        data: {
                                            assetId: matchedAsset.id,
                                            type: maintenanceType as any,
                                            description: previousUserMessage.content || '',
                                            cost: amount,
                                            date: new Date(),
                                        },
                                    });

                                    // Create financial record linked to maintenance
                                    await prisma.financialRecord.create({
                                        data: {
                                            assetId: matchedAsset.id,
                                            type: 'EXPENSE',
                                            amount,
                                            description: previousUserMessage.content || '',
                                            date: new Date(),
                                            maintenanceRecordId: maintenanceRecord.id,
                                        },
                                    });

                                    toolExecutionResult = `\n\n[ACCIÓN COMPLETADA] ✅ Perfecto! Registré:\n- Gasto de $${amount.toLocaleString('es-CO')} para ${matchedAsset.name}\n- Mantenimiento tipo: ${maintenanceType.replace(/_/g, ' ')}\n\nTodo listo! 🎉`;
                                } else {
                                    // Just create the financial record without maintenance
                                    await prisma.financialRecord.create({
                                        data: {
                                            assetId: matchedAsset.id,
                                            type: 'EXPENSE',
                                            amount,
                                            description: previousUserMessage.content || '',
                                            date: new Date(),
                                        },
                                    });

                                    toolExecutionResult = `\n\n[ACCIÓN COMPLETADA] ✅ Registré solo el gasto de $${amount.toLocaleString('es-CO')} para ${matchedAsset.name}.`;
                                }
                                console.log('[Tool Executed]', toolExecutionResult);
                            } catch (error) {
                                console.error('[Tool Error]', error);
                                toolExecutionResult = '\n\n[ERROR] ❌ No pude registrar la transacción.';
                            }
                        }
                    }
                }
            }
        }

        // Normalize messages
        const formattedMessages = messages
            .map((msg: any) => {
                if (typeof msg === 'string') {
                    return { role: 'user', content: msg };
                }
                const content = msg.content ?? msg.text;
                if (!content || typeof content !== 'string' || content.trim() === '') {
                    return null;
                }
                return {
                    role: msg.role ?? 'user',
                    content: content,
                };
            })
            .filter((msg) => msg !== null && !(msg.role === 'assistant' && (!msg.content || (typeof msg.content === 'string' && msg.content.trim() === '')))) as CoreMessage[];

        // If we executed a tool, add it to the system prompt for context
        const enhancedSystemPrompt = toolExecutionResult
            ? systemPrompt + '\n\n' + toolExecutionResult + '\n\nResponde al usuario confirmando esta acción de manera amigable.'
            : systemPrompt;

        console.log('[API] Messages count:', formattedMessages.length);
        console.log('[API] Formatted messages:', JSON.stringify(formattedMessages, null, 2));
        console.log('[API] Tool execution result:', toolExecutionResult || 'none');

        try {
            const result = streamText({
                model: google('gemini-2.5-flash'),
                messages: formattedMessages,
                system: enhancedSystemPrompt,
            });

            return result.toTextStreamResponse();
        } catch (streamError) {
            console.error('[API] streamText failed:', streamError);
            console.error('[API] Error details:', JSON.stringify(streamError, null, 2));

            // Return a simple text response as fallback
            const fallbackMessage = toolExecutionResult
                ? toolExecutionResult.replace('[ACCIÓN COMPLETADA] ', '').replace('[ERROR] ', '')
                : 'Recibí tu mensaje. ¿En qué más puedo ayudarte?';

            return new Response(fallbackMessage, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            });
        }
    } catch (error) {
        console.error('[API] Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
