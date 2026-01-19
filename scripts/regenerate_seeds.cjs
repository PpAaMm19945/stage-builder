
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE_V2_0002 = path.join(__dirname, '../cloudflare/migrations/v2_0002_seed_formations.sql');
const OUTPUT_FILE_V2_0004 = path.join(__dirname, '../cloudflare/migrations/v2_0004_seed_progressions.sql');
const OUTPUT_FILE_V2_0005 = path.join(__dirname, '../cloudflare/migrations/v2_0005_seed_prove_it.sql');
const LEGACY_DIR = path.join(__dirname, '../cloudflare/migrations/legacy');

// --- CONSTANTS ---

const FORMATIONS_TARGET_COLS = [
    'id', 'title', 'formation_type', 'primary_virtue', 'biblical_faculty', 'description',
    'guide_steps', 'parent_posture', 'liturgical_script', 'materials', 'duration_minutes',
    'context_anchor', 'cluster_tag', 'min_age_months', 'max_age_months',
    'source', 'content_source'
];

const PROGRESSIONS_TARGET_COLS = [
    'id', 'formation_id', 'stage', 'simplified_content', 'memory_portion', 'parent_teaching_note'
];

// Q1-Q10 Hardcoded (recovered)
const Q1_10_VALUES = [
    `('wsc_q1', 'Q1: Chief End of Man', 'liturgy', 'Wisdom', 'Purpose', 'Q: What is the chief end of man?\n A: Man''s chief end is to glorify God, and to enjoy him forever.', '["Recite together", "Discuss: Why were we made?", "Pray"]', 'We exist for God''s glory.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q2', 'Q2: Rule of Direction', 'liturgy', 'Wisdom', 'Memory', 'Q: What rule hath God given to direct us how we may glorify and enjoy him?\n A: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.', '["Recite together", "Discuss: The Bible is our rule.", "Pray"]', 'Scripture guides us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q3', 'Q3: Principal Teaching', 'liturgy', 'Wisdom', 'Memory', 'Q: What do the scriptures principally teach?\n A: The scriptures principally teach what man is to believe concerning God, and what duty God requires of man.', '["Recite together", "Discuss: Faith and Duty.", "Pray"]', 'Believe and Obey.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q4', 'Q4: What is God?', 'liturgy', 'Wisdom', 'Memory', 'Q: What is God?\n A: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', '["Recite together", "Discuss: God is a Spirit.", "Pray"]', 'God is not like us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q5', 'Q5: One God', 'liturgy', 'Wisdom', 'Memory', 'Q: Are there more Gods than one?\n A: There is but one only, the living and true God.', '["Recite together", "Discuss: One God.", "Pray"]', 'No other gods.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q6', 'Q6: The Trinity', 'liturgy', 'Wisdom', 'Memory', 'Q: How many persons are there in the Godhead?\n A: There are three persons in the Godhead; the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.', '["Recite together", "Discuss: Three in One.", "Pray"]', 'Mystery of the Trinity.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q7', 'Q7: God''s Decrees', 'liturgy', 'Wisdom', 'Memory', 'Q: What are the decrees of God?\n A: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.', '["Recite together", "Discuss: God''s Plan.", "Pray"]', 'God plans everything.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q8', 'Q8: Execution of Decrees', 'liturgy', 'Wisdom', 'Memory', 'Q: How doth God execute his decrees?\n A: God executeth his decrees in the works of creation and providence.', '["Recite together", "Discuss: Making and Keeping.", "Pray"]', 'Creation and Providence.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q9', 'Q9: Work of Creation', 'liturgy', 'Wisdom', 'Memory', 'Q: What is the work of creation?\n A: The work of creation is, God''s making all things of nothing, by the word of his power, in the space of six days, and all very good.', '["Recite together", "Discuss: Made from nothing.", "Pray"]', 'God speaks, it happens.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`,
    `('wsc_q10', 'Q10: Creation of Man', 'liturgy', 'Wisdom', 'Memory', 'Q: How did God create man?\n A: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.', '["Recite together", "Discuss: Image of God.", "Pray"]', 'We are like mirrors of God.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core')`
];

// --- PARSER ---

