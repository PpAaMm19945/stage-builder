-- Migration 0054: Seed Sapling History (Active History for Ancient Africa)
-- Ages 6-12 (72-144 months)
-- Focus: "Fathers of Soroti" (Ham, Cush, Egypt, Ethiopia, Carthage)
-- Type: Skill
-- Virtue: Wisdom

INSERT OR REPLACE INTO formations (
  id, 
  title, 
  formation_type, 
  primary_virtue, 
  biblical_faculty, 
  description, 
  guide_steps, 
  materials,
  duration_minutes,
  cluster_tag,
  min_age_months, 
  max_age_months,
  context_anchor,
  parent_posture
) VALUES 
-- 1. Ham: Relief Map
(
  'hist_skill_01_ham_map',
  'Construct a Relief Map of Ancient Africa',
  'skill',
  'Wisdom',
  'Reason',
  'By sculpting the physical geography of Africa, we help the child connect the biblical narrative of Ham''s sons to the real world. We see how God designed the mountains and rivers to shelter and sustain the early nations.',
  '["Prepare a batch of salt dough (flour, salt, water).", "On a cardboard base, outline the continent of Africa.", "Build up the mountains (Atlas, Ethiopian Highlands) and depress the river valleys (Nile).", "Once dry, paint the Green Sahara and the desert regions as they would have been.", "Place flags for Cush, Mizraim, and Phut in their respective regions."]',
  '["2 cups flour", "1 cup salt", "1 cup water", "Cardboard base (A3 size)", "Paints and brushes", "Toothpicks and paper for flags"]',
  45,
  'history',
  72,
  144,
  'Anytime',
  'Act as the lead geographer. Help them notice how the rivers flow from the mountains.'
),

-- 2. Egypt: Shaduf Engineering
(
  'hist_skill_02_shaduf',
  'Engineer a Functioning Nile Shaduf',
  'skill',
  'Wisdom',
  'Reason',
  'The Egyptians used wisdom to water their crops in the desert. Building a shaduf (counterweight water lifter) teaches the child about leverage, stewardship of resources, and the ingenuity God gave to ancient people.',
  '["Create a vertical stand using sturdy sticks or a small wooden frame.", "Attach a long horizontal pole on a pivot point (fulcrum).", "On one end, hang a counterweight (clay ball or stone).", "On the other end, hang a bucket using string.", "Test the mechanism: does the weight help lift the full bucket?"]',
  '["Sturdy sticks/dowels", "String/Twine", "Small bucket or cup", "Clay or stone for weight", "Large container of water"]',
  45,
  'history',
  72,
  144,
  'Anytime',
  'Encourage trial and error. Ask, "Why is it easier to lift the water with the weight?"'
),

-- 3. Cush: Nubian Target
(
  'hist_skill_03_nubian_bow',
  'Design a Nubian Archer''s Target',
  'skill',
  'Wisdom',
  'Reason',
  'Cush was known as the "Land of the Bow." Their archers were famous for their skill and focus. We create a target to practice aim, reminding us that wisdom requires a focal point—God''s truth.',
  '["Cut a large circle out of cardboard.", "Paint concentric rings: White (outer), Blue, Red, and Gold (bullseye).", "Discuss how the Nubian archers protected their kingdom.", "Set up the target in a safe place.", "Practice hitting the mark with a toy bow or beanbags."]',
  '["Large Cardboard", "Paints (White, Blue, Red, Yellow)", "Toy Bow and Arrows (or Beanbags)", "String for hanging"]',
  30,
  'history',
  72,
  144,
  'Anytime',
  'Focus on the concept of "missing the mark" (sin) and "hitting the mark" (righteousness).'
),

-- 4. Meroe: Iron Furnace Model
(
  'hist_skill_04_meroe_iron',
  'Model a Meroitic Iron Furnace',
  'skill',
  'Wisdom',
  'Reason',
  'Meroe was an industrial city where iron was smelted from rock. We simulate this transformation by building a model furnace, learning how God provided iron for tools and strength.',
  '["Form a chimney shape using clay or a plastic bottle covered in foil.", "Create air vents at the bottom for ''draft''.", "Place red tissue paper and small stones inside to represent the fire and ore.", "Paint the exterior to look like baked mud/brick.", "Discuss how heat transforms the rock into useful metal."]',
  '["Air-dry clay or Plastic bottle", "Aluminum foil", "Red and Orange Tissue Paper", "Small stones", "Paints"]',
  45,
  'history',
  72,
  144,
  'Anytime',
  'Marvel at the chemistry God embedded in creation. Stone becomes metal!'
),

