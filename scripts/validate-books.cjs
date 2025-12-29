const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, '../public/books');
const REQUIRED_METADATA_FIELDS = [
    'id', 'series', 'title', 'author', 'description',
    'minAgeMonths', 'maxAgeMonths', 'pageCount', 'domain', 'learningStage'
];

let violations = {
    folderNaming: [],
    coverIssues: [],
    pageNumbering: [],
    missingFiles: [],
    metadata: []
};

function isSnakeCase(str) {
    return /^[a-z0-9_]+$/.test(str);
}

function scanBooks() {
    if (!fs.existsSync(BOOKS_DIR)) {
        console.error(`Books directory not found: ${BOOKS_DIR}`);
        return;
    }

    const seriesFolders = fs.readdirSync(BOOKS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    seriesFolders.forEach(seriesDirent => {
        const seriesName = seriesDirent.name;
        const seriesPath = path.join(BOOKS_DIR, seriesName);

        // Check Series Naming
        if (!isSnakeCase(seriesName)) {
            violations.folderNaming.push({
                path: seriesPath,
                current: seriesName,
                expected: toSnakeCase(seriesName)
            });
        }

        // Check Series Metadata and Cover
        const seriesMetadataPath = path.join(seriesPath, 'metadata.json');
        const seriesCoverPath = path.join(seriesPath, 'cover.png');

        if (!fs.existsSync(seriesMetadataPath)) {
            violations.missingFiles.push(`SERIES METADATA: ${seriesMetadataPath}`);
        } else {
            try {
                const meta = JSON.parse(fs.readFileSync(seriesMetadataPath, 'utf8'));
                if (meta.id !== seriesName) {
                    violations.metadata.push({
                        path: seriesMetadataPath,
                        issue: `Series ID mismatch: "${meta.id}"`,
                        expected: `Should be "${seriesName}"`
                    });
                }
            } catch (e) {
                violations.metadata.push({ path: seriesMetadataPath, issue: 'Invalid JSON' });
            }
        }

        if (!fs.existsSync(seriesCoverPath)) {
            violations.missingFiles.push(`SERIES COVER: ${seriesCoverPath}`);
        }

        const bookFolders = fs.readdirSync(seriesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        bookFolders.forEach(bookDirent => {
            const bookId = bookDirent.name;
            const bookPath = path.join(seriesPath, bookId);

            // Check Book Naming
            if (!isSnakeCase(bookId)) {
                violations.folderNaming.push({
                    path: bookPath,
                    current: bookId,
                    expected: toSnakeCase(bookId)
                });
            }

            validateBookFiles(bookPath, bookId, seriesName);
        });
    });

    reportViolations();
}

function validateBookFiles(bookPath, bookId, seriesName) {
    const imagesPath = path.join(bookPath, 'images');
    const metadataPath = path.join(bookPath, 'metadata.json');

    // Check Images Directory
    if (!fs.existsSync(imagesPath)) {
        violations.missingFiles.push(`${bookPath}/images/`);
    } else {
        const imageFiles = fs.readdirSync(imagesPath);

        // Check Cover
        if (!imageFiles.includes('cover.png')) {
            // Check if there's a misnamed cover (case insensitive)
            const misnamedCover = imageFiles.find(f => f.toLowerCase() === 'cover.png');
            if (misnamedCover) {
                violations.coverIssues.push({
                    path: path.join(imagesPath, misnamedCover),
                    issue: 'Wrong casing',
                    fix: 'Rename to cover.png'
                });
            } else {
                // Check if page-01 is suspicious (large size or typical for series)
                violations.coverIssues.push({
                    path: imagesPath,
                    issue: 'Missing cover.png',
                    fix: 'Check if page-01.png is actually the cover'
                });
            }
        }

        // Check Page Numbering
        const pageFiles = imageFiles.filter(f => f.startsWith('page-') && f.endsWith('.png'));
        pageFiles.forEach(f => {
            if (!/page-\d{2}\.png/.test(f)) {
                violations.pageNumbering.push({
                    path: path.join(imagesPath, f),
                    issue: 'Invalid numbering format',
                    expected: 'page-XX.png'
                });
            }
        });
    }

    // Check Metadata
    if (!fs.existsSync(metadataPath)) {
        violations.missingFiles.push(metadataPath);
    } else {
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

            if (metadata.id !== bookId) {
                violations.metadata.push({
                    path: metadataPath,
                    issue: `ID mismatch: "${metadata.id}"`,
                    expected: `Should be "${bookId}"`
                });
            }

            REQUIRED_METADATA_FIELDS.forEach(field => {
                if (!metadata[field]) {
                    violations.metadata.push({
                        path: metadataPath,
                        issue: `Missing field: ${field}`
                    });
                }
            });

        } catch (e) {
            violations.metadata.push({
                path: metadataPath,
                issue: 'Invalid JSON'
            });
        }
    }
}

function toSnakeCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function reportViolations() {
    console.log('\n🔍 SCHOOLOS BOOKS VALIDATION REPORT\n');

    let hasViolations = false;

    if (violations.folderNaming.length > 0) {
        hasViolations = true;
        console.log('1. FOLDER NAMING ISSUES:');
        violations.folderNaming.forEach(v => {
            console.log(`   ❌ "${v.current}" -> Should be: "${v.expected}"`);
        });
        console.log('');
    }

    if (violations.coverIssues.length > 0) {
        hasViolations = true;
        console.log('2. COVER FILE ISSUES:');
        violations.coverIssues.forEach(v => {
            console.log(`   ❌ ${v.path}`);
            console.log(`      -> ${v.issue}. FIX: ${v.fix}`);
        });
        console.log('');
    }

    if (violations.pageNumbering.length > 0) {
        hasViolations = true;
        console.log('3. PAGE NUMBERING ISSUES:');
        violations.pageNumbering.forEach(v => {
            console.log(`   ❌ ${v.path} (${v.issue})`);
        });
        console.log('');
    }

    if (violations.missingFiles.length > 0) {
        hasViolations = true;
        console.log('4. MISSING FILES:');
        violations.missingFiles.forEach(v => {
            console.log(`   ❌ ${v}`);
        });
        console.log('');
    }

    if (violations.metadata.length > 0) {
        hasViolations = true;
        console.log('5. METADATA ISSUES:');
        violations.metadata.forEach(v => {
            console.log(`   ❌ ${v.path}`);
            console.log(`      -> ${v.issue}`);
            if (v.expected) console.log(`      -> ${v.expected}`);
        });
        console.log('');
    }

    if (!hasViolations) {
        console.log('✅ ALL BOOKS ARE CONFORMANT!');
    } else {
        console.log('\n⚠️  Please run "node scripts/conform-books.cjs" to fix these issues.');
        process.exit(1);
    }
}

scanBooks();
