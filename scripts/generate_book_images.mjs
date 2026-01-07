import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { GoogleGenerativeAI } from '@google/generative-ai'; // Available if needed for text/multimodal

// CONFIGURATION
// ==========================================
// Replace these with your actual details
const WORKER_URL = 'https://stage-builder.antmwes104-1.workers.dev';
const ADMIN_SECRET = 'schoolos-admin';

// Model Configuration
// User requested "gemini-2.5-flash-image" (Nano Banana).
// NOTE: Google's image generation model via API is typically "imagen-3.0-generate-001".
// We will use the user's string if they provided one, but implement the REST call logic.
const MODEL_ID = 'gemini-2.5-flash-image';
// const MODEL_ID = 'imagen-3.0-generate-001'; // Fallback standard

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
        // Construct endpoint for Imagen on Vertex AI or AI Studio
        // Note: As of early 2025, Imagen 3 on AI Studio uses the beta endpoint.
        // Endpoint structure: https://generativelanguage.googleapis.com/v1beta/models/{model}:predict
        // If the user's model ID is "gemini-2.5-flash-image", we try that.
        // If it fails, we might need 'imagen-3.0-generate-001'.

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:predict?key=${API_KEY}`;

        // Payload for Imagen
        const body = {
            instances: [
                {
                    prompt: prompt
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: "2:3", // Portrait for books
                outputOptions: {
                    mimeType: "image/png"
                }
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

        // Response format for Imagen on AI Studio usually:
        // { predictions: [ { bytesBase64Encoded: "..." } ] }
        // or slightly different depending on version.

        if (!data.predictions || !data.predictions[0]) {
             throw new Error('No image data in response');
        }

        const base64Image = data.predictions[0].bytesBase64Encoded || data.predictions[0].b64;

        if (!base64Image) {
             throw new Error('Image data missing from prediction');
        }

        return Buffer.from(base64Image, 'base64');

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
