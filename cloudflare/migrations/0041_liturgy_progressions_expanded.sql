-- Migration 0041: Liturgy Progressions for WSC Q11-Q20
-- Age-scaled simplifications for the WSC questions about Providence, Fall, and Redemption

-- ============================================================================
-- WSC Q11: Providence
-- ============================================================================
INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES

('wsc_q11_seedling', 'wsc_q11', 'seedling',
  'Who takes care of us?',
  'God takes care of everything. He takes care of you.',
  'God takes care of me.',
  'Point to things: the sun, your food, your bed. "Who gives us these? God takes care of us."'),

('wsc_q11_sprout', 'wsc_q11', 'sprout',
  'How does God take care of the world?',
  'Q: How does God take care of the world?\nA: God keeps everything going and watches over all things.',
  'God keeps everything going.',
  'Use examples: the seasons, animals finding food, our hearts beating. All God''s care.'),

('wsc_q11_sapling', 'wsc_q11', 'sapling',
  'Q11: What is God''s providence?',
  'Q: What are God''s works of providence?\nA: God''s works of providence are his holy, wise, and powerful preserving and governing of all his creatures and all their actions.',
  'God preserves and governs all his creatures.',
  'Discuss: God doesn''t just make things—He keeps them going. Compare to a gardener who waters daily.'),

('wsc_q11_tree', 'wsc_q11', 'tree',
  'Q11: Providence',
  'Q: What are God''s works of providence?\nA: God''s works of providence are, his most holy, wise, and powerful preserving and governing all his creatures, and all their actions.\n\nScripture: Psalm 145:17, Psalm 104:24, Hebrews 1:3',
  'God''s works of providence are his most holy, wise, and powerful preserving and governing all his creatures, and all their actions.',
  'Key attributes: holy (pure motives), wise (perfect plan), powerful (nothing can stop Him). Discuss how providence comforts us.'),

('wsc_q11_oak', 'wsc_q11', 'oak',
  'Q11: Providence',
  'Q: What are God''s works of providence?\nA: God''s works of providence are, his most holy, wise, and powerful preserving and governing all his creatures, and all their actions.\n\nScripture Proofs:\n- Ps 145:17: "The LORD is righteous in all his ways and kind in all his works."\n- Heb 1:3: "He upholds the universe by the word of his power."\n- Dan 4:35: "He does according to his will among the host of heaven."\n\nApologetic Note: This refutes Deism (God made but abandoned the world) and randomness (things happen by chance). God actively sustains and governs every atom.',
  'God''s works of providence are his most holy, wise, and powerful preserving and governing all his creatures, and all their actions.',
  'Essay: How does belief in providence differ from fatalism? How does it provide hope in suffering?');

-- ============================================================================
-- WSC Q14: What is Sin?
-- ============================================================================
INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES

('wsc_q14_seedling', 'wsc_q14', 'seedling',
  'What is wrong?',
  'When we don''t obey God, that is wrong. God is good. Disobeying Him is bad.',
  'Disobeying God is wrong.',
  'Use simple examples: when mama says "come" and you don''t come—that''s disobedient. When God says "love," and we don''t love—that''s sin.'),

('wsc_q14_sprout', 'wsc_q14', 'sprout',
  'What is sin?',
  'Q: What is sin?\nA: Sin is not doing what God says, or doing what God says not to do.',
  'Sin is disobeying God.',
  'Two parts: NOT doing good (being lazy, not sharing) and DOING bad (hitting, lying). Both are sin.'),

('wsc_q14_sapling', 'wsc_q14', 'sapling',
  'Q14: What is sin?',
  'Q: What is sin?\nA: Sin is any want of conformity unto, or transgression of, the law of God.',
  'Sin is any want of conformity unto, or transgression of, the law of God.',
  'Define: "want of conformity" = not measuring up to God''s standard. "Transgression" = crossing the line. Sins of omission AND commission.'),

('wsc_q14_tree', 'wsc_q14', 'tree',
  'Q14: What is sin?',
  'Q: What is sin?\nA: Sin is any want of conformity unto, or transgression of, the law of God.\n\nScripture: 1 John 3:4, Romans 3:23, James 4:17',
  'Sin is any want of conformity unto, or transgression of, the law of God.',
  'Discuss: Why is sin defined by God''s law, not society''s standards? What makes something truly wrong?'),

('wsc_q14_oak', 'wsc_q14', 'oak',
  'Q14: What is sin?',
  'Q: What is sin?\nA: Sin is any want of conformity unto, or transgression of, the law of God.\n\nScripture Proofs:\n- 1 John 3:4: "Everyone who makes a practice of sinning also practices lawlessness; sin is lawlessness."\n- Rom 3:23: "For all have sinned and fall short of the glory of God."\n- James 4:17: "Whoever knows the right thing to do and fails to do it, for him it is sin."\n\nApologetic Note: This refutes moral relativism. Sin is not "what society disapproves of" but what God''s eternal law forbids. Without God as the standard, there is no real "wrong."',
  'Sin is any want of conformity unto, or transgression of, the law of God.',
  'Debate topic: Can there be objective morality without God? How does the catechism''s definition answer the question "why is X wrong?"');

-- ============================================================================
-- WSC Q20: The Covenant of Grace (The Gospel!)
-- ============================================================================
INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES

('wsc_q20_seedling', 'wsc_q20', 'seedling',
  'Did God save us?',
  'Yes! God sent Jesus to save us because He loves us.',
  'God sent Jesus to save us.',
  'This is the GOOD NEWS! Smile, hug, celebrate. "Even when we were bad, God loved us and sent Jesus!"'),

