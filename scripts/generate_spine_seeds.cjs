const fs = require('fs');
const path = require('path');

// --- Types & Constants ---

const SUBJECTS = ['literacy', 'numeracy', 'formation', 'motor'];
const STAGES = ['seedling', 'sprout', 'sapling', 'tree'];
const WEEKS_PER_STAGE = 52;

const PROGRESSIONS = {
    literacy: {
        seedling: [
            "Environmental print awareness", "Book handling", "Listening to read-alouds", "Sound discrimination", "Rhyme exposure", "Vocabulary through conversation", "Pointing at pictures", "Turn pages", "Recognize own name", "Babbling/first words"
        ],
        sprout: [
            "Phonological awareness (rhyming)", "Phonological awareness (syllables)", "Phonological awareness (alliteration)", "Letter recognition (uppercase)", "Letter recognition (lowercase)", "Letter-sound correspondence", "Print concepts (left-right)", "Print concepts (top-bottom)", "Name writing", "Vocabulary expansion", "Retelling simple stories", "Following 2-3 step directions"
        ],
        sapling: [
            "Phonics (CVC words)", "Phonics (blends)", "Phonics (digraphs)", "Sight words (Dolch pre-primer)", "Sight words (Dolch primer)", "Sight words (Dolch 1st)", "Sight words (Dolch 2nd)", "Reading fluency", "Comprehension (main idea)", "Comprehension (sequence)", "Comprehension (prediction)", "Narration (oral)", "Handwriting (manuscript)", "Dictation", "Copywork", "Simple composition"
        ],
        tree: [
            "Advanced phonics", "Fluency benchmarks", "Comprehension (inference)", "Comprehension (summarization)", "Comprehension (compare/contrast)", "Narration (written)", "Grammar basics", "Paragraph writing", "Poetry memorization", "Research skills"
        ]
    },
    numeracy: {
        seedling: [
            "Sensory quantity (more/less)", "Spatial awareness (in/out)", "Spatial awareness (up/down)", "Sorting by one attribute", "Nesting/stacking", "Cause-effect exploration", "Pattern exposure", "Size comparison", "Counting songs"
        ],
        sprout: [
            "Rote counting 1-20", "Rote counting 1-50", "1-to-1 correspondence", "Number recognition 1-10", "Number recognition 11-20", "Sorting by multiple attributes", "Simple patterns (AB)", "Simple patterns (ABB)", "Shape recognition", "Positional words", "Comparing quantities", "Introduction to addition"
        ],
        sapling: [
            "Number writing", "Counting to 100", "Skip counting (2s)", "Skip counting (5s)", "Skip counting (10s)", "Addition facts (sums to 10)", "Addition facts (sums to 20)", "Subtraction facts", "Place value (tens/ones)", "Measurement (length)", "Measurement (weight)", "Time (hours)", "Time (half-hours)", "Money (coins)", "Word problems", "Number line", "Ordinal numbers", "Basic fractions"
        ],
        tree: [
            "Multi-digit addition", "Multi-digit subtraction", "Multiplication concept", "Multiplication facts", "Division introduction", "Place value to thousands", "Measurement conversions", "Geometry (perimeter)", "Geometry (area)", "Data/graphs", "Fractions (equivalent)", "Fractions (comparing)", "Time (elapsed)", "Problem-solving strategies", "Mental math"
        ]
    },
    formation: {
        seedling: [
            "Secure attachment", "Trust in caregiver", "Basic routine compliance", "Responding to no", "Emotional co-regulation", "Gentle touch", "Sharing space", "Simple manners", "Waiting briefly", "Separation comfort"
        ],
        sprout: [
            "Obedience", "Basic manners", "Sharing", "Taking turns", "Gentle words", "Self-control (waiting)", "Self-control (not grabbing)", "Cleaning up", "Kindness to siblings", "Truthfulness", "Gratitude", "Respect for authority", "Empathy"
        ],
        sapling: [
            "Responsibility", "Perseverance", "Self-control (regulation)", "Conflict resolution", "Hospitality", "Generosity", "Honesty", "Respect for elders", "Courage", "Stewardship", "Service", "Compassion"
        ],
        tree: [
            "Leadership", "Serving siblings", "Initiative", "Time stewardship", "Integrity", "Handling disappointment", "Forgiveness", "Loyalty", "Diligence", "Financial stewardship", "Community service", "Mentoring", "Self-governance"
        ]
    },
    motor: {
        seedling: [
            "Tummy time", "Head control", "Rolling", "Sitting", "Crawling", "Pulling to stand", "Cruising", "First steps", "Reaching/grasping", "Transferring objects", "Pincer grasp", "Banging/shaking", "Stacking blocks", "Self-feeding", "Scribbling"
        ],
        sprout: [
            "Running", "Jumping", "Climbing stairs", "Kicking ball", "Throwing overhand", "Catching large ball", "Balance (one foot)", "Pedaling tricycle", "Threading beads", "Playdough manipulation", "Scissor introduction", "Drawing circles", "Building with blocks", "Dressing self", "Pouring"
        ],
        sapling: [
            "Skipping", "Hopping", "Ball bouncing", "Catching small ball", "Balance beam", "Swimming basics", "Cutting on line", "Handwriting readiness", "Drawing shapes", "Lacing cards", "Building models", "Tying attempts", "Using utensils", "Bike with training wheels", "Obstacle courses"
        ],
        tree: [
            "Refined sports skills", "Swimming proficiency", "Bike without training wheels", "Jump rope", "Dance/movement", "Cursive handwriting", "Detailed drawing", "Sewing basics", "Woodworking basics", "Cooking skills", "Instrument playing", "Typing", "Complex building"
        ]
    }
};

