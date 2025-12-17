import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

// Sample notes for testing
const SAMPLE_NOTES = [
    "Feeling overwhelmed today but trying to stay positive",
    "Had a great coffee this morning, small wins matter",
    "Why do I keep procrastinating on the things I care about?",
    "The sunset was beautiful, reminded me to slow down",
    "Anxious about tomorrow's meeting but prepared",
    "Grateful for the quiet moments between the chaos",
    "Need to call mom, been too long",
    "That book really changed my perspective on things",
    "Struggling to focus, mind keeps wandering",
    "Finally finished that project, feels good",
];

// Sample colors for testing undercurrents - intentionally varied for visual interest
const SAMPLE_COLOR_PALETTES = [
    ['#1a365d', '#e53e3e', '#68d391', '#faf089'], // Emotional complexity: deep blue, passionate red, hopeful green, warm light
    ['#553c9a', '#f6ad55', '#4fd1c5', '#feb2b2'], // Creative tension: purple depth, amber energy, teal calm, soft warmth
    ['#2d3748', '#fc8181', '#90cdf4', '#c6f6d5'], // Introspective: dark gray, anxious coral, peaceful blue, gentle growth
    ['#744210', '#9f7aea', '#48bb78', '#fbd38d'], // Earthy wisdom: brown stability, intuitive purple, vital green, golden insight
    ['#c53030', '#3182ce', '#38a169', '#d69e2e'], // Bold contrast: passionate red, contemplative blue, growth green, illuminating gold
];

interface DevMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

export const DevMenu: React.FC<DevMenuProps> = ({ isVisible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const createDummyNote = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage('❌ Not logged in');
                return;
            }

            const randomNote = SAMPLE_NOTES[Math.floor(Math.random() * SAMPLE_NOTES.length)];

            const { error } = await supabase
                .from('notes')
                .insert({
                    user_id: user.id,
                    content: randomNote,
                });

            if (error) throw error;
            setMessage(`✅ Created note: "${randomNote.substring(0, 30)}..."`);
        } catch (err) {
            setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
        } finally {
            setLoading(false);
        }
    };

    const createDummyUndercurrent = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage('❌ Not logged in');
                return;
            }

            const randomPalette = SAMPLE_COLOR_PALETTES[Math.floor(Math.random() * SAMPLE_COLOR_PALETTES.length)];

            const { error } = await supabase
                .from('undercurrents')
                .insert({
                    user_id: user.id,
                    summary_text: "This is a test undercurrent.[1] It demonstrates the sentiment color feature.[2] The colors should reflect the emotional tone of the analyzed notes.[3]",
                    questions: [
                        "What patterns do you notice in your thoughts?",
                        "How does this resonate with your current state?",
                        "What would you tell yourself a week from now?"
                    ],
                    notes_included: [],
                    sentiment_colors: randomPalette,
                });

            if (error) throw error;
            setMessage(`✅ Created undercurrent with colors: ${randomPalette[0]}`);
        } catch (err) {
            setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
        } finally {
            setLoading(false);
        }
    };

    const create5Notes = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage('❌ Not logged in');
                return;
            }

            const notesToCreate = [];
            for (let i = 0; i < 5; i++) {
                notesToCreate.push({
                    user_id: user.id,
                    content: SAMPLE_NOTES[Math.floor(Math.random() * SAMPLE_NOTES.length)],
                });
            }

            const { error } = await supabase
                .from('notes')
                .insert(notesToCreate);

            if (error) throw error;
            setMessage('✅ Created 5 random notes');
        } catch (err) {
            setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed bottom-4 left-4 z-[100] bg-black/90 border border-ocean-500/50 rounded-lg p-4 backdrop-blur-xl min-w-[280px]"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-ocean-300 font-bold text-sm uppercase tracking-wider">🛠 Dev Menu</h3>
                        <button
                            onClick={onClose}
                            className="text-ocean-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={createDummyNote}
                            disabled={loading}
                            className="w-full px-3 py-2 text-left text-sm bg-ocean-950/50 hover:bg-ocean-900/50 border border-ocean-800/50 rounded text-ocean-200 disabled:opacity-50 transition-colors"
                        >
                            📝 Create 1 Random Note
                        </button>

                        <button
                            onClick={create5Notes}
                            disabled={loading}
                            className="w-full px-3 py-2 text-left text-sm bg-ocean-950/50 hover:bg-ocean-900/50 border border-ocean-800/50 rounded text-ocean-200 disabled:opacity-50 transition-colors"
                        >
                            📝📝 Create 5 Random Notes
                        </button>

                        <button
                            onClick={createDummyUndercurrent}
                            disabled={loading}
                            className="w-full px-3 py-2 text-left text-sm bg-ocean-950/50 hover:bg-ocean-900/50 border border-ocean-800/50 rounded text-ocean-200 disabled:opacity-50 transition-colors"
                        >
                            🌊 Create Test Undercurrent
                        </button>
                    </div>

                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 text-xs text-ocean-300/80 break-words"
                        >
                            {message}
                        </motion.p>
                    )}

                    {loading && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-ocean-400">
                            <div className="w-3 h-3 border-2 border-ocean-400 border-t-transparent rounded-full animate-spin" />
                            Working...
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
