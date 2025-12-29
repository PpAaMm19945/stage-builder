#!/usr/bin/env python3
"""
Generate My Feelings Today image specifications
"""

# Emotion data: (emotion, trigger, facial_expression)
FEELINGS = [
    ("HAPPY", "when Mama gives me a hug", "big smile, bright eyes, relaxed face"),
    ("SAD", "when my toy breaks", "tears, downturned mouth, drooping eyes"),
    ("ANGRY", "when someone takes my food", "furrowed brow, tight mouth, intense eyes"),
    ("SCARED", "when thunder goes BOOM!", "wide eyes, open mouth, tense body"),
    ("EXCITED", "on market day!", "wide smile, bright eyes, animated expression"),
    ("TIRED", "after playing all day", "drooping eyelids, yawn, relaxed posture"),
    ("LOVED", "every single day", "peaceful smile, warm eyes, relaxed"),
    ("PROUD", "when I learn something new", "chin up, chest out, confident smile"),
    ("SHY", "when I meet a new friend", "looking down/away, small smile, hand near face"),
    ("FRUSTRATED", "when my tower falls down", "tight lips, furrowed brow, tense"),
    ("CURIOUS", "when I see a tiny bug", "wide eyes, leaning forward, focused look"),
]

header = """# My Feelings Today
## Complete Image Specification Document

**Book ID:** `my-feelings-today`
**Series:** My First Books
**Target Age:** 2-5 years
**Domain:** Social-Emotional (Emotion Recognition)
**Page Count:** 12 content pages + 1 cover

---

## BOOK PHILOSOPHY

### Educational Purpose
This book teaches emotion recognition and validation using a child's everyday experiences. Each page presents one emotion with a relatable trigger situation and clear facial expression. The book affirms that ALL feelings are okay—a crucial social-emotional learning foundation.

### Learning Goals
1. Recognize and name 11 common emotions
2. Understand what triggers different feelings
3. See emotions reflected in facial expressions
4. Learn that all feelings are valid and normal
5. Build emotional vocabulary and self-awareness

### Pedagogical Approach
- First-person perspective ("I feel...")
- Concrete triggers children experience
- Visual focus on facial expressions
- Validating tone throughout
- Finale affirms: "All feelings are okay"

---

## VISUAL CONSISTENCY RULES

### Lighting
Soft, warm natural light creating safe, intimate atmosphere

### Character
Same African child (3-4 years, warm brown skin #6B4423) throughout showing different emotions

### Composition
Close-up on child's face (40-50% of frame) with simple background showing context. Template B (Character + Context).

### Color Psychology
- Happy/Excited/Loved: Warm yellows, oranges
- Sad: Cool blues, grays
- Angry/Frustrated: Reds, intense tones
- Scared: Dark blues, purples
- Tired: Soft pastels
- Proud/Curious: Bright, clear colors

---

## PAGE SPECIFICATIONS

### COVER
```json
{
  "book_id": "my-feelings-today",
  "page_number": 0,
  "filename": "cover.png",
  "ai_prompt": "Children's book COVER about emotions. One African child (3-4 years, warm brown skin #6B4423, short natural hair) shown with split composition showing 4 emotions: happy (big smile top-left), sad (tears top-right), excited (wide smile bottom-left), calm/loved (peaceful bottom-right). Warm realistic children's illustration style. Cream background. Leave space for title 'My Feelings Today' and subtitle 'A First Emotions Book'. Mood: validating, safe, all feelings welcome."
}
```

"""

