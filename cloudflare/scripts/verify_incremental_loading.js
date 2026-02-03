
// Simulation of the Incremental Caching Logic

// Mock Data
const MOCK_MANIFEST_V1 = {
  "series1/book1/metadata.json": "books/series1/book1/metadata.json",
  "series1/book1/cover": "books/series1/book1/cover.png",
  "series1/book2/metadata.json": "books/series1/book2/metadata.json",
  "series1/book2/cover": "books/series1/book2/cover.png",
};

const MOCK_MANIFEST_V2 = {
  "series1/book1/metadata.json": "books/series1/book1/metadata.json", // Same
  "series1/book1/cover": "books/series1/book1/cover.png",
  "series1/book2/metadata.json": "books/series1/book2/metadata_v2.json", // Changed physical key
  "series1/book2/cover": "books/series1/book2/cover.png",
  "series1/book3/metadata.json": "books/series1/book3/metadata.json", // New
};

const MOCK_DB = {
  "books/series1/book1/metadata.json": { id: "book1", title: "Book 1" },
  "books/series1/book2/metadata.json": { id: "book2", title: "Book 2" },
  "books/series1/book2/metadata_v2.json": { id: "book2", title: "Book 2 Updated" },
  "books/series1/book3/metadata.json": { id: "book3", title: "Book 3" },
};

// Mock R2 Bucket
class MockBucket {
  constructor() {
    this.reads = 0;
    this.currentManifest = MOCK_MANIFEST_V1;
  }

  async get(key) {
    if (key === 'manifest.json') {
      return {
        json: async () => this.currentManifest
      };
    }
    this.reads++;
    const data = MOCK_DB[key];
    if (!data) return null;
    return {
      json: async () => data
    };
  }

  async list() {
      return { objects: [], delimitedPrefixes: [] };
  }
}

// Global Cache State (simulating the worker global variables)
let MANIFEST_CACHE = null;
let MANIFEST_BOOKS_CACHE = null;

function areManifestsEqual(a, b) {
    if (a === b) return true;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

// The Optimized Logic
async function fetchBooksOptimized(bucket) {
    const books = [];

    // 1. Get Manifest
    let manifest;
    // (Simulating getManifest helper)
    const manifestObj = await bucket.get('manifest.json');
    manifest = await manifestObj.json();

    // 2. Incremental Loading Logic
    if (MANIFEST_BOOKS_CACHE && areManifestsEqual(MANIFEST_BOOKS_CACHE.manifest, manifest)) {
        console.log("Cache Hit: Full Manifest Match");
        return MANIFEST_BOOKS_CACHE.data;
    }

    console.log("Cache Miss: Re-evaluating Manifest...");

    const manifestEntries = Object.keys(manifest).filter(k => k.endsWith('/metadata.json'));

    // Create a lookup for old books if available
    const oldBookMap = new Map();
    if (MANIFEST_BOOKS_CACHE) {
        // We need to map 'entryKey' -> BookMetadata
        // But BookMetadata doesn't strictly have 'entryKey'.
        // We can infer it: ${series}/${id}/metadata.json
        for (const book of MANIFEST_BOOKS_CACHE.data) {
             const key = `${book.series}/${book.id}/metadata.json`;
             oldBookMap.set(key, book);
        }
    }

    const manifestBooks = await Promise.all(manifestEntries.map(async (entryKey) => {
        const parts = entryKey.split('/');
        if (parts.length < 3) return null;
        const series = parts[0];
        const bookId = parts[1];

        const physicalKey = manifest[entryKey];

        // Check Optimization
        if (MANIFEST_BOOKS_CACHE) {
            const oldPhysicalKey = MANIFEST_BOOKS_CACHE.manifest[entryKey];
            if (oldPhysicalKey === physicalKey) {
                const cachedBook = oldBookMap.get(entryKey);
                if (cachedBook) {
                    // console.log(`Incremental Hit: ${entryKey}`);
                    return cachedBook;
                }
            }
        }

        // Fetch
        const object = await bucket.get(physicalKey);
        if (object) {
            const data = await object.json();
            return {
                id: bookId,
                series: series,
                title: data.title
                // ... other fields
            };
        }
        return null;
    }));

    const validBooks = manifestBooks.filter(b => b !== null);

    // Update Cache
    MANIFEST_BOOKS_CACHE = {
        data: validBooks,
        manifest: manifest
    };

    return validBooks;
}

async function runTest() {
    const bucket = new MockBucket();

    console.log("--- Test 1: Initial Load ---");
    await fetchBooksOptimized(bucket);
    console.log(`Reads: ${bucket.reads}`);
    if (bucket.reads !== 2) throw new Error(`Expected 2 reads (Book1, Book2), got ${bucket.reads}`);

    console.log("\n--- Test 2: Unchanged Manifest ---");
    bucket.reads = 0;
    await fetchBooksOptimized(bucket);
    console.log(`Reads: ${bucket.reads}`);
    if (bucket.reads !== 0) throw new Error(`Expected 0 reads, got ${bucket.reads}`);

    console.log("\n--- Test 3: Modified Manifest (1 Change, 1 New) ---");
    bucket.currentManifest = MOCK_MANIFEST_V2;
    bucket.reads = 0;
    await fetchBooksOptimized(bucket);
    console.log(`Reads: ${bucket.reads}`);
    // Expected:
    // Book 1: Unchanged -> 0 reads
    // Book 2: Changed Physical Key -> 1 read
    // Book 3: New -> 1 read
    // Total: 2 reads
    if (bucket.reads !== 2) throw new Error(`Expected 2 reads (Book2, Book3), got ${bucket.reads}`);

    console.log("\n✅ VERIFICATION SUCCESS: Incremental loading working correctly.");
}

runTest().catch(e => {
    console.error("❌ VERIFICATION FAILED:", e);
    process.exit(1);
});
