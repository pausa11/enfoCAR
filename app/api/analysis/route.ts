import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt } = await req.json();

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            prompt,
        });

        return new Response(text);
    } catch (error) {
        console.error("Analysis Error:", error);
        return new Response("Error al generar análisis.", { status: 500 });
    }
}

