/**
 * SchoolOS Retrieval Test Harness
 * 
 * Verifies that the AI's search tools (books, activities) return relevant results.
 * This is "Phase 2" testing: ensuring we have good data to give the AI.
 * 
 * Usage: 
 *   node scripts/test-retrieval.cjs --prod --token=YOUR_JWT_TOKEN
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_API = 'http://localhost:8787';
const PROD_API = 'https://stage-builder.antmwes104-1.workers.dev';

// Parse command line args
const args = process.argv.slice(2);
const useProd = args.includes('--prod');
const tokenArg = args.find(a => a.startsWith('--token='));
const AUTH_TOKEN = tokenArg ? tokenArg.split('=')[1] : process.env.SCHOOLOS_TOKEN;

const API_URL = useProd ? PROD_API : LOCAL_API;

if (!AUTH_TOKEN) {
    console.log('\n⚠️  WARNING: No auth token provided.');
    console.log('   The API requires authentication for search tools.');
    process.exit(1);
}

// Mock context for tool execution
const mockContext = {
    children: [
        { name: 'Grace', age_in_months: 30 },
        { name: 'Samuel', age_in_months: 60 },
        { name: 'David', age_in_months: 84 } // 7 years old (matches Cyprian book)
    ],
    user: { id: 'test-user-123', name: 'Test Parent' }
};

// ============================================================================
// RETRIEVAL TEST CASES
// We send natural language to the AI, and verify that:
// 1. It correctly categorizes intent (ROUTER)
// 2. It executes the correct tool (SEARCH)
// 3. The tool returns RELEVANT results (GROUNDING)
// ============================================================================

const TEST_CASES = [
    // BOOKS - SPECIFIC TITLES/CHARACTERS
    {
        input: 'Do you have a book about Athanasius?',
        expectedIntent: 'SEARCH_BOOKS',
        expectedKeywords: ['athanasius'],
        expectedResultItem: 'Athanasius and the Truth'
    },
    {
        input: 'Find the story about the Prodigal Son',
        expectedIntent: 'SEARCH_BOOKS',
        expectedKeywords: ['prodigal', 'son'],
        expectedResultItem: 'The Prodigal Son'
    },

    // BOOKS - THEMATIC
    {
        input: 'I need a book about bravery',
        expectedIntent: 'SEARCH_BOOKS',
        expectedKeywords: ['bravery', 'brave', 'courage'],
        expectedResultItem: 'Cyprian the Brave' // or Perpetua
    },
    {
        input: 'Books about animals',
        expectedIntent: 'SEARCH_BOOKS',
        expectedKeywords: ['animals'],
        expectedResultItem: 'Animal Friends'
    },
    {
        input: 'Something about feelings or emotions',
        expectedIntent: 'SEARCH_BOOKS',
        expectedKeywords: ['feelings', 'emotions'],
        expectedResultItem: 'My Feelings Today'
    },

    // ACTIVITIES (If seeded, otherwise we just test intent)
    {
        input: 'Find me a sensory activity',
        expectedIntent: 'SEARCH_ACTIVITIES',
        expectedKeywords: ['sensory']
    },
    {
        input: 'Math games for a 5 year old',
        expectedIntent: 'SEARCH_ACTIVITIES',
        expectedKeywords: ['math', 'games']
    }
];

async function testRetrieval(testCase, index) {
    const startTime = Date.now();
    console.log(`\n[${index + 1}/${TEST_CASES.length}] Input: "${testCase.input}"`);

    try {
        // We use the same chat endpoint, but we look at the STREAMED logs/tool calls
        // Since we can't easily see internal tool calls in the final response (unless we log them),
        // we will infer success based on the FINAL ANSWER containing the expected book title.
        // * Ideally, we would hit a debug endpoint, but relying on the chat response is a good "end-to-end" test.

        const response = await fetch(`${API_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({
                message: testCase.input,
                context: mockContext
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });

            // Reconstruct SSE data
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const data = line.trim().slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.response) fullResponse += parsed.response;
                    } catch (e) { fullResponse += data; }
                }
            }
        }

        const latency = Date.now() - startTime;

        // Verification
        let passed = true;
        let reasons = [];

        // 1. Check if expected ITEM is in the response (Grounding check)
        if (testCase.expectedResultItem) {
            if (!fullResponse.toLowerCase().includes(testCase.expectedResultItem.toLowerCase())) {
                passed = false;
                reasons.push(`Missing expected item: "${testCase.expectedResultItem}"`);
            }
        }

        // 2. Check for action blocks (We expect NO clarify blocks for these clear queries)
        if (fullResponse.includes('<CLARIFY_BLOCK>')) {
            passed = false;
            reasons.push('Unexpected CLARIFY_BLOCK (Should have searched directly)');
        }

        if (passed) {
            console.log(`   ✅ PASS (${latency}ms)`);
            return { success: true };
        } else {
            console.log(`   ❌ FAIL: ${reasons.join(', ')}`);
            console.log(`   Response: ${fullResponse.substring(0, 150)}...`);
            return { success: false };
        }

    } catch (e) {
        console.log(`   ❌ ERROR: ${e.message}`);
        return { success: false };
    }
}

async function runTests() {
    console.log(`Starting Retrieval Verification...`);
    console.log(`Target: ${API_URL}`);

    let passed = 0;
    for (let i = 0; i < TEST_CASES.length; i++) {
        const result = await testRetrieval(TEST_CASES[i], i);
        if (result.success) passed++;
        await new Promise(r => setTimeout(r, 2500));
    }

    console.log(`\nResults: ${passed}/${TEST_CASES.length} Passed`);
}

runTests().catch(console.error);
