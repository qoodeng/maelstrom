import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
    id: string;
    content: string;
    created_at: string;
}

interface NoteViewerModalProps {
    notes: Note[] | null;
    onClose: () => void;
}

export const NoteViewerModal: React.FC<NoteViewerModalProps> = ({ notes, onClose }) => {
    return (
        <AnimatePresence>
            {notes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-ocean-950/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative bg-[#083344] border border-white/20 p-8 rounded-2xl shadow-2xl max-w-lg w-full z-10 max-h-[80vh] overflow-y-auto"
                    >
                        <h3 className="text-xs font-bold text-ocean-300 uppercase tracking-wider mb-6">
                            Original Thoughts
                        </h3>
                        <div className="space-y-6">
                            {notes.map((note) => (
                                <div key={note.id} className="border-b border-ocean-500/20 last:border-0 pb-6 last:pb-0">
                                    <p className="text-xl font-sans text-white mb-2 italic">
                                        "{note.content}"
                                    </p>
                                    <div className="text-xs text-ocean-200/60">
                                        {new Date(note.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
