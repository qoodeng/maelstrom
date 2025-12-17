import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeframeOption {
    value: string;
    label: string;
}

interface TimeframeDropdownProps {
    value: string;
    options: readonly TimeframeOption[];
    isOpen: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
}

export const TimeframeDropdown: React.FC<TimeframeDropdownProps> = ({
    value,
    options,
    isOpen,
    onToggle,
    onChange,
}) => {
    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="w-full sm:w-auto justify-between sm:justify-start px-4 py-2 bg-black/40 text-ocean-200 border border-ocean-900/50 rounded-full text-sm backdrop-blur-sm flex items-center gap-2 hover:border-ocean-700 transition-colors"
            >
                <span>{selectedOption?.label}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 left-0 sm:left-auto bg-black/90 border border-ocean-900/50 rounded-lg overflow-hidden backdrop-blur-sm z-20 w-full sm:w-48"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onChange(option.value)}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${value === option.value
                                    ? 'bg-ocean-900/50 text-ocean-100'
                                    : 'text-ocean-300/70 hover:bg-ocean-900/30 hover:text-ocean-100'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
