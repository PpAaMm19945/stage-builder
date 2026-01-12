const fs = require('fs');
const path = require('path');

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
        const fileContent = fs.readFileSync(filepath, 'utf-8');

        // Split by ## headers
        // The first part might be the main header "# Hymns 1-10", discard it or check
        const sections = fileContent.split(/^## /m);

        for (const section of sections) {
            const lines = section.trim().split('\n');
            if (lines.length < 2) continue; // Skip empty or header-only sections

            let titleLine = lines[0].trim();
            // Remove "1. " numbering
            titleLine = titleLine.replace(/^\d+\.\s*/, "");

            if (!titleLine || titleLine.startsWith("#")) continue; // Skip the main file header

            const slug = titleLine.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

            // Rejoin the rest as content
            const content = lines.slice(1).join('\n').trim();

            const description = escapeSql(content.substring(0, 200).replace(/<[^>]*>/g, "") + "..."); // Strip HTML for description
            const script = escapeSql(content);

            values.push(`('hymn_${slug}', '${escapeSql(titleLine)}', 'liturgy', 'Worship', 'Affection', '${description}', '${script}', 'Morning_Circle', 48, 216)`);
        }
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
        const content = fs.readFileSync(contentPath, 'utf-8'); // Fixed variable declaration

        const title = meta.title || slug.replace(/_/g, " ");
        const description = escapeSql(content);

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
