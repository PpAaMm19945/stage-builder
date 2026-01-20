import { Book } from '@/types';

// Defined based on Paperback Bible website (31 volumes)
const VOLUMES = [
  { num: 1, title: 'Genesis', slug: 'genesis', chapters: 50, testament: 'Old Testament' },
  { num: 2, title: 'Exodus', slug: 'exodus', chapters: 40, testament: 'Old Testament' },
  { num: 3, title: 'Leviticus', slug: 'leviticus', chapters: 27, testament: 'Old Testament' },
  { num: 4, title: 'Numbers', slug: 'numbers', chapters: 36, testament: 'Old Testament' },
  { num: 5, title: 'Deuteronomy', slug: 'deuteronomy', chapters: 34, testament: 'Old Testament' },
  { num: 6, title: 'Joshua', slug: 'joshua', chapters: 24, testament: 'Old Testament' },
  { num: 7, title: 'Judges & Ruth', slug: 'judges_ruth', chapters: 25, testament: 'Old Testament' }, // Judges 21 + Ruth 4
  { num: 8, title: 'Books of Samuel', slug: 'samuel', chapters: 55, testament: 'Old Testament' }, // 1 Sam 31 + 2 Sam 24
  { num: 9, title: 'Books of Kings', slug: 'kings', chapters: 47, testament: 'Old Testament' }, // 1 Kings 22 + 2 Kings 25
  { num: 10, title: 'Books of Chronicles', slug: 'chronicles', chapters: 65, testament: 'Old Testament' }, // 1 Chron 29 + 2 Chron 36
  { num: 11, title: 'Ezra, Nehemiah, Esther', slug: 'ezra_nehemiah_esther', chapters: 33, testament: 'Old Testament' }, // Ezra 10 + Neh 13 + Est 10
  { num: 12, title: 'Job', slug: 'job', chapters: 42, testament: 'Old Testament' },
  { num: 13, title: 'Psalms', slug: 'psalms', chapters: 150, testament: 'Old Testament' },
  { num: 14, title: 'Proverbs', slug: 'proverbs', chapters: 31, testament: 'Old Testament' },
  { num: 15, title: 'Poetry', slug: 'poetry', chapters: 20, testament: 'Old Testament' }, // Ecc 12 + Song 8
  { num: 16, title: 'Isaiah', slug: 'isaiah', chapters: 66, testament: 'Old Testament' },
  { num: 17, title: 'Jeremiah', slug: 'jeremiah', chapters: 57, testament: 'Old Testament' }, // Jer 52 + Lam 5
  { num: 18, title: 'Ezekiel', slug: 'ezekiel', chapters: 48, testament: 'Old Testament' },
  { num: 19, title: 'Daniel', slug: 'daniel', chapters: 12, testament: 'Old Testament' },
  { num: 20, title: 'Minor Prophets', slug: 'minor_prophets', chapters: 67, testament: 'Old Testament' },
  { num: 21, title: 'Matthew', slug: 'matthew', chapters: 28, testament: 'New Testament' },
  { num: 22, title: 'Mark', slug: 'mark', chapters: 16, testament: 'New Testament' },
  { num: 23, title: 'Luke', slug: 'luke', chapters: 24, testament: 'New Testament' },
  { num: 24, title: 'John', slug: 'john', chapters: 21, testament: 'New Testament' },
  { num: 25, title: 'Acts', slug: 'acts', chapters: 28, testament: 'New Testament' },
  { num: 26, title: 'Romans', slug: 'romans', chapters: 16, testament: 'New Testament' },
  { num: 27, title: 'Corinthians', slug: 'corinthians', chapters: 29, testament: 'New Testament' }, // 1 Cor 16 + 2 Cor 13
  { num: 28, title: "Paul's Epistles", slug: 'epistles_of_paul', chapters: 42, testament: 'New Testament' }, // Gal-Philemon
  { num: 29, title: 'Hebrews', slug: 'hebrews', chapters: 13, testament: 'New Testament' },
  { num: 30, title: 'General Epistles', slug: 'general_epistles', chapters: 21, testament: 'New Testament' }, // James-Jude
  { num: 31, title: 'Revelation', slug: 'revelation', chapters: 22, testament: 'New Testament' },
];

export const PAPERBACK_BIBLE_BOOKS: Book[] = VOLUMES.map(vol => {
  const paddedNum = String(vol.num).padStart(2, '0');

  return {
    id: `pbb-${vol.slug.replace(/_/g, '-')}`,
    title: vol.title,
    author: 'Sermon Audio',
    series: 'The Paperback Bible',
    minAgeMonths: 0,
    maxAgeMonths: 120,
    learningStage: 'all',
    domain: 'wisdom',
    pageCount: vol.chapters,
    renderFormat: 'pdf',
    pdfUrl: `https://static.sermonaudio.com/pbb/books/download/${paddedNum}-${vol.slug}_5.pdf`,
    coverUrl: `https://static.sermonaudio.com/pbb/books/${paddedNum}-${vol.slug}_5.jpg`,
    description: `The Paperback Bible edition of ${vol.title}. Designed to be portable, readable, and truly personal.`,
    topics: ['bible', 'scripture', vol.testament === 'Old Testament' ? 'old testament' : 'new testament'],
    readingPrompts: []
  };
});
