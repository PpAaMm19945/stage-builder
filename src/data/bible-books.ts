import { Book } from '@/types';

interface BibleBook {
  number: number;
  name: string;
  testament: 'Old Testament' | 'New Testament';
  chapters: number;
}

const BIBLE_BOOKS_DATA: BibleBook[] = [
  // Old Testament
  { number: 1, name: 'Genesis', testament: 'Old Testament', chapters: 50 },
  { number: 2, name: 'Exodus', testament: 'Old Testament', chapters: 40 },
  { number: 3, name: 'Leviticus', testament: 'Old Testament', chapters: 27 },
  { number: 4, name: 'Numbers', testament: 'Old Testament', chapters: 36 },
  { number: 5, name: 'Deuteronomy', testament: 'Old Testament', chapters: 34 },
  { number: 6, name: 'Joshua', testament: 'Old Testament', chapters: 24 },
  { number: 7, name: 'Judges', testament: 'Old Testament', chapters: 21 },
  { number: 8, name: 'Ruth', testament: 'Old Testament', chapters: 4 },
  { number: 9, name: '1 Samuel', testament: 'Old Testament', chapters: 31 },
  { number: 10, name: '2 Samuel', testament: 'Old Testament', chapters: 24 },
  { number: 11, name: '1 Kings', testament: 'Old Testament', chapters: 22 },
  { number: 12, name: '2 Kings', testament: 'Old Testament', chapters: 25 },
  { number: 13, name: '1 Chronicles', testament: 'Old Testament', chapters: 29 },
  { number: 14, name: '2 Chronicles', testament: 'Old Testament', chapters: 36 },
  { number: 15, name: 'Ezra', testament: 'Old Testament', chapters: 10 },
  { number: 16, name: 'Nehemiah', testament: 'Old Testament', chapters: 13 },
  { number: 17, name: 'Esther', testament: 'Old Testament', chapters: 10 },
  { number: 18, name: 'Job', testament: 'Old Testament', chapters: 42 },
  { number: 19, name: 'Psalms', testament: 'Old Testament', chapters: 150 },
  { number: 20, name: 'Proverbs', testament: 'Old Testament', chapters: 31 },
  { number: 21, name: 'Ecclesiastes', testament: 'Old Testament', chapters: 12 },
  { number: 22, name: 'Song of Solomon', testament: 'Old Testament', chapters: 8 },
  { number: 23, name: 'Isaiah', testament: 'Old Testament', chapters: 66 },
  { number: 24, name: 'Jeremiah', testament: 'Old Testament', chapters: 52 },
  { number: 25, name: 'Lamentations', testament: 'Old Testament', chapters: 5 },
  { number: 26, name: 'Ezekiel', testament: 'Old Testament', chapters: 48 },
  { number: 27, name: 'Daniel', testament: 'Old Testament', chapters: 12 },
  { number: 28, name: 'Hosea', testament: 'Old Testament', chapters: 14 },
  { number: 29, name: 'Joel', testament: 'Old Testament', chapters: 3 },
  { number: 30, name: 'Amos', testament: 'Old Testament', chapters: 9 },
  { number: 31, name: 'Obadiah', testament: 'Old Testament', chapters: 1 },
  { number: 32, name: 'Jonah', testament: 'Old Testament', chapters: 4 },
  { number: 33, name: 'Micah', testament: 'Old Testament', chapters: 7 },
  { number: 34, name: 'Nahum', testament: 'Old Testament', chapters: 3 },
  { number: 35, name: 'Habakkuk', testament: 'Old Testament', chapters: 3 },
  { number: 36, name: 'Zephaniah', testament: 'Old Testament', chapters: 3 },
  { number: 37, name: 'Haggai', testament: 'Old Testament', chapters: 2 },
  { number: 38, name: 'Zechariah', testament: 'Old Testament', chapters: 14 },
  { number: 39, name: 'Malachi', testament: 'Old Testament', chapters: 4 },
  // New Testament
  { number: 40, name: 'Matthew', testament: 'New Testament', chapters: 28 },
  { number: 41, name: 'Mark', testament: 'New Testament', chapters: 16 },
  { number: 42, name: 'Luke', testament: 'New Testament', chapters: 24 },
  { number: 43, name: 'John', testament: 'New Testament', chapters: 21 },
  { number: 44, name: 'Acts', testament: 'New Testament', chapters: 28 },
  { number: 45, name: 'Romans', testament: 'New Testament', chapters: 16 },
  { number: 46, name: '1 Corinthians', testament: 'New Testament', chapters: 16 },
  { number: 47, name: '2 Corinthians', testament: 'New Testament', chapters: 13 },
  { number: 48, name: 'Galatians', testament: 'New Testament', chapters: 6 },
  { number: 49, name: 'Ephesians', testament: 'New Testament', chapters: 6 },
  { number: 50, name: 'Philippians', testament: 'New Testament', chapters: 4 },
  { number: 51, name: 'Colossians', testament: 'New Testament', chapters: 4 },
  { number: 52, name: '1 Thessalonians', testament: 'New Testament', chapters: 5 },
  { number: 53, name: '2 Thessalonians', testament: 'New Testament', chapters: 3 },
  { number: 54, name: '1 Timothy', testament: 'New Testament', chapters: 6 },
  { number: 55, name: '2 Timothy', testament: 'New Testament', chapters: 4 },
  { number: 56, name: 'Titus', testament: 'New Testament', chapters: 3 },
  { number: 57, name: 'Philemon', testament: 'New Testament', chapters: 1 },
  { number: 58, name: 'Hebrews', testament: 'New Testament', chapters: 13 },
  { number: 59, name: 'James', testament: 'New Testament', chapters: 5 },
  { number: 60, name: '1 Peter', testament: 'New Testament', chapters: 5 },
  { number: 61, name: '2 Peter', testament: 'New Testament', chapters: 3 },
  { number: 62, name: '1 John', testament: 'New Testament', chapters: 5 },
  { number: 63, name: '2 John', testament: 'New Testament', chapters: 1 },
  { number: 64, name: '3 John', testament: 'New Testament', chapters: 1 },
  { number: 65, name: 'Jude', testament: 'New Testament', chapters: 1 },
  { number: 66, name: 'Revelation', testament: 'New Testament', chapters: 22 },
];

