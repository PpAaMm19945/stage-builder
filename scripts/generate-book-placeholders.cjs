const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Books metadata
const books = [
  // Athanasius Press
  { series: 'athanasius_contra_mundum', id: 'on_the_incarnation', title: 'On the Incarnation', pages: 32, color: '#4B5563' },
  { series: 'athanasius_contra_mundum', id: 'against_the_heathen', title: 'Against the Heathen', pages: 28, color: '#4B5563' },
  { series: 'athanasius_contra_mundum', id: 'life_of_antony', title: 'Life of Antony', pages: 40, color: '#4B5563' },

  // Animal Friends
  { series: 'animal_friends', id: 'the_brave_bear', title: 'The Brave Bear', pages: 16, color: '#10B981' },
  { series: 'animal_friends', id: 'the_wise_owl', title: 'The Wise Owl', pages: 16, color: '#10B981' },
  { series: 'animal_friends', id: 'the_kind_elephant', title: 'The Kind Elephant', pages: 16, color: '#10B981' },
  { series: 'animal_friends', id: 'the_busy_beaver', title: 'The Busy Beaver', pages: 16, color: '#10B981' },
  { series: 'animal_friends', id: 'the_playful_dolphin', title: 'The Playful Dolphin', pages: 16, color: '#10B981' },
  { series: 'animal_friends', id: 'the_faithful_dog', title: 'The Faithful Dog', pages: 16, color: '#10B981' },
  { series: 'animal_friends', id: 'the_gentle_lamb', title: 'The Gentle Lamb', pages: 16, color: '#10B981' },

  // Early Church Fathers
  { series: 'early_church_fathers', id: 'polycarps_letter', title: "Polycarp's Letter", pages: 24, color: '#D97706' },
  { series: 'early_church_fathers', id: 'ignatius_ephesians', title: 'Ignatius to the Ephesians', pages: 24, color: '#D97706' },
  { series: 'early_church_fathers', id: 'ignatius_romans', title: 'Ignatius to the Romans', pages: 24, color: '#D97706' },
  { series: 'early_church_fathers', id: 'the_didache', title: 'The Didache', pages: 20, color: '#D97706' },
  { series: 'early_church_fathers', id: 'letter_to_diognetus', title: 'Letter to Diognetus', pages: 18, color: '#D97706' },
  { series: 'early_church_fathers', id: 'shepherd_of_hermas', title: 'Shepherd of Hermas', pages: 48, color: '#D97706' },
  { series: 'early_church_fathers', id: 'clement_of_rome', title: 'Clement of Rome', pages: 32, color: '#D97706' },
  { series: 'early_church_fathers', id: 'justin_martyr_apology', title: "Justin Martyr's Apology", pages: 36, color: '#D97706' },
  { series: 'early_church_fathers', id: 'irenaeus_against_heresies', title: 'Irenaeus Against Heresies', pages: 42, color: '#D97706' },
];

const OUTPUT_DIR = path.join(__dirname, '../public/books-placeholders');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function generatePlaceholder(book) {
  const width = 600;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.font = 'bold 48px sans-serif';
  wrapText(ctx, book.title, width / 2, height / 2 - 50, 500, 60);

  // Footer
  ctx.font = '24px sans-serif';
  ctx.fillText('Coming Soon', width / 2, height - 50);

  // Series
  ctx.font = '32px sans-serif';
  ctx.fillText(book.series.replace(/_/g, ' ').toUpperCase(), width / 2, 100);

  const buffer = canvas.toBuffer('image/png');
  const bookDir = path.join(OUTPUT_DIR, book.series, book.id);

  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }

  fs.writeFileSync(path.join(bookDir, 'cover.png'), buffer);
  console.log(`Generated cover for ${book.title}`);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

books.forEach(generatePlaceholder);
console.log('Placeholder generation complete.');
