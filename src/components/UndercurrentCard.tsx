import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient } from '@paper-design/shaders-react';
import { renderSummary } from '../utils/citationParser';
import { getColorNames } from '../utils/colorNames';

interface Undercurrent {
    id: string;
    summary_text: string;
    questions: string[];
    notes_included: string[];
    sentiment_colors?: string[];
    created_at: string;
}

interface UndercurrentCardProps {
    undercurrent: Undercurrent;
    index: number;
    onDelete: (id: string) => void;
    onFetchNotes: (noteIds: string[]) => void;
}

// Default colors if none provided
const DEFAULT_COLORS = ['#1e3a5f', '#2d5a7c', '#3d7a9c', '#4d9abc'];

export const UndercurrentCard: React.FC<UndercurrentCardProps> = ({
    undercurrent,
    index,
    onDelete,
    onFetchNotes,
}) => {
    const [showColorTooltip, setShowColorTooltip] = useState(false);

    const colors = undercurrent.sentiment_colors?.length === 4
        ? undercurrent.sentiment_colors
        : DEFAULT_COLORS;

    const colorNames = getColorNames(colors);

    // Randomize animation parameters based on index to desync orbs
    const animParams = useMemo(() => ({
        speed: 0.3 + (((index * 1234) % 100) / 100) * 0.4, // 0.3 to 0.7
        distortion: 0.2 + (((index * 5678) % 100) / 100) * 0.3, // 0.2 to 0.5
        swirl: 0.1 + (((index * 9012) % 100) / 100) * 0.3, // 0.1 to 0.4
    }), [index]);

    // Long press logic
    // Long press logic
    const [isLongPressing, setIsLongPressing] = useState(false);
    const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const feedbackTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const startPress = () => {
        // Delay visual feedback slightly to allow for scroll detection
        feedbackTimer.current = setTimeout(() => {
            setIsLongPressing(true);
        }, 100);

        longPressTimer.current = setTimeout(() => {
            onDelete(undercurrent.id);
            setIsLongPressing(false);
        }, 500); // 500ms long press
    };

    const cancelPress = () => {
        setIsLongPressing(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
            feedbackTimer.current = null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isLongPressing ? 0.98 : 1, // Subtle shrink effect on press
            }}
            transition={{
                delay: index * 0.15,
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
                scale: { duration: 0.2 }
            }}
            whileHover={{
                y: -4,
                transition: { duration: 0.2 }
            }}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onTouchMove={cancelPress} // Cancel if user scrolls
            className={`relative overflow-hidden rounded-lg bg-ocean-950/30 border backdrop-blur-xl group select-none transition-colors duration-200 ${isLongPressing ? 'border-red-500/50 bg-red-950/10' : 'border-ocean-500/30'
                }`}
        >
            {/* Progress Bar for Long Press */}
            <motion.div
                className="absolute top-0 left-0 h-1 bg-red-500/50 z-50"
                initial={{ width: 0 }}
                animate={{ width: isLongPressing ? '100%' : '0%' }}
                transition={{ duration: isLongPressing ? 0.5 : 0.1, ease: 'linear' }}
            />

            {/* Desktop Delete button (still available for non-touch) */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering long press
                    onDelete(undercurrent.id);
                }}
                className="hidden sm:block absolute top-4 right-4 text-ocean-700/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 z-10"
                title="Delete insight"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Content with Orb Column */}
            <div className="relative p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 items-center">
                    {/* Sentiment Gradient Orb - Own Column */}
                    <div
                        className="relative flex-shrink-0"
                        onMouseEnter={() => setShowColorTooltip(true)}
                        onMouseLeave={() => setShowColorTooltip(false)}
                        onTouchStart={(e) => e.stopPropagation()} // Allow interacting with orb without triggering delete
                    >
                        <div className="w-12 h-12 rounded-full ring-2 ring-white overflow-hidden cursor-pointer">
                            <MeshGradient
                                speed={animParams.speed}
                                scale={1.5}
                                distortion={animParams.distortion}
                                swirl={animParams.swirl}
                                colors={colors}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Color Names Tooltip */}
                        <AnimatePresence>
                            {showColorTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute left-0 top-full mt-2 z-20 bg-black/90 border border-ocean-500/40 rounded-lg p-3 min-w-[160px] backdrop-blur-sm"
                                >
                                    <p className="text-xs text-ocean-400 uppercase tracking-wider mb-2 font-bold">Emotional Palette</p>
                                    {colorNames.map((name, i) => (
                                        <div key={i} className="flex items-center gap-2 py-1">
                                            <div
                                                className="w-3 h-3 rounded-full ring-1 ring-white/50"
                                                style={{ backgroundColor: colors[i] }}
                                            />
                                            <span className="text-xs text-ocean-200">{name}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Summary Text */}
                    <div className="prose prose-lg max-w-none leading-relaxed text-ocean-100/90 flex-1 text-center">
                        <p className="text-base sm:text-lg">
                            {renderSummary(undercurrent.summary_text, undercurrent.notes_included, (ids) => {
                                cancelPress(); // Cancel delete if clicking a citation
                                onFetchNotes(ids);
                            })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-ocean-900/30">
                    {undercurrent.questions.map((q, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 + i * 0.1 + 0.3 }}
                            className="p-5 rounded-md bg-black/30 border border-ocean-900/20 text-center"
                        >
                            <h3 className="text-xs font-bold text-ocean-400/70 uppercase tracking-widest mb-2">
                                Reflection {i + 1}
                            </h3>
                            <p className="text-ocean-100/80">
                                {renderSummary(q, undercurrent.notes_included, (ids) => {
                                    cancelPress();
                                    onFetchNotes(ids);
                                })}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
