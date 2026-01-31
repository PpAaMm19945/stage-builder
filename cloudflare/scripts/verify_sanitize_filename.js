
function sanitizeFilename(name) {
    if (!name) return 'download';
    // Remove control characters
    let sanitized = name.replace(/[\x00-\x1F\x7F]/g, '');

    // Replace risky characters with underscore: " / \ : * ? < > | ;
    sanitized = sanitized.replace(/["\/\\:*?<>|;]/g, '_');

    // Prevent traversal
    sanitized = sanitized.replace(/\.\./g, '__');

    // Trim
    sanitized = sanitized.trim();

    if (sanitized.length === 0) return 'download';

    // Max length
    if (sanitized.length > 200) sanitized = sanitized.substring(0, 200);

    return sanitized;
}

const testCases = [
  { input: 'ValidName.pdf', expected: 'ValidName.pdf' },
  { input: 'Name with spaces.pdf', expected: 'Name with spaces.pdf' },
  { input: 'invalid"quote.pdf', expected: 'invalid_quote.pdf' },
  { input: 'path/traversal.pdf', expected: 'path_traversal.pdf' },
  // Escaping backslash in JS string to represent literal backslash
  { input: '..\\parent.pdf', expected: '___parent.pdf' },
  { input: 'foo"; filename="malicious.exe', expected: 'foo__ filename=_malicious.exe' },
  { input: 'semi;colon.pdf', expected: 'semi_colon.pdf' },
  { input: '', expected: 'download' },
  { input: '   ', expected: 'download' },
];

console.log('Running Sanitize Filename Tests...');

let failed = 0;
testCases.forEach(({ input, expected }) => {
    const result = sanitizeFilename(input);
    if (result !== expected) {
        console.error(`FAIL: "${input}" -> "${result}" (Expected: "${expected}")`);
        failed++;
    } else {
        console.log(`PASS: "${input}" -> "${result}"`);
    }
});

if (failed > 0) {
    console.error(`${failed} tests failed.`);
    process.exit(1);
} else {
    console.log('All tests passed.');
}
