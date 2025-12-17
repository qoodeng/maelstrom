import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { UndercurrentCard } from './UndercurrentCard';
import { NoteCard } from './NoteCard';
import { ConfirmModal } from './ConfirmModal';
import { NoteViewerModal } from './NoteViewerModal';
import { TimeframeDropdown } from './TimeframeDropdown';
import { UndercurrentSkeletonList, NoteSkeletonList } from './Skeletons';

interface Undercurrent {
    id: string;
    summary_text: string;
    questions: string[];
    notes_included: string[];
    created_at: string;
}

interface Note {
    id: string;
    content: string;
    created_at: string;
}

interface TidePoolProps {
    onSurface: () => void;
}

const TIMEFRAME_OPTIONS = [
    { value: '24h', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
] as const;

export const TidePool: React.FC<TidePoolProps> = ({ onSurface }) => {
    const [undercurrents, setUndercurrents] = useState<Undercurrent[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loadingUndercurrents, setLoadingUndercurrents] = useState(true);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState<Note[] | null>(null);
    const [timeframe, setTimeframe] = useState<'24h' | 'week' | 'month'>('month');
    const [timeframeOpen, setTimeframeOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'undercurrents' | 'thoughts'>('undercurrents');
    const [warning, setWarning] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'note' | 'undercurrent'; id: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUndercurrents();
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoadingNotes(true);
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notes:', error);
        } else {
            setNotes(data || []);
        }
        setLoadingNotes(false);
    };

    const fetchUndercurrents = async () => {
        setLoadingUndercurrents(true);
        const { data, error } = await supabase
            .from('undercurrents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching undercurrents:', error);
        } else {
            setUndercurrents(data || []);
        }
        setLoadingUndercurrents(false);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        const { type, id } = deleteConfirm;
        const table = type === 'note' ? 'notes' : 'undercurrents';

        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting ${type}:`, error);
            setWarning(`Failed to delete ${type}`);
        } else {
            if (type === 'note') {
                setNotes(notes.filter(n => n.id !== id));
            } else {
                setUndercurrents(undercurrents.filter(u => u.id !== id));
            }
        }
        setDeleteConfirm(null);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setWarning(null);
        try {
            const { data, error } = await supabase.functions.invoke('generate-undercurrent', {
                body: { timeframe }
            });

            if (error) throw error;

            if (data?.error) {
                throw new Error(data.error);
            }

            if (data?.message) {
                setWarning(data.message);
            } else {
                fetchUndercurrents();
            }
        } catch (error: unknown) {
            console.error('Error generating undercurrent:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            setWarning(`Failed to generate insight: ${message}`);
        } finally {
            setGenerating(false);
        }
    };

    const fetchSelectedNotes = async (noteIds: string[]) => {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .in('id', noteIds);

        if (error || !data || data.length === 0) {
            setWarning('These notes no longer exist.');
        } else {
            setSelectedNotes(data);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleTimeframeChange = (value: string) => {
        setTimeframe(value as '24h' | 'week' | 'month');
        setTimeframeOpen(false);
    };

    const filteredNotes = notes.filter(n =>
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDeleteMessage = () => {
        if (!deleteConfirm) return '';
        return deleteConfirm.type === 'note'
            ? 'This thought will be lost to the depths forever.'
            : 'This insight will dissolve into the abyss.';
    };

    return (
        <div className="min-h-screen bg-transparent text-ocean-100 font-sans relative">
            {/* Sign Out Button */}
            <button
                onClick={handleLogout}
                className="absolute top-4 right-4 z-50 p-2 text-ocean-400/50 hover:text-ocean-200 transition-colors bg-black/40 backdrop-blur-sm border border-ocean-900/30 rounded-lg"
                title="Sign out"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>

            <div className="max-w-4xl mx-auto relative z-10 p-8 pt-16">
                {/* Return to Surface */}
                <div
                    className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center text-ocean-200/40 cursor-pointer animate-pulse hover:text-ocean-200/60 transition-colors"
                    onClick={onSurface}
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium tracking-wider">Return to Surface</span>
                </div>

                <header className="mb-4 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-ocean-50 drop-shadow-[0_0_15px_rgba(56,189,248,0.2)] mb-4 sm:mb-8 text-center sm:text-left">
                        Deep Ocean
                    </h1>

                    {/* Tab Navigation */}
                    <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8 border-b border-ocean-900/30">
                        <button
                            onClick={() => setActiveTab('undercurrents')}
                            className={`pb-3 sm:pb-4 text-base sm:text-lg font-medium transition-all duration-300 relative ${activeTab === 'undercurrents'
                                ? 'text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                                : 'text-ocean-500/40 hover:text-ocean-300/80'
                                }`}
                        >
                            Undercurrents
                            {activeTab === 'undercurrents' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ocean-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('thoughts')}
                            className={`pb-3 sm:pb-4 text-base sm:text-lg font-medium transition-all duration-300 relative ${activeTab === 'thoughts'
                                ? 'text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                                : 'text-ocean-500/40 hover:text-ocean-300/80'
                                }`}
                        >
                            Your Thoughts
                            {activeTab === 'thoughts' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ocean-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                                />
                            )}
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'undercurrents' ? (
                        <motion.div
                            key="undercurrents"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mb-6 sm:mb-8">
                                <TimeframeDropdown
                                    value={timeframe}
                                    options={TIMEFRAME_OPTIONS}
                                    isOpen={timeframeOpen}
                                    onToggle={() => setTimeframeOpen(!timeframeOpen)}
                                    onChange={handleTimeframeChange}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="w-full sm:w-auto px-6 py-2 bg-ocean-950/50 text-ocean-200 border border-ocean-900/50 rounded-full hover:bg-ocean-900/50 hover:text-ocean-100 disabled:opacity-50 transition-all backdrop-blur-sm text-center"
                                >
                                    {generating ? 'Synthesizing...' : 'Generate Insight'}
                                </button>
                            </div>

                            {/* Warning Banner */}
                            <AnimatePresence>
                                {warning && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-8 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg flex items-center justify-between"
                                    >
                                        <p className="text-amber-200 text-sm">{warning}</p>
                                        <button
                                            onClick={() => setWarning(null)}
                                            className="text-amber-400/70 hover:text-amber-200 transition-colors ml-4"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {loadingUndercurrents ? (
                                <UndercurrentSkeletonList count={2} />
                            ) : (
                                <div className="space-y-12">
                                    {/* Ocean-themed loading indicator */}
                                    {generating && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="flex gap-1 mb-4">
                                                {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                                                    <span
                                                        key={i}
                                                        className="w-2 h-8 bg-[#0E405C] rounded-full animate-[wave_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                                                        style={{ animationDelay: `${delay}s` }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-ocean-300/50 text-sm">Synthesizing patterns from the depths...</p>
                                        </div>
                                    )}

                                    {undercurrents.length === 0 && !generating ? (
                                        <div className="text-center text-ocean-800/50 italic">
                                            The waters are calm. No undercurrents found yet.
                                        </div>
                                    ) : (
                                        undercurrents.map((uc, index) => (
                                            <UndercurrentCard
                                                key={uc.id}
                                                undercurrent={uc}
                                                index={index}
                                                onDelete={(id) => setDeleteConfirm({ type: 'undercurrent', id })}
                                                onFetchNotes={fetchSelectedNotes}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="thoughts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="mb-6 relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search your thoughts..."
                                        className="w-full bg-ocean-950/30 border border-ocean-500/30 rounded-lg px-4 py-3 pl-10 text-ocean-100 placeholder:text-ocean-400/50 focus:outline-none focus:border-ocean-400/50 transition-colors backdrop-blur-xl"
                                    />
                                    <svg className="w-5 h-5 text-ocean-400/50 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {loadingNotes ? (
                                    <NoteSkeletonList count={5} />
                                ) : filteredNotes.length === 0 ? (
                                    <p className="text-ocean-800/50 text-sm italic text-center py-12">
                                        {searchQuery ? 'No matching thoughts found.' : 'No thoughts yet. Return to the surface to add some.'}
                                    </p>
                                ) : (
                                    filteredNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onDelete={(id) => setDeleteConfirm({ type: 'note', id })}
                                        />
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <NoteViewerModal
                notes={selectedNotes}
                onClose={() => setSelectedNotes(null)}
            />

            <ConfirmModal
                isOpen={deleteConfirm !== null}
                title="Confirm Delete"
                message={getDeleteMessage()}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </div>
    );
};
