import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import {
    isOnline,
    saveNoteOffline,
    getPendingNotes,
    clearPendingNote
} from '../lib/offlineStorage';
import { OfflineIndicator } from './OfflineIndicator';

// Pre-computed stable durations for "Maelstrom" letters (9 letters)
const LETTER_DURATIONS = [6.3, 7.8, 6.9, 8.1, 6.5, 7.2, 8.4, 6.7, 7.5];

interface TheMaelstromProps {
    onDive: () => void;
}

export const TheMaelstrom: React.FC<TheMaelstromProps> = ({ onDive }) => {
    const [inputText, setInputText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync pending notes when coming back online
    const syncPendingNotes = useCallback(async () => {
        if (!isOnline()) return;

        const pendingNotes = getPendingNotes();
        if (pendingNotes.length === 0) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        for (const note of pendingNotes) {
            try {
                const { error } = await supabase
                    .from('notes')
                    .insert({
                        user_id: user.id,
                        content: note.content,
                    });

                if (!error) {
                    clearPendingNote(note.id);
                }
            } catch (err) {
                console.error('Error syncing note:', err);
            }
        }
    }, []);

    // Try to sync pending notes on mount and when coming back online
    useEffect(() => {
        syncPendingNotes();
    }, [syncPendingNotes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setIsSubmitting(true);
        const noteContent = inputText.trim();

        // Check if we're online
        if (isOnline()) {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { error } = await supabase
                        .from('notes')
                        .insert({
                            user_id: user.id,
                            content: noteContent,
                        });

                    if (error) throw error;
                }
            } catch (error) {
                console.error('Error saving note, saving offline:', error);
                // Save to offline queue on failure
                saveNoteOffline(noteContent);
            }
        } else {
            // Save to offline queue when offline
            saveNoteOffline(noteContent);
        }

        // Animation sequence
        // Simple fade out (1s) then show success
        setTimeout(() => {
            setShowSuccess(true);
            setInputText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }

            // Hide success message and reset after delay
            setTimeout(() => {
                setShowSuccess(false);
                setIsSubmitting(false);
            }, 3000);
        }, 1000);
    };

    return (
        <div className="relative w-full min-h-screen bg-transparent overflow-hidden flex flex-col items-center justify-center text-ocean-100">
            {/* Offline Indicator */}
            <OfflineIndicator onSyncRequest={syncPendingNotes} />

            {/* Dark depth overlay - Moved from Deep Ocean */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent pointer-events-none z-0" />

            {/* Floating Header */}
            <div className="absolute top-8 z-20 flex">
                {LETTER_DURATIONS.map((duration, i) => (
                    <motion.span
                        key={i}
                        className="text-xl md:text-2xl font-bold tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 2, -2, 0],
                            opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                        }}
                        style={{ display: 'inline-block' }}
                    >
                        {"Maelstrom"[i]}
                    </motion.span>
                ))}
            </div>

            {/* Input Container */}
            <div className="z-10 w-full max-w-2xl relative px-6 sm:px-0 min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!showSuccess ? (
                        <motion.div
                            key="input-box"
                            className="rounded-2xl p-6 sm:p-8 relative w-full transition-all duration-1000"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isSubmitting ? {
                                opacity: 0,
                                scale: 0.95, // Slight shrink for feel
                                filter: 'blur(10px)'
                            } : {
                                opacity: 1,
                                scale: 1,
                                filter: 'blur(0px)'
                            }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            style={{ minHeight: '200px' }}
                        >
                            {/* Background Element */}
                            <motion.div
                                className="absolute inset-0 bg-ocean-950/90 border border-ocean-500/30 shadow-[0_0_60px_rgba(14,165,233,0.15)] backdrop-blur-xl rounded-2xl -z-10"
                            />

                            {/* Text Input Form - Always visible until box disappears */}
                            <form
                                onSubmit={handleSubmit}
                                className="w-full h-full flex flex-col items-center justify-center relative min-h-[140px] cursor-text"
                                onClick={() => textareaRef.current?.focus()}
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => {
                                        setInputText(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                                            e.stopPropagation();
                                        }
                                    }}
                                    maxLength={280}
                                    placeholder="What's on your mind?"
                                    className={`w-full bg-transparent text-ocean-100/90 placeholder:text-ocean-100/70 text-lg sm:text-xl leading-relaxed font-sans focus:outline-none resize-none text-center my-8 ${inputText ? 'caret-ocean-400' : 'caret-transparent'}`}
                                    rows={1}
                                    autoFocus
                                    disabled={isSubmitting}
                                    spellCheck={false}
                                    enterKeyHint="send"
                                />

                                {/* Bottom Row: Character Count & Submit Button */}
                                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between">
                                    <div className="text-xs text-ocean-100/70 font-sans font-medium pointer-events-none select-none tracking-wide">
                                        {inputText.length} / 280
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="hidden sm:block text-xs text-ocean-100/70 font-sans font-medium tracking-wide">
                                            ⌘ + Enter
                                        </span>
                                        <span className="hidden sm:block text-xs text-ocean-100/50 font-sans">
                                            or
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={!inputText.trim() || isSubmitting}
                                            className="p-2 text-ocean-400 hover:text-ocean-200 disabled:opacity-30 transition-all duration-300 transform hover:scale-110 active:scale-95"
                                            aria-label="Submit thought"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center"
                        >
                            {["Note", "added", "to", "The", "Maelstrom."].map((word, i) => (
                                <span key={i} className="text-lg sm:text-xl font-medium text-white/90 tracking-wide">
                                    {word}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dive Deeper Prompt */}
            <div
                className="absolute bottom-8 flex flex-col items-center text-ocean-200/40 cursor-pointer animate-bounce"
                onClick={onDive}
            >
                <span className="text-sm font-medium tracking-wider mb-1">Dive Deeper</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
};
