# SchoolOS Children's Picture Book - Master Style Guide

## Series Identity: "My First Books"
**Target Audience:** African children ages 1-5 (and their parents)
**Publisher:** Petra Reformed Publishing, Kampala, Uganda
**Art Direction:** Warm, realistic, culturally authentic African children's book illustrations

---

## DESIGN PHILOSOPHY

### Core Principles
1. **Cultural Authenticity**: Every element must feel genuinely East African, not "African-flavored Western"
2. **Warmth & Safety**: Images should evoke the comfort of a loving Ugandan home
3. **Educational Clarity**: One concept per page, visually unmistakable
4. **Realistic but Friendly**: Not cartoonish, not photorealistic—the sweet spot of children's illustration
5. **Inclusive Representation**: Beautiful, healthy African children with varying skin tones within the realistic Ugandan range

### Visual Goals
- Child should immediately recognize the object/concept being taught
- Parents should see their own homes, neighborhoods, and children reflected
- Colors should be rich but not overwhelming
- Composition should guide the eye to the focal point

---

## STYLE SPECIFICATIONS

### Art Style
- **Primary Style**: Warm, soft-lit digital illustration (like Jon Klassen meets African context)
- **Rendering**: Soft brushwork, visible texture, gentle gradients
- **Lighting**: Golden hour (morning or afternoon), warm ambient light
- **Mood**: Cozy, inviting, safe, joyful

### Acceptable Influences (For AI Reference)
- Jon Klassen (composition, simplicity)
- Oliver Jeffers (warmth, character)
- Christian Robinson (texture, color blocking)
- Kadir Nelson (African features, dignity)

### NOT Acceptable
- Cartoon/Anime style
- Photorealistic
- Western "diverse stock photo" aesthetic
- Flat vector graphics
- Harsh lighting or shadows

---

## CHARACTER DESIGN

### Primary Characters

#### CHILD 1 (Boy, Age 3-4)
- **Appearance**: Round face, short hair (typical boy cut), warm brown skin (medium-dark)
- **Expression**: Curious, eager, sometimes concentrating
- **Clothing**: Simple cotton t-shirts (solid colors: yellow, blue, green), shorts
- **Personality**: Inquisitive, loves discovering new things, reaches for objects

#### CHILD 2 (Girl, Age 4-5)
- **Appearance**: Round face, short natural hair with small braids or twists, warm brown skin
- **Expression**: Expressive, shows big emotions clearly
- **Clothing**: Colorful dresses, hair ribbons
- **Personality**: Sensitive, caring, experiences feelings deeply

#### GENERIC CHILD (When not character-specific)
- Use realistic African child features
- Should look healthy, well-cared-for, happy

### Secondary Characters
- **Mother**: Warm, loving, often in colorful dress
- **Father**: Gentle, present, in simple shirt
- **Grandmother**: Elder, kind face, traditional dress

---

## ENVIRONMENT DESIGN

### Home Interior (Most Common Setting)
- **Walls**: Light blue, pink, or cream painted cement walls
- **Floor**: Cement or tiles (not dirt)
- **Furniture**: Simple wooden chairs, tables, plastic chairs
- **Kitchen**: Charcoal stove (sigiri), clay pots, metal saucepans, yellow jerrycans
- **Decorations**: Calendar on wall, family photos, curtains on windows
- **Lighting**: Natural light from windows, warm and soft

### Outdoor Settings
- **Compound**: Swept red earth, green plants, possibly banana trees
- **Market**: Colorful tarps, piles of produce, busy but organized
- **Road**: Dusty with boda-bodas, matatus, bicycles

### Weather
- **Default**: Sunny with soft clouds
- **Rainy**: When story requires (feeling sad/scared)

---

## COLOR PALETTE

### Primary Palette (Use Most Often)
| Color | Hex | Usage |
|-------|-----|-------|
| Warm Yellow | #F5C518 | Sunlight, bananas, joy |
| Ugandan Red | #C9302C | Kitenge fabrics, tomatoes |
| Sky Blue | #87CEEB | Walls, sky, calm |
| Banana Leaf Green | #228B22 | Nature, growth |
| Earth Brown | #8B4513 | Skin tones, wood, earth |
| Cream | #FFF8DC | Backgrounds, light |

### Accent Palette (Use Sparingly)
| Color | Hex | Usage |
|-------|-----|-------|
| Kitenge Orange | #FF7F50 | Traditional fabric accents |
| Deep Purple | #663399 | Bougainvillea, special moments |
| White | #FFFFFF | Milk, clouds, highlights |
| Charcoal | #36454F | Sigiri, shadows |

### Skin Tone Range (Realistic Ugandan)
- Light Brown: #8D5524
- Medium Brown: #6B4423
- Dark Brown: #4A2C2A
- Deep Brown: #3D2314

---

## TEXT & PAGE NUMBERING

### Text Overlay Specifications
Since text will be overlaid in the app/PDF, images should have:

1. **Text-Safe Zone**: Leave ~15% of bottom of image slightly less busy for text overlay
2. **Page Number Zone**: Small corner area (bottom right) for page number

