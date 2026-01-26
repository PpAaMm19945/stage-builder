// Utility: Convert snake_case or kebab-case to Title Case
export function toTitleCase(str: string): string {
    if (!str) return '';
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Series display name mapping for known series
export const SERIES_DISPLAY_NAMES: Record<string, string> = {
    'my_first_books': 'My First Books',
    'african_men_of_faith': 'African Men of Faith',
    'the_paperback_bible': 'The Paperback Bible',
    'pastor_curtis_knapp': 'Selected Works: Booklets on Doctrine, Family, and the Christian Walk',
    'sanyus_growing_heart': "Sanyu's Growing Heart",
    'reformed-hymns': 'Reformed Hymns',
    'catechism': 'Catechism',
};

export function getSeriesDisplayName(series: string): string {
    const lower = series.toLowerCase();
    return SERIES_DISPLAY_NAMES[lower] || SERIES_DISPLAY_NAMES[series] || toTitleCase(series);
}

// Check if a series contains primarily picture books (landscape)
export function isLandscapeSeries(series: string): boolean {
    const s = series.toLowerCase();
    // Heuristic keyword match (more robust than enumerating every series)
    return (
        s.includes('my_first_books') ||
        s.includes('my first books') ||
        s.includes('african_men_of_faith') ||
        s.includes('african men of faith') ||
        s.includes('sanyus_growing_heart') ||
        s.includes("sanyu's growing heart") ||
        s.includes('gospel') ||
        s.includes('working_fathers_of_soroti') ||
        s.includes('working fathers')
    );
}
