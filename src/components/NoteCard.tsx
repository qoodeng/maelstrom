import React from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '../utils/formatters';

interface Note {
    id: string;
    content: string;
    created_at: string;
}

interface NoteCardProps {
    note: Note;
    onDelete: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-ocean-950/30 border border-ocean-500/30 rounded-lg group hover:bg-ocean-950/40 transition-colors backdrop-blur-xl"
        >
            <div className="flex-1 min-w-0">
                <p className="text-ocean-100/90 text-base sm:text-lg leading-relaxed">{note.content}</p>
                <p className="text-ocean-600/50 text-xs sm:text-sm mt-2">{formatRelativeTime(note.created_at)}</p>
            </div>
            <button
                onClick={() => onDelete(note.id)}
                className="text-ocean-700/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                title="Delete note"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};
