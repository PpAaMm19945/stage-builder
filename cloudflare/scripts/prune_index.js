const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/index.ts');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log(`original lines: ${lines.length}`);

// Validating cut points
const line448 = lines[447]; // Should be app.route('/', curriculumRoutes); or something
const line476 = lines[475]; // Should be app.use('/api/*', ...
const line494 = lines[493]; // Should be });
const line1554 = lines[1553]; // Should be // ============ PROGRESS TRACKING ...

console.log(`Line 448: ${line448}`);
console.log(`Line 476: ${line476}`);
console.log(`Line 494: ${line494}`);
console.log(`Line 1554: ${line1554}`);

// Verify markers (loose check)
if (!line476.includes('app.use')) {
    console.error('Marker 476 mismatch!');
    // Try to find it nearby
    const correctIdx = lines.findIndex((l, i) => i > 400 && l.trim().startsWith("app.use('/api/*',"));
    console.log(`Found app.use at ${correctIdx + 1}`);
}

// Slice
// We want to keep 0..447
// Then skip to Middleware (475..493)
// Then skip to 1553..End

const part1 = lines.slice(0, 448);
const middleware = lines.slice(475, 494);
const part3 = lines.slice(1553);

// Inject Imports
// Find last import
let lastImportIdx = 0;
for (let i = 0; i < part1.length; i++) {
    if (part1[i].startsWith('import ')) lastImportIdx = i;
}

const newImports = [
    "import workRoutes from './routes/work';",
    "import analyticsRoutes from './routes/analytics';",
    "import exportRoutes from './routes/export';",
    "import reportsRoutes from './routes/reports';"
];

part1.splice(lastImportIdx + 1, 0, ...newImports);

// Inject Mounts
// Find end of mounts in part1
// part1 ends at 448
const newMounts = [
    "app.route('/', workRoutes);",
    "app.route('/', analyticsRoutes);",
    "app.route('/', exportRoutes);",
    "app.route('/', reportsRoutes);"
];
part1.push(...newMounts);

const finalLines = [...part1, ...middleware, ...part3];

console.log(`final lines: ${finalLines.length}`);

fs.writeFileSync(filePath, finalLines.join('\n'));
console.log('Done.');
