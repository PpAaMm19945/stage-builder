import { Book } from '@/types';

// Verified volumes based on static asset probing
// Note: Some volumes (Ruth, Ezra/Neh/Esther, Minor Prophets, Epistles, Revelation)
// are omitted because their specific 'group-' slug or number could not be verified via probe.
// These can be added back once the correct filenames are known.

const VOLUMES = [
  // Pentateuch
  { num: 1, title: 'Genesis', slug: 'genesis', chapters: 50, testament: 'Old Testament' },
  { num: 2, title: 'Exodus', slug: 'exodus', chapters: 40, testament: 'Old Testament' },
  { num: 3, title: 'Leviticus', slug: 'leviticus', chapters: 27, testament: 'Old Testament' },
  { num: 4, title: 'Numbers', slug: 'numbers', chapters: 36, testament: 'Old Testament' },
  { num: 5, title: 'Deuteronomy', slug: 'deuteronomy', chapters: 34, testament: 'Old Testament' },

  // History
  { num: 6, title: 'Joshua', slug: 'joshua', chapters: 24, testament: 'Old Testament' },
  { num: 7, title: 'Judges', slug: 'judges', chapters: 21, testament: 'Old Testament' },
  // Missing: 08 Ruth
  { num: 9, title: 'Books of Samuel', slug: 'group-samuel', chapters: 55, testament: 'Old Testament' },
  // Missing: 10
  { num: 11, title: 'Books of Kings', slug: 'group-kings', chapters: 47, testament: 'Old Testament' },
  // Missing: 12
  { num: 13, title: 'Books of Chronicles', slug: 'group-chronicles', chapters: 65, testament: 'Old Testament' },
  // Missing: 14-17 (Ezra, Nehemiah, Esther)

  // Wisdom / Poetry
  { num: 18, title: 'Job', slug: 'job', chapters: 42, testament: 'Old Testament' },
  { num: 19, title: 'Psalms', slug: 'psalms', chapters: 150, testament: 'Old Testament' },
  { num: 20, title: 'Proverbs', slug: 'proverbs', chapters: 31, testament: 'Old Testament' },
  { num: 21, title: 'Books of Poetry', slug: 'group-poetry', chapters: 20, testament: 'Old Testament' }, // Ecc + Song

  // Major Prophets
  { num: 23, title: 'Isaiah', slug: 'isaiah', chapters: 66, testament: 'Old Testament' },
  { num: 24, title: 'Books of Jeremiah', slug: 'group-jeremiah', chapters: 57, testament: 'Old Testament' }, // Jer + Lam
  // Missing: 25
  { num: 26, title: 'Ezekiel', slug: 'ezekiel', chapters: 48, testament: 'Old Testament' },
  { num: 27, title: 'Daniel', slug: 'daniel', chapters: 12, testament: 'Old Testament' },
  // Missing: 28-39 (Minor Prophets)

  // New Testament
  { num: 40, title: 'Matthew', slug: 'matthew', chapters: 28, testament: 'New Testament' },
  { num: 41, title: 'Mark', slug: 'mark', chapters: 16, testament: 'New Testament' },
  { num: 42, title: 'Luke', slug: 'luke', chapters: 24, testament: 'New Testament' },
  { num: 43, title: 'John', slug: 'john', chapters: 21, testament: 'New Testament' },
  { num: 44, title: 'Acts', slug: 'acts', chapters: 28, testament: 'New Testament' },
  { num: 45, title: 'Romans', slug: 'romans', chapters: 16, testament: 'New Testament' },
  { num: 46, title: 'Corinthians', slug: 'group-corinthians', chapters: 29, testament: 'New Testament' },
  // Missing: 47-57 (Galatians through Philemon)
  { num: 58, title: 'Hebrews', slug: 'hebrews', chapters: 13, testament: 'New Testament' },
  // Missing: 59-XX (General Epistles, Revelation)
];

export const PAPERBACK_BIBLE_BOOKS: Book[] = VOLUMES.map(vol => {
  const paddedNum = String(vol.num).padStart(2, '0');

  // Note: The file extension is _5.jpg for covers and _5.pdf for content based on observation
  // The slug in VOLUMES already contains 'group-' if applicable.

  return {
    id: `pbb-${vol.slug.replace(/_/g, '-')}`,
    title: vol.title,
    author: 'Sermon Audio',
    series: 'The Paperback Bible',
    minAgeMonths: 0,
    maxAgeMonths: 120, // All ages
    learningStage: 'all',
    domain: 'wisdom',
    pageCount: vol.chapters,
    renderFormat: 'pdf',
    // Construct URLs using the verified schema
    pdfUrl: `https://static.sermonaudio.com/pbb/books/download/${paddedNum}-${vol.slug}_5.pdf`,
    coverUrl: `https://static.sermonaudio.com/pbb/books/${paddedNum}-${vol.slug}_5.jpg`,
    description: `The Paperback Bible edition of ${vol.title}. Designed to be portable, readable, and truly personal.`,
    topics: ['bible', 'scripture', vol.testament === 'Old Testament' ? 'old testament' : 'new testament'],
    readingPrompts: []
  };
});
