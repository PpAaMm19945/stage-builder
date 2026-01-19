import { Book } from '@/types';

interface BibleBook {
  number: number;
  name: string;
  testament: 'Old Testament' | 'New Testament';
  chapters: number;
  category: string;
  volumeSlug?: string; // For bundled books (e.g., "samuel" for 1 & 2 Samuel)
  volumeNumber?: number; // The starting book number for the bundle (e.g., 9 for Samuel)
}

const BIBLE_BOOKS_DATA: BibleBook[] = [
  // Old Testament
  // Pentateuch
  { number: 1, name: 'Genesis', testament: 'Old Testament', chapters: 50, category: 'Pentateuch' },
  { number: 2, name: 'Exodus', testament: 'Old Testament', chapters: 40, category: 'Pentateuch' },
  { number: 3, name: 'Leviticus', testament: 'Old Testament', chapters: 27, category: 'Pentateuch' },
  { number: 4, name: 'Numbers', testament: 'Old Testament', chapters: 36, category: 'Pentateuch' },
  { number: 5, name: 'Deuteronomy', testament: 'Old Testament', chapters: 34, category: 'Pentateuch' },

  // Historical Books
  { number: 6, name: 'Joshua', testament: 'Old Testament', chapters: 24, category: 'Historical Books' },
  { number: 7, name: 'Judges', testament: 'Old Testament', chapters: 21, category: 'Historical Books' },
  { number: 8, name: 'Ruth', testament: 'Old Testament', chapters: 4, category: 'Historical Books' },
  { number: 9, name: '1 Samuel', testament: 'Old Testament', chapters: 31, category: 'Historical Books', volumeSlug: 'samuel', volumeNumber: 9 },
  { number: 10, name: '2 Samuel', testament: 'Old Testament', chapters: 24, category: 'Historical Books', volumeSlug: 'samuel', volumeNumber: 9 },
  { number: 11, name: '1 Kings', testament: 'Old Testament', chapters: 22, category: 'Historical Books', volumeSlug: 'kings', volumeNumber: 11 },
  { number: 12, name: '2 Kings', testament: 'Old Testament', chapters: 25, category: 'Historical Books', volumeSlug: 'kings', volumeNumber: 11 },
  { number: 13, name: '1 Chronicles', testament: 'Old Testament', chapters: 29, category: 'Historical Books', volumeSlug: 'chronicles', volumeNumber: 13 },
  { number: 14, name: '2 Chronicles', testament: 'Old Testament', chapters: 36, category: 'Historical Books', volumeSlug: 'chronicles', volumeNumber: 13 },
  { number: 15, name: 'Ezra', testament: 'Old Testament', chapters: 10, category: 'Historical Books', volumeSlug: 'ezra_nehemiah_esther', volumeNumber: 15 },
  { number: 16, name: 'Nehemiah', testament: 'Old Testament', chapters: 13, category: 'Historical Books', volumeSlug: 'ezra_nehemiah_esther', volumeNumber: 15 },
  { number: 17, name: 'Esther', testament: 'Old Testament', chapters: 10, category: 'Historical Books', volumeSlug: 'ezra_nehemiah_esther', volumeNumber: 15 },

  // Poetry
  { number: 18, name: 'Job', testament: 'Old Testament', chapters: 42, category: 'Poetry' },
  { number: 19, name: 'Psalms', testament: 'Old Testament', chapters: 150, category: 'Poetry' },
  { number: 20, name: 'Proverbs', testament: 'Old Testament', chapters: 31, category: 'Poetry' },
  { number: 21, name: 'Ecclesiastes', testament: 'Old Testament', chapters: 12, category: 'Poetry' },
  { number: 22, name: 'Song of Solomon', testament: 'Old Testament', chapters: 8, category: 'Poetry' },

  // Major Prophets
  { number: 23, name: 'Isaiah', testament: 'Old Testament', chapters: 66, category: 'Major Prophets' },
  { number: 24, name: 'Jeremiah', testament: 'Old Testament', chapters: 52, category: 'Major Prophets' },
  { number: 25, name: 'Lamentations', testament: 'Old Testament', chapters: 5, category: 'Major Prophets' },
  { number: 26, name: 'Ezekiel', testament: 'Old Testament', chapters: 48, category: 'Major Prophets' },
  { number: 27, name: 'Daniel', testament: 'Old Testament', chapters: 12, category: 'Major Prophets' },

  // Minor Prophets
  { number: 28, name: 'Hosea', testament: 'Old Testament', chapters: 14, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 29, name: 'Joel', testament: 'Old Testament', chapters: 3, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 30, name: 'Amos', testament: 'Old Testament', chapters: 9, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 31, name: 'Obadiah', testament: 'Old Testament', chapters: 1, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 32, name: 'Jonah', testament: 'Old Testament', chapters: 4, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 33, name: 'Micah', testament: 'Old Testament', chapters: 7, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 34, name: 'Nahum', testament: 'Old Testament', chapters: 3, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 35, name: 'Habakkuk', testament: 'Old Testament', chapters: 3, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 36, name: 'Zephaniah', testament: 'Old Testament', chapters: 3, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 37, name: 'Haggai', testament: 'Old Testament', chapters: 2, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 38, name: 'Zechariah', testament: 'Old Testament', chapters: 14, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },
  { number: 39, name: 'Malachi', testament: 'Old Testament', chapters: 4, category: 'Minor Prophets', volumeSlug: 'minor_prophets', volumeNumber: 28 },

  // New Testament
  // Gospels
  { number: 40, name: 'Matthew', testament: 'New Testament', chapters: 28, category: 'Gospels' },
  { number: 41, name: 'Mark', testament: 'New Testament', chapters: 16, category: 'Gospels' },
  { number: 42, name: 'Luke', testament: 'New Testament', chapters: 24, category: 'Gospels' },
  { number: 43, name: 'John', testament: 'New Testament', chapters: 21, category: 'Gospels' },

  // History
  { number: 44, name: 'Acts', testament: 'New Testament', chapters: 28, category: 'History (NT)' },

  // Pauline Epistles
  { number: 45, name: 'Romans', testament: 'New Testament', chapters: 16, category: 'Pauline Epistles' },
  { number: 46, name: '1 Corinthians', testament: 'New Testament', chapters: 16, category: 'Pauline Epistles', volumeSlug: 'corinthians', volumeNumber: 46 },
  { number: 47, name: '2 Corinthians', testament: 'New Testament', chapters: 13, category: 'Pauline Epistles', volumeSlug: 'corinthians', volumeNumber: 46 },
  { number: 48, name: 'Galatians', testament: 'New Testament', chapters: 6, category: 'Pauline Epistles' },
  { number: 49, name: 'Ephesians', testament: 'New Testament', chapters: 6, category: 'Pauline Epistles' },
  { number: 50, name: 'Philippians', testament: 'New Testament', chapters: 4, category: 'Pauline Epistles' },
  { number: 51, name: 'Colossians', testament: 'New Testament', chapters: 4, category: 'Pauline Epistles' },
  { number: 52, name: '1 Thessalonians', testament: 'New Testament', chapters: 5, category: 'Pauline Epistles', volumeSlug: 'thessalonians_timothy_titus_philemon', volumeNumber: 52 },
  { number: 53, name: '2 Thessalonians', testament: 'New Testament', chapters: 3, category: 'Pauline Epistles', volumeSlug: 'thessalonians_timothy_titus_philemon', volumeNumber: 52 },
  { number: 54, name: '1 Timothy', testament: 'New Testament', chapters: 6, category: 'Pauline Epistles', volumeSlug: 'thessalonians_timothy_titus_philemon', volumeNumber: 52 },
  { number: 55, name: '2 Timothy', testament: 'New Testament', chapters: 4, category: 'Pauline Epistles', volumeSlug: 'thessalonians_timothy_titus_philemon', volumeNumber: 52 },
  { number: 56, name: 'Titus', testament: 'New Testament', chapters: 3, category: 'Pauline Epistles', volumeSlug: 'thessalonians_timothy_titus_philemon', volumeNumber: 52 },
  { number: 57, name: 'Philemon', testament: 'New Testament', chapters: 1, category: 'Pauline Epistles', volumeSlug: 'thessalonians_timothy_titus_philemon', volumeNumber: 52 },

  // General Epistles
  { number: 58, name: 'Hebrews', testament: 'New Testament', chapters: 13, category: 'General Epistles' },
  { number: 59, name: 'James', testament: 'New Testament', chapters: 5, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },
  { number: 60, name: '1 Peter', testament: 'New Testament', chapters: 5, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },
  { number: 61, name: '2 Peter', testament: 'New Testament', chapters: 3, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },
  { number: 62, name: '1 John', testament: 'New Testament', chapters: 5, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },
  { number: 63, name: '2 John', testament: 'New Testament', chapters: 1, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },
  { number: 64, name: '3 John', testament: 'New Testament', chapters: 1, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },
  { number: 65, name: 'Jude', testament: 'New Testament', chapters: 1, category: 'General Epistles', volumeSlug: 'general_epistles', volumeNumber: 59 },

  // Prophecy
  { number: 66, name: 'Revelation', testament: 'New Testament', chapters: 22, category: 'Prophecy' },
];

