const fs = require('fs');
const path = require('path');

// Configuration
const MIGRATION_FILES = [
    'cloudflare/migrations/0002_seed_activities.sql',
    'cloudflare/migrations/0004_expanded_activities.sql',
    'cloudflare/migrations/0008_more_family_sessions.sql'
];
const OUTPUT_CSV = 'activities_migration_plan.csv';

// Rules Configuration
const BLACKLIST_TERMS = ['yoga', 'meditation', 'chakra', 'namaste', 'third eye', 'magic', 'spell'];
const RESTRICT_MATERIALS = ['shaving cream', 'foam', 'beads', 'buttons', 'marbles']; // for < 36m
const REFRAME_TERMS = {
    'child-led': 'parent-led',
    'facilitator': 'guide',
    'facilitate': 'guide',
    'self-expression': 'creative imitation'
};

function parseSqlValues(content) {
    const activities = [];

    // Normalize content: remove comments (simple line comments)
    // content = content.replace(/--.*$/gm, ''); // Be careful not to remove urls or strings with --

    // Regex to find: INSERT INTO activities (...) VALUES ... ;
    // We assume VALUES is followed by (val1), (val2);
    const insertRegex = /INSERT INTO activities\s*\((.*?)\)\s*VALUES\s*([\s\S]*?);/gi;

    let match;
    while ((match = insertRegex.exec(content)) !== null) {
        const colsStr = match[1];
        const valuesBlock = match[2];
        const cols = colsStr.split(',').map(c => c.trim());

        // We need to split valuesBlock by ")," or "),\n" etc.
        // Simple state machine to parse: (val1, val2), (val3, val4)
        // We look for (...) blocks.

        let currentRow = '';
        let inParen = 0;
        let inQuote = false;

        for (let i = 0; i < valuesBlock.length; i++) {
            const char = valuesBlock[i];

            if (char === "'" && (i === 0 || valuesBlock[i - 1] !== '\\')) {
                inQuote = !inQuote;
                currentRow += char;
            } else if (char === '(' && !inQuote) {
                if (inParen === 0) currentRow = ''; // Start of new row group (but we only care about content inside)
                currentRow += char;
                inParen++;
            } else if (char === ')' && !inQuote) {
                currentRow += char;
                inParen--;
                if (inParen === 0) {
                    // End of row found: (...)
                    // Process this row. Remove outerParens first if desired, or simpler:
                    // just process the string inside parens.
                    const inner = currentRow.trim();
                    if (inner.startsWith('(') && inner.endsWith(')')) {
                        processRow(inner.slice(1, -1), cols, activities);
                    }
                    currentRow = '';
                }
            } else if (inParen > 0) {
                currentRow += char;
            }
            // Ignore chars outside of parens (like commas, newlines between rows)
        }
    }
    return activities;
}

