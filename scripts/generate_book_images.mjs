import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURATION
// ==========================================
// Replace these with your actual details
const WORKER_URL = 'https://stage-builder-9hh.pages.dev';
const ADMIN_SECRET = 'schoolos-admin';

// Model Configuration
// User requested "gemini-2.5-flash-image" (Nano Banana).
// NOTE: We use the :generateContent endpoint for this Gemini model.
const MODEL_ID = 'gemini-2.5-flash-image';

const API_KEY = process.env.GEMINI_API_KEY;

// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_DIR = path.join(__dirname, '../public/books');

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImage(prompt, filename) {
    if (!API_KEY) {
        console.error('Error: GEMINI_API_KEY environment variable is not set.');
        process.exit(1);
    }

    console.log(`Generating: ${filename} with prompt: "${prompt.substring(0, 50)}..."`);

    try {
        // Use Gemini generateContent endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

        // Payload for Gemini image generation
        // Note: For image generation via Gemini 2.5 Flash Image, we send text and expect image data in response.
        // It's a "text-to-image" via the unified generateContent API.
        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                // If the model supports specific generation parameters like seed or aspect ratio in this payload,
                // they would go here. For "Nano Banana" / Gemini 2.5 Flash Image, we stick to defaults or
                // standard multimodal prompts.
                // Note: Standard Gemini image generation often infers ratio from prompt or specific params if supported.
                // For now we send just the prompt.
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to generate image: ${response.status} ${err}`);
        }

        const data = await response.json();

        // Parse Gemini response for inline image data
        // Structure: candidates[0].content.parts[0].inlineData.data

        const candidate = data.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        const inlineData = part?.inlineData;

        if (!inlineData || !inlineData.data) {
             throw new Error('No image data in Gemini response');
        }

        return Buffer.from(inlineData.data, 'base64');

    } catch (error) {
        console.error(`Error generating ${filename}:`, error);
        return null;
    }
}

async function uploadToWorker(buffer, relativePath) {
    const url = `${WORKER_URL}/api/books/upload?key=${ADMIN_SECRET}&path=${encodeURIComponent(relativePath)}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            body: buffer,
            headers: {
                'Content-Type': 'image/png'
            }
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Upload failed: ${response.status} ${err}`);
        }
        console.log(`Uploaded: ${relativePath}`);
        return true;
    } catch (error) {
        console.error(`Error uploading ${relativePath}:`, error);
        return false;
    }
}

async function processBooks() {
    // 1. Find all prompts.json
    const seriesList = fs.readdirSync(BOOKS_DIR);

    for (const series of seriesList) {
        const seriesPath = path.join(BOOKS_DIR, series);
        if (!fs.statSync(seriesPath).isDirectory()) continue;

        const booksList = fs.readdirSync(seriesPath);
        for (const book of booksList) {
            const bookPath = path.join(seriesPath, book);
            if (!fs.statSync(bookPath).isDirectory()) continue;

            const imagesDir = path.join(bookPath, 'images');
            const promptsFile = path.join(imagesDir, 'prompts.json');

            if (fs.existsSync(promptsFile)) {
                console.log(`Processing book: ${series}/${book}`);
                const promptsData = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
                const pages = promptsData.pages;

                // Base style prompt
                const baseStyle = promptsData.style?.base || '';

                for (const [pageKey, pageData] of Object.entries(pages)) {
                    const filename = pageData.filename;
                    const prompt = `${baseStyle} ${pageData.prompt}`.trim();
                    const relativePath = `books/${series}/${book}/images/${filename}`;

                    const imageBuffer = await generateImage(prompt, filename);
                    if (imageBuffer) {
                        await uploadToWorker(imageBuffer, relativePath);
                    }
                }
            }
        }
    }
}

// Check arguments
if (process.argv[2]) {
    console.log("Usage: node scripts/generate_book_images.mjs");
    console.log("Ensure GEMINI_API_KEY is set.");
} else {
    processBooks().catch(console.error);
}
