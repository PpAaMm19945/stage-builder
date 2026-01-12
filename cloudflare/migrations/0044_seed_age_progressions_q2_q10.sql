-- Migration 0044: Seed Age Progressions Q2-Q10
-- Provides 5 stages of depth for WSC Q2-Q10 (Skipping Q4 as per request).
-- Stages: Seedling (0-3), Sprout (4-6), Sapling (7-10), Tree (11-14), Oak (15-18).

INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES

-- Q2: Rule of Direction (The Bible)
('wsc_q2_seedling', 'wsc_q2', 'seedling', 'God speaks to us', 'God gave us the Bible to teach us.', 'The Bible is God''s Word.', 'Hold the Bible. Kiss it. Show it is special. God speaks here.'),
('wsc_q2_sprout', 'wsc_q2', 'sprout', 'What rule did God give?', 'Q: How do we know how to love God?\nA: God gave us the Bible.', 'The Bible is the only rule.', 'Explain "Rule" means a straight line—the Bible keeps us straight.'),
('wsc_q2_sapling', 'wsc_q2', 'sapling', 'The Word of God', 'Q: What rule hath God given to direct us how we may glorify and enjoy him?\nA: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.', 'The Word of God is the only rule.', 'Focus on "Old and New Testaments" as the two parts of one book.'),
('wsc_q2_tree', 'wsc_q2', 'tree', 'Q2: Rule of Direction', 'Q: What rule hath God given to direct us how we may glorify and enjoy him?\nA: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.', 'Scripture is the only rule.', 'Discuss Sola Scriptura: Tradition is helpful, but Scripture is King.'),
('wsc_q2_oak', 'wsc_q2', 'oak', 'Q2: Authority of Scripture', 'Q: What rule hath God given to direct us how we may glorify and enjoy him?\nA: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.\n(2 Tim 3:16, Eph 2:20)', 'The Bible is our final authority.', 'Apologetics: Why do we trust the Bible? It validates itself and carries God''s authority.'),

-- Q3: Principal Teaching (Faith & Obedience)
('wsc_q3_seedling', 'wsc_q3', 'seedling', 'Believe and Obey', 'The Bible teaches us to love God and obey Him.', 'Believe God and Obey God.', 'Two hands: One for Believing (Heart), One for Obeying (Actions).'),
('wsc_q3_sprout', 'wsc_q3', 'sprout', 'What does the Bible teach?', 'Q: What does the Bible teach us?\nA: What to believe about God and what God wants us to do.', 'Faith and Duty.', 'The Bible isn''t just stories; it tells us who God is and how to live.'),
('wsc_q3_sapling', 'wsc_q3', 'sapling', 'Faith and Duty', 'Q: What do the scriptures principally teach?\nA: The scriptures principally teach what man is to believe concerning God, and what duty God requires of man.', 'Believe concerning God, Duty required.', 'Define "Principally" = Mainly. "Duty" = Responsibility.'),
('wsc_q3_tree', 'wsc_q3', 'tree', 'Q3: Principal Teaching', 'Q: What do the scriptures principally teach?\nA: The scriptures principally teach what man is to believe concerning God, and what duty God requires of man.', 'Faith and Obedience.', 'Doctrine leads to Doxology (Worship) and Duty (Life).'),
('wsc_q3_oak', 'wsc_q3', 'oak', 'Q3: Scope of Scripture', 'Q: What do the scriptures principally teach?\nA: The scriptures principally teach what man is to believe concerning God, and what duty God requires of man.\n(2 Tim 1:13)', 'Faith and Life.', 'Apologetics: The Bible is sufficient for faith and practice. We don''t need new revelations.'),