### If Text IS Embedded in Image (Alternative)
- **Font Style**: Rounded sans-serif, child-friendly (like Nunito, Baloo)
- **Font Color**: Deep brown or dark blue (never pure black)
- **Text Position**: Bottom center, with slight drop shadow for readability
- **Page Number**: Bottom right corner, small, matching font

Example Text Format:
```
"ONE yellow banana."
                    — 1 —
```

---

## PAGE COMPOSITION RULES

### Golden Rules
1. **Single Focal Point**: One main subject per page, clearly centered or rule-of-thirds positioned
2. **Breathing Room**: Don't crowd the image; leave empty space for the eye to rest
3. **Eye-Level Perspective**: Camera at child's eye level (not looking down at child)
4. **Hands Reaching In**: When appropriate, show a child's hand interacting with the object

### Layout Templates

#### Template A: Object Focus (Counting, Colors Books)
```
+---------------------------+
|                           |
|    [Background/Setting]   |
|                           |
|      +-------------+      |
|      |   OBJECT    |      |
|      |   (focal)   |      |
|      +-------------+      |
|                           |
|   [text zone - 15%]       |
+---------------------------+
```

#### Template B: Character + Object (Feelings, Animals Books)
```
+---------------------------+
|                           |
|   [Character]   [Object]  |
|    (left 40%)  (right 50%)|
|                           |
|   [text zone - 15%]       |
+---------------------------+
```

#### Template C: Full Scene (Vehicles, Summary Pages)
```
+---------------------------+
|   [Full scene with        |
|    multiple elements      |
|    arranged naturally]    |
|                           |
|   [text zone - 15%]       |
+---------------------------+
```

---

## COVER IMAGE SPECIFICATIONS

### Cover Layout
- **Title Area (Top 20%)**: Leave space for title text overlay
- **Main Image (Center 60%)**: Hero image representing book theme
- **Author Area (Bottom 20%)**: Leave space for author/publisher text

### Cover Composition
- Should capture the ESSENCE of the book in one image
- Character should be present (if character-driven book)
- Maximum 3-5 objects representing book content
- Background should be simpler than interior pages

---

## CONSISTENCY CHECKLIST (Before Each Image)

Before finalizing any prompt, verify:

- [ ] Does this match the Master Style Guide?
- [ ] Is the skin tone within the realistic Ugandan range?
- [ ] Is the setting recognizably East African?
- [ ] Is there a clear focal point?
- [ ] Is there space for text overlay (if needed)?
- [ ] Does the lighting feel warm and inviting?
- [ ] Would a Ugandan parent recognize this scene?
- [ ] Is the child drawn with dignity and beauty?

---

## JSON SPECIFICATION FORMAT

Each page image should have a detailed JSON specification:

```json
{
  "book_id": "string",
  "page_number": 1,
  "filename": "page-01.png",
  
  "educational_context": {
    "learning_goal": "Child learns to recognize and count ONE object",
    "concept": "Number recognition: 1",
    "vocabulary": ["one", "banana", "yellow"],
    "ask_prompt": "Can you find ONE banana?"
  },
  
  "visual_composition": {
    "template": "A (Object Focus)",
    "focal_point": "Single ripe banana on plate",
    "focal_position": "center, slightly above middle",
    "background_elements": ["wooden table", "blue wall", "window with light"],
    "foreground_elements": ["child's hand reaching from bottom left"]
  },
  
  "scene_details": {
    "setting": "Ugandan home kitchen",
    "time_of_day": "Morning, golden light from window",
    "atmosphere": "Warm, inviting, breakfast time",
    "cultural_elements": ["woven plate (ensawo)", "painted cement wall"]
  },
  
  "color_direction": {
    "dominant_colors": ["Warm Yellow", "Cream", "Sky Blue"],
    "accent_colors": ["Earth Brown", "Wood tones"],
    "mood": "Cheerful, appetizing"
  },
  
  "character_direction": {
    "character": "Kato (or generic child hand)",
    "expression": null,
    "pose": "Hand reaching toward banana",
    "clothing_visible": null
  },
  
  "text_integration": {
    "text_content": "ONE yellow banana.",
    "text_position": "bottom center",
    "page_number_position": "bottom right corner",
    "text_safe_zone": "bottom 15% of image less detailed"
  },
  
  "technical_specs": {
    "aspect_ratio": "1:1 (square)",
    "minimum_resolution": "2048x2048",
    "file_format": "PNG",
    "color_profile": "sRGB"
  },
  
  "ai_prompt": "Detailed prompt for Nano Banana goes here..."
}
```

---

## NEXT STEPS

This style guide will be referenced for all image specifications.

Now creating detailed page-by-page specifications for:
1. Kato Counts to Five (10 pages + cover)
2. Rangi Zangu - My Colors (10 pages + cover)
3. Wanyama wa Kampala - Animals of Kampala (12 pages + cover)
4. Amina's Feelings (12 pages + cover)
5. Boda Boda and Friends - Things That Go (10 pages + cover)
