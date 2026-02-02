
// Mock security helper
function isValidPathSegment(segment) {
    if (!segment) return false;
    try {
        const decoded = decodeURIComponent(segment);
        if (decoded.includes('..')) return false;
    } catch { }
    return !segment.includes('..');
}

// Mock Handler logic simulation
function testHandler(seriesId, withValidation) {
    // 1. Extract param
    // const seriesId = c.req.param('seriesId'); // Injected arg

    // 2. Validation (The fix)
    if (withValidation) {
        if (!isValidPathSegment(seriesId)) {
            return { status: 400, body: { error: 'Invalid path segment' } };
        }
    }

    // 3. Logic (Vulnerable part)
    const key = `books/${seriesId}/cover.png`;

    // Check if key escapes 'books/'
    // In a real exploit, seriesId could be '../secrets' -> 'books/../secrets/cover.png' -> 'secrets/cover.png'

    // For this test, we just return the generated key to see what we're accessing
    return { status: 200, accessKey: key };
}

console.log("--- Verifying Path Traversal Vulnerability & Fix ---");

const maliciousInput = "../secrets";

// Test WITHOUT validation
const resultVulnerable = testHandler(maliciousInput, false);
console.log(`[Vulnerable] Input: "${maliciousInput}" -> Access Key: "${resultVulnerable.accessKey}"`);
if (resultVulnerable.accessKey === "books/../secrets/cover.png") {
    console.log("🚨 VULNERABILITY CONFIRMED: Path traversal allowed.");
} else {
    console.log("❓ Unexpected behavior in vulnerable check.");
}

// Test WITH validation
const resultFixed = testHandler(maliciousInput, true);
console.log(`[Fixed] Input: "${maliciousInput}" -> Status: ${resultFixed.status}, Body: ${JSON.stringify(resultFixed.body)}`);

if (resultFixed.status === 400 && resultFixed.body.error === 'Invalid path segment') {
    console.log("✅ FIX VERIFIED: Path traversal blocked.");
} else {
    console.error("❌ FIX FAILED: Validation did not block the request.");
    process.exit(1);
}

console.log("--- Verification Complete ---");
