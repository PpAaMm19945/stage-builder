const fs = require('fs');
const path = require('path');

const filePath = 'cloudflare/migrations/0047_seed_progressions_q82_q107.sql';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf-8');

// Regex to find wsc_q[Number] and decrement content by 1
// We need to handle both the ID keys ('wsc_q82_seedling') and the base_item_id ('wsc_q82')
// And also comments if possible, but mainly the SQL values.

// Strategy: Replace specific patterns to avoid false positives.
// Pattern: wsc_q(\d+)
// We only want to replace 82-107 range.

console.log("Aligning IDs in 0047...");

let replacementCount = 0;

const newContent = content.replace(/wsc_q(\d+)/g, (match, numberStr) => {
    const num = parseInt(numberStr, 10);
    if (num >= 82 && num <= 107) {
        replacementCount++;
        return `wsc_q${num - 1}`;
    }
    return match;
});

// Also fix the headers in comments just for clarity? 
// E.g. -- Q82: ...
// Regex: -- Q(\d+):
const finalContent = newContent.replace(/-- Q(\d+):/g, (match, numberStr) => {
    const num = parseInt(numberStr, 10);
    if (num >= 82 && num <= 107) {
        return `-- Q${num - 1}:`;
    }
    return match;
});

fs.writeFileSync(filePath, finalContent);

console.log(`Updated ${filePath}. Replaced ${replacementCount} ID references.`);
console.log("New range should be wsc_q81 to wsc_q106.");