function parseValuesRawMap(content) {
    const rows = [];
    const valueStartIndex = content.search(/VALUES\s*/i);
    if (valueStartIndex === -1) return []; // No insert?

    // Start scanning from where values likely begin
    let i = valueStartIndex;
    // Fast forward to first '('
    while (i < content.length && content[i] !== '(') i++;

    let buffer = '';
    let inQuote = false;
    let depth = 0;

    let currentRowBuffer = "";

    for (; i < content.length; i++) {
        const char = content[i];

        // Handle Quotes
        if (char === "'") {
            if (inQuote && i + 1 < content.length && content[i + 1] === "'") {
                // Escaped quote: preserve it doubly escaped or process?
                // We want to capture the RAW content of the row.
                currentRowBuffer += "''";
                i++; // skip next '
                continue;
            }
            inQuote = !inQuote;
            currentRowBuffer += "'";
            continue;
        }

        if (inQuote) {
            currentRowBuffer += char;
            continue;
        }

        // Handle Parens (Tuple boundaries)
        if (char === '(') {
            if (depth === 0) currentRowBuffer = ""; // Start of new row
            else currentRowBuffer += char;
            depth++;
        } else if (char === ')') {
            depth--;
            if (depth === 0) {
                // End of row
                rows.push(parseSingleRow(currentRowBuffer));
                currentRowBuffer = "";
            } else {
                currentRowBuffer += char;
            }
        } else if (char === ';') {
            // End of statement.
            // If we rely on depth, we ignore this unless completely messed up formatting.
        } else if (char === ',' && depth > 0) {
            currentRowBuffer += char;
        }
    }

    return rows;
}

// Parses "val1, 'string val', 123, NULL" into an array
function parseSingleRow(rowString) {
    const values = [];
    let buffer = '';
    let inQuote = false;

    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];

        if (char === "'") {
            if (inQuote && i + 1 < rowString.length && rowString[i + 1] === "'") {
                buffer += "''";
                i++;
                continue;
            }
            inQuote = !inQuote;
            buffer += "'";
            continue;
        }

        if (char === ',' && !inQuote) {
            values.push(buffer.trim());
            buffer = '';
        } else {
            buffer += char;
        }
    }
    values.push(buffer.trim());
    return values;
}