def generate_feeling_spec(num, emotion, trigger, expression):
    # Set color mood based on emotion
    color_moods = {
        "HAPPY": "#F5C518 warm yellow, #FFF8DC cream - joyful warmth",
        "SAD": "#87CEEB soft blue, #C0C0C0 gray - gentle sadness",
        "ANGRY": "#C9302C red accents, intense warm tones",
        "SCARED": "#4B0082 deep purple, dark blues - stormy",
        "EXCITED": "#FF7F50 bright orange, #F5C518 yellow - energetic",
        "TIRED": "#E6E6FA soft lavender, #FFF8DC pale cream - restful",
        "LOVED": "#FFB6C1 soft pink, #F5C518 warm gold - warmth",
        "PROUD": "#FFD700 gold, #87CEEB bright blue - achievement",
        "SHY": "#E0BBE4 soft purple, #FFF8DC cream - gentle",
        "FRUSTRATED": "#FF6347 tomato red, orange - tension",
        "CURIOUS": "#228B22 green, #F5C518 yellow - wonder"
    }
    
    color = color_moods.get(emotion, "#FFF8DC cream, gentle tones")
    
    return f"""---

### PAGE {num}: {emotion}
```json
{{
  "book_id": "my-feelings-today",
  "page_number": {num},
  "filename": "page-{num:02d}.png",
  "educational_context": {{
    "learning_goal": "Recognize {emotion.lower()} emotion; validate this feeling",
    "concept": "Emotion: {emotion}",
    "vocabulary": ["{emotion.lower()}", "feel", "emotion"],
    "ask_prompt": "{'What makes you ' + emotion.lower() + '?' if num < 11 else 'How do you feel right now?'}"
  }},
  "scene_details": {{
    "setting": "Simple Ugandan home context showing situation",
    "trigger": "I feel {emotion} {trigger}",
    "atmosphere": "Validating, safe, understanding"
  }},
  "character_direction": {{
    "expression": "{expression}",
    "emotion": "{emotion}",
    "age": "3-4 years, African child, warm brown skin #6B4423"
  }},
  "color_direction": {{
    "dominant_colors": ["{color}"],
    "mood": "{emotion.lower()} emotion conveyed through color"
  }},
  "text_content": "I feel {emotion} {trigger}",
  "ai_prompt": "Children's book illustration, page {num} of emotions book. SCENE: Close-up of 3-4 year old African child's face (warm brown skin #6B4423, short natural hair) showing {emotion} emotion. EXPRESSION: {expression}. The child's face is the FOCUS (40-50% of frame)—every detail of the emotion visible. CONTEXT: Simple background suggesting situation—{trigger.replace('when ', '')}. Maybe hands or simple objects in scene showing trigger. LIGHTING: Soft natural light, warm and safe feeling even for difficult emotions. COMPOSITION: Child's face centered, expression CLEAR and authentic. Background simple, color-coded to emotion. Bottom 15% clear for text. STYLE: Warm, realistic children's book illustration. The emotion looks REAL and validating—'Yes, you feel this way sometimes and that's okay.' Not cartoonish. Dignified child. MOOD: Validating all feelings—{emotion.lower()} is a valid emotion. Cultural authenticity. COLOR: {color}. Text: 'I feel {emotion} {trigger}'"
}}
```
"""

# Generate all pages
output = header

for i, (emotion, trigger, expression) in enumerate(FEELINGS, 1):
    output += generate_feeling_spec(i, emotion, trigger, expression)

# Add finale
output += """
---

### PAGE 12: FINALE - ALL FEELINGS ARE OKAY
```json
{
  "book_id": "my-feelings-today",
  "page_number": 12,
  "filename": "page-12.png",
  "educational_context": {
    "learning_goal": "Affirm all emotions are valid; God made feelings",
    "concept": "EMOTIONAL VALIDATION",
    "ask_prompt": "How do you feel right now?"
  },
  "text_content": "All feelings are okay. Big feelings, small feelings, happy and sad feelings. God made them all!",
  "ai_prompt": "Children's book illustration, page 12 FINALE of emotions book. SCENE: The same African child (3-4 years, warm brown skin #6B4423) sits peacefully center with calm, accepting expression. Around the child in soft vignettes or small scenes are glimpses of all 11 emotions shown in gentle, accepting way—not overwhelming but affirming 'all these feelings are part of me.' Maybe shown as: child's hands holding hearts with emoji-like faces of emotions, or soft watercolor scenes of different feeling moments surrounding main peaceful child. BACKGROUND: Warm rainbow gradient or soft cream with touches of all emotion colors. LIGHTING: Soft, warm, completely SAFE and affirming. COMPOSITION: Central child peaceful and whole, emotions around like memories or acceptance. Bottom clear for important text. STYLE: Warm, gentle, DEEPLY validating children's book illustration. This page says 'You are okay. All your feelings are okay. God made you with feelings and that's GOOD.' Peaceful, loving, accepting. Cultural authenticity. COLOR: Soft rainbow incorporating all emotion colors in harmony. MOOD: PEACE, ACCEPTANCE, WHOLENESS. Text: 'All feelings are okay. Big feelings, small feelings, happy and sad feelings. God made them all!'"
}
```

---

## COMPLETE
13 total specifications (1 cover + 12 pages)
"""

# Write to file
output_path = r"C:\Users\Anthony Mwesigwa\Documents\Home Line Shop\stage-builder\public\books\My First Books\my-feelings-today\_image_specs.md"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Generated: {output_path}")
print(f"Total length: {len(output)} characters")
