# Book Assets Specification

This document defines the required assets for the SchoolOS Book Library (Part 1 of Phase 1 - Faithful Minimum).
The API expects these assets to be present in the R2 bucket.

## Directory Structure

Books are stored in R2 using the following path structure:
`books/{series_slug}/{book_slug}/`

Required files per book:
1. `cover.png` - The cover image (aspect ratio 2:3 or 3:4)
2. `images/page-{n}.png` - Individual pages, where `{n}` is the page number (1-indexed).

Example:
```
books/
  athanasius_contra_mundum/
    on_the_incarnation/
      cover.png
      images/
        page-1.png
        page-2.png
        ...
```

## Image Specifications

- **Format:** PNG (preferred) or JPG
- **Resolution:**
  - Cover: Min 600px width
  - Pages: Min 1200px width (for readability)
- **File Naming:** strictly `page-1.png`, `page-2.png`, etc. (no leading zeros needed by logic, but typically used 01, 02... standard logic supports `page-${pageNumber}.png`).

## Current Inventory & Status

### Series: `athanasius_contra_mundum` (Athanasius Press)

1.  **On the Incarnation** (`on_the_incarnation`)
    - Status: Missing Assets
    - Page Count: 32

2.  **Against the Heathen** (`against_the_heathen`)
    - Status: Missing Assets
    - Page Count: 28

3.  **Life of Antony** (`life_of_antony`)
    - Status: Missing Assets
    - Page Count: 40

### Series: `animal_friends` (Animal Friends)

1.  **The Brave Bear** (`the_brave_bear`)
    - Status: Missing Assets
    - Page Count: 16

2.  **The Wise Owl** (`the_wise_owl`)
    - Status: Missing Assets
    - Page Count: 16

3.  **The Kind Elephant** (`the_kind_elephant`)
    - Status: Missing Assets
    - Page Count: 16

4.  **The Busy Beaver** (`the_busy_beaver`)
    - Status: Missing Assets
    - Page Count: 16

5.  **The Playful Dolphin** (`the_playful_dolphin`)
    - Status: Missing Assets
    - Page Count: 16

6.  **The Faithful Dog** (`the_faithful_dog`)
    - Status: Missing Assets
    - Page Count: 16

7.  **The Gentle Lamb** (`the_gentle_lamb`)
    - Status: Missing Assets
    - Page Count: 16

### Series: `early_church_fathers` (Early Church Fathers)

1.  **Polycarp's Letter** (`polycarps_letter`)
    - Status: Missing Assets
    - Page Count: 24

2.  **Ignatius to the Ephesians** (`ignatius_ephesians`)
    - Status: Missing Assets
    - Page Count: 24

3.  **Ignatius to the Romans** (`ignatius_romans`)
    - Status: Missing Assets
    - Page Count: 24

4.  **The Didache** (`the_didache`)
    - Status: Missing Assets
    - Page Count: 20

5.  **Letter to Diognetus** (`letter_to_diognetus`)
    - Status: Missing Assets
    - Page Count: 18

6.  **Shepherd of Hermas** (`shepherd_of_hermas`)
    - Status: Missing Assets
    - Page Count: 48

7.  **Clement of Rome** (`clement_of_rome`)
    - Status: Missing Assets
    - Page Count: 32

8.  **Justin Martyr's Apology** (`justin_martyr_apology`)
    - Status: Missing Assets
    - Page Count: 36

9.  **Irenaeus Against Heresies** (`irenaeus_against_heresies`)
    - Status: Missing Assets
    - Page Count: 42

## Fallback Strategy

To prevent a broken user experience while assets are being created:
1.  **BookCard:** Displays a generated placeholder using the book title and series color if `cover.png` fails to load.
2.  **BookReader:** Displays a "Content Coming Soon" message if page images are missing, allowing the user to mark it as read manually if they have a physical copy.