-- Q5: One God (Monotheism)
('wsc_q5_seedling', 'wsc_q5', 'seedling', 'One True God', 'There is only one true God.', 'One God.', 'Show one finger. "How many Gods? One!"'),
('wsc_q5_sprout', 'wsc_q5', 'sprout', 'Are there more Gods?', 'Q: Are there more Gods than one?\nA: No, there is only one living and true God.', 'One living and true God.', 'Contrast with idols (statues that can''t see/hear).'),
('wsc_q5_sapling', 'wsc_q5', 'sapling', 'The Living and True God', 'Q: Are there more Gods than one?\nA: There is but one only, the living and true God.', 'One only, living and true.', 'Define "Living" (Active, alive) vs "Dead" idols.'),
('wsc_q5_tree', 'wsc_q5', 'tree', 'Q5: Monotheism', 'Q: Are there more Gods than one?\nA: There is but one only, the living and true God.', 'God is One.', 'Discuss how the world has many "gods" (money, fame), but only One is essential.'),
('wsc_q5_oak', 'wsc_q5', 'oak', 'Q5: Uniqueness of God', 'Q: Are there more Gods than one?\nA: There is but one only, the living and true God.\n(Deut 6:4, Jer 10:10)', 'The Lord our God is one.', 'Apologetics: The logic of Monotheism. There can only be one Supreme Being.'),

-- Q6: The Trinity
('wsc_q6_seedling', 'wsc_q6', 'seedling', 'Three in One', 'God is Father, Son, and Holy Spirit.', 'Father, Son, Holy Spirit.', 'Use a shamrock or triangle analogy if helpful, or just list the Names.'),
('wsc_q6_sprout', 'wsc_q6', 'sprout', 'How many persons?', 'Q: How many persons are in God?\nA: Three: The Father, the Son, and the Holy Spirit.', 'Three Persons, One God.', 'They are not three gods, but three persons in one God.'),
('wsc_q6_sapling', 'wsc_q6', 'sapling', 'The Godhead', 'Q: How many persons are there in the Godhead?\nA: There are three persons in the Godhead; the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.', 'Same substance, equal power.', 'Define "Godhead" (Divinity) and "Substance" (Essence).'),
('wsc_q6_tree', 'wsc_q6', 'tree', 'Q6: The Trinity', 'Q: How many persons are there in the Godhead?\nA: There are three persons in the Godhead; the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.', 'Three Persons, One God.', 'Mystery of the Trinity: Distinct persons, same essence. Not 1+1+1=3, but 1x1x1=1.'),
('wsc_q6_oak', 'wsc_q6', 'oak', 'Q6: Trinitarian Theology', 'Q: How many persons are there in the Godhead?\nA: There are three persons in the Godhead; the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.\n(Matt 28:19, 1 John 5:7)', 'Equal in power and glory.', 'Apologetics: Defending the Trinity against modalism (masks) or tritheism (three gods).'),

