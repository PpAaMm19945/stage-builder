-- Migration 0017: Seed Liturgy Content
-- Westminster Shorter Catechism Q1-10, Classic Hymns, Memory Verses

-- Westminster Shorter Catechism Q1-10 (MVP)
INSERT INTO liturgy_items (id, type, source, sequence_number, title, content, reference) VALUES
('wsc_q1', 'catechism', 'westminster_shorter', 1, 'Q1: What is the chief end of man?', 'Q: What is the chief end of man?\n\nA: Man''s chief end is to glorify God, and to enjoy him forever.', 'WSC Q1'),
('wsc_q2', 'catechism', 'westminster_shorter', 2, 'Q2: What rule hath God given?', 'Q: What rule hath God given to direct us how we may glorify and enjoy him?\n\nA: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.', 'WSC Q2'),
('wsc_q3', 'catechism', 'westminster_shorter', 3, 'Q3: What do the Scriptures principally teach?', 'Q: What do the Scriptures principally teach?\n\nA: The Scriptures principally teach what man is to believe concerning God, and what duty God requires of man.', 'WSC Q3'),
('wsc_q4', 'catechism', 'westminster_shorter', 4, 'Q4: What is God?', 'Q: What is God?\n\nA: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', 'WSC Q4'),
('wsc_q5', 'catechism', 'westminster_shorter', 5, 'Q5: Are there more Gods than one?', 'Q: Are there more Gods than one?\n\nA: There is but one only, the living and true God.', 'WSC Q5'),
('wsc_q6', 'catechism', 'westminster_shorter', 6, 'Q6: How many persons are there in the Godhead?', 'Q: How many persons are there in the Godhead?\n\nA: There are three persons in the Godhead: the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.', 'WSC Q6'),
('wsc_q7', 'catechism', 'westminster_shorter', 7, 'Q7: What are the decrees of God?', 'Q: What are the decrees of God?\n\nA: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.', 'WSC Q7'),
('wsc_q8', 'catechism', 'westminster_shorter', 8, 'Q8: How doth God execute his decrees?', 'Q: How doth God execute his decrees?\n\nA: God executeth his decrees in the works of creation and providence.', 'WSC Q8'),
('wsc_q9', 'catechism', 'westminster_shorter', 9, 'Q9: What is the work of creation?', 'Q: What is the work of creation?\n\nA: The work of creation is, God''s making all things of nothing, by the word of his power, in the space of six days, and all very good.', 'WSC Q9'),
('wsc_q10', 'catechism', 'westminster_shorter', 10, 'Q10: How did God create man?', 'Q: How did God create man?\n\nA: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.', 'WSC Q10');

-- Classic Hymns (5 for MVP)
INSERT INTO liturgy_items (id, type, source, sequence_number, title, content, reference) VALUES
('hymn_amazing_grace', 'hymn', 'classic_hymns', 1, 'Amazing Grace', 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.\n\n''Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.', 'John Newton, 1779'),
('hymn_great_is_thy', 'hymn', 'classic_hymns', 2, 'Great Is Thy Faithfulness', 'Great is Thy faithfulness, O God my Father;\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions, they fail not;\nAs Thou hast been, Thou forever will be.\n\nGreat is Thy faithfulness! Great is Thy faithfulness!\nMorning by morning new mercies I see.\nAll I have needed Thy hand hath provided;\nGreat is Thy faithfulness, Lord, unto me!', 'Thomas Chisholm, 1923'),
('hymn_be_thou_my', 'hymn', 'classic_hymns', 3, 'Be Thou My Vision', 'Be Thou my Vision, O Lord of my heart;\nNaught be all else to me, save that Thou art.\nThou my best Thought, by day or by night,\nWaking or sleeping, Thy presence my light.', 'Irish hymn, 8th century'),
('hymn_a_mighty_fortress', 'hymn', 'classic_hymns', 4, 'A Mighty Fortress Is Our God', 'A mighty fortress is our God,\nA bulwark never failing;\nOur helper He, amid the flood\nOf mortal ills prevailing:\nFor still our ancient foe\nDoth seek to work us woe;\nHis craft and pow''r are great,\nAnd, armed with cruel hate,\nOn earth is not his equal.', 'Martin Luther, 1529'),
('hymn_holy_holy_holy', 'hymn', 'classic_hymns', 5, 'Holy, Holy, Holy', 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy, merciful and mighty!\nGod in three Persons, blessèd Trinity!', 'Reginald Heber, 1826');

-- Memory Verses (5 for MVP)
INSERT INTO liturgy_items (id, type, source, sequence_number, title, content, reference) VALUES
('verse_gen_1_1', 'scripture', 'esv', 1, 'Genesis 1:1', 'In the beginning, God created the heavens and the earth.', 'Genesis 1:1 ESV'),
('verse_john_3_16', 'scripture', 'esv', 2, 'John 3:16', 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.', 'John 3:16 ESV'),
('verse_prov_3_5', 'scripture', 'esv', 3, 'Proverbs 3:5-6', 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.', 'Proverbs 3:5-6 ESV'),
('verse_psalm_23_1', 'scripture', 'esv', 4, 'Psalm 23:1-3', 'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.', 'Psalm 23:1-3 ESV'),
('verse_rom_8_28', 'scripture', 'esv', 5, 'Romans 8:28', 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.', 'Romans 8:28 ESV');