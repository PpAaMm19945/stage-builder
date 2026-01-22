const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, '../public/books');
const BUCKET_NAME = 'schoolos-books';
const R2_PREFIX = 'books'; // Files go into books/series/id/

console.log('📚 SchoolOS Book Sync Utility');
console.log('============================');

function syncBooks() {
    if (!fs.existsSync(BOOKS_DIR)) {
        console.error(`Error: ${BOOKS_DIR} not found.`);
        process.exit(1);
    }

    // Check if wrangler is available via npx
    try {
        execSync('npx wrangler --version', { stdio: 'ignore', shell: true });
    } catch (e) {
        console.error('Error: "wrangler" is not available via npx.');
        console.log('Please run: npm install wrangler --save-dev');
        process.exit(1);
    }

    const seriesFolders = fs.readdirSync(BOOKS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    console.log(`Found ${seriesFolders.length} series folders.`);

    seriesFolders.forEach(seriesDirent => {
        const seriesName = seriesDirent.name;
        const seriesPath = path.join(BOOKS_DIR, seriesName);

        // Sync Series Metadata
        const seriesFiles = ['metadata.json', 'cover.png'];
        seriesFiles.forEach(file => {
            const filePath = path.join(seriesPath, file);
            if (fs.existsSync(filePath)) {
                console.log(`Uploading series asset: ${seriesName}/${file}`);
                uploadFile(filePath, `${R2_PREFIX}/${seriesName}/${file}`);
            }
        });

        const bookFolders = fs.readdirSync(seriesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        bookFolders.forEach(bookDirent => {
            const bookId = bookDirent.name;
            const bookPath = path.join(seriesPath, bookId);

            console.log(`\nSyncing Book: ${seriesName}/${bookId}`);

            // 1. Sync Metadata
            const metaPath = path.join(bookPath, 'metadata.json');
            if (fs.existsSync(metaPath)) {
                uploadFile(metaPath, `${R2_PREFIX}/${seriesName}/${bookId}/metadata.json`);
            } else {
                console.warn(`  ⚠️ Missing metadata.json for ${bookId}`);
            }

            // 2. Sync Images
            const imagesPath = path.join(bookPath, 'images');
            if (fs.existsSync(imagesPath)) {
                // Upload entire images folder structure
                // For efficiency, we use recursive directory put if possible, but wrangler might handle one by one more reliably for small batches
                // Let's iterate to be explicit and avoid "prompts.json" etc if needed

                const imageFiles = fs.readdirSync(imagesPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));

                if (imageFiles.length === 0) {
                    console.log(`  ℹ️ No images found in images/ folder.`);
                }

                imageFiles.forEach(img => {
                    const localPath = path.join(imagesPath, img);
                    const remoteKey = `${R2_PREFIX}/${seriesName}/${bookId}/images/${img}`;
                    uploadFile(localPath, remoteKey);
                });
            } else {
                console.log(`  ℹ️ No images folder found.`);
            }
        });
    });
}

function uploadFile(localPath, remoteKey) {
    try {
        // Use 'npx wrangler' and ensure shell parsing for Windows
        execSync(`npx wrangler r2 object put "${BUCKET_NAME}/${remoteKey}" --file="${localPath}"`, { stdio: 'inherit', shell: true });
    } catch (e) {
        console.error(`  ❌ Failed to upload ${remoteKey}`);
    }
}

syncBooks();
console.log('\n✨ Sync Complete!');
