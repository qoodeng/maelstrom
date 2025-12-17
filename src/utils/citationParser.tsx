import React from 'react';

/**
 * Renders summary text with clickable footnotes that reference original notes.
 * Handles citation consolidation, punctuation correction, and sequential re-indexing.
 * 
 * @param text - The summary text containing citation markers like [1], [2, 3]
 * @param noteIds - Array of note IDs in order (index 0 = [1], index 1 = [2], etc.)
 * @param onFetchNotes - Callback to fetch and display the original notes
 * @returns React elements with clickable citation buttons
 */
export function renderSummary(
    text: string,
    noteIds: string[],
    onFetchNotes: (noteIds: string[]) => void
): React.ReactNode {
    // 1. Consolidate adjacent citations: [1][2] or [1] [2] -> [1, 2]
    let processedText = text.replace(/\]\s*\[/g, ', ');

    // 2. Auto-correct citation placement: move punctuation before citations
    // e.g. "word[1]." -> "word.[1]"
    processedText = processedText.replace(/((?:\[[0-9, ]+\])+)([.,;:!]+)/g, '$2$1');

    // 3. Re-index citations sequentially
    let citationCounter = 1;

    // Split by citation blocks
    const parts = processedText.split(/(\[[0-9, ]+\])/g);

    return parts.map((part, index) => {
        if (/^\[[0-9, ]+\]$/.test(part)) {
            // This is a citation block like "[1, 2]"
            const originalIndices = part.match(/\d+/g)?.map(n => parseInt(n) - 1) || [];
            const validNoteIds = originalIndices.map(i => noteIds[i]).filter(Boolean);

            if (validNoteIds.length > 0) {
                const newIndex = citationCounter++;

                return (
                    <sup key={index} className="inline ml-0.5">
                        <button
                            onClick={() => onFetchNotes(validNoteIds)}
                            className="text-sky-400 hover:text-sky-200 text-[11px] font-medium cursor-pointer transition-all duration-200 hover:underline drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] hover:drop-shadow-[0_0_10px_rgba(56,189,248,1)]"
                        >
                            {newIndex}
                        </button>
                    </sup>
                );
            }
            return null;
        }
        return <span key={index}>{part}</span>;
    });
}
