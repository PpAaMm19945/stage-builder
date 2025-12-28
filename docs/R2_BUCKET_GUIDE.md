# R2 Bucket Structure Guide for SchoolOS Books

## Bucket Name
`schoolos-books`

## Directory Structure

The R2 bucket should mirror the local `public/books/` structure exactly:

```
schoolos-books/
├── African Men of Faith/
│   ├── Athanasius/
│   │   ├── metadata.json        # Book metadata
│   │   ├── cover.png            # Cover image (same as page-01)
│   │   └── images/
│   │       ├── page-01.png      # First page
│   │       ├── page-02.png
│   │       ├── page-03.png
│   │       └── ...
│   ├── Augustine/
│   │   ├── metadata.json
│   │   ├── cover.png
│   │   └── images/
│   │       └── page-XX.png
│   ├── Cyprian/
│   ├── Moses/
│   └── Perpetua/
│
└── My First Books/
    ├── colors-around-me/
    │   ├── metadata.json
    │   ├── cover.png
    │   └── images/
    │       ├── page-01.png
    │       └── ...
    ├── animal-friends/
    ├── counting-to-five/
    ├── my-feelings-today/
    ├── things-that-go/
    ├── Counting With Kato/
    └── Vroom Africa/
```

## File Naming Conventions

| File Type | Naming Pattern | Examples |
|-----------|---------------|----------|
| Cover | `cover.png` | `cover.png` |
| Pages | `page-XX.png` (zero-padded) | `page-01.png`, `page-12.png` |
| Metadata | `metadata.json` | `metadata.json` |

## Uploading to R2

### Option 1: Wrangler CLI (Recommended)

```bash
# Install wrangler if not already
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Upload entire books folder
# Run from the stage-builder directory
wrangler r2 object put schoolos-books/ --file=public/books/ --recursive
```

### Option 2: Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Select `schoolos-books` bucket
3. Click "Upload" → "Upload folder"
4. Select the `public/books` folder contents
5. Maintain the directory structure during upload

### Option 3: Sync Script (for updates)

```bash
# Sync local changes to R2
wrangler r2 object put "schoolos-books/African Men of Faith/Athanasius/" \
  --file="public/books/African Men of Faith/Athanasius/" \
  --recursive
```

## metadata.json Format

Each book needs a `metadata.json` with this structure:

```json
{
  "id": "athanasius",
  "series": "African Men of Faith",
  "title": "Athanasius and the Truth",
  "author": "Anthony Jr. Mwesigwa",
  "illustrator": "Anthony Jr. Mwesigwa",
  "description": "The story of Athanasius...",
  "minAgeMonths": 72,
  "maxAgeMonths": 108,
  "pageCount": 12,
  "domain": "language",
  "learningStage": "early-years",
  "readingPrompts": [
    { "page": 1, "prompt": "What do you see on the cover?" },
    { "page": 3, "prompt": "How do you think Athanasius felt?" }
  ]
}
```

## Age Range Conversion

| Input | minAgeMonths | maxAgeMonths |
|-------|--------------|--------------|
| 1-4 years | 12 | 48 |
| 2-5 years | 24 | 60 |
| 3-5 years | 36 | 60 |
| 6-9 | 72 | 108 |

## Verification Checklist

After uploading to R2:

- [ ] Each book folder has `metadata.json`
- [ ] Each book folder has `cover.png`
- [ ] Each book has `images/page-01.png`, `page-02.png`, etc.
- [ ] Page numbering is sequential with no gaps
- [ ] API endpoint returns books: `GET /api/books`
- [ ] Cover images load: `GET /api/books/{series}/{bookId}/cover`
- [ ] Page images load: `GET /api/books/{series}/{bookId}/pages/01`
