#!/usr/bin/env python3
"""
Generate complete Animal Friends image specifications
"""

# Animal data: (name, sound, setting_type, description)
ANIMALS = [
    ("HEN", "Cluck-cluck-cluck!", "farm", "brown speckled hen pecking grain in compound"),
    ("DOG", "Woof-woof!", "farm", "friendly brown dog sitting in compound"),
    ("CAT", "Meow!", "farm", "orange/tabby cat on veranda or wall"),
    ("COW", "Moo-oo!", "farm", "large gentle cow in grazing area"),
    ("GOAT", "Meh-meh!", "farm", "playful goat standing on something"),
    ("PARROT", "Hello! Hello!", "farm", "colorful African Grey parrot on perch"),
    ("LION", "ROAAAAR!", "wild", "majestic lion in savanna grass"),
    ("ELEPHANT", "trumpet sound", "wild", "wise elephant with trunk raised"),
    ("MONKEY", "chatter", "wild", "playful monkey in tree"),
    ("HIPPO", "grunt/splash", "wild", "hippo in water showing head"),
    ("ZEBRA", "bray", "wild", "zebra showing stripes in grassland"),
]

header = """#Animal Friends
## Complete Image Specification Document

**Book ID:** `animal-friends`
**Series:** My First Books
**Target Age:** 2-4 years
**Domain:** Language (Animal Recognition & Sounds)
**Page Count:** 12 content pages + 1 cover

---

## BOOK PHILOSOPHY

### Educational Purpose
Teaches animal recognition and sounds using familiar East African animals. Farm animals (pages 1-6) transition to wildlife (pages 7-11), building from concrete daily experiences to aspirational wildlife encounters.

### Learning Goals
1. Recognize and name 11 common animals
2. Associate each animal with its sound
3. Imitate animal sounds (phonics foundation)
4. Distinguish farm animals from wildlife
5. Build vocabulary through repetition and pattern

### Pedagogical Approach
- Familiar to exciting progression
- Multi-sensory (visual + auditory)
- Repetitive structure with variation
- Interactive sound-making prompts
- Culturally grounded in Ugandan context

---

## VISUAL CONSISTENCY RULES

### Lighting
Warm natural daylight throughout, soft and inviting

### Backgrounds
- **Farm pages (1-6):** Red earth compound, simple buildings
- **Wildlife pages (7-11):** Golden savanna, blue sky, natural habitat
- **Finale (12):** Magical gathering of all animals

### Composition
Animals are focal point (50-60% of frame), dignified realistic style, bottom 15% clear for text

---

## PAGE SPECIFICATIONS

### COVER
```json
{
  "book_id": "animal-friends",
  "page_number": 0,
  "filename": "cover.png",
  "ai_prompt": "Children's book COVER. Joyful 3-4 year old African child (warm brown skin #6B4423) center, surrounded by friendly animals: brown hen, loyal dog, majestic gentle lion, wise elephant. Cream background blending farm and savanna. Warm realistic children's illustration, animals have dignity. Leave space for title 'Animal Friends' at top. Mood: safe, joyful animal discovery."
}
```

"""

def generate_page_spec(num, animal, sound, setting_type, desc):
    setting = "Ugandan compound, red earth, house/fence background" if setting_type == "farm" else "Savanna grassland, acacia trees, blue sky, natural habitat"
    bg_color = "#8B4513 red earth" if setting_type == "farm" else "#F5C518 golden grass, #87CEEB sky blue"
    
    return f"""---

### PAGE {num}: {animal}
```json
{{
  "book_id": "animal-friends",
  "page_number": {num},
  "filename": "page-{num:02d}.png",
  "educational_context": {{
    "learning_goal": "Recognize {animal.lower()}; learn {animal.lower()} sound",
    "concept": "Animal: {animal}",
    "vocabulary": ["{animal.lower()}", "{sound.split()[0].lower()}", "animal"],
    "ask_prompt": "Can you make the {animal.lower()} sound?"
  }},
  "scene_details": {{
    "setting": "{setting}",
    "atmosphere": "{'Familiar farm life' if setting_type == 'farm' else 'Wildlife wonder'}",
    "animal_description": "{desc}"
  }},
  "color_direction": {{
    "dominant_colors": ["{bg_color}"],
    "mood": "{'Friendly, everyday' if setting_type == 'farm' else 'Majestic, natural'}"
  }},
  "text_content": "{animal}! The {animal.lower()} says \\"{sound}\\"",
  "ai_prompt": "Children's book illustration, page {num}. SCENE: {animal} in {setting}. The {animal.lower()} is the focal point—{desc}. Realistic Ugandan {animal.lower()} with authentic features. {setting}. Warm natural daylight. Animal takes 50-60% of frame, positioned center. Bottom 15% simpler for text. Style: warm realistic children's book illustration, dignified animal portrayal, not cartoonish. Cultural authenticity. Color: {bg_color}. Text: '{animal}! The {animal.lower()} says\\"{sound}\\"'"
}}
```
"""

# Generate all pages
output = header

for i, (name, sound, stype, desc) in enumerate(ANIMALS, 1):
    output += generate_page_spec(i, name, sound, stype, desc)

# Add finale
output += """
---

### PAGE 12: FINALE - ALL ANIMALS
```json
{
  "book_id": "animal-friends",
  "page_number": 12,
  "filename": "page-12.png",
  "educational_context": {
    "learning_goal": "Review all animals; celebrate animal diversity",
    "concept": "ALL ANIMALS TOGETHER",
    "ask_prompt": "Which animal is your favorite?"
  },
  "text_content": "So many animal friends all around us!",
  "ai_prompt": "Children's book illustration, page 12 FINALE. SCENE: ALL 11 ANIMALS gathered in magical scene—child (3-4 years, African, brown skin #6B4423) sits center smiling, surrounded by: hen, dog, cat, cow, goat, parrot (farm animals in front), lion, elephant, monkey, hippo, zebra (wildlife behind). Background blends compound and savanna. Each animal clearly recognizable from their page. Warm joyful atmosphere. Style: warm realistic children's illustration with magical quality (not realistic ecology—celebratory gathering). All animals look friendly and safe. Bottom text space. Mood: CELEBRATION of animal friends! Color: full spectrum from all pages."
}
```

---

## COMPLETE
13 total specifications (1 cover + 12 pages)
"""

# Write to file
output_path = r"C:\Users\Anthony Mwesigwa\Documents\Home Line Shop\stage-builder\public\books\My First Books\animal-friends\_image_specs.md"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Generated: {output_path}")
print(f"Total length: {len(output)} characters")
