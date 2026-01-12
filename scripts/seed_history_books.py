import os
import json

# Define the absolute path to the target directory to avoid CWD issues
TARGET_DIR = r"c:\Users\Anthony Mwesigwa\Documents\Home Line Shop\stage-builder\public\books\young_historians_africa"

BOOKS_DATA = [
    {
        "slug": "01_god_made_africa",
        "title": "God Made Africa",
        "spreads": [
            {
                "text": "Long, long ago, in the very beginning, God made the heavens and the earth. He spoke, and light filled the darkness. He made the sun to warm us and the moon to watch over our sleep.",
                "image_prompt": "Photorealistic, cinematic wide shot of the Earth from space, focusing on the continent of Africa glowing in the golden sunlight of creation. 8k resolution, highly detailed."
            },
            {
                "text": "God smiled and created the land of Africa. He made the tall mountains reach for the sky, and the long, winding rivers flow to the sea. He filled the land with animals—lions, elephants, and beautiful birds.",
                "image_prompt": "A majestic African landscape with Mount Kilimanjaro in the distance, a flowing river in the foreground, and various animals like elephants and lions peacefully coexisting. Golden hour lighting."
            },
            {
                "text": "After the Great Flood, when Noah’s ark landed safely, his three sons stepped out to fill the earth again. Their names were Shem, Ham, and Japheth.",
                "image_prompt": "Three ancient men, Noah's sons, standing on a mountain peak looking out over a renewed, green world. They are dressed in simple ancient tunics. Cinematic lighting."
            },
            {
                "text": "Noah's son Ham had a special family. His children and grandchildren would become the fathers of the great nations of Africa. They were strong and clever.",
                "image_prompt": "A warm, photorealistic portrait of an ancient Near Eastern family, Ham and his sons, looking strong and noble. They are gathering supplies to travel. Dusty, warm atmosphere."
            },
            {
                "text": "One son was named Cush. His family traveled south, along the great Nile River. They built powerful kingdoms and became known as mighty warriors and builders.",
                "image_prompt": "A group of ancient travelers walking along the banks of the Nile River, with lush palm trees and the blue water contrasting with the desert sands. 8k resolution."
            },
            {
                "text": "Another son was named Mizraim. His family settled where the river meets the sea. They built the land of Egypt, with its great stone pyramids that still stand today.",
                "image_prompt": "A view of the early construction of Ancient Egypt, with simple mud-brick homes and the foundations of a great monument being laid. The Nile Delta is green and fertile."
            },
            {
                "text": "The third son was named Phut. His family walked west, to the lands of green grass and open skies. They learned to live in the mountains and the plains.",
                "image_prompt": "A vast, green savanna landscape (Green Sahara) with ancient people setting up a camp. In the distance, the Atlas Mountains are visible. Photorealistic style."
            },
            {
                "text": "For a long time, people told stories that weren't true. They said Africa was forgotten. But that was a lie. The Bible tells us the true story.",
                "image_prompt": "A wise elder sitting by a fire at night, telling stories to children. The firelight illuminates their faces. The background is a starry African sky."
            },
            {
                "text": "God loves all the nations He made. He has a special plan for Africa, just as He has a plan for you. From the beginning, He was weaving His story.",
                "image_prompt": "A cinematic shot of a diverse group of ancient African people looking up at the sky with hope. Soft, heavenly light breaking through the clouds."
            },
            {
                "text": "The kings and queens of Africa would one day build great cities, write books, and worship God. It was all started with the families of Cush, Mizraim, and Phut.",
                "image_prompt": "A montage or split screen showing a glimpse of a pyramid, a stone church, and a bustling ancient market. Highly detailed and realistic."
            },
            {
                "text": "We are going to be Young Historians. We will learn the secrets of the past. We will see how God’s hand guided the people of this beautiful continent.",
                "image_prompt": "A young African child holding an ancient scroll or artifact, looking at it with wonder. The background is a library or museum setting with warm lighting."
            },
            {
                "text": "Map: The Sons of Ham. This map shows where the three brothers' families went. Cush to the south, Mizraim to the river, and Phut to the west.",
                "image_prompt": "A simplified, ancient parchment map of Africa and the Near East. Arrows labeled 'Cush', 'Mizraim', and 'Phut' point to their respective regions (Sudan, Egypt, North Africa). The map breathes with history."
            }
        ]
    },
    {
        "slug": "02_the_river_of_time",
        "title": "The River of Time",
        "spreads": [
            {
                "text": "Close your eyes and imagine a river that never ends. This is the Nile, the father of rivers. For thousands of years, it has engaged the desert in a hug of green.",
                "image_prompt": "A stunning textual aerial shot of the Nile River winding through the golden desert sands, creating a ribbon of lush green vegetation. 8k resolution, cinematic."
            },
            {
                "text": "In the land of Egypt, the people learned the rhythm of the river. Every year, it flooded and brought rich black soil. They called their land 'Kemet', the Black Land.",
                "image_prompt": "Ancient Egyptian farmers working in the fields as the Nile waters recede, leaving dark, rich soil. Pyramids are visible in the far distance in the morning mist."
            },
            {
                "text": "A powerful King named Narmer united the people of the river. He wore a special double crown—white and red—to show he ruled everything from the delta to the valley.",
                "image_prompt": "A photorealistic close-up of the Narmer Palette or King Narmer himself wearing the Double Crown, standing tall with a royal scepter. Ancient Egyptian palace background."
            },
            {
                "text": "The Egyptians wanted to live forever. The mighty Pharaohs built mountains of stone called Pyramids to reach the stars. They thought they were gods.",
                "image_prompt": "The Great Pyramids of Giza under construction, with wooden scaffolding and hundreds of workers hauling stones. The sun is setting, casting long shadows."
            },
            {
                "text": "But a true man of God came to Egypt. His name was Joseph. He didn't come as a king, but as a slave. Yet God was with him.",
                "image_prompt": "Joseph standing in an Egyptian prison cell, a single shaft of light hitting his face. He looks peaceful and wise despite his surroundings. Realistic texture."
            },
            {
                "text": "Joseph helped the Pharaoh understand a strange dream. Because Joseph listened to God, he saved Egypt from a terrible time of hunger.",
                "image_prompt": "Joseph, now dressed in fine Egyptian linen and gold chains, standing beside Pharaoh on a balcony overlooking grain silos being filled. A crowd cheers below."
            },
            {
                "text": "Years later, God’s people were trapped in Egypt. They cried out for help. God sent Moses to tell the Pharaoh, 'Let my people go!'",
                "image_prompt": "Moses standing before a seated, arrogant Pharaoh in a grand throne room. Moses holds a wooden staff. The atmosphere is tense and dramatic."
            },
            {
                "text": "Egypt saw many other rulers. There was Akhenaten, who tried to pray to only one sun god. And the famous Queen Cleopatra, the very last Pharaoh.",
                "image_prompt": "A split page showing a bust of Akhenaten on one side and a regal, photorealistic portrait of Queen Cleopatra on the other, wearing Greek-Egyptian royal attire."
            },
            {
                "text": "Over time, the great power of the Pharaohs faded. Rome took over the land. The old temples became silent ruins buried in the sand.",
                "image_prompt": "Roman soldiers marching past the Sphinx, which is partially buried in sand. The sky is slightly overcast, signaling a change in history."
            },
            {
                "text": "But the story wasn't over. The River Nile still flowed. And soon, a new message would come to Egypt—a message about a baby who also escaped to the Nile for safety.",
                "image_prompt": "A peaceful night scene on the Nile. A small boat carries Mary, Joseph, and baby Jesus. The stars reflect in the water."
            },
            {
                "text": "Today, we remember Egypt not just for its stone piles, but as a place where God showed His mighty power and kept His people safe.",
                "image_prompt": "Modern day view of the pyramids with a bustling Cairo in the background, bridging the ancient and the modern. Golden hour."
            },
            {
                "text": "Map: The Black Land. See the long blue line of the Nile flowing North. Find the Delta at the top where it meets the sea. This is Egypt.",
                "image_prompt": "A parchment map focusing on the Nile River. It highlights 'Upper Egypt' in the south and 'Lower Egypt' (the Delta) in the north. The Red Sea is also visible."
            }
        ]
    },
    {
        "slug": "03_the_green_sahara",
        "title": "The Green Sahara",
        "spreads": [
            {
                "text": "Imagine standing in the Sahara desert. Today, it is hot and sandy. But if you could travel back in time, you would see something amazing.",
                "image_prompt": "A split image. Left side: Hot, dry sand dunes of the modern Sahara. Right side: The same landscape but lush, green, and full of grass and lakes."
            },
            {
                "text": "Thousands of years ago, the Sahara was green! It was a land of flowing rivers, splashing hippos, and tall giraffes. People lived there happily.",
                "image_prompt": "A prehistoric scene of the 'Green Sahara'. A lake with hippos, and people fishing in dug-out canoes. Giraffes grazing in the background."
            },
            {
                "text": "These people were the children of Phut. They painted pictures on the rocks of the animals they saw. We can still see these paintings today.",
                "image_prompt": "A close-up of ancient rock art on a sandstone cave wall, depicting cattle and hunters. A hand of a modern child is reaching out to touch it (implied)."
            },
            {
                "text": "Slowly, the rain stopped falling. The grass turned brown. The lakes dried up. The sand took over. The people had to move.",
                "image_prompt": "A time-lapse style composite showing the landscape transitioning from green savanna to dry scrubland, and finally to desert dunes. The mood is melancholic."
            },
            {
                "text": "Some people learned to live in the desert. They were called the Garamantes. They dug deep tunnels to find water hidden underground.",
                "image_prompt": "Ancient engineers digging a 'foggara' tunnel in the desert rock. Water flows through a stone channel, irrigating a small oasis garden."
            },
            {
                "text": "They rode horses and chariots across the sands. Later, they used camels. The camel was the 'ship of the desert' that helped them trade.",
                "image_prompt": "A caravan of camels walking through a sandstorm, carrying goods. The riders are wrapped in indigo cloth. The sun is a hazy ball of white."
            },
            {
                "text": "On the coast, huge ships arrived. The Phoenicians built a great city called Carthage. It was famous for its purple cloth and mighty ships.",
                "image_prompt": "The ancient harbor of Carthage. It is circular and filled with wooden warships (triremes). The city rises white and majestic in the background."
            },
            {
                "text": "Carthage became powerful. But a city called Rome wanted to be the boss. They fought huge wars. A general named Hannibal even rode elephants over mountains!",
                "image_prompt": "A dramatic scene of Hannibal’s army crossing the snowy Alps. War elephants are tramping through the snow, soldiers bracing against the wind."
            },
            {
                "text": "In the end, Rome won. But the people of Phut—the Amazigh—stayed strong. They kept their own language and their own ways.",
                "image_prompt": "An Amazigh family in a mountain village, wearing traditional wool cloaks. They look proud and resilient. Roman ruins are visible in the far distance."
            },
            {
                "text": "God had a plan for these tough people. Soon, the news of Jesus would come to their cities and farms, and they would become heroes of the faith.",
                "image_prompt": "A simple early Christian meeting in a North African home. Light streams in from a window. People are listening intently to a reader."
            },
            {
                "text": "The desert may remain, but the history of the Green Sahara reminds us that the world is always changing in God's hands.",
                "image_prompt": "A lone tree standing in the desert (an acacia), symbolizing resilience. The sun is setting, painting the sky in deep purples and oranges."
            },
            {
                "text": "Map: The Changing Land. This map shows North Africa. The green spots show where the oasis cities were. Carthage is on the coast.",
                "image_prompt": "A parchment map of North Africa. It shows the Atlas Mountains and the Mediterranean coast. A dot for 'Carthage' and symbols for 'Oases' in the desert."
            }
        ]
    },
    {
        "slug": "04_the_iron_kingdom",
        "title": "The Iron Kingdom",
        "spreads": [
            {
                "text": "South of Egypt, in the land of Cush, a new kind of kingdom was born. This was a land of gold mines and strong warriors.",
                "image_prompt": "A sweeping view of the Nubian desert with the smaller, steeper pyramids of Meroe in the background. The sand is reddish-gold."
            },
            {
                "text": "The people of Cush were powerful. Once, their kings marched north and became the Pharaohs of Egypt! We call them the Black Pharaohs.",
                "image_prompt": "A dramatic low-angle shot of a Kushite King (pharaoh) wearing the distinct cap-crown with two cobras. He looks regal and powerful. Temple columns behind him."
            },
            {
                "text": "But their true home was the city of Meroe. Meroe was not just a city of stone; it was a city of fire and iron.",
                "image_prompt": "The city of Meroe at its height. Smoke rises from iron smelting furnaces. The city is bustling with trade and activity."
            },
            {
                "text": "The people learned the secret of smelting iron. They made strong tools for farming and sharp spears for hunting. Iron made them rich.",
                "image_prompt": "Close up of an ancient blacksmith striking glowing red iron on an anvil. Sparks fly. He is focused and skilled. Realistic detail."
            },
            {
                "text": "Meroe was also famous for its Queens, called 'Kandakes'. When the Romans tried to attack, a one-eyed Queen named Amanirenas led her army to stop them!",
                "image_prompt": "Queen Amanirenas leading her army into battle. She is fierce, riding a war chariot or horse, holding a spear. Roman soldiers are retreating in the distance."
            },
            {
                "text": "The Cushites wrote in their own special alphabet. They built temples and palaces. They traded with India and Arabia.",
                "image_prompt": "A stone stele covered in Meroitic script. A scholar or scribe is carving into it. In the background, merchants trade ivory and cloth."
            },
            {
                "text": "One day, a man from Cush was riding his chariot home from Jerusalem. He was reading a scroll from the prophet Isaiah.",
                "image_prompt": "The Ethiopian Eunuch sitting in a grand chariot on a desert road. He is reading a scroll intently. Philip the Evangelist is approaching on foot."
            },
            {
                "text": "God sent a man named Philip to explain the scroll. The man from Cush believed the good news about Jesus! He took that joy back to Africa.",
                "image_prompt": "Philip baptizing the Ethiopian official in a small desert oasis pool. The official looks joyful and at peace. The chariot waits nearby."
            },
            {
                "text": "Later, a new kingdom called Aksum grew in the mountains. A King named Ezana decided to follow Jesus, too.",
                "image_prompt": "King Ezana standing on a balcony of his palace in the highlands. He holds a coin with a Cross on it, showing it to the people."
            },
            {
                "text": "The fires of Meroe eventually went out, but the history of the Iron Kingdom shows us the strength and skill of Africa's ancient people.",
                "image_prompt": "Ruins of the Meroe pyramids under a starry night sky. The Milky Way is visible. The scene is quiet and majestic."
            },
            {
                "text": "They were builders, warriors, and believers. Their story is written in the iron and the stone.",
                "image_prompt": "A montage spread showing an iron spearhead, a gold bracelet, and a piece of pottery from Meroe. Artifacts on a museum table."
            },
            {
                "text": "Map: The Land of the Bow. This map shows the Nile bending in an 'S' shape. The city of Meroe is between the rivers. The Red Sea is to the East.",
                "image_prompt": "A parchment map of the varying Nile cataracts (waterfalls). It marks 'Meroe', 'Napata', and 'Aksum'. The Red Sea trade routes are dotted lines."
            }
        ]
    },
    {
        "slug": "05_the_garden_of_faith",
        "title": "The Garden of Faith",
        "spreads": [
            {
                "text": "After the wars with Rome, North Africa became a peaceful garden. Fields of wheat stretched as far as the eye could see.",
                "image_prompt": "Endless golden wheat fields in North Africa under a bright blue sky. Roman-style aqueducts run through the fields. Farmers harvesting."
            },
            {
                "text": "It was here, in this rich land, that the church of Jesus began to grow like a strong tree. People of all kinds became Christians.",
                "image_prompt": "A diverse group of early Christians (Romans, Amazigh, others) gathered in a courtyard for a meal (Agape feast). Warm, inviting lighting."
            },
            {
                "text": "But the Roman Emperor wanted everyone to worship him. He didn't like the Christians because they said, 'Jesus is Lord.'",
                "image_prompt": "A Roman official reading a decree in a public square. Soldiers stand guard. The people look worried. Shadowy and tense atmosphere."
            },
            {
                "text": "A young mother named Perpetua was arrested. She was very brave. Even when her father begged her to give up, she pointed to a pitcher.",
                "image_prompt": "Perpetua in prison, talking to her elderly father. She points to a water pitcher on the floor. Her face is calm and resolute."
            },
            {
                "text": "'Can you call this pitcher by any other name?' she asked. 'No,' said her father. 'In the same way, I cannot call myself anything but a Christian.'",
                "image_prompt": "Close up of Perpetua's face, filled with grace and strength. Soft lighting highlights her expression of faith."
            },
            {
                "text": "Perpetua and her friend Felicitas gave their lives for Jesus. Their courage made the church grow even stronger. The blood of martyrs was like seed.",
                "image_prompt": "A symbolic image of seeds falling into the ground and sprouting into strong green plants. In the background, the silhouette of the Roman arena."
            },
            {
                "text": "Years later, a brilliant young man named Augustine lived in Africa. He made many mistakes and looked for happiness in wrong places.",
                "image_prompt": "A young, troubled Augustine sitting in a garden in Milan, looking distressed. A scroll lies on the ground next to him."
            },
            {
                "text": "But his mother, Monica, prayed for him every day. Finally, in a garden, Augustine heard a child's voice say, 'Take up and read.'",
                "image_prompt": "Augustine under a fig tree. He is reading a Bible with a look of realization and peace. A light shines on the page."
            },
            {
                "text": "Augustine became a great Bishop. He wrote books that taught the whole world about God’s grace and the City of God.",
                "image_prompt": "Bishop Augustine sitting in his study in Hippo, writing with a quill. Shelves of scrolls behind him. He looks wise and kind."
            },
            {
                "text": "Enemies eventually attacked the cities of North Africa, but the wisdom of Augustine and the courage of Perpetua could never be destroyed.",
                "image_prompt": "The ruins of the Hippo Basilica at sunset. The stones are old, but the cross still stands or is implied in the architecture."
            },
            {
                "text": "They remind us that the strongest kingdom is not Rome or Carthage, but the Kingdom of God.",
                "image_prompt": "A heavenly city shining in the clouds above the African landscape, representing the 'City of God'. Artistic and inspiring."
            },
            {
                "text": "Map: The Coast of Saints. This map shows the cities of Carthage and Hippo along the Mediterranean Sea. The land is green and fertile.",
                "image_prompt": "A parchment map of the North African coast. It marks 'Carthage' and 'Hippo Regius'. Olive branches decorate the corners."
            }
        ]
    },
    {
        "slug": "06_the_desert_prayer",
        "title": "The Desert Prayer",
        "spreads": [
            {
                "text": "In the busy city of Alexandria, Egypt, scholars argued and studied. It was a place of noise and crowds.",
                "image_prompt": "The crowded streets of ancient Alexandria. The Great Library is in the background. Merchants, scholars, and soldiers bustle about."
            },
            {
                "text": "A young man named Antony heard Jesus' words in church: 'Sell what you have and give to the poor.' Antony did exactly that!",
                "image_prompt": "Young Antony handing out bags of coins and goods to the poor people of his village. He looks light and free."
            },
            {
                "text": "He moved away from the noisy city. He went deep into the quiet desert. He wanted to fill his mind only with God.",
                "image_prompt": "Antony walking alone into the vast, rocky Egyptian desert. The city is far behind him. The landscape is stark and empty."
            },
            {
                "text": "Antony lived in a cave or an old fort. He prayed and sang psalms. Sometimes it was hard, but God helped him.",
                "image_prompt": "Antony praying inside a small, dim cave. A candle flickers. He looks focused and holy."
            },
            {
                "text": "Soon, other people wanted to find peace too. They followed Antony to the desert. They became the first monks.",
                "image_prompt": "A wide shot of the desert with many small caves or huts scattered around. Monks are walking or working in small gardens."
            },
            {
                "text": "These monks were like athletes for God. They trained their hearts to love. They wove baskets and prayed without ceasing.",
                "image_prompt": "A monk seated on a palm mat weaving a basket. His lips are moving in silent prayer. His face is weathered but kind."
            },
            {
                "text": "A great leader named Athanasius knew Antony. Athanasius fought for the truth that Jesus is fully God. Antony supported him.",
                "image_prompt": "Athanasius and an aged Antony embracing or talking. Athanasius is dressed as a Bishop, Antony in simple monk skins."
            },
            {
                "text": "The wisdom of the desert fathers spread all over the world. They taught us that silence can be better than speaking.",
                "image_prompt": "An ancient manuscript depicting the sayings of the Desert Fathers. A monk is copying the text in a scriptorium."
            },
            {
                "text": "Later, sad times came. Armies from Arabia brought a new religion called Islam. But the Christians of Egypt stayed true.",
                "image_prompt": "A Coptic church from the outside, with its distinct dome and cross. It stands firm amidst a changing city landscape."
            },
            {
                "text": "Today, the Coptic Christians of Egypt still pray the prayers of St. Antony. They are proud of their ancient faith.",
                "image_prompt": "Modern Coptic Christians attending a service. The priest is swinging incense. Beautiful icons of saints are on the walls."
            },
            {
                "text": "The desert is not empty. It is full of the memory of prayer.",
                "image_prompt": "A beautiful sunset over the desert. The silhouette of a monastery (like St. Catherine's or St. Antony's) is visible on a mountain."
            },
            {
                "text": "Map: The Desert Cells. This map shows the Nile Delta and the Red Sea. Small crosses mark where the monasteries were in the desert.",
                "image_prompt": "A parchment map of the Egyptian Eastern Desert. It marks 'Alexandria' and the location of 'St. Antony's Monastery'. The desert is textured like sand."
            }
        ]
    },
    {
        "slug": "07_the_cross_on_the_coin",
        "title": "The Cross on the Coin",
        "spreads": [
            {
                "text": "High in the mountains of East Africa, the Kingdom of Aksum touched the clouds. It was a rich land of trade and ivory.",
                "image_prompt": "The misty highlands of Ethiopia. The obelisks (stelae) of Aksum rise up through the mist. Lush green terraces."
            },
            {
                "text": "Aksum was powerful. It controlled the Red Sea ports. Ships from India and Rome came to buy its goods.",
                "image_prompt": "The port of Adulis on the Red Sea. Ships are being loaded with elephant tusks and gold. Diverse traders are bargaining."
            },
            {
                "text": "One day, two Christian boys from Syria, Frumentius and Aedesius, were shipwrecked. They were taken to the King's palace.",
                "image_prompt": "Two young boys standing nervously before the King of Aksum. The court is lavish, filled with gold and leopard skins."
            },
            {
                "text": "The boys were smart and kind. They helped the Queen raise her young son, Ezana, who would become the King.",
                "image_prompt": "Frumentius teaching a young Prince Ezana. They are looking at a scroll. The atmosphere is warm and mentorship-focused."
            },
            {
                "text": "Frumentius told Ezana about Jesus. When Ezana grew up and became King, he did something amazing.",
                "image_prompt": "King Ezana, now an adult, sitting on his throne deep in thought. A cross is visible in the background design."
            },
            {
                "text": "For years, the coins of Aksum showed the sun and moon gods. But Ezana changed them. He put the Cross of Christ on the coins!",
                "image_prompt": "Close up of a gold Aksumite coin. On one side, the face of Ezana. On the other, a distinct Cross. The metal glints in the light."
            },
            {
                "text": "He declared, 'I will rule by the power of the Lord of Heaven.' Aksum became one of the first Christian kingdoms in the world.",
                "image_prompt": "A public ceremony where King Ezana is proclaiming his faith. A large stone tablet with inscriptions (Greek, Sabaean, Ge'ez) stands nearby."
            },
            {
                "text": "Monks called the 'Nine Saints' came to Aksum. They built monasteries on top of steep cliffs where they were safe to pray.",
                "image_prompt": "The monastery of Debre Damo atop a flat-topped mountain (amba). Monks are climbing up a rope to get to it."
            },
            {
                "text": "They translated the Bible into Ge'ez, the language of the people. Now everyone could hear the Word of God.",
                "image_prompt": "A monk writing in a heavy, leather-bound book. He is using red and black ink to write the Ge'ez script artfully."
            },
            {
                "text": "Aksum declined later, but the faith did not die. It moved deeper into the mountains, kept safe by the people.",
                "image_prompt": "A procession of Ethiopian priests carrying ceremonial crosses and colorful umbrellas. The landscape is mountainous and green."
            },
            {
                "text": "King Ezana’s coins are small, but they tell a huge story of a King who chose the Cross.",
                "image_prompt": "A child's hand holding an ancient Aksumite coin against the backdrop of a modern Ethiopian church."
            },
            {
                "text": "Map: The Highland Kingdom. This map shows the Red Sea and the mountains of Ethiopia. Aksum is the capital in the north.",
                "image_prompt": "A parchment map of the Horn of Africa/Ethiopia. It marks 'Aksum', 'Adulis', and the 'Blue Nile'. Mountains are drawn in relief."
            }
        ]
    },
    {
        "slug": "08_the_great_trek_south",
        "title": "The Great Trek South",
        "spreads": [
            {
                "text": "A long time ago, a great adventure began. Families in West Africa started to pack up their belongings. They were moving.",
                "image_prompt": "A village scene in West Africa (near Nigeria/Cameroon). Families are packing bundles. Children are helping. There is a sense of anticipation."
            },
            {
                "text": "Why did they move? Maybe their families were growing big. Maybe they were looking for new land. We call this the Bantu Migration.",
                "image_prompt": "A wide shot of a large group of people walking through a lush forest path. Sunbeams filter through the trees. They carry baskets and tools."
            },
            {
                "text": "These travelers had a secret weapon. It wasn’t a sword—it was knowledge. They knew how to make iron and grow yams.",
                "image_prompt": "Close up of a farmer planting yams with an iron hoe. The tool looks sturdy and effective compared to stone or wood."
            },
            {
                "text": "As they moved south and east, they cut through the thick rainforests. They built canoes to paddle down the mighty Congo River.",
                "image_prompt": "People in dugout canoes navigating a wide, misty river (the Congo). The jungle is dense on both sides."
            },
            {
                "text": "They met other people who lived in the forests, the Pygmies and the Khoisan. Sometimes they fought, but often they traded and shared ideas.",
                "image_prompt": "A meeting between a Bantu group (taller, with iron spears) and a Khoisan group (smaller, with bows). They are exchanging goods cautiously."
            },
            {
                "text": "The Bantu people brought their language with them. Today, millions of people in Africa speak languages that are cousins to each other!",
                "image_prompt": "A conceptual image showing a 'tree' of languages branching out across a map of Africa. Words float in the air."
            },
            {
                "text": "They also brought their cows. In the grassy plains of the south, their herds grew huge. Cattle became their bank account.",
                "image_prompt": "A vast herd of 'Ankole' cattle (long horns) grazing on the savanna. Herders watch over them. The sky is big and blue."
            },
            {
                "text": "They built villages in circles, with the cattle in the middle to keep them safe. This was the 'kraal'.",
                "image_prompt": "An aerial view of a traditional circular African village (kraal). Huts surround a central cattle pen. Smoke rises from cooking fires."
            },
            {
                "text": "It took thousands of years, but these families walked all the way to the bottom of the continent.",
                "image_prompt": "Travelers reaching the coast of South Africa. They look out at the ocean, tired but triumphant."
            },
            {
                "text": "They filled the land with farms, iron, and songs. They are the ancestors of many of us today.",
                "image_prompt": "A happy scene of a village celebration. Drums are playing, people are dancing. Iron jewelry glints in the firelight."
            },
            {
                "text": "The Great Trek wasn't just a walk; it was the planting of a whole continent.",
                "image_prompt": "A young child planting a seed in the ground. Behind him, a vision of many future cities and nations rises."
            },
            {
                "text": "Map: The Moving Families. This map shows arrows moving from West Africa down to the South and East. It looks like a flowing river of people.",
                "image_prompt": "A parchment map of Sub-Saharan Africa. Large arrows sweep from Nigeria/Cameroon down into the Congo, East Africa, and South Africa."
            }
        ]
    },
    {
        "slug": "09_the_churches_in_the_rock",
        "title": "The Churches in the Rock",
        "spreads": [
            {
                "text": "In the hidden mountains of Ethiopia, a King was born. His name was Lalibela. Legend says bees surrounded him as a baby!",
                "image_prompt": "Baby Lalibela lying in a crib. A swarm of bees hovers gently around him, symbolizing his future greatness. His mother looks on in wonder."
            },
            {
                "text": "Lalibela grew up to be a very holy King. He wanted his people to see the holy city of Jerusalem, but the journey was too dangerous.",
                "image_prompt": "King Lalibela standing on a mountain ridge, looking towards the horizon with a longing expression. The terrain is rugged and dry."
            },
            {
                "text": "So, Lalibela had a dream. He would build a New Jerusalem right here in Ethiopia. But he wouldn't build it *up*.",
                "image_prompt": "King Lalibela asleep, having a vision. Angels are showing him blueprints of churches descending from heaven."
            },
            {
                "text": "He commanded his workers to carve the churches *down* into the solid red rock! They used hammers and chisels.",
                "image_prompt": "Workers standing on top of a flat rock surface, chiseling downwards. A trench is beginning to form. Dust flies in the air."
            },
            {
                "text": "It was hard work. But stories say that while the men worked by day, the angels worked by night to help them.",
                "image_prompt": "A night scene. The site is deserted of humans, but glowing, transparent angels are continuing the carving work on the stone."
            },
            {
                "text": "They carved eleven amazing churches. The most famous one is shaped like a perfect cross. It is called St. George's.",
                "image_prompt": "A stunning high-angle shot looking down into the cruciform (cross-shaped) pit of the Church of St. George (Bet Giyorgis). The red rock contrasts with the green moss."
            },
            {
                "text": "Inside, the churches are hollowed out, with columns and windows. It feels like standing inside a mountain.",
                "image_prompt": "Interior of a rock-hewn church. Light beams stream through cross-shaped windows. A priest is reading a Bible near a pillar."
            },
            {
                "text": "Connecting the churches are deep tunnels and trenches. It is like a secret maze dedicated to God.",
                "image_prompt": "A pilgrim walking through a narrow, high-walled stone trench connecting the churches. The sky is a strip of blue above."
            },
            {
                "text": "Europeans heard rumors of a powerful Christian King in Africa named 'Prester John'. They searched for him everywhere.",
                "image_prompt": "Medieval European mapmakers discussing a map. They point to a mythical figure of a King labeled 'Prester John' in Africa."
            },
            {
                "text": "They didn't find Prester John, but they found the faithful kings of Ethiopia, keeping the flame of Jesus alive.",
                "image_prompt": "A meeting between Portuguese explorers and an Ethiopian Emperor. Both look regal. They are exchanging gifts."
            },
            {
                "text": "King Lalibela’s churches still stand today. They are a miracle in stone.",
                "image_prompt": "A wide shot of the Lalibela complex at dawn. Pilgrims draped in white shamma cloth are gathering for prayer."
            },
            {
                "text": "Map: The Hidden City. This map shows the highlands of Lasta. It marks the 'New Jerusalem' of Lalibela.",
                "image_prompt": "A parchment map of the Ethiopian highlands. It marks 'Lalibela'. A small illustration of a cross-shaped church is on the map."
            }
        ]
    }
]

