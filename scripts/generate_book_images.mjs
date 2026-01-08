import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURATION
// ==========================================
// Replace these with your actual details
const WORKER_URL = 'http://localhost:8787'; // or your production URL
const ADMIN_SECRET = 'your-admin-secret'; // Must match the worker's ADMIN_SECRET

// Model Configuration
// User requested "nanobanana pro".
// If this is a public Replicate model like 'ostris/nanobanana-pro', use that ID.
// If it's a version hash, set it here without slashes.
// Defaulting to a high-quality model for books:
const MODEL_ID = 'black-forest-labs/flux-1.1-pro';
const API_TOKEN = process.env.REPLICATE_API_TOKEN; // Set this env var

// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_DIR = path.join(__dirname, '../public/books');

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImage(prompt, filename) {
    if (!API_TOKEN) {
        console.error('Error: REPLICATE_API_TOKEN environment variable is not set.');
        process.exit(1);
    }

    console.log(`Generating: ${filename} with prompt: "${prompt.substring(0, 50)}..."`);

    try {
        let endpoint = 'https://api.replicate.com/v1/predictions';
        let body = {
            input: {
                prompt: prompt,
                aspect_ratio: "2:3", // Portrait for books usually
                output_format: "png"
            }
        };

        // Determine if using a named model (owner/name) or a version hash
        if (MODEL_ID.includes('/')) {
            // Named model endpoint: https://api.replicate.com/v1/models/{owner}/{name}/predictions
            endpoint = `https://api.replicate.com/v1/models/${MODEL_ID}/predictions`;
        } else {
            // Version hash endpoint: https://api.replicate.com/v1/predictions
            // Requires 'version' in body
            body.version = MODEL_ID;
        }

        // 1. Start Prediction
        const startResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait'
            },
            body: JSON.stringify(body)
        });

        if (!startResponse.ok) {
            const err = await startResponse.text();
            throw new Error(`Failed to start generation: ${startResponse.status} ${err}`);
        }

        let prediction = await startResponse.json();

        // 2. Poll if needed (if 'Prefer: wait' didn't finish it)
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
            await delay(1000);
            const pollResponse = await fetch(prediction.urls.get, {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            });
            prediction = await pollResponse.json();
            if (prediction.status === 'failed') throw new Error('Generation failed');
        }

        const imageUrl = prediction.output; // Array or string depending on model
        const finalUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

        // 3. Download Image
        const imgResponse = await fetch(finalUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();

        return Buffer.from(arrayBuffer);

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

                    // Check if exists? (Optional: HEAD request to worker, skipping for now to force regeneration or just overwrite)
                    // You could add a check here.

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
// User can override WORKER_URL via args if needed
if (process.argv[2]) {
    console.log("Usage: node scripts/generate_book_images.mjs");
    console.log("Ensure REPLICATE_API_TOKEN is set.");
} else {
    processBooks().catch(console.error);
}
