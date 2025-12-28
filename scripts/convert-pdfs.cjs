/**
 * PDF to PNG Conversion Script for SchoolOS Books
 * 
 * Prerequisites:
 * 1. Install Poppler (PDF library):
 *    - Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases
 *    - Extract to C:\poppler and add C:\poppler\Library\bin to PATH
 *    - Or install via chocolatey: choco install poppler
 * 
 * 2. Install dependencies:
 *    npm install pdf-poppler fs-extra
 * 
 * Usage:
 *    node scripts/convert-pdfs.js
 */

const fs = require('fs-extra');
const path = require('path');
const pdf = require('pdf-poppler');

// Configuration
const BOOKS_DIR = path.join(__dirname, '..', 'public', 'books');
const SERIES_TO_CONVERT = ['African Men of Faith', 'The Gospel Series', 'My First Books'];

async function findPDFs(seriesDir) {
    const books = await fs.readdir(seriesDir);
    const pdfFiles = [];

    for (const book of books) {
        const bookPath = path.join(seriesDir, book);
        const stat = await fs.stat(bookPath);

        if (stat.isDirectory()) {
            const files = await fs.readdir(bookPath);
            const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));

            if (pdfFile) {
                pdfFiles.push({
                    bookName: book,
                    bookPath: bookPath,
                    pdfPath: path.join(bookPath, pdfFile),
                    imagesDir: path.join(bookPath, 'images')
                });
            }
        }
    }

    return pdfFiles;
}

async function convertPDF(pdfInfo) {
    const { bookName, pdfPath, imagesDir } = pdfInfo;

    console.log(`\n📖 Converting: ${bookName}`);
    console.log(`   PDF: ${pdfPath}`);

    // Ensure images directory exists
    await fs.ensureDir(imagesDir);

    // Check if already converted
    const existingImages = await fs.readdir(imagesDir);
    const pngFiles = existingImages.filter(f => f.startsWith('page-') && f.endsWith('.png'));

    if (pngFiles.length > 0) {
        console.log(`   ⏭️  Already has ${pngFiles.length} pages, skipping...`);
        return { bookName, pages: pngFiles.length, skipped: true };
    }

    // Convert PDF to PNG
    const options = {
        format: 'png',
        out_dir: imagesDir,
        out_prefix: 'page',
        page: null, // All pages
        scale: 2048, // Width in pixels (good quality for display)
    };

    try {
        await pdf.convert(pdfPath, options);

        // Rename files to match our naming convention (page-01.png, page-02.png, etc.)
        const files = await fs.readdir(imagesDir);
        const convertedFiles = files.filter(f => f.startsWith('page-') && f.endsWith('.png'));

        // Sort and rename with zero-padding
        convertedFiles.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
        });

        let pageCount = 0;
        for (const file of convertedFiles) {
            pageCount++;
            const newName = `page-${String(pageCount).padStart(2, '0')}.png`;
            const oldPath = path.join(imagesDir, file);
            const newPath = path.join(imagesDir, newName);

            if (file !== newName) {
                await fs.rename(oldPath, newPath);
            }
        }

        // Copy first page as cover
        const coverSrc = path.join(imagesDir, 'page-01.png');
        const coverDst = path.join(imagesDir, '..', 'cover.png');

        if (await fs.pathExists(coverSrc)) {
            await fs.copy(coverSrc, coverDst);
            console.log(`   ✅ Converted ${pageCount} pages + cover`);
        }

        return { bookName, pages: pageCount, skipped: false };

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return { bookName, pages: 0, error: error.message };
    }
}

async function updateMetadata(pdfInfo, pageCount) {
    const metadataPath = path.join(pdfInfo.bookPath, 'metadata.json');

    if (await fs.pathExists(metadataPath)) {
        try {
            const metadata = await fs.readJson(metadataPath);

            // Add/update standardized fields
            metadata.pageCount = pageCount;
            metadata.learningStage = metadata.learningStage || 'early-years';
            metadata.domain = metadata.domain || 'language';

            // Convert ageRange to months if needed
            if (metadata.ageRange && !metadata.minAgeMonths) {
                const match = metadata.ageRange.match(/(\d+)\s*-\s*(\d+)/);
                if (match) {
                    let min = parseInt(match[1]);
                    let max = parseInt(match[2]);
                    if (max <= 12) { // Likely years
                        min *= 12;
                        max *= 12;
                    }
                    metadata.minAgeMonths = min;
                    metadata.maxAgeMonths = max;
                }
            }

            await fs.writeJson(metadataPath, metadata, { spaces: 2 });
            console.log(`   📝 Updated metadata.json`);

        } catch (error) {
            console.error(`   ⚠️  Could not update metadata: ${error.message}`);
        }
    }
}

async function main() {
    console.log('🚀 SchoolOS Book PDF Converter\n');
    console.log('='.repeat(50));

    const results = [];

    for (const series of SERIES_TO_CONVERT) {
        const seriesDir = path.join(BOOKS_DIR, series);

        if (!await fs.pathExists(seriesDir)) {
            console.log(`\n⚠️  Series directory not found: ${series}`);
            continue;
        }

        console.log(`\n📚 Series: ${series}`);

        const pdfs = await findPDFs(seriesDir);
        console.log(`   Found ${pdfs.length} books with PDFs`);

        for (const pdfInfo of pdfs) {
            const result = await convertPDF(pdfInfo);
            results.push(result);

            if (result.pages > 0 && !result.skipped) {
                await updateMetadata(pdfInfo, result.pages);
            }
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Conversion Summary:\n');

    for (const r of results) {
        if (r.error) {
            console.log(`   ❌ ${r.bookName}: Failed - ${r.error}`);
        } else if (r.skipped) {
            console.log(`   ⏭️  ${r.bookName}: Skipped (${r.pages} pages exist)`);
        } else {
            console.log(`   ✅ ${r.bookName}: ${r.pages} pages converted`);
        }
    }

    console.log('\n✨ Done!\n');
}

main().catch(console.error);