def create_book(book_data):
    slug = book_data["slug"]
    title = book_data["title"]
    spreads = book_data["spreads"]
    
    # 1. Create Directory
    dir_path = os.path.join(TARGET_DIR, slug)
    os.makedirs(dir_path, exist_ok=True)
    print(f"Created directory: {dir_path}")

    # 2. Metadata
    metadata = {
        "title": title,
        "ageRange": {
            "min": 48,
            "max": 120
        },
        "pageCount": 24,
        "summary": spreads[0]["text"] # Use first page as summary
    }
    with open(os.path.join(dir_path, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 3. Content.md
    content_lines = [f"# {title}", ""]
    for i, spread in enumerate(spreads):
        page_num = (i * 2) + 1
        content_lines.append(f"## Spread {i+1} (Pages {page_num}-{page_num+1})")
        content_lines.append("")
        content_lines.append(f"![{spread['image_prompt']}]")
        content_lines.append("")
        content_lines.append(spread["text"])
        content_lines.append("")
        content_lines.append("---")
        content_lines.append("")
        
    with open(os.path.join(dir_path, "content.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(content_lines))

    # 4. Prompts.json
    prompts = []
    for i, spread in enumerate(spreads):
        prompts.append({
            "page": (i * 2) + 1,
            "spread_index": i,
            "description": spread["image_prompt"],
            "text_content": spread["text"]
        })
        
    with open(os.path.join(dir_path, "prompts.json"), "w", encoding="utf-8") as f:
        json.dump(prompts, f, indent=2)

def main():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)
        
    for book in BOOKS_DATA:
        create_book(book)
        
    print("Successfully seeded all 9 history books!")

if __name__ == "__main__":
    main()
