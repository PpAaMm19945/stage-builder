/**
 * SchoolOS Chatbot Stress Test Harness
 * 
 * This script aggressively tests the chatbot API with REALISTIC parent messages.
 * Parents are assumed to NOT know what the app does or can do.
 * 
 * Usage: 
 *   node scripts/test-chatbot.cjs --prod --token=YOUR_JWT_TOKEN
 *   node scripts/test-chatbot.cjs --iterations=5 --token=YOUR_JWT_TOKEN
 * 
 * Get your token:
 *   1. Log into the app in your browser
 *   2. Open DevTools > Application > Local Storage
 *   3. Copy the value of 'schoolos_token'
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_API = 'http://localhost:8787';
const PROD_API = 'https://stage-builder.antmwes104-1.workers.dev';

// Parse command line args
const args = process.argv.slice(2);
const useProd = args.includes('--prod');
const iterationsArg = args.find(a => a.startsWith('--iterations='));
const iterations = iterationsArg ? parseInt(iterationsArg.split('=')[1]) : 1;
const tokenArg = args.find(a => a.startsWith('--token='));
const AUTH_TOKEN = tokenArg ? tokenArg.split('=')[1] : process.env.SCHOOLOS_TOKEN;

const API_URL = useProd ? PROD_API : LOCAL_API;

if (!AUTH_TOKEN) {
    console.log('\n⚠️  WARNING: No auth token provided.');
    console.log('   The API requires authentication. Get your token from browser LocalStorage.');
    console.log('   Usage: node scripts/test-chatbot.cjs --prod --token=YOUR_JWT_TOKEN\n');
    process.exit(1);
}

// ============================================================================
// REALISTIC PARENT TEST CASES
// Written from the perspective of parents who:
// - Don't know what the app can do
// - Are busy, frustrated, or confused
// - Just want help with their kids
// - May have typos or use casual language
// ============================================================================

const TEST_CASES = [
    // === GREETINGS & CASUAL ===
    { category: 'greeting', input: 'Hi' },
    { category: 'greeting', input: 'Hello there' },
    { category: 'greeting', input: 'Hey' },
    { category: 'greeting', input: '👋' },
    { category: 'greeting', input: 'Good morning!' },
    { category: 'greeting', input: 'Is anyone there?' },

    // === PARENTS WHO DON'T KNOW WHAT THE APP DOES ===
    { category: 'discovery', input: 'What is this?' },
    { category: 'discovery', input: 'What can you do?' },
    { category: 'discovery', input: 'How does this work?' },
    { category: 'discovery', input: 'I just signed up, now what?' },
    { category: 'discovery', input: 'Is this like an AI tutor?' },
    { category: 'discovery', input: 'Can you teach my kids?' },
    { category: 'discovery', input: 'What age is this for?' },

    // === VAGUE/FRUSTRATED PARENT REQUESTS ===
    { category: 'vague', input: 'Help' },
    { category: 'vague', input: 'I need help' },
    { category: 'vague', input: "I don't know what to do" },
    { category: 'vague', input: 'My kid is bored' },
    { category: 'vague', input: 'What should we do today?' },
    { category: 'vague', input: 'Everything is hard' },
    { category: 'vague', input: "This isn't working" },
    { category: 'vague', input: 'Ugh' },

    // === REALISTIC BOOK/READING REQUESTS ===
    { category: 'books', input: 'I want to read with my kids' },
    { category: 'books', input: 'Do you have books?' },
    { category: 'books', input: 'My daughter loves animals' },
    { category: 'books', input: 'What should I read to a 2 year old?' },
    { category: 'books', input: "He won't sit still for stories" },
    { category: 'books', input: 'Any bible stories?' },

    // === REALISTIC ACTIVITY REQUESTS ===
    { category: 'activities', input: 'What can I do with a toddler?' },
    { category: 'activities', input: "I need something that doesn't make a mess" },
    { category: 'activities', input: "It's raining and we're stuck inside" },
    { category: 'activities', input: 'My 4yo needs to burn energy' },
    { category: 'activities', input: 'Something educational but fun' },
    { category: 'activities', input: 'He just wants to play with blocks all day' },

    // === SCHEDULING CONFUSION ===
    { category: 'schedule', input: 'When does school start?' },
    { category: 'schedule', input: "We can't do mornings" },
    { category: 'schedule', input: 'This is too much for one day' },
    { category: 'schedule', input: 'We want to take Fridays off' },
    { category: 'schedule', input: 'How long should we homeschool each day?' },

    // === CHILD-SPECIFIC CONCERNS ===
    { category: 'child', input: 'My son has sensory issues' },
    { category: 'child', input: 'She gets overwhelmed easily' },
    { category: 'child', input: "He's behind other kids his age" },
    { category: 'child', input: 'My baby is only 3 months old' },
    { category: 'child', input: 'She just turned 6' },

    // === SPIRITUAL/LITURGY ===
    { category: 'spiritual', input: 'Do you have prayers?' },
    { category: 'spiritual', input: "We're Christian, is this Christian?" },
    { category: 'spiritual', input: 'What catechism do you use?' },
    { category: 'spiritual', input: 'We want to start each day with devotions' },

    // === OUT OF SCOPE / EDGE CASES ===
    { category: 'oos', input: 'Can you help with my taxes?' },
    { category: 'oos', input: "What's the weather today?" },
    { category: 'oos', input: 'Tell me a joke' },
    { category: 'oos', input: 'Do you have curriculum for high school?' },
    { category: 'oos', input: 'I need a nanny' },

    // === TYPOS & CASUAL LANGUAGE ===
    { category: 'typos', input: 'halp' },
    { category: 'typos', input: 'activitys for babay' },
    { category: 'typos', input: 'wat shud we do' },
    { category: 'typos', input: 'thx' },

    // === FOLLOW-UPS ===
    { category: 'followup', input: 'Thanks!' },
    { category: 'followup', input: "That's perfect" },
    { category: 'followup', input: 'Never mind' },
    { category: 'followup', input: 'Ok' },
    { category: 'followup', input: "I'll try that" },
];

// Results storage
const results = [];

// Mock context (simulating a logged-in user with 2 kids)
const mockContext = {
    children: [
        { name: 'Grace', age_in_months: 30 },
        { name: 'Samuel', age_in_months: 54 }
    ],
    user: { id: 'test-user-123', name: 'Sarah' },
    currentPage: '/early-years/planner'
};

async function testChatEndpoint(testCase, iteration) {
    const startTime = Date.now();

    try {
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

        const latency = Date.now() - startTime;

        if (!response.ok) {
            return {
                ...testCase,
                iteration,
                success: false,
                error: `HTTP ${response.status}`,
                latency,
                timestamp: new Date().toISOString()
            };
        }

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });

            // Parse SSE format
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const data = line.trim().slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.response) {
                            fullResponse += parsed.response;
                        }
                    } catch (e) {
                        // Not JSON, might be raw text
                        fullResponse += data;
                    }
                }
            }
        }

        // Analyze response for quality issues
        const hasActionBlock = fullResponse.includes('<ACTION_BLOCK>') || fullResponse.includes('<CLARIFY_BLOCK>');
        const hasRawJson = /\{"[^"]+":/.test(fullResponse) && !hasActionBlock;
        const isBlocked = (fullResponse.toLowerCase().includes("couldn't process") ||
            fullResponse.toLowerCase().includes('rephrase')) && !hasActionBlock;
        const isEmpty = fullResponse.trim().length === 0;
        const isTooShort = fullResponse.trim().length < 20;
        const isVeryLong = fullResponse.length > 1000;

        // Quality flags
        const issues = [];
        if (isEmpty) issues.push('EMPTY_RESPONSE');
        if (isTooShort && !isEmpty) issues.push('TOO_SHORT');
        if (isVeryLong) issues.push('TOO_LONG');
        if (hasRawJson) issues.push('RAW_JSON_LEAKED');
        if (isBlocked && testCase.category !== 'oos') issues.push('UNEXPECTED_BLOCK');

        return {
            ...testCase,
            iteration,
            success: true,
            issues,
            responsePreview: fullResponse.substring(0, 300),
            fullResponse,
            responseLength: fullResponse.length,
            hasActionBlock,
            isBlocked,
            latency,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        return {
            ...testCase,
            iteration,
            success: false,
            error: error.message,
            latency: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };
    }
}

async function runTests() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SchoolOS Chatbot Stress Test - REALISTIC PARENT MESSAGES`);
    console.log(`${'='.repeat(60)}`);
    console.log(`API: ${API_URL}`);
    console.log(`Test Cases: ${TEST_CASES.length}`);
    console.log(`Iterations per case: ${iterations}`);
    console.log(`Total requests: ${TEST_CASES.length * iterations}`);
    console.log(`${'='.repeat(60)}\n`);

    for (let i = 1; i <= iterations; i++) {
        console.log(`\n--- Iteration ${i}/${iterations} ---\n`);

        for (const testCase of TEST_CASES) {
            process.stdout.write(`[${testCase.category.padEnd(10)}] "${testCase.input.substring(0, 35).padEnd(35)}" `);

            const result = await testChatEndpoint(testCase, i);
            results.push(result);

            if (!result.success) {
                console.log(`❌ ERROR: ${result.error}`);
            } else if (result.issues.length > 0) {
                console.log(`⚠️  ISSUES: ${result.issues.join(', ')}`);
            } else {
                console.log(`✅ OK (${result.latency}ms, ${result.responseLength} chars)`);
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 800));
        }
    }

    // Generate report
    generateReport();
}

function generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../chatbot-test-report-${timestamp}.json`);
    const summaryPath = path.join(__dirname, `../chatbot-test-summary-${timestamp}.md`);

    // Save raw results
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Calculate stats
    const totalTests = results.length;
    const successfulRequests = results.filter(r => r.success).length;
    const cleanResponses = results.filter(r => r.success && r.issues.length === 0).length;
    const issueResponses = results.filter(r => r.success && r.issues.length > 0);
    const erroredTests = results.filter(r => !r.success);

    const byCategory = {};
    for (const r of results) {
        if (!byCategory[r.category]) {
            byCategory[r.category] = { total: 0, clean: 0, issues: 0, errors: 0, responses: [] };
        }
        byCategory[r.category].total++;
        if (!r.success) byCategory[r.category].errors++;
        else if (r.issues.length === 0) byCategory[r.category].clean++;
        else byCategory[r.category].issues++;
        if (r.success) byCategory[r.category].responses.push(r);
    }

    // Generate markdown summary
    let summary = `# Chatbot Test Summary - Realistic Parent Messages\n\n`;
    summary += `**Date:** ${new Date().toISOString()}\n`;
    summary += `**API:** ${API_URL}\n`;
    summary += `**Total Tests:** ${totalTests}\n\n`;

    summary += `## Overall Results\n\n`;
    summary += `| Metric | Count | % |\n`;
    summary += `|--------|-------|---|\n`;
    summary += `| Clean (No Issues) | ${cleanResponses} | ${((cleanResponses / totalTests) * 100).toFixed(1)}% |\n`;
    summary += `| Has Issues | ${issueResponses.length} | ${((issueResponses.length / totalTests) * 100).toFixed(1)}% |\n`;
    summary += `| Errors | ${erroredTests.length} | ${((erroredTests.length / totalTests) * 100).toFixed(1)}% |\n\n`;

    summary += `## By Category\n\n`;
    summary += `| Category | Clean | Issues | Errors | Success Rate |\n`;
    summary += `|----------|-------|--------|--------|-------------|\n`;
    for (const [cat, stats] of Object.entries(byCategory)) {
        const rate = ((stats.clean / stats.total) * 100).toFixed(1);
        summary += `| ${cat} | ${stats.clean} | ${stats.issues} | ${stats.errors} | ${rate}% |\n`;
    }

    summary += `\n## Sample Responses by Category\n\n`;
    for (const [cat, stats] of Object.entries(byCategory)) {
        summary += `### ${cat}\n\n`;
        const samples = stats.responses.slice(0, 3);
        for (const s of samples) {
            summary += `**Input:** "${s.input}"\n`;
            summary += `**Response:** ${s.responsePreview?.substring(0, 200)}...\n`;
            if (s.issues.length > 0) summary += `**Issues:** ${s.issues.join(', ')}\n`;
            summary += `\n`;
        }
    }

    summary += `\n## Responses with Issues\n\n`;
    for (const f of issueResponses) {
        summary += `### [${f.category}] "${f.input}"\n`;
        summary += `- **Issues:** ${f.issues.join(', ')}\n`;
        summary += `- **Response:** \`${f.responsePreview?.substring(0, 150)}...\`\n\n`;
    }

    summary += `\n## Errors\n\n`;
    for (const e of erroredTests) {
        summary += `- [${e.category}] "${e.input}" - ${e.error}\n`;
    }

    fs.writeFileSync(summaryPath, summary);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST COMPLETE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total: ${totalTests} | Clean: ${cleanResponses} | Issues: ${issueResponses.length} | Errors: ${erroredTests.length}`);
    console.log(`Clean Rate: ${((cleanResponses / totalTests) * 100).toFixed(1)}%`);
    console.log(`\nReports saved to:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${summaryPath}`);
}

// Run
runTests().catch(console.error);
