import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { type Session } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

interface AuthLayerProps {
    children: React.ReactNode;
}

// Pre-computed stable durations for "Maelstrom" letters (9 letters)
// Using seeded values instead of Math.random() to satisfy React purity rules
const LETTER_DURATIONS = [4.2, 5.1, 4.8, 5.5, 4.3, 5.8, 4.6, 5.2, 4.9];

export const AuthLayer: React.FC<AuthLayerProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-ocean-200/50 font-sans tracking-widest uppercase text-sm">
                <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    Submerging...
                </motion.div>
            </div>
        );
    }

    if (!session) {
        const title = "Maelstrom";

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#f0f9ff] relative z-50">
                <div className="mb-12 flex">
                    {title.split('').map((char, i) => (
                        <motion.span
                            key={i}
                            className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#e0f2fe] to-[#0E405C] drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                            animate={{
                                y: [0, -15, 0],
                                rotate: [0, 2, -2, 0],
                                opacity: [0.8, 1, 0.8],
                            }}
                            transition={{
                                duration: LETTER_DURATIONS[i],
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.15,
                            }}
                            style={{ display: 'inline-block' }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    <button
                        onClick={handleLogin}
                        className="group relative px-8 py-4 bg-black/20 backdrop-blur-md text-ocean-200 border border-ocean-500/30 rounded-full overflow-hidden transition-all hover:border-ocean-400/60 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                    >
                        <div className="absolute inset-0 bg-ocean-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <span className="relative font-medium tracking-wide flex items-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            Enter the Depths
                        </span>
                    </button>
                </motion.div>

                <motion.p
                    className="absolute bottom-8 text-ocean-600/50 text-xs tracking-[0.2em] uppercase"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    Journaling for the Subconscious
                </motion.p>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
};
