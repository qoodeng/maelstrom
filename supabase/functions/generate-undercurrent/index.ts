import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

// Type definitions
interface Note {
    id: string;
    content: string;
    created_at: string;
}

interface AIOutput {
    summary_text: string;
    questions: string[];
    sentiment_colors: string[]; // 4 hex colors representing emotional palette
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Calculate cutoff date based on timeframe
function getTimeframeCutoff(timeframe: string): Date | null {
    const now = new Date()
    switch (timeframe) {
        case '24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000)
        case 'week':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case 'month':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case 'all':
        default:
            return null // No cutoff, get all notes
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Parse request body for timeframe
        let timeframe = 'all'
        try {
            const body = await req.json()
            timeframe = body.timeframe || 'all'
        } catch {
            // No body or invalid JSON, use default
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Get the user from the authorization header
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders })
        }

        // 2. Fetch notes (no is_processed filter - notes can be reused)
        let query = supabaseClient
            .from('notes')
            .select('id, content, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        // Apply timeframe filter if specified
        const cutoffDate = getTimeframeCutoff(timeframe)
        if (cutoffDate) {
            query = query.gte('created_at', cutoffDate.toISOString())
        }

        const { data: notes, error: notesError } = await query

        if (notesError) throw notesError

        if (!notes || notes.length < 3) {
            return new Response(
                JSON.stringify({ message: 'Not enough turbulence yet. Keep writing.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Limit to most recent 20 notes for AI processing
        const notesToProcess: Note[] = notes.slice(0, 20)

        // 3. Prepare prompt for Gemini
        const notesText = notesToProcess.map((n: Note, i: number) => `Note ${i + 1} (ID: ${n.id}): "${n.content}"`).join('\n')

        console.log('Preparing Gemini prompt with notes:', notesToProcess.length, 'timeframe:', timeframe);

        const prompt = `
            You are an introspective analyst called 'The Deep'.
            You are analyzing a stream of short, disconnected user notes.
            Your goal is to OBSERVE the notes and identify any emerging patterns, themes, or emotional currents.
            
            IMPORTANT: Do NOT force connections where there are none. If the notes are disconnected, acknowledge that variety. If a theme emerges naturally, highlight it.

            Here are the notes:
            ${notesText}

            Output a JSON object with the following structure:
            {
                "summary_text": "A 3-sentence observation of the content... Include inline citations like [1], [2] corresponding to the Note numbers above.",
                "questions": ["Provocative question 1?", "Provocative question 2?", "Provocative question 3?"],
                "sentiment_colors": ["#hex1", "#hex2", "#hex3", "#hex4"]
            }

            SENTIMENT COLORS GUIDE - Return exactly 4 DISTINCT hex color codes with VISUAL VARIETY:
            - Color 1: Dominant Base Emotion - The core, primary emotion. Choose a saturated, distinctive color (e.g., deep navy for Sadness, rich gold for Joy, burgundy for Anger).
            - Color 2: Tonal Intensity - A CONTRASTING color showing emotional intensity or a sub-emotion. Avoid just making this lighter/darker - pick a different hue that relates emotionally.
            - Color 3: Nuance/Accent - The contradictory or accent emotion. This MUST be a different color family (e.g., if base is blue, use orange, coral, or green here).
            - Color 4: Context/Atmosphere - A softer color for atmosphere, but still DISTINCT from the others. Can be warmer or cooler to balance the palette.
            
            IMPORTANT: The 4 colors should look VARIED and INTERESTING together, not monochromatic. Aim for an artistic, emotionally evocative palette with contrast.

            IMPORTANT:
            - The "summary_text" MUST include inline citations to reference specific notes.
            - Place citations AFTER punctuation. This is critical. (e.g., "This is a thought."[1] is CORRECT. "This is a thought[1]." is WRONG.)
            - Group multiple citations into a single bracket, e.g., "[1, 3]".
            - The "questions" should be simple, direct, and written in plain English. Avoid scholarly, clinical, or overly abstract language. Ask as if you are a curious friend, not a therapist or professor. Focus on the core emotion or idea.
            - The "sentiment_colors" must be exactly 4 valid hex color codes (e.g., "#1e3a5f").
            - Return ONLY the JSON object.
        `

        // 4. Call Gemini API
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            throw new Error('Missing GEMINI_API_KEY')
        }

        let aiOutput: AIOutput;
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Clean up markdown code blocks if present
            let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

            // Sometimes the model adds extra text before or after the JSON
            const firstBrace = jsonStr.indexOf('{');
            const lastBrace = jsonStr.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }

            aiOutput = JSON.parse(jsonStr);
        } catch (aiError) {
            console.error('AI Generation/Parsing Error:', aiError);
            throw aiError;
        }

        // 5. Insert into undercurrents (notes are NOT marked as processed - they can be reused)
        const { data: undercurrent, error: insertError } = await supabaseClient
            .from('undercurrents')
            .insert({
                user_id: user.id,
                summary_text: aiOutput.summary_text,
                questions: aiOutput.questions,
                notes_included: notesToProcess.map((n: Note) => n.id),
                sentiment_colors: aiOutput.sentiment_colors || ['#1e3a5f', '#2d5a7c', '#3d7a9c', '#4d9abc'],
            })
            .select()
            .single()

        if (insertError) throw insertError

        return new Response(
            JSON.stringify(undercurrent),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        return new Response(
            JSON.stringify({ error: errorMessage, stack: errorStack }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})

