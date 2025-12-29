const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BOOKS_DIR = path.join(__dirname, '../public/books');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function toSnakeCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

async function conformBooks() {
    console.log('🚀 SCHOOLOS BOOK CONFORMITY SCRIPT\n');

    if (!fs.existsSync(BOOKS_DIR)) {
        console.error('Books directory not found.');
        process.exit(1);
    }

    const seriesFolders = fs.readdirSync(BOOKS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    for (const seriesDirent of seriesFolders) {
        const oldSeriesName = seriesDirent.name;
        const newSeriesName = toSnakeCase(oldSeriesName);
        const oldSeriesPath = path.join(BOOKS_DIR, oldSeriesName);
        const newSeriesPath = path.join(BOOKS_DIR, newSeriesName);

        // Rename Series Folder
        if (oldSeriesName !== newSeriesName) {
            console.log(`\n📁 Rename Series: "${oldSeriesName}" -> "${newSeriesName}"`);
            fs.renameSync(oldSeriesPath, newSeriesPath);
            console.log('   ✅ Renamed');
        }

        const currentSeriesPath = newSeriesPath; // It's now at the new path (or was already there)

        // --- SERIES METADATA ---
        const seriesMetaPath = path.join(currentSeriesPath, 'metadata.json');
        if (!fs.existsSync(seriesMetaPath)) {
            const defaultMeta = {
                id: newSeriesName,
                title: toTitleCase(newSeriesName),
                description: ""
            };
            fs.writeFileSync(seriesMetaPath, JSON.stringify(defaultMeta, null, 2));
            console.log(`   📝 Created series metadata: ${seriesMetaPath}`);
        } else {
            // Ensure ID matches
            try {
                const meta = JSON.parse(fs.readFileSync(seriesMetaPath, 'utf8'));
                if (meta.id !== newSeriesName) {
                    meta.id = newSeriesName;
                    fs.writeFileSync(seriesMetaPath, JSON.stringify(meta, null, 2));
                    console.log(`   📝 Updated series metadata ID to ${newSeriesName}`);
                }
            } catch (e) {
                console.log(`   ❌ Failed to parse series metadata: ${e.message}`);
            }
        }

        // --- SERIES COVER ---
        if (!fs.existsSync(path.join(currentSeriesPath, 'cover.png'))) {
            console.log(`   ⚠️  Missing series cover: ${path.join(currentSeriesPath, 'cover.png')}`);
        }



        const bookFolders = fs.readdirSync(currentSeriesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        for (const bookDirent of bookFolders) {
            const oldBookId = bookDirent.name;
            const newBookId = toSnakeCase(oldBookId);
            const oldBookPath = path.join(currentSeriesPath, oldBookId);
            const newBookPath = path.join(currentSeriesPath, newBookId);

            // Rename Book Folder
            if (oldBookId !== newBookId) {
                console.log(`   📘 Rename Book: "${oldBookId}" -> "${newBookId}"`);
                fs.renameSync(oldBookPath, newBookPath);
                console.log('      ✅ Renamed folder');
            }

            const currentBookPath = newBookPath;
            await processBookFiles(currentBookPath, newBookId, newSeriesName);
        }
    }

    console.log('\n✨ Conformity check complete!');
    rl.close();
}

// Helper to title case snake string
function toTitleCase(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function processBookFiles(bookPath, bookId, seriesName) {
    const imagesPath = path.join(bookPath, 'images');

    // 1. Fix "images" folder casing if needed
    if (!fs.existsSync(imagesPath)) {
        if (fs.existsSync(bookPath)) {
            const items = fs.readdirSync(bookPath);
            const imagesFolder = items.find(i => i.toLowerCase() === 'images');
            if (imagesFolder) {
                fs.renameSync(path.join(bookPath, imagesFolder), imagesPath);
                console.log(`      ✅ Renamed image folder: ${imagesFolder} -> images`);
            }
        }
    }

    if (fs.existsSync(imagesPath)) {
        const files = fs.readdirSync(imagesPath);

        // 2. Fix specific series logic
        if (seriesName === 'the_gospel_series') {
            await handleGospelSeries(imagesPath, files);
        } else if (seriesName === 'african_men_of_faith') {
            await handleAfricanMenOfFaith(imagesPath, files);
        } else {
            // General cover fix attempt for others if missing
            if (!files.includes('cover.png') && !files.includes('Cover.png')) {
                const page01 = files.find(f => f.toLowerCase() === 'page-01.png');
                if (page01) {
                    // Assume page-01 is cover if it's the only candidate
                    // But be careful. For now, let's copy page-01 to cover.png to be safe?
                    // Or just rename? User implies "page-01 is cover" for others.
                    // Let's safe copy for now to satisfy existence check
                    try {
                        fs.copyFileSync(path.join(imagesPath, page01), path.join(imagesPath, 'cover.png'));
                        console.log(`      ⚠️  Created cover.png from ${page01} (auto-fix)`);
                    } catch (err) {
                        console.log(`      ❌ Failed to create cover.png: ${err.message}`);
                    }
                }
            }
        }

        // 3. General cleanup
        const finalFiles = fs.readdirSync(imagesPath);
        for (const file of finalFiles) {
            const oldPath = path.join(imagesPath, file);
            let newName = file.toLowerCase();

            if (file === 'Cover.png') newName = 'cover.png';
            if (file === 'Page-01.png') newName = 'page-01.png';

            if (file !== newName) {
                fs.renameSync(oldPath, path.join(imagesPath, newName));
                console.log(`      ✅ Renamed file: ${file} -> ${newName}`);
            }
        }
    }

    // 4. Update Metadata
    const metadataPath = path.join(bookPath, 'metadata.json');
    let metadata = {};
    let metadataExists = false;

    if (fs.existsSync(metadataPath)) {
        metadataExists = true;
    } else if (fs.existsSync(bookPath)) {
        const items = fs.readdirSync(bookPath);
        const metaFile = items.find(i => i.toLowerCase() === 'metadata.json');
        if (metaFile) {
            fs.renameSync(path.join(bookPath, metaFile), metadataPath);
            console.log(`      ✅ Renamed metadata file: ${metaFile} -> metadata.json`);
            metadataExists = true;
        }
    }

    if (metadataExists) {
        try {
            const raw = fs.readFileSync(metadataPath, 'utf8');
            metadata = JSON.parse(raw);
            let changed = false;

            // Fix ID
            if (metadata.id !== bookId) {
                metadata.id = bookId;
                changed = true;
            }

            // Fix Series
            if (!metadata.series) {
                metadata.series = toTitleCase(seriesName);
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
                console.log(`      📝 Updated metadata (id/series)`);
            }

        } catch (e) {
            console.log(`      ❌ Error reading/writing metadata for ${bookId}: ${e.message}`);
        }
    }
}

async function handleGospelSeries(imagesPath, files) {
    // Current: page-01 (cover), page-02 (copyright), page-03 (page-01), etc.
    // Target: cover.png, page-00.png, page-01.png

    if (files.includes('cover.png')) return; // Already processed?

    console.log('      🔄 Processing Gospel Series Renumbering...');

    const page01 = files.find(f => f.toLowerCase() === 'page-01.png');

    // Check if we need to act (only if page-01 exists and no cover)
    if (page01) {
        // 1. Rename page-01 to cover.png
        fs.renameSync(path.join(imagesPath, page01), path.join(imagesPath, 'cover.png'));
        console.log('         - Converted page-01.png to cover.png');

        // 2. Shift others: page-02 -> page-00, page-03 -> page-01
        // We need to do this carefully. 
        const otherPages = files
            .filter(f => f.toLowerCase().match(/page-\d{2}\.png/) && f.toLowerCase() !== 'page-01.png')
            .sort(); // Sort to process in order? Actually order doesn't matter if we map properly

        for (const page of otherPages) {
            const match = page.toLowerCase().match(/page-(\d{2})\.png/);
            if (match) {
                const num = parseInt(match[1]);
                const newNum = num - 2; // 02 -> 00, 03 -> 01
                if (newNum >= 0) {
                    const newName = `page-${String(newNum).padStart(2, '0')}.png`;
                    fs.renameSync(path.join(imagesPath, page), path.join(imagesPath, newName));
                    console.log(`         - Renumbered ${page} -> ${newName}`);
                }
            }
        }
    }
}

async function handleAfricanMenOfFaith(imagesPath, files) {
    // Current: page-01 (cover, 3MB), page-02...
    // Target: cover.png, page-01.png (from page-02)

    if (files.includes('cover.png')) return;

    console.log('      🔄 Processing African Men of Faith Renumbering...');

    const page01 = files.find(f => f.toLowerCase() === 'page-01.png');
    if (page01) {
        fs.renameSync(path.join(imagesPath, page01), path.join(imagesPath, 'cover.png'));
        console.log('         - Converted page-01.png to cover.png');

        const otherPages = files
            .filter(f => f.toLowerCase().match(/page-\d{2}\.png/) && f.toLowerCase() !== 'page-01.png')
            .sort();

        for (const page of otherPages) {
            const match = page.toLowerCase().match(/page-(\d{2})\.png/);
            if (match) {
                const num = parseInt(match[1]);
                const newNum = num - 1; // 02 -> 01
                /* 
                   Wait, for specific files:
                   If page-02.png -> page-01.png
                */
                if (newNum > 0) { // Should start at 01? User said: "Rename page-02.png -> page-01.png"
                    const newName = `page-${String(newNum).padStart(2, '0')}.png`;
                    fs.renameSync(path.join(imagesPath, page), path.join(imagesPath, newName));
                    console.log(`         - Renumbered ${page} -> ${newName}`);
                } else if (newNum === 0) {
                    // If there was a page-01 (which was cover), page-02 -> page-01. 
                    // What if there was a copyright page? User didn't specify page-00 for this series in the fix list.
                    // "page-01.png appears to be cover ... Fix: Create cover from page-01... Rename page-02 -> page-01"
                    // So we follow that.
                }
            }
        }
    }
}

conformBooks();