function processFile(filename, sourceCols, targetCols, defaults) {
    const filePath = path.join(LEGACY_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`Skipping missing file: ${filename}`);
        return [];
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // --- PRE-PROCESSING FIXES FOR BROKEN LEGACY FILES ---

    // Strip SQL comments (-- ...) to avoid parsing errors
    content = content.replace(/--.*$/gm, '');
    if (filename === '0061_seed_prove_it_catechism.sql') {
        // Fix unescaped "Children's" and other possessives in this corrupted file
        content = content.replace(/Children's/g, "Children''s");
        content = content.replace(/God's/g, "God''s");
        content = content.replace(/Man's/g, "Man''s");
        content = content.replace(/Christ's/g, "Christ''s");
        content = content.replace(/Father's/g, "Father''s");
        content = content.replace(/He's/g, "He''s");
    }

    const valuesArrays = parseValuesRawMap(content);

    const processed = [];

    for (const values of valuesArrays) {
        if (values.length === 0) continue;

        const rowMap = {};
        sourceCols.forEach((col, idx) => {
            rowMap[col] = values[idx];
        });

        // Build target
        const targetValues = targetCols.map(col => {
            let val = rowMap[col];
            const def = defaults[col];

            // Special logic for column mapping renames
            if (col === 'formation_id' && rowMap['base_item_id']) val = rowMap['base_item_id'];

            if (val === undefined || val === 'NULL' || val === '') {
                if (def !== undefined) return def;
                return 'NULL';
            }
            return val;
        });

        // VALIDATION: Check Key Columns
        if (targetCols.includes('title')) {
            const titleIdx = targetCols.indexOf('title');
            const titleVal = targetValues[titleIdx];
            if (!titleVal || titleVal === 'NULL' || titleVal === "''") {
                console.error(`ERROR: Found NULL title in ${filename}. Row:`, values);
                continue; // Skip invalid row
            }
        }

        if (targetCols.includes('formation_id')) {
            const fIdx = targetCols.indexOf('formation_id');
            const fVal = targetValues[fIdx];
            if (!fVal || fVal === 'NULL' || fVal === "''") {
                console.error(`ERROR: Found NULL formation_id in ${filename}. Row:`, values);
                continue; // Skip invalid row
            }
        }

        // VALIDATION: Check Primary Virtue (Strict Enum)
        if (targetCols.includes('primary_virtue')) {
            const virtueIdx = targetCols.indexOf('primary_virtue');
            let virtueVal = targetValues[virtueIdx];

            // Remove quotes for checking
            let cleanVirtue = (virtueVal || '').replace(/'/g, '').trim();

            const VALID_VIRTUES = ['Wisdom', 'Stewardship', 'Love', 'Order', 'Wonder'];
            const VIRTUE_MAP = {
                'wisdom': 'Wisdom',
                'stewardship': 'Stewardship',
                'love': 'Love',
                'order': 'Order',
                'wonder': 'Wonder',
                'faith': 'Love',
                'hope': 'Wonder',
                'prudence': 'Wisdom',
                'justice': 'Order',
                'fortitude': 'Stewardship',
                'temperance': 'Order',
                'charity': 'Love',
                'reason': 'Wisdom',
                'memory': 'Wisdom'
            };

            if (!VALID_VIRTUES.includes(cleanVirtue)) {
                // Try to map
                const mapped = VIRTUE_MAP[cleanVirtue.toLowerCase()];
                if (mapped) {
                    targetValues[virtueIdx] = `'${mapped}'`;
                } else {
                    console.warn(`WARNING: Invalid virtue '${cleanVirtue}' in ${filename}. Defaulting to 'Wisdom'.`);
                    targetValues[virtueIdx] = `'Wisdom'`;
                }
            }
        }

        processed.push(`(${targetValues.join(', ')})`);
    }

    return processed;
}

function generateSqlFile(outputFile, tableName, columns, rows) {
    let output = `-- Migration (Regenerated): Seed ${tableName}\n\n`;

    const insertStmt = `INSERT OR REPLACE INTO ${tableName} (\n  ${columns.join(', ')}\n) VALUES`;
    const BATCH_SIZE = 50;

    if (rows.length === 0) {
        fs.writeFileSync(outputFile, output + "-- No rows to insert.\n");
        return;
    }

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        output += `${insertStmt}\n` + batch.join(',\n') + ';\n\n';
    }

    fs.writeFileSync(outputFile, output);
    console.log(`Generated ${outputFile} with ${rows.length} rows.`);
}


function main() {
    console.log("Starting regeneration...");

    // --- 1. FORMATIONS (v2_0002) ---
    let formRows = [...Q1_10_VALUES];

    // WSC
    const wscCols = ['id', 'title', 'formation_type', 'primary_virtue', 'biblical_faculty', 'description',
        'guide_steps', 'parent_posture', 'context_anchor', 'min_age_months', 'max_age_months'];
    const wscDefaults = {
        liturgical_script: 'NULL', materials: 'NULL', duration_minutes: 15,
        cluster_tag: "'catechism'", source: "'westminster_shorter'", content_source: "'schoolos_core'"
    };
    formRows.push(...processFile('0040_seed_wsc_expanded.sql', wscCols, FORMATIONS_TARGET_COLS, wscDefaults));
    formRows.push(...processFile('0042_seed_wsc_q39_q70.sql', wscCols, FORMATIONS_TARGET_COLS, wscDefaults));
    formRows.push(...processFile('0043_seed_wsc_q71_q107.sql', wscCols, FORMATIONS_TARGET_COLS, wscDefaults));

    // Hymns
    const hymnCols = ['id', 'title', 'formation_type', 'primary_virtue', 'biblical_faculty', 'description',
        'liturgical_script', 'context_anchor', 'min_age_months', 'max_age_months'];
    const hymnDefaults = {
        guide_steps: "'[\"Sing together\", \"Discuss lyrics\", \"Pray\"]'",
        parent_posture: "'Lead with joy.'", materials: 'NULL', duration_minutes: 10,
        cluster_tag: "'hymn'", source: "'hymnary'", content_source: "'schoolos_core'"
    };
    formRows.push(...processFile('0048_seed_hymns_from_markdown.sql', hymnCols, FORMATIONS_TARGET_COLS, hymnDefaults));

    // History Stories
    const histCols = hymnCols; // Same structure
    const histDefaults = {
        guide_steps: "'[\"Read story\", \"Look at pictures\", \"Pray\"]'",
        parent_posture: "'Storytelling mode.'", materials: 'NULL', duration_minutes: 15,
        cluster_tag: "'history'", source: "'schoolos_history'", content_source: "'schoolos_core'"
    };
    formRows.push(...processFile('0049_seed_history_formations.sql', histCols, FORMATIONS_TARGET_COLS, histDefaults));

    // History Skills (0054)
    const histSkillCols = ['id', 'title', 'formation_type', 'primary_virtue', 'biblical_faculty', 'description',
        'guide_steps', 'materials', 'duration_minutes', 'cluster_tag',
        'min_age_months', 'max_age_months', 'context_anchor', 'parent_posture'];
    const histSkillDefaults = {
        source: "'schoolos_history_projects'", content_source: "'schoolos_core'", liturgical_script: 'NULL'
    };
    formRows.push(...processFile('0054_seed_sapling_history.sql', histSkillCols, FORMATIONS_TARGET_COLS, histSkillDefaults));

    // Memory Verses
    const verseCols = ['id', 'title', 'formation_type', 'primary_virtue', 'description',
        'liturgical_script', 'context_anchor', 'min_age_months', 'max_age_months'];
    const verseDefaults = {
        biblical_faculty: "'Memory'",
        guide_steps: "'[\"Recite verse\", \"Discuss meaning\", \"Pray\"]'",
        parent_posture: "'Encourage repetition.'", materials: 'NULL', duration_minutes: 5,
        cluster_tag: "'scripture'", source: "'bible'", content_source: "'schoolos_core'"
    };
    formRows.push(...processFile('0050_seed_memory_verses_52weeks.sql', verseCols, FORMATIONS_TARGET_COLS, verseDefaults));

    generateSqlFile(OUTPUT_FILE_V2_0002, 'formations', FORMATIONS_TARGET_COLS, formRows);

    // --- 2. PROVE IT (v2_0005) ---
    const proveCols = ['id', 'title', 'description', 'formation_type', 'primary_virtue',
        'context_anchor', 'cluster_tag', 'min_age_months', 'max_age_months',
        'duration_minutes', 'liturgical_script', 'source', 'sequence_number', 'is_active'];
    const proveDefaults = {
        biblical_faculty: "'Memory'", guide_steps: 'NULL', parent_posture: 'NULL',
        materials: 'NULL', content_source: "'schoolos_core'"
    };
    // Note: Only generate this for V2_0005
    const proveRows = processFile('0061_seed_prove_it_catechism.sql', proveCols, FORMATIONS_TARGET_COLS, proveDefaults);
    generateSqlFile(OUTPUT_FILE_V2_0005, 'formations', FORMATIONS_TARGET_COLS, proveRows);

    // --- 3. PROGRESSIONS (V2_0004) ---
    const progRows = [];
    const progSourceCols = ['id', 'base_item_id', 'stage', 'simplified_title', 'simplified_content', 'memory_portion', 'parent_teaching_note'];
    const progDefaults = {};

    progRows.push(...processFile('0044_seed_age_progressions_q2_q10.sql', progSourceCols, PROGRESSIONS_TARGET_COLS, progDefaults));
    progRows.push(...processFile('0045_seed_progressions_q12_q38.sql', progSourceCols, PROGRESSIONS_TARGET_COLS, progDefaults));
    progRows.push(...processFile('0046_seed_progressions_q39_q81.sql', progSourceCols, PROGRESSIONS_TARGET_COLS, progDefaults));
    progRows.push(...processFile('0047_seed_progressions_q82_q107.sql', progSourceCols, PROGRESSIONS_TARGET_COLS, progDefaults));

    generateSqlFile(OUTPUT_FILE_V2_0004, 'formation_progressions', PROGRESSIONS_TARGET_COLS, progRows);

    console.log("Done.");
}

main();
