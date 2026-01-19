
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../cloudflare/migrations/v2_0002_seed_formations.sql');

function fixSql() {
    try {
        const content = fs.readFileSync(inputFile, 'utf8');

        // Regex to find the start of the VALUES section
        const match = content.match(/(INSERT OR REPLACE INTO formations\s*\(.*?\)\s*VALUES\s*)/is);

        if (!match) {
            console.error("Could not find INSERT statement.");
            return;
        }

        const insertClause = match[1].trim();
        let valuesText = content.substring(match.index + match[0].length).trim();

        // Remove final semicolon if present
        if (valuesText.endsWith(';')) {
            valuesText = valuesText.slice(0, -1);
        }

        const rawRows = [];
        let buffer = "";
        let depth = 0;
        let inQuote = false;
        let i = 0;
        const length = valuesText.length;

        while (i < length) {
            const char = valuesText[i];
            buffer += char;

            if (char === "'" && (i + 1 >= length || valuesText[i + 1] !== "'")) {
                // Toggle quote if not an escaped quote ('')
                inQuote = !inQuote;
            } else if (char === "'" && (i + 1 < length && valuesText[i + 1] === "'")) {
                // Escaped quote, consume next char
                buffer += valuesText[i + 1];
                i++;
            }

            if (!inQuote) {
                if (char === '(') {
                    depth++;
                } else if (char === ')') {
                    depth--;
                } else if (char === ',' && depth === 0) {
                    // Row separator
                    const rowStr = buffer.slice(0, -1).trim(); // Remove trailing comma
                    if (rowStr) {
                        rawRows.push(rowStr);
                    }
                    buffer = "";
                }
            }
            i++;
        }

        if (buffer.trim()) {
            rawRows.push(buffer.trim());
        }

        // Remove trailing semicolon from last row if caught
        if (rawRows.length > 0 && rawRows[rawRows.length - 1].endsWith(';')) {
            rawRows[rawRows.length - 1] = rawRows[rawRows.length - 1].slice(0, -1);
        }

        console.log(`Found ${rawRows.length} rows.`);

        let newContent = "-- Migration v2_0002: Seed Formations (Batched)\n";
        const batchSize = 50;

        for (let j = 0; j < rawRows.length; j += batchSize) {
            const batch = rawRows.slice(j, j + batchSize);
            newContent += `\n${insertClause}\n` + batch.join(',\n') + ";\n";
        }

        fs.writeFileSync(inputFile, newContent, 'utf8');
        console.log(`Successfully split into ${Math.ceil(rawRows.length / batchSize)} batches.`);

    } catch (err) {
        console.error("Error processing file:", err);
    }
}

fixSql();
