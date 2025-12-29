const fs = require('fs-extra');
const path = require('path');

// Configuration
const BOOKS_DIR = path.join(__dirname, '..', 'public', 'books', 'The Gospel Series');

async function processBook(bookDirName) {
    const bookPath = path.join(BOOKS_DIR, bookDirName);
    const metadataPath = path.join(bookPath, 'metadata.json');
    const imagesDir = path.join(bookPath, 'images');

    if (!await fs.pathExists(metadataPath)) {
        console.log(`Skipping ${bookDirName}: No metadata.json found`);
        return;
    }

    const currentMetadata = await fs.readJson(metadataPath);
    let imageCount = 0;
    if (await fs.pathExists(imagesDir)) {
        const imageFiles = await fs.readdir(imagesDir);
        imageCount = imageFiles.filter(f => f.startsWith('page-') && f.endsWith('.png')).length;
    }

    // Base schema matching African Men of Faith
    const newMetadata = {
        bookId: bookDirName.replace(/\s+/g, '-'),
        id: bookDirName.replace(/\s+/g, '-'),
        title: currentMetadata.title || bookDirName,
        subtitle: currentMetadata.subtitle || "The Gospel Series",
        author: "Unknown",
        illustrator: "Unknown",
        description: `The story of ${bookDirName} from the Gospel Series.`,
        genre: "Children's Picture Book - Biblical",
        keywords: "bible, gospel, children, story",
        ageRange: "3-6",
        publisher: "Petra Reformed Publishing",
        publisherLocation: "Kampala, Uganda",
        copyrightYear: 2025,
        edition: "First Edition",
        isbn: "ISBN-PENDING",
        price: "0",
        website: "www.example.com",
        printLocation: "Uganda",
        dedication: "To all children learning the good news.",
        authorBio: "A collection of faithful retellings of Bible stories.",
        backCoverText: `Read the amazing story of ${bookDirName}.`,
        cover_image_url: "cover.png",
        pageFormat: {
            size: "Square",
            orientation: "landscape",
            width: "200mm",
            height: "200mm",
            flip: "short-edge",
            margins: {
                top: "10mm",
                right: "10mm",
                bottom: "10mm",
                left: "10mm"
            }
        },
        styleProfile: "print-square-picturebook.css",
        bookType: "picturebook",
        learningStage: "early-years",
        domain: "spiritual",
        minAgeMonths: 36,
        maxAgeMonths: 72,
        pages: []
    };

    // Build Pages Array
    // 1. Cover
    newMetadata.pages.push({
        type: "cover",
        image: "cover.png"
    });

    // 2. Title Page
    newMetadata.pages.push({
        type: "title",
        subtitle: "The Gospel Series"
    });

    // 3. Copyright
    newMetadata.pages.push({
        type: "copyright"
    });

    // 4. Dedication
    newMetadata.pages.push({
        type: "dedication",
        text: newMetadata.dedication
    });

    // 5. Content Pages
    for (let i = 1; i <= imageCount; i++) {
        const pageNumStr = String(i).padStart(2, '0');
        newMetadata.pages.push({
            pageNumber: i,
            type: "content",
            image: `images/page-${pageNumStr}.png`,
            imageAlt: `Illustration for page ${i} of ${bookDirName}`,
            text: [
                ""
            ]
        });
    }

    // 6. Back Cover
    newMetadata.pages.push({
        type: "back-cover",
        text: [newMetadata.backCoverText]
    });

    newMetadata.pageCount = newMetadata.pages.length;

    await fs.writeJson(metadataPath, newMetadata, { spaces: 2 });
    console.log(`✅ Enhanced metadata for: ${bookDirName}`);
}

async function main() {
    console.log('🚀 Enhancing Gospel Series Metadata Schema...\n');
    if (!await fs.pathExists(BOOKS_DIR)) {
        console.error('Directory not found:', BOOKS_DIR);
        return;
    }

    const books = await fs.readdir(BOOKS_DIR);
    for (const book of books) {
        if ((await fs.stat(path.join(BOOKS_DIR, book))).isDirectory()) {
            await processBook(book);
        }
    }
    console.log('\n✨ Done!');
}

main();