// --- Helper Functions ---

function snakeCase(str) {
    return str.toLowerCase()
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/\//g, '_')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

function escapeSql(str) {
    if (!str) return 'NULL';
    return str.replace(/'/g, "''");
}

function getSubjectAbbr(subject) {
    const map = { literacy: 'lit', numeracy: 'num', formation: 'for', motor: 'mot' };
    return map[subject];
}

function getStageAbbr(stage) {
    const map = { seedling: 'seed', sprout: 'spro', sapling: 'sapl', tree: 'tree' };
    return map[stage];
}

// --- Logic ---

function parseCatechism() {
    const filePath = path.join(__dirname, '../public/books/Prove it Catecishm/Full Text of the Catecism - Children\'s _Prove It_ Catechism.html');
    const html = fs.readFileSync(filePath, 'utf-8');

    const questionsMap = new Map();
    let currentQ = {};

    // Split by <p> tags
    const parts = html.split(/<p>/i);

    for (const part of parts) {
        // Clean up
        const text = part.replace(/<\/p>[\s\S]*/i, '').trim()
            .replace(/<[^>]+>/g, '') // Remove other tags
            .replace(/&nbsp;/g, ' ')
            .trim();

        if (!text) continue;

        // Q Match
        // Handles "Q1", "Q. 1", "Q1.", "Q66What"
        const qMatch = text.match(/^Q\.?\s*(\d+)/i);

        // If it starts with Q and digits
        if (qMatch) {
            const num = parseInt(qMatch[1]);
            // Extract text after the number
            // We need to handle "66What" vs "1 Who"
            // The qMatch[0] is e.g. "Q66" or "Q1"
            let qText = text.substring(qMatch[0].length).replace(/^[\.\s]+/, '').trim();

            // If previous exists, save it
            if (currentQ.number) {
                if (!questionsMap.has(currentQ.number)) {
                    questionsMap.set(currentQ.number, currentQ);
                }
            }

            currentQ = {
                number: num,
                question: qText
            };
            continue;
        }

        // A Match
        // Relaxed regex matches: "A. The..." (no space) or "A The..."
        const aMatch = text.match(/^A\.?\s*(.*)/i);
        if (aMatch && currentQ.number) {
            // Ensure it's not a false positive "A" if that was possible (unlikely in this file)
            if (aMatch[1].length > 0) {
                currentQ.answer = aMatch[1].trim();
                continue;
            }
        }

        // Verse Match
        if (currentQ.number && currentQ.answer && !currentQ.verseRef) {
            // It's not a Q or A line, and we have Q and A.
            // Ignore navigational links or headers
            if (!text.toLowerCase().includes("catechism") && !text.toLowerCase().includes("text of") && !text.includes("HOME")) {
                currentQ.verseRef = text;
            }
        }
    }
    // Push last
    if (currentQ.number) {
        questionsMap.set(currentQ.number, currentQ);
    }

    const questions = Array.from(questionsMap.values());
    console.log(`Parsed ${questions.length} unique catechism questions.`);

    // Check Q89 specifically
    const q89 = questions.find(q => q.number === 89);
    if (q89) {
        console.log(`Q89 Verse: ${q89.verseRef}`);
    } else {
        console.warn("Q89 not found!");
    }

    // Sort
    questions.sort((a, b) => a.number - b.number);

    // Validation
    const numbers = new Set(questions.map(q => q.number));
    const missing = [];
    for (let i = 1; i <= 130; i++) {
        if (!numbers.has(i)) missing.push(i);
    }

    if (missing.length > 0) {
        console.warn(`Missing Questions: ${missing.join(', ')}`);
    }

    return questions;
}

function generateFaithFraming(topic, catQ) {
    const openers = [
        "God's world is full of wonders, including",
        "We can glorify God by learning about",
        "Just as God made us, we learn to",
        "Order and beauty are seen in",
        "We serve others when we practice"
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    return `${opener} ${topic.toLowerCase()}.`;
}

function generateData() {
    const catechism = parseCatechism();
    const data = [];

    // Ensure we have enough catechism
    if (catechism.length < 130) {
        console.warn(`Warning: Only parsed ${catechism.length} questions. Expected 130.`);
    }

    // Create a lookup for catechism to handle potential gaps gracefully if any
    const catMap = new Map(catechism.map(q => [q.number, q]));

    for (const subject of SUBJECTS) {
        let globalWeek = 0; // 0 to 208

        for (const stage of STAGES) {
            const topics = PROGRESSIONS[subject][stage];

            for (let week = 1; week <= WEEKS_PER_STAGE; week++) {
                globalWeek++; // 1-based global counter for this subject

                // Cycling logic
                // Catechism: 1 to 130, then 1...
                // The index should be based on globalWeek
                // globalWeek 1 -> Q1
                // globalWeek 130 -> Q130
                // globalWeek 131 -> Q1

                // (globalWeek - 1) % 130 + 1
                const catNum = ((globalWeek - 1) % 130) + 1;
                const catQ = catMap.get(catNum) || { number: catNum, question: "Unknown", answer: "Unknown", verseRef: "Unknown" };


                // Hymn: 1-56
                const hymnNum = ((globalWeek - 1) % 56) + 1;

                // Topic distribution
                const topicRaw = topics[(week - 1) % topics.length];

                // Unique focus area
                const focusAreaUnique = snakeCase(topicRaw) + (topics.length < 52 ? `_${Math.ceil(week / topics.length)}` : "");

                // Faith Framing
                const framing = generateFaithFraming(topicRaw, catQ);

                data.push({
                    id: `spine_${getSubjectAbbr(subject)}_${getStageAbbr(stage)}_w${week.toString().padStart(2, '0')}`,
                    subject,
                    week_number: week,
                    stage,
                    focus_area: focusAreaUnique,
                    skill_targets: [
                        `Demonstrates ${topicRaw.toLowerCase()}`,
                        `Shows interest in ${topicRaw.toLowerCase()}`
                    ],
                    faith_framing: framing,
                    catechism_q: catQ.number,
                    hymn_number: hymnNum,
                    scripture_ref: catQ.verseRef
                });
            }
        }
    }
    return data;
}

function generateSql(data) {
    const files = {};

    const phases = [
        { file: 'v2_0056_spine_seed_literacy_1.sql', subject: 'literacy', stages: ['seedling', 'sprout'] },
        { file: 'v2_0057_spine_seed_literacy_2.sql', subject: 'literacy', stages: ['sapling', 'tree'] },
        { file: 'v2_0058_spine_seed_numeracy_1.sql', subject: 'numeracy', stages: ['seedling', 'sprout'] },
        { file: 'v2_0059_spine_seed_numeracy_2.sql', subject: 'numeracy', stages: ['sapling', 'tree'] },
        { file: 'v2_0060_spine_seed_formation_1.sql', subject: 'formation', stages: ['seedling', 'sprout'] },
        { file: 'v2_0061_spine_seed_formation_2.sql', subject: 'formation', stages: ['sapling', 'tree'] },
        { file: 'v2_0062_spine_seed_motor_1.sql', subject: 'motor', stages: ['seedling', 'sprout'] },
        { file: 'v2_0063_spine_seed_motor_2.sql', subject: 'motor', stages: ['sapling', 'tree'] }
    ];

    for (const p of phases) {
        const rows = data.filter(d => d.subject === p.subject && p.stages.includes(d.stage));

        let sql = `-- ${p.file}\n`;
        sql += `-- Curriculum spine seed: ${p.subject}, ${p.stages.join(' + ')}\n\n`;
        sql += `INSERT INTO curriculum_spine (id, spine_version, subject, week_number, stage, focus_area, skill_targets, faith_framing, resources, confidence, approved_by, approved_at, catechism_q, hymn_number, scripture_ref)\nVALUES\n`;

        const values = rows.map(r => {
            return `('${r.id}', 'v1.0', '${r.subject}', ${r.week_number}, '${r.stage}', '${r.focus_area}', '${JSON.stringify(r.skill_targets)}', '${escapeSql(r.faith_framing)}', '[]', 'research', 'admin', '2026-02-09T00:00:00Z', ${r.catechism_q}, ${r.hymn_number}, '${escapeSql(r.scripture_ref)}')`;
        }).join(',\n');

        sql += values + ';\n';
        files[p.file] = sql;
    }

    return files;
}

function main() {
    console.log("Generating spine data...");
    const data = generateData();
    console.log(`Generated ${data.length} weeks of data.`);

    if (data.length !== 832) {
        console.error("Error: Expected 832 rows!");
        process.exit(1);
    }

    const sqlFiles = generateSql(data);
    const outDir = path.join(__dirname, '../cloudflare/migrations');

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const [filename, content] of Object.entries(sqlFiles)) {
        fs.writeFileSync(path.join(outDir, filename), content);
        console.log(`Wrote ${filename}`);
    }

    // Metadata file
    const metaFile = 'v2_0064_spine_metadata.sql';
    const metaContent = `-- ${metaFile}
DELETE FROM spine_metadata WHERE spine_version = 'v1.0';
INSERT INTO spine_metadata (id, spine_version, status, total_weeks, subjects, approved_by, approved_at)
VALUES ('spine_v1_meta', 'v1.0', 'approved', 832, '["literacy","numeracy","formation","motor"]', 'admin', '2026-02-09T00:00:00Z');
`;
    fs.writeFileSync(path.join(outDir, metaFile), metaContent);
    console.log(`Wrote ${metaFile}`);
}

main();