-- Q7: The Decrees (God's Plan)
('wsc_q7_seedling', 'wsc_q7', 'seedling', 'God''s Plan', 'God planned everything before He made the world.', 'God has a plan.', 'God is never surprised. He knows the end from the beginning.'),
('wsc_q7_sprout', 'wsc_q7', 'sprout', 'Does God have a plan?', 'Q: Does God have a plan?\nA: Yes, God planned everything that happens for His glory.', 'For His own glory.', 'Why did God make a plan? To show how great He is.'),
('wsc_q7_sapling', 'wsc_q7', 'sapling', 'God''s Decrees', 'Q: What are the decrees of God?\nA: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.', 'He hath foreordained whatsoever comes to pass.', 'Vocabulary: "Decree" (Law/Order), "Foreordained" (Ordered beforehand).'),
('wsc_q7_tree', 'wsc_q7', 'tree', 'Q7: Eternal Purpose', 'Q: What are the decrees of God?\nA: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.', 'God''s purpose stands.', 'God is Sovereign. Nothing happens by accident.'),
('wsc_q7_oak', 'wsc_q7', 'oak', 'Q7: Sovereignty', 'Q: What are the decrees of God?\nA: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.\n(Eph 1:11, Rom 11:36)', 'According to His will.', 'Apologetics: How Sovereignty relates to human responsibility. God is King, we are responsible subjects.'),

-- Q8: Execution of Decrees (Creation & Providence)
('wsc_q8_seedling', 'wsc_q8', 'seedling', 'God Does It', 'God makes His plan happen.', 'God does His plan.', 'God didn''t just make a plan and leave; He is working right now.'),
('wsc_q8_sprout', 'wsc_q8', 'sprout', 'How does God do it?', 'Q: How does God do His plan?\nA: By making everything and taking care of everything.', 'Creation and Providence.', 'Creation = Making. Providence = Taking Care/Ruling.'),
('wsc_q8_sapling', 'wsc_q8', 'sapling', 'Executing Decrees', 'Q: How doth God execute his decrees?\nA: God executeth his decrees in the works of creation and providence.', 'Creation and Providence.', 'Two ways God works: Making the stage (Creation) and directing the play (Providence).'),
('wsc_q8_tree', 'wsc_q8', 'tree', 'Q8: Making and Keeping', 'Q: How doth God execute his decrees?\nA: God executeth his decrees in the works of creation and providence.', 'Works of Creation and Providence.', 'Distinguish between God''s singular act (Creation) and continuous act (Providence).'),
('wsc_q8_oak', 'wsc_q8', 'oak', 'Q8: God in History', 'Q: How doth God execute his decrees?\nA: God executeth his decrees in the works of creation and providence.\n(Rev 4:11, Dan 4:35)', 'He executes His decrees.', 'Apologetics: History is not random. It is "His Story".'),

-- Q9: Creation
('wsc_q9_seedling', 'wsc_q9', 'seedling', 'God Made the World', 'God made the whole world from nothing.', 'God made everything.', 'Look at the sky, trees, hands. God made them all.'),
('wsc_q9_sprout', 'wsc_q9', 'sprout', 'What is Creation?', 'Q: What is the work of creation?\nA: God made all things of nothing, very good.', 'Out of nothing.', 'Imagine making a cookie without ingredients. Only God can do that.'),
('wsc_q9_sapling', 'wsc_q9', 'sapling', 'Six Days', 'Q: What is the work of creation?\nA: The work of creation is, God''s making all things of nothing, by the word of his power, in the space of six days, and all very good.', 'By the word of His power.', 'He spoke, and it happened. "Let there be light."'),
('wsc_q9_tree', 'wsc_q9', 'tree', 'Q9: Work of Creation', 'Q: What is the work of creation?\nA: The work of creation is, God''s making all things of nothing, by the word of his power, in the space of six days, and all very good.', 'All very good.', 'Creation was perfect originally. Sin messed it up later.'),
('wsc_q9_oak', 'wsc_q9', 'oak', 'Q9: Ex Nihilo', 'Q: What is the work of creation?\nA: The work of creation is, God''s making all things of nothing, by the word of his power, in the space of six days, and all very good.\n(Gen 1:1, Heb 11:3)', 'Space of six days.', 'Apologetics: "Creatio Ex Nihilo" (Creation out of nothing). Matter is not eternal; only God is.'),

-- Q10: Creation of Man
('wsc_q10_seedling', 'wsc_q10', 'seedling', 'God Made Me', 'God made people special.', 'God made me special.', 'You are not an accident. God made you to love Him.'),
('wsc_q10_sprout', 'wsc_q10', 'sprout', 'How did God make man?', 'Q: How did God create man?\nA: Male and female, in His own image.', 'Male and female.', 'Boys and girls are both made to look like God in their hearts.'),
('wsc_q10_sapling', 'wsc_q10', 'sapling', 'Image of God', 'Q: How did God create man?\nA: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.', 'Knowledge, righteousness, holiness.', 'We were made smart, good, and holy—like a mirror of God.'),
('wsc_q10_tree', 'wsc_q10', 'tree', 'Q10: Man''s Creation', 'Q: How did God create man?\nA: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.', 'Dominion over creatures.', 'Stewardship: We are kings and queens of creation, under God.'),
('wsc_q10_oak', 'wsc_q10', 'oak', 'Q10: Imago Dei', 'Q: How did God create man?\nA: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.\n(Gen 1:26-27, Col 3:10)', 'Image of God.', 'Apologetics: Human dignity comes from being made in God''s image. This is why racism/murder are wrong.');
