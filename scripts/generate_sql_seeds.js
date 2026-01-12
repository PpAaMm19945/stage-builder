const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Assuming glob is available/installable, or use fs.readdir recursive
// Actually, standard fs.readdirSync recursively is safer if glob isn't installed.
// Let's implement a simple recursive walker to avoid dependency issues.

function getFiles(dir, files = []) {
    try {
        const fileList = fs.readdirSync(dir);
        for (const file of fileList) {
            const name = `${dir}/${file}`;
            if (fs.statSync(name).isDirectory()) {
                getFiles(name, files);
            } else {
                files.push(name);
            }
        }
    } catch (e) {
        console.warn(`Warning: Could not read directory ${dir}`);
    }
    return files;
}

function escapeSql(text) {
    if (!text) return "";
    return text.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

function generateHymns() {
    console.log("Generating 0048_seed_hymns_from_markdown.sql...");
    const outputFile = "cloudflare/migrations/0048_seed_hymns_from_markdown.sql";
    const sourceDir = "public/books/reformed-hymns";

    if (!fs.existsSync(sourceDir)) {
        console.error(`Source directory not found: ${sourceDir}`);
        return;
    }

    const files = getFiles(sourceDir).filter(f => f.endsWith('.md'));
    let sql = "-- Migration 0048: Seed Hymns from Markdown\n";
    sql += "INSERT INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, liturgical_script, context_anchor, min_age_months, max_age_months) VALUES\n";

    const values = [];

    for (const filepath of files) {
        const filename = path.basename(filepath);
        const slug = filename.replace(".md", "").toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
        const content = fs.readFileSync(filepath, 'utf-8');

        const lines = content.split('\n');
        let title = lines[0].replace("#", "").trim();
        if (!title) title = filename.replace(".md", "").replace(/-/g, " ");

        const description = escapeSql(content.substring(0, 200) + "...");
        const script = escapeSql(content);

        values.push(`('hymn_${slug}', '${escapeSql(title)}', 'liturgy', 'Worship', 'Affection', '${description}', '${script}', 'Morning_Circle', 48, 216)`);
    }

    if (values.length > 0) {
        sql += values.join(",\n") + ";\n";
        fs.writeFileSync(outputFile, sql);
        console.log(`Generated ${values.length} hymns.`);
    } else {
        console.log("No hymns found.");
    }
}

function generateHistory() {
    console.log("Generating 0049_seed_history_formations.sql...");
    const outputFile = "cloudflare/migrations/0049_seed_history_formations.sql";
    const sourceDir = "public/books/young_historians_africa";

    if (!fs.existsSync(sourceDir)) {
        console.error(`Source directory not found: ${sourceDir}`);
        return;
    }

    // Get direct subdirectories
    const dirs = fs.readdirSync(sourceDir).map(d => path.join(sourceDir, d)).filter(d => fs.statSync(d).isDirectory());

    let sql = "-- Migration 0049: Seed History Short Stories\n";
    sql += "INSERT INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, liturgical_script, context_anchor, min_age_months, max_age_months) VALUES\n";

    const values = [];

    for (const dirpath of dirs) {
        const slug = path.basename(dirpath);
        const metaPath = path.join(dirpath, "metadata.json");
        const contentPath = path.join(dirpath, "content.md");

        if (!fs.existsSync(metaPath) || !fs.existsSync(contentPath)) continue;

        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const content = fs.readFileSync(contentPath, 'utf-8');

        const title = meta.title || slug.replace(/_/g, " ");
        const description = escapeSql(content); // Store full content in description for now

        values.push(`('hist_story_${slug}', '${escapeSql(title)}', 'narrative', 'Wonder', 'Imagination', '${description}', '', 'Bedside', 48, 120)`);
    }

    if (values.length > 0) {
        sql += values.join(",\n") + ";\n";
        fs.writeFileSync(outputFile, sql);
        console.log(`Generated ${values.length} history stories.`);
    } else {
        console.log("No history stories found.");
    }
}

generateHymns();
generateHistory();