export const PAPERBACK_BIBLE_BOOKS: Book[] = BIBLE_BOOKS_DATA.map(book => {
  const paddedNum = String(book.number).padStart(2, '0');
  // Construct URL slug: spaces become underscores, lowercase
  // e.g. "Song of Solomon" -> "song_of_solomon"
  // Note: Some multi-word books (like 1 Samuel) might have different patterns on SermonAudio
  // but we can rely on BookCard's fallback behavior for now.
  const urlSlug = book.name.toLowerCase().replace(/\s/g, '_');

  return {
    id: `pbb-${book.name.toLowerCase().replace(/\s/g, '-')}`,
    title: book.name,
    author: 'Sermon Audio',
    series: `Bible - ${book.testament}`,
    minAgeMonths: 0,
    maxAgeMonths: 120,
    learningStage: 'all',
    domain: 'wisdom',
    pageCount: book.chapters,
    renderFormat: 'pdf' as const,
    pdfUrl: `https://static.sermonaudio.com/pbb/books/download/${paddedNum}-${urlSlug}_5.pdf`,
    coverUrl: `https://static.sermonaudio.com/pbb/books/${paddedNum}-${urlSlug}_5.jpg`,
    description: `The Paperback Bible edition of ${book.name}. Designed to be portable, readable, and truly personal.`,
    topics: ['bible', 'scripture', book.testament === 'Old Testament' ? 'old testament' : 'new testament'],
    readingPrompts: []
  };
});
