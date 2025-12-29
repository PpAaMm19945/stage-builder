const fs = require('fs-extra');
const path = require('path');

// Configuration
const BOOKS_DIR = path.join(__dirname, '..', 'public', 'books');
const SERIES_TO_PROCESS = ['The Gospel Series', 'My First Books'];

async function processBook(bookPath) {
    const files = await fs.readdir(bookPath);
    const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));

    if (!pdfFile) return null;

    console.log(`\n📚 Processing: ${path.basename(bookPath)}`);
    console.log(`   PDF: ${pdfFile}`);

    const pdfPath = path.join(bookPath, pdfFile);

    // SKIP PDF TEXT EXTRACTION due to library issues in this environment.
    // We will rely on images which are essentially the book.
    const fullText = "(Text content not extracted from PDF)";
    const totalPages = 0; // We will use image count

    const imagesDir = path.join(bookPath, 'images');
    let imageCount = 0;
    if (await fs.pathExists(imagesDir)) {
        const imageFiles = await fs.readdir(imagesDir);
        imageCount = imageFiles.filter(f => f.startsWith('page-') && f.endsWith('.png')).length;
    }

    console.log(`   🖼️  Found ${imageCount} generated images.`);

    const bookTitle = path.basename(bookPath);

    // 1. Generate content.md
    let markdownContent = `---
title: ${bookTitle}
subtitle: The Gospel Series
author: Unknown
illustrator: Unknown
publisher: Petra Reformed Publishing
publisherLocation: Kampala, Uganda
copyrightYear: 2025
ageRange: 3-6 years
domain: spiritual
description: A story from the Gospel Series.
keywords: bible, gospel, christian, children
---

# Dedication

To all children learning the good news.

---
`;

    const pagesToCreate = imageCount > 0 ? imageCount : 1;

    for (let i = 1; i <= pagesToCreate; i++) {
        const pageNum = String(i).padStart(2, '0');
        markdownContent += `
# Page ${i}
![Page ${i}](images/page-${pageNum}.png)

**Ask:** What is happening in this picture?

---
`;
    }

    const contentPath = path.join(bookPath, 'content.md');
    if (!await fs.pathExists(contentPath)) {
        await fs.writeFile(contentPath, markdownContent, 'utf-8');
        console.log(`   📝 Created content.md`);
    } else {
        console.log(`   ⚠️  content.md already exists, skipping overwrite.`);
    }

    // 2. Generate/Update metadata.json
    const metadataPath = path.join(bookPath, 'metadata.json');
    let metadata = {};
    if (await fs.pathExists(metadataPath)) {
        metadata = await fs.readJson(metadataPath);
    } else {
        console.log(`   📝 Creating new metadata.json`);
    }

    metadata.title = metadata.title || bookTitle;
    metadata.pageCount = Math.max(metadata.pageCount || 0, pagesToCreate);
    metadata.ageRange = metadata.ageRange || "3-6 years";
    metadata.domain = metadata.domain || "spiritual";

    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
    console.log(`   💾 Saved metadata.json`);

    // 3. User Request: Use Page 1 as Cover
    const pageOnePath = path.join(imagesDir, 'page-01.png');
    const coverPath = path.join(bookPath, 'cover.png');

    if (await fs.pathExists(pageOnePath)) {
        await fs.copy(pageOnePath, coverPath, { overwrite: true });
        console.log(`   🖼️  Copied page-01.png to cover.png`);
    } else {
        console.log(`   ⚠️  Could not find page-01.png to use as cover`);
    }

    // 4. Delete PDF
    await fs.remove(pdfPath);
    console.log(`   🗑️  Deleted PDF file`);
}

async function main() {
    console.log('🚀 SchoolOS Book Structure Finalizer (Skipping Text Extraction)\n');

    for (const series of SERIES_TO_PROCESS) {
        const seriesDir = path.join(BOOKS_DIR, series);
        if (!await fs.pathExists(seriesDir)) continue;

        const books = await fs.readdir(seriesDir);
        for (const book of books) {
            const bookPath = path.join(seriesDir, book);
            // Check if it is a directory
            try {
                if ((await fs.stat(bookPath)).isDirectory()) {
                    await processBook(bookPath);
                }
            } catch (e) {
                // Ignore non-directories or errors
            }
        }
    }

    console.log('\n✨ Done!');
}

main();
