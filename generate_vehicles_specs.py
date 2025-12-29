#!/usr/bin/env python3
"""
Generate Things That Go image specifications
"""

# Vehicle data: (name, sound, setting_description)
VEHICLES = [
    ("MOTORCYCLE", "VROOM VROOM!", "boda-boda on dusty road with rider"),
    ("MINIBUS", "BEEP BEEP!", "colorful matatu/taxi on city road"),
    ("BIG TRUCK", "HONK HONK!", "cargo truck carrying goods on highway"),
    ("BICYCLE", "ring-ring!", "simple bicycle on compound path"),
    ("AIRPLANE", "whoooosh!", "plane in sky above Uganda"),
    ("BOAT", "splish-splash!", "wooden boat on Lake Victoria"),
    ("TRAIN", "Chugga-Chugga Choo-Choo!", "train on tracks through landscape"),
    ("WHEELBARROW", "Squeak squeak!", "wheelbarrow carrying matoke/bricks"),
    ("BIG BUS", "HONK HONK!", "passenger bus on intercity road"),
]

header = """# Things That Go
## Complete Image Specification Document

**Book ID:** `things-that-go`
**Series:** My First Books
**Target Age:** 1-4 years
**Domain:** Cognitive (Vehicle Recognition)
**Page Count:** 10 content pages + 1 cover

---

## BOOK PHILOSOPHY

### Educational Purpose
This book teaches vehicle recognition using familiar Ugandan transport. Each page presents one vehicle with its characteristic sound, building vocabulary and sound-symbol association. The vehicles progress from everyday (motorcycle, bicycle) to exciting (airplane, train).

### Learning Goals
1. Recognize and name 9 common vehicles
2. Associate vehicles with their sounds
3. Make vehicle sound effects (phonics and play)
4. Understand different modes of transportation
5. Build vocabulary in Ugandan transport context

### Pedagogical Approach
- Concrete daily experiences (boda-boda, matatu)
- Sound-word association for literacy
- Repetitive structure with variation
- Interactive sound-making prompts
- Culturally grounded (Ugandan vehicles and roads)

---

## VISUAL CONSISTENCY RULES

### Lighting
Bright daylight—outdoor scenes showing vehicles in motion or ready to move

### Settings
- Roads: Dusty Ugandan roads, red earth
- City: Kampala street scenes
- Rural: Village paths and compounds
- Sky: For airplane
- Water: Lake Victoria for boat

### Composition
Template C (Full Scene)—vehicle in context showing movement and purpose. Dynamic, energetic compositions.

---

## PAGE SPECIFICATIONS

### COVER
```json
{
  "book_id": "things-that-go",
  "page_number": 0,
  "filename": "cover.png",
  "ai_prompt": "Children's book COVER about vehicles. African child (3-4 years, warm brown skin #6B4423) center waving excitedly, surrounded by vehicles: motorcycle/boda-boda (left), colorful minibus/matatu (right), airplane in sky (top), boat on water (bottom). Dynamic, energetic composition. Warm realistic children's illustration. Leave space for title 'Things That Go' and subtitle. Mood: excitement, movement, 'VROOM!' energy. Ugandan transport context."
}
```

"""

