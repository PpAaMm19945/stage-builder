# SchoolOS Books Conformity Standard

This document defines the **ONLY** acceptable structure for books in this repository. Any deviation is considered a bug in the data.

## 1. Directory Structure

```
books/
├── series_name/                    # snake_case, lowercase
│   ├── metadata.json               # Required, exactly "metadata.json"
│   ├── cover.png                   # Required for series detail view
│   └── book_id/                    # snake_case, lowercase
│       ├── metadata.json           # Required, exactly "metadata.json"
│       └── images/                 # Required folder
│           ├── cover.png           # Required, exactly "cover.png"
│           ├── page-00.png         # Optional, usually copyright page
│           ├── page-01.png         # Required, first content page
│           ├── page-02.png         # Second content page
│           └── ...
```

## 2. Naming Rules

### Folders
- **Format**: `snake_case` (lowercase words separated by underscores).
- **Allowed Characters**: `a-z`, `0-9`, `_`.
- **Examples**:
    - ✅ `african_men_of_faith`
    - ❌ `African Men of Faith`
    - ❌ `the-prodigal-son` (no hyphens in folders)

### Files
- **Format**: Lowercase.
- **Cover Image**: MUST be named `cover.png`.
- **Pages**: MUST be named `page-XX.png` (zero-padded).
    - `page-00.png` (Copyright/Intro)
    - `page-01.png` (First story page)
    - `page-10.png`
- **Metadata**: MUST be named `metadata.json`.

## 3. Metadata Requirements

File: `books/series_name/book_id/metadata.json`

```json
{
  "id": "book_id",           // MUST match the folder name exactly
  "series": "Series Name",   // Human readable Title Case
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book description.",
  "minAgeMonths": 36,
  "maxAgeMonths": 72,
  "pageCount": 12,           // Total number of content pages
  "domain": "spiritual",     // One of: language, cognitive, motor, social-emotional, spiritual
  "learningStage": "early-years" // One of: early-years, lower-primary
}
  "learningStage": "early-years" // One of: early-years, lower-primary
}
```

## 4. Series Metadata Requirements

File: `books/series_name/metadata.json`

```json
{
  "id": "series_name",       // MUST match the folder name exactly
  "title": "Series Title",   // Human readable Title Case
  "description": "Series description."
}
```

File: `books/series_name/cover.png` - Required 4:3 or square aspect ratio image for series card.

## 5. Special Series Rules

### My First Books
- `page-00.png`: Copyright page
- `page-01.png`: First content page

### The Gospel Series
- `cover.png`: Separate cover file
- `page-00.png`: Copyright page
- `page-01.png`: First story page

### African Men of Faith
- `cover.png`: Separate cover file
- `page-00.png`: Copyright/Intro
- `page-01.png`: First story page
