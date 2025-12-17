import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
    onComplete: () => void;
}

const STEPS = [
    {
        title: "Welcome to Maelstrom",
        description: "A place to capture fleeting thoughts and discover hidden patterns in your mind.",
        icon: "🌊"
    },
    {
        title: "Cast Your Thoughts",
        description: "Write short notes (up to 280 characters) about whatever's on your mind. Don't overthink it.",
        icon: "✍️"
    },
    {
        title: "Dive Deeper",
        description: "Scroll down or tap 'Dive Deeper' to explore the Deep Ocean — where your thoughts are analyzed.",
        icon: "🔮"
    },
    {
        title: "Discover Undercurrents",
        description: "AI synthesizes your notes to reveal hidden themes, patterns, and questions you might not have noticed.",
        icon: "💡"
    }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const step = STEPS[currentStep];
    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-md w-full mx-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        {/* Icon */}
                        <motion.div
                            className="text-6xl mb-6"
                            animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {step.icon}
                        </motion.div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                            {step.title}
                        </h2>

                        {/* Description */}
                        <p className="text-ocean-200/80 text-lg leading-relaxed mb-8">
                            {step.description}
                        </p>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 mb-8">
                            {STEPS.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep
                                            ? 'bg-ocean-400 w-6'
                                            : index < currentStep
                                                ? 'bg-ocean-400/50'
                                                : 'bg-ocean-800/50'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4">
                            {!isLastStep && (
                                <button
                                    onClick={handleSkip}
                                    className="px-6 py-2 text-ocean-400/60 hover:text-ocean-200 transition-colors text-sm"
                                >
                                    Skip
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-ocean-500/20 hover:bg-ocean-500/30 border border-ocean-500/40 text-white rounded-full transition-all duration-300 hover:scale-105"
                            >
                                {isLastStep ? "Let's Go" : "Next"}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