('wsc_q20_sprout', 'wsc_q20', 'sprout',
  'Did God leave us lost?',
  'Q: Did God leave everyone lost in sin?\nA: No! God promised to save His people. He sent Jesus to rescue us.',
  'God promised to send Jesus to rescue us.',
  'Tell the story arc: God made us, we disobeyed, but God didn''t give up. He promised a Savior from the very beginning!'),

('wsc_q20_sapling', 'wsc_q20', 'sapling',
  'Q20: The Covenant of Grace',
  'Q: Did God leave all mankind to perish in sin?\nA: No. Out of His love, God chose some people to be saved. He made a covenant of grace to save them through a Redeemer.',
  'God made a covenant of grace to save us through a Redeemer.',
  'Explain covenant: a promise God keeps no matter what. Unlike our broken promises, God always keeps His word.'),

('wsc_q20_tree', 'wsc_q20', 'tree',
  'Q20: The Covenant of Grace',
  'Q: Did God leave all mankind to perish in the estate of sin and misery?\nA: God having, out of his mere good pleasure, from all eternity, elected some to everlasting life, did enter into a covenant of grace, to deliver them out of the estate of sin and misery, and to bring them into an estate of salvation by a Redeemer.\n\nScripture: Ephesians 1:4, Romans 9:11-13, Genesis 3:15',
  'God entered into a covenant of grace to deliver us by a Redeemer.',
  'Key phrase: "mere good pleasure" = God didn''t have to save anyone. It was pure grace. Discuss election with humility, not pride.'),

('wsc_q20_oak', 'wsc_q20', 'oak',
  'Q20: The Covenant of Grace',
  'Q: Did God leave all mankind to perish in the estate of sin and misery?\nA: God having, out of his mere good pleasure, from all eternity, elected some to everlasting life, did enter into a covenant of grace, to deliver them out of the estate of sin and misery, and to bring them into an estate of salvation by a Redeemer.\n\nScripture Proofs:\n- Eph 1:4: "He chose us in him before the foundation of the world."\n- Gen 3:15: The first gospel promise—the seed of the woman will crush the serpent.\n- Rom 9:11-13: Election is based on God''s purpose, not human merit.\n\nApologetic Note: This teaches unconditional election while preserving human responsibility. The covenant is unilateral (God makes and keeps it) but includes means (faith, repentance). Discuss: How is election a comfort, not a source of anxiety?',
  'God entered into a covenant of grace to deliver us by a Redeemer.',
  'Essay: How does the covenant of grace in Genesis 3:15 unfold through Abraham, Moses, David, and finally Christ?');

-- ============================================================================
-- WSC Q21: Who is the Redeemer? (Jesus Christ!)
-- ============================================================================
INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES

('wsc_q21_seedling', 'wsc_q21', 'seedling',
  'Who saves us?',
  'Jesus saves us! Jesus is God''s Son. He became a man to rescue us.',
  'Jesus saves us!',
  'Say His name with love. Let them know Jesus is real, Jesus is alive, Jesus loves them.'),

('wsc_q21_sprout', 'wsc_q21', 'sprout',
  'Who is our Savior?',
  'Q: Who is our Savior?\nA: Our Savior is the Lord Jesus Christ. He is God''s Son who became a man to save us.',
  'Jesus is God''s Son who became a man to save us.',
  'Two truths: Jesus is God (He has always existed) AND Jesus became a man (He was born as a baby). Both are amazing!'),

('wsc_q21_sapling', 'wsc_q21', 'sapling',
  'Q21: Who is the Redeemer?',
  'Q: Who is the Redeemer of God''s elect?\nA: The only Redeemer is the Lord Jesus Christ. He is the eternal Son of God who became man. He is both God and man in one person, forever.',
  'The only Redeemer is the Lord Jesus Christ, God and man in one person forever.',
  'Key truth: Jesus didn''t stop being God when He became man. He is 100% God AND 100% man—not half and half.'),

('wsc_q21_tree', 'wsc_q21', 'tree',
  'Q21: Who is the Redeemer?',
  'Q: Who is the Redeemer of God''s elect?\nA: The only Redeemer of God''s elect is the Lord Jesus Christ, who, being the eternal Son of God, became man, and so was, and continueth to be, God and man in two distinct natures, and one person, forever.\n\nScripture: 1 Timothy 2:5, John 1:14, Galatians 4:4-5',
  'The only Redeemer of God''s elect is the Lord Jesus Christ.',
  'Important: "two distinct natures"—not mixed together. "one person"—not two persons. The Chalcedonian Definition. Why this matters: only a God-man could save us.'),

('wsc_q21_oak', 'wsc_q21', 'oak',
  'Q21: Who is the Redeemer?',
  'Q: Who is the Redeemer of God''s elect?\nA: The only Redeemer of God''s elect is the Lord Jesus Christ, who, being the eternal Son of God, became man, and so was, and continueth to be, God and man in two distinct natures, and one person, forever.\n\nScripture Proofs:\n- 1 Tim 2:5: "There is one mediator between God and men, the man Christ Jesus."\n- John 1:14: "The Word became flesh and dwelt among us."\n- Heb 7:24-25: "He holds his priesthood permanently... he always lives to make intercession."\n\nApologetic Note: This refutes: (1) Arianism—Jesus is truly God, not a created being; (2) Docetism—Jesus had a real human body; (3) Nestorianism—Jesus is one person, not two. Only a divine-human mediator can bridge the infinite gap between God and sinful man.',
  'The only Redeemer of God''s elect is the Lord Jesus Christ, God and man in two distinct natures, one person, forever.',
  'Research: How did the Council of Chalcedon (451 AD) settle the debates about Christ''s nature?');
