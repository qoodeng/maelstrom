import React from 'react';
import { motion } from 'framer-motion';

// Skeleton for UndercurrentCard
export const UndercurrentSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        className="relative overflow-hidden rounded-lg bg-ocean-950/30 border border-ocean-500/20 backdrop-blur-xl"
    >
        <div className="p-5 sm:p-8">
            <div className="flex gap-6 mb-6 sm:mb-8 items-center">
                {/* Skeleton orb */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ocean-800/30 animate-pulse" />

                {/* Skeleton text lines */}
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-ocean-800/30 rounded animate-pulse w-full" />
                    <div className="h-4 bg-ocean-800/30 rounded animate-pulse w-4/5" />
                    <div className="h-4 bg-ocean-800/30 rounded animate-pulse w-3/5" />
                </div>
            </div>

            {/* Skeleton questions grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-ocean-900/30">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="p-5 rounded-md bg-black/20 border border-ocean-900/20">
                        <div className="h-3 bg-ocean-800/30 rounded animate-pulse w-20 mb-3" />
                        <div className="space-y-2">
                            <div className="h-3 bg-ocean-800/30 rounded animate-pulse w-full" />
                            <div className="h-3 bg-ocean-800/30 rounded animate-pulse w-4/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.div>
);

// Skeleton for NoteCard
export const NoteSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="relative overflow-hidden bg-ocean-950/20 border border-ocean-800/30 rounded-lg p-4"
    >
        <div className="space-y-2">
            <div className="h-4 bg-ocean-800/30 rounded animate-pulse w-full" />
            <div className="h-4 bg-ocean-800/30 rounded animate-pulse w-3/4" />
        </div>
        <div className="mt-3 h-3 bg-ocean-800/30 rounded animate-pulse w-24" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.div>
);

// Loading skeleton lists
export const UndercurrentSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="space-y-12">
        {Array.from({ length: count }).map((_, i) => (
            <UndercurrentSkeleton key={i} index={i} />
        ))}
    </div>
);

export const NoteSkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <NoteSkeleton key={i} index={i} />
        ))}
    </div>
);