function processRow(rowStr, cols, activities) {
    const vals = [];
    let current = '';
    let inQuote = false;
    let inBracket = 0;

    for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === "'" && (i === 0 || rowStr[i - 1] !== '\\')) {
            inQuote = !inQuote;
            current += char;
        } else if (char === '[' && !inQuote) {
            inBracket++;
            current += char;
        } else if (char === ']' && !inQuote) {
            inBracket--;
            current += char;
        } else if (char === ',' && !inQuote && inBracket === 0) {
            vals.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    vals.push(current.trim());

    // Map columns to values
    const activity = {};
    for (let i = 0; i < cols.length; i++) {
        if (i >= vals.length) break;
        let cleanVal = vals[i];

        // Handle basic SQL strings '...'
        if (cleanVal && cleanVal.startsWith("'")) {
            // Find end quote (ignoring escaped ones inside - simplistic for now)
            if (cleanVal.endsWith("'")) {
                cleanVal = cleanVal.slice(1, -1);
            }
            cleanVal = cleanVal.replace(/\\'/g, "'");
        }

        activity[cols[i]] = cleanVal;
    }
    activities.push(activity);
}

function checkRules(activity) {
    const modifications = {};
    const notes = [];
    let action = 'KEEP';

    const title = activity.title || '';
    const description = activity.description || '';
    const textContent = (title + ' ' + description).toLowerCase();

    // 1. Blacklist Check
    for (const term of BLACKLIST_TERMS) {
        if (textContent.includes(term)) {
            action = 'REMOVE';
            notes.push(`Blacklisted term found: '${term}'`);
            return { action, modifications, notes };
        }
    }

    // 2. Safety Restriction Check
    const minAge = parseInt(activity.min_age_months || '0', 10);
    let materials = [];
    try {
        if (activity.materials && activity.materials !== 'NULL') {
            materials = JSON.parse(activity.materials);
        }
    } catch (e) {
        // ignore parsing error
    }

    if (minAge < 36) {
        for (const mat of materials) {
            for (const badMat of RESTRICT_MATERIALS) {
                if (mat.toLowerCase().includes(badMat)) {
                    action = 'RESTRICT';
                    modifications.safety_note = `Warning: Contains ${badMat}. Strict adult supervision required. Choking hazard.`;
                    notes.push(`Restricted material for age < 36m: ${badMat}`);
                    break;
                }
            }
        }
    }

    // 3. Reframe Check
    const instructions = activity.instructions || '';
    const combinedText = (instructions + description).toLowerCase();

    for (const [term, replacement] of Object.entries(REFRAME_TERMS)) {
        if (combinedText.includes(term)) {
            if (action === 'KEEP') action = 'REFRAME';
            notes.push(`Language flag: '${term}' -> suggest '${replacement}'`);
        }
    }

    // 4. Auto-fill Metadata
    if (!modifications.success_cue) modifications.success_cue = "[TODO: Reviewer add specific success cue]";
    if (!modifications.parent_script) modifications.parent_script = "[TODO: Reviewer add script]";

    const domain = activity.domain || 'unknown';
    if (domain === 'cognitive') modifications.biblical_domain = 'wisdom';
    else if (domain === 'motor') modifications.biblical_domain = 'stature';
    else if (domain === 'social-emotional') modifications.biblical_domain = 'favor_with_man';
    else if (domain === 'language') modifications.biblical_domain = 'wisdom';
    else if (domain === 'pre-academic') modifications.biblical_domain = 'wisdom';

    return { action, modifications, notes };
}

function escapeCsv(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

async function main() {
    console.log("Loading activities from SQL migrations...");
    const allActivities = [];

    for (const fileItem of MIGRATION_FILES) {
        // Handle path resolution
        let fullPath = path.resolve(process.cwd(), fileItem);
        // If not found, try relative to script
        if (!fs.existsSync(fullPath)) {
            fullPath = path.resolve(__dirname, '..', fileItem);
        }

        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const activities = parseSqlValues(content);
            allActivities.push(...activities);
            console.log(`Loaded ${activities.length} activities from ${fileItem}`);
        } else {
            console.log(`Warning: Could not find ${fileItem}`);
        }
    }

    console.log("Applying rules...");
    const csvRows = [];
    const headers = ['id', 'title', 'current_domain', 'min_age', 'action', 'suggested_content_status', 'suggested_biblical_domain', 'suggested_safety_note', 'notes'];
    csvRows.push(headers.map(escapeCsv).join(','));

    for (const activity of allActivities) {
        const { action, modifications, notes } = checkRules(activity);

        csvRows.push([
            activity.id,
            activity.title,
            activity.domain,
            activity.min_age_months,
            action,
            action === 'REMOVE' ? 'blacklisted' : (action === 'RESTRICT' ? 'restricted' : 'reviewed'),
            modifications.biblical_domain || '',
            modifications.safety_note || '',
            notes.join('; ')
        ].map(escapeCsv).join(','));
    }

    console.log(`Writing results to ${OUTPUT_CSV}...`);
    fs.writeFileSync(OUTPUT_CSV, csvRows.join('\n'));
    console.log("Done.");
}

main().catch(console.error);
