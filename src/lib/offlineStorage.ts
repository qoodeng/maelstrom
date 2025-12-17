// Offline storage utility for managing notes when offline

const PENDING_NOTES_KEY = 'maelstrom_pending_notes';

export interface PendingNote {
    id: string;
    content: string;
    created_at: string;
    user_id?: string;
}

/**
 * Check if the browser is currently online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Get all pending notes awaiting sync
 */
export function getPendingNotes(): PendingNote[] {
    try {
        const stored = localStorage.getItem(PENDING_NOTES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Save a note to the offline queue
 */
export function saveNoteOffline(content: string, userId?: string): PendingNote {
    const pendingNotes = getPendingNotes();

    const newNote: PendingNote = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        created_at: new Date().toISOString(),
        user_id: userId,
    };

    pendingNotes.push(newNote);
    localStorage.setItem(PENDING_NOTES_KEY, JSON.stringify(pendingNotes));

    return newNote;
}

/**
 * Remove a note from the pending queue after successful sync
 */
export function clearPendingNote(id: string): void {
    const pendingNotes = getPendingNotes();
    const filtered = pendingNotes.filter(note => note.id !== id);
    localStorage.setItem(PENDING_NOTES_KEY, JSON.stringify(filtered));
}

/**
 * Clear all pending notes (use after successful bulk sync)
 */
export function clearAllPendingNotes(): void {
    localStorage.removeItem(PENDING_NOTES_KEY);
}

/**
 * Get the count of pending notes
 */
export function getPendingCount(): number {
    return getPendingNotes().length;
}
