
function isValidPath(path) {
  // Prevent Path Traversal
  if (path.includes('..')) return false;

  // Enforce Prefix to contained folder
  // We want to force all uploads to be under 'books/' to prevent overwriting manifest.json or other system files.
  if (!path.startsWith('books/')) return false;

  return true;
}

const testCases = [
  // Valid cases
  { path: 'books/Series/Book/cover.png', expected: true },
  { path: 'books/Series/Book/page 1.png', expected: true },
  { path: 'books/Series/Book/file-with_special.chars.pdf', expected: true },

  // Invalid cases - No prefix
  { path: 'manifest.json', expected: false },
  { path: 'random.txt', expected: false },
  { path: '/books/test', expected: false }, // Starts with slash, might be valid in some systems but we want relative to root 'books/'?
  // Wait, R2 keys usually don't start with /. 'books/' is correct.
  // If user passes '/books/', standard string startsWith fails.
  // Reindex uses 'books/' prefix. So we should enforce 'books/'.

  // Invalid cases - Traversal
  { path: 'books/../manifest.json', expected: false },
  { path: 'books/series/../../secret', expected: false },
  { path: 'books/..', expected: false },
  { path: '../books/test', expected: false },
];

let failed = 0;

testCases.forEach(({ path, expected }) => {
  const result = isValidPath(path);
  if (result !== expected) {
    console.error(`FAILED: Path "${path}". Expected ${expected}, got ${result}`);
    failed++;
  } else {
    console.log(`PASS: Path "${path}" -> ${result}`);
  }
});

if (failed > 0) {
  console.error(`${failed} tests failed.`);
  process.exit(1);
} else {
  console.log('All tests passed.');
}