-- 5. Aksum: Ezana''s Coins
(
  'hist_skill_05_ezana_coins',
  'Mint King Ezana''s Cross Coins',
  'skill',
  'Wisdom',
  'Reason',
  'Changing the money changed the message of the Kingdom. By minting coins with the Cross, King Ezana declared who really ruled Aksum. We imitate this act of public faith.',
  '["Roll out a flat sheet of clay or salt dough.", "Use a round cutter to make coin blanks.", "Carve a Cross into the wet clay.", "Add the inscription ''TOYTOAPECHTHXWRA'' (May this please the country) or a simple Cross.", "Paint gold or silver when dry."]',
  '["Salt dough or Modeling Clay", "Round cookie cutter", "Toothpicks for carving", "Gold/Silver paint"]',
  40,
  'history',
  72,
  144,
  'Anytime',
  'Discuss how money shows what a country values. What would our money look like?'
),

-- 6. Aksum/Lalibela: Rock-Hewn Church
(
  'hist_skill_06_lalibela_carve',
  'Carve a Church from "Rock"',
  'skill',
  'Wisdom',
  'Reason',
  'The churches of Lalibela were not built up, but carved down. This deductive process teaches patience and vision, reminding us that sometimes God carves away our rough edges to make us beautiful.',
  '["Take a large bar of soft soap or a block of floral foam.", "Draw a cross shape on the top surface.", "Carefully carve away the material ''outside'' the cross.", "Dig down to create the walls and windows.", "Reveal the church hidden inside the block."]',
  '["Large bar of soap or Floral Foam", "Plastic knives or carving tools", "Sketch of Church of St. George (Lalibela)"]',
  45,
  'history',
  72,
  144,
  'Anytime',
  'Emphasize "Reduction." We are removing what doesn''t belong to reveal the form.'
),

-- 7. Carthage: Tyrian Purple
(
  'hist_skill_07_carthage_dye',
  'Experiment with "Tyrian Purple" Dye',
  'skill',
  'Wisdom',
  'Reason',
  'Carthage grew rich trading purple cloth. This chemistry experiment helps the child understand the value of color in the ancient world and the beauty God put in nature.',
  '["Crush dark berries (blackberries/blueberries) or red cabbage to create a dye bath.", "Add a little vinegar to set the color.", "Dip strips of white cotton cloth into the dye.", "Experiment with tie-dye patterns or full immersion.", "Let dry and observe the rich color."]',
  '["Blackberries, Blueberries, or Red Cabbage", "Vinegar", "White cotton fabric strips", "Bowl and masher", "Gloves"]',
  40,
  'history',
  72,
  144,
  'Anytime',
  'Talk about value. Why was purple for kings? Because it was hard to get.'
),

-- 8. Carthage: Phoenician Ship
(
  'hist_skill_08_phoenician_boat',
  'Build a Carthaginian Trade Ship',
  'skill',
  'Wisdom',
  'Reason',
  'The Phoenicians were master navigators. Building a model ship teaches buoyancy and design, reflecting on how God guides us through the waters of life.',
  '["Shape a hull using wood scraps, styrofoam, or cardboard.", "Attach a mast and a square sail (typical of ancient ships).", "Draw an eye on the prow (a Phoenician tradition).", "Test the boat in a tub of water.", "Load it with ''cargo'' to see how much it can carry."]',
  '["Wood scraps/Styrofoam", "Cloth for sail", "Glue/Tape", "Markers", "Tub of water"]',
  45,
  'history',
  72,
  144,
  'Anytime',
  'Discuss navigation. How did they find their way without GPS? (Stars/Sun).'
),

-- 9. Green Sahara: Rock Art
(
  'hist_skill_09_sahara_art',
  'Create Rock Art of the Green Sahara',
  'skill',
  'Wisdom',
  'Reason',
  'Before it was a desert, the Sahara was a garden. We remember this lost world by recreating the rock art left by the ancestors, realizing that the world changes, but God remains.',
  '["Crumple brown paper to create a ''rock'' texture.", "Mix charcoal or earth-toned paints (red, ochre).", "Paint silhouettes of giraffes, cattle, and swimming humans.", "Use handprints as signatures, just like the ancients.", "Display the art as a ''cave wall''."]',
  '["Brown packing paper or paper bags", "Charcoal", "Red/Brown Paint", "Sponges or fingers"]',
  30,
  'history',
  72,
  144,
  'Anytime',
  'Imagine the Sahara as a green place. How does the environment shape how we live?'
),

-- 10. North Africa: Augustine Journal
(
  'hist_skill_10_augustine_book',
  'Bind a Saint Augustine Journal',
  'skill',
  'Wisdom',
  'Reason',
  'St. Augustine wrote his heart out to God in his ''Confessions''. We learn the craft of bookbinding to create a space for our own thoughts and prayers.',
  '["Fold several sheets of paper in half to make a ''signature''.", "Sew the spine using a simple pamphlet stitch.", "Glue a cover made of cardstock or fabric/leather scraps.", "Write ''Tolle Lege'' (Take Up and Read) on the cover.", "Write the first entry: A prayer or a memory."]',
  '["Quality paper", "Cardstock or leather scrap", "Needle and heavy thread", "Awl or push-pin", "Glue"]',
  45,
  'history',
  72,
  144,
  'Anytime',
  'Reflect on the power of writing our story. Augustine changed the world with his book.'
);