def generate_vehicle_spec(num, vehicle, sound, desc):
    # Determine setting colors
    if "sky" in desc.lower() or "airplane" in desc.lower():
        colors = "#87CEEB sky blue, #FFFFFF clouds"
        setting_type = "sky"
    elif "boat" in desc.lower() or "lake" in desc.lower():
        colors = "#87CEEB water blue, #228B22 shore green"
        setting_type = "water"
    elif "city" in desc.lower() or "matatu" in desc.lower():
        colors = "#8B4513 road brown, building colors"
        setting_type = "city"
    else:
        colors = "#8B4513 red-brown earth, #F5C518 dusty road"
        setting_type = "road"
    
    return f"""---

### PAGE {num}: {vehicle}
```json
{{
  "book_id": "things-that-go",
  "page_number": {num},
  "filename": "page-{num:02d}.png",
  "educational_context": {{
    "learning_goal": "Recognize {vehicle.lower()}; learn vehicle sound '{sound}'",
    "concept": "Vehicle: {vehicle}",
    "vocabulary": ["{vehicle.lower()}", "go", "{sound.split()[0].lower()}", "ride"],
    "ask_prompt": "Can you say {sound}?"
  }},
  "scene_details": {{
    "setting": "Ugandan {setting_type} scene",
    "vehicle_description": "{desc}",
    "atmosphere": "Dynamic, moving, energetic"
  }},
  "color_direction": {{
    "dominant_colors": ["{colors}"],
    "mood": "Energetic movement, excitement"
  }},
  "text_content": "{vehicle} goes {sound}",
  "ai_prompt": "Children's book illustration, page {num} of vehicles book. SCENE: {vehicle} in motion or ready to go. SUBJECT: Realistic Ugandan {vehicle.lower()}—{desc}. The vehicle is DYNAMIC—suggest movement with dust, motion lines, or active positioning. Vehicle takes 45-55% of frame. SETTING: {setting_type.capitalize()} scene in Uganda—{desc}. Show context (road/path/sky/water). Maybe small child figure waving or watching with excitement. LIGHTING: Bright outdoor daylight, clear and energetic. COMPOSITION: Vehicle positioned dynamically (not static), suggesting movement and power. Background shows Ugandan landscape. Bottom 15% clear for text. STYLE: Warm, realistic children's book illustration. Vehicles look REAL and EXCITING—makes child point and say '{sound}!' Not cartoonish. Dynamic energy. Cultural authenticity (Ugandan roads/transport). COLOR: {colors}. MOOD: Movement, excitement, the thrill of vehicles going places! Text: '{vehicle} goes {sound}'"
}}
```
"""

# Generate all pages
output = header

for i, (name, sound, desc) in enumerate(VEHICLES, 1):
    output += generate_vehicle_spec(i, name, sound, desc)

# Add finale
output += """
---

### PAGE 10: FINALE - ALL VEHICLES
```json
{
  "book_id": "things-that-go",
  "page_number": 10,
  "filename": "page-10.png",
  "educational_context": {
    "learning_goal": "Review all vehicles; celebrate transportation",
    "concept": "ALL VEHICLES TOGETHER",
    "ask_prompt": "What's your favorite thing that goes?"
  },
  "text_content": "So many things that go! VROOM VROOM!",
  "ai_prompt": "Children's book illustration, page 10 FINALE of vehicles book. SCENE: Dynamic collection of ALL vehicles in motion! African child (3-4 years, warm brown skin #6B4423) stands center on hilltop waving excitedly at vehicles all around: motorcycle zooming by road (lower left), colorful minibus on road (lower right), truck in distance, bicycle on path, airplane in sky above, boat on water/lake at bottom edge, train crossing middle-distance, wheelbarrow being pushed, big bus on far road. Each vehicle recognizable from its page. The scene is DYNAMIC—vehicles all in motion, going different directions. SETTING: Ugandan landscape showing roads, paths, sky, water—everything in one panoramic view from child's hilltop. LIGHTING: Bright clear daylight, energetic. COMPOSITION: Child center on small hill, vehicles arranged in dynamic circular pattern around and beyond. Sense of movement and energy everywhere. Bottom clear for text. STYLE: Warm, dynamic, realistic children's book illustration with celebration energy. Each vehicle clear and recognizable. Not cartoonish but EXCITING. Movement everywhere—dust clouds, water splashes, sky trails. MOOD: EXCITEMENT! Movement! So many ways to GO! VROOM VROOM! Cultural authenticity (all Ugandan transport). COLOR: Full spectrum—road browns, sky blues, colorful vehicles, green landscape, water blue. Text: 'So many things that go! VROOM VROOM!'"
}
```

---

## COMPLETE
11 total specifications (1 cover + 10 pages)
"""

# Write to file
output_path = r"C:\Users\Anthony Mwesigwa\Documents\Home Line Shop\stage-builder\public\books\My First Books\things-that-go\_image_specs.md"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Generated: {output_path}")
print(f"Total length: {len(output)} characters")