export const PAPERBACK_BIBLE_BOOKS: Book[] = BIBLE_BOOKS_DATA.map(book => {
  let paddedNum = String(book.number).padStart(2, '0');
  let urlSlug = book.name.toLowerCase();

  if (book.volumeNumber && book.volumeSlug) {
      paddedNum = String(book.volumeNumber).padStart(2, '0');
      urlSlug = book.volumeSlug;
  } else {
      // Default logic for standalone books
      if (/^\d\s/.test(book.name)) {
        // Numbered book: remove the first space
        urlSlug = urlSlug.replace(' ', '');
      }
      // Replace remaining spaces with underscores
      urlSlug = urlSlug.replace(/\s/g, '_');
  }

  return {
    id: `pbb-${book.name.toLowerCase().replace(/\s/g, '-')}`,
    title: book.name,
    author: 'Sermon Audio',
    series: `Bible - ${book.category}`, // Updated to use specific category
    minAgeMonths: 0,
    maxAgeMonths: 120,
    learningStage: 'all',
    domain: 'wisdom',
    pageCount: book.chapters,
    renderFormat: 'pdf' as const,
    pdfUrl: `https://static.sermonaudio.com/pbb/books/download/${paddedNum}-${urlSlug}_5.pdf`,
    coverUrl: `https://static.sermonaudio.com/pbb/books/${paddedNum}-${urlSlug}_5.jpg`,
    description: `The Paperback Bible edition of ${book.name}. Designed to be portable, readable, and truly personal.`,
    topics: ['bible', 'scripture', book.testament === 'Old Testament' ? 'old testament' : 'new testament', book.category.toLowerCase()],
    readingPrompts: []
  };
});
