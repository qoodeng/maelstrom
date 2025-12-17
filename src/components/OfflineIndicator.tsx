import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingCount, isOnline } from '../lib/offlineStorage';

interface OfflineIndicatorProps {
    onSyncRequest?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onSyncRequest }) => {
    const [offline, setOffline] = useState(!isOnline());
    const [pendingCount, setPendingCount] = useState(getPendingCount());

    useEffect(() => {
        const handleOnline = () => {
            setOffline(false);
            // Trigger sync when coming back online
            if (onSyncRequest) {
                onSyncRequest();
            }
        };

        const handleOffline = () => {
            setOffline(true);
        };

        // Update pending count periodically
        const updatePendingCount = () => {
            setPendingCount(getPendingCount());
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check pending count every 2 seconds
        const interval = setInterval(updatePendingCount, 2000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [onSyncRequest]);

    // Only show if offline or has pending notes
    const showIndicator = offline || pendingCount > 0;

    return (
        <AnimatePresence>
            {showIndicator && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm text-sm"
                    style={{
                        backgroundColor: offline ? 'rgba(220, 38, 38, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                        borderColor: offline ? 'rgba(220, 38, 38, 0.4)' : 'rgba(14, 165, 233, 0.4)',
                        borderWidth: 1,
                    }}
                >
                    {offline ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                            <span className="text-red-300">Offline</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-ocean-400 animate-pulse" />
                            <span className="text-ocean-300">Syncing {pendingCount}...</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
