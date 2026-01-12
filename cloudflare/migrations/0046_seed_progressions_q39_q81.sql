-- Migration 0046: Seed Age Progressions Q39-Q81
-- Covers The Moral Law and Ten Commandments (Q39-Q81)
-- Stages: Seedling (0-3), Sprout (4-6), Sapling (7-10), Tree (11-14), Oak (15-18).

INSERT INTO liturgy_progressions (id, base_item_id, stage, simplified_title, simplified_content, memory_portion, parent_teaching_note) VALUES

-- Q39: Duty of Man
('wsc_q39_seedling', 'wsc_q39', 'seedling', 'What does God want?', 'God wants us to obey Him.', 'Obey God.', 'Simple instruction: God gives us rules because He loves us.'),
('wsc_q39_sprout', 'wsc_q39', 'sprout', 'What is our duty?', 'Q: What does God want from us?\nA: God wants us to obey His Word.', 'Obey God''s Word.', 'Connect to daily obedience: listening to parents, sharing toys.'),
('wsc_q39_sapling', 'wsc_q39', 'sapling', 'Duty to God', 'Q: What is the duty which God requireth of man?\nA: The duty which God requireth of man, is obedience to his revealed will.', 'Obedience to His revealed will.', 'Duty = What we must do. Revealed will = The Bible.'),
('wsc_q39_tree', 'wsc_q39', 'tree', 'Q39: Duty of Man', 'Q: What is the duty which God requireth of man?\nA: The duty which God requireth of man, is obedience to his revealed will.', 'Obedience to His revealed will.', 'Discuss how we know what God wants (The Bible vs. Feelings).'),
('wsc_q39_oak', 'wsc_q39', 'oak', 'Q39: Biblical Ethics', 'Q: What is the duty which God requireth of man?\nA: The duty which God requireth of man, is obedience to his revealed will.\n(Micah 6:8, 1 Sam 15:22)', 'Obedience is better than sacrifice.', 'Apologetics: Divine Command Theory. Good is what God says is good.'),

-- Q40: Rule of Obedience
('wsc_q40_seedling', 'wsc_q40', 'seedling', 'God''s Rules', 'The Bible tells us God''s rules.', 'The Bible has rules.', 'Hold up a Bible. "This book tells us how to be good."'),
('wsc_q40_sprout', 'wsc_q40', 'sprout', 'Where are the rules?', 'Q: Where do we find God''s rules?\nA: In the Bible.', 'The Moral Law.', 'The Bible is our rule book for life.'),
('wsc_q40_sapling', 'wsc_q40', 'sapling', 'The Moral Law', 'Q: What did God at first reveal to man for the rule of his obedience?\nA: The rule which God at first revealed to man for his obedience, was the moral law.', 'The Moral Law.', 'Moral Law = Rules for what is right and wrong that never change.'),
('wsc_q40_tree', 'wsc_q40', 'tree', 'Q40: First Rule', 'Q: What did God at first reveal to man for the rule of his obedience?\nA: The rule which God at first revealed to man for his obedience, was the moral law.', 'Revealed the moral law.', 'Written on Adam''s heart, then on stone tablets.'),
('wsc_q40_oak', 'wsc_q40', 'oak', 'Q40: Natural Law', 'Q: What did God at first reveal to man for the rule of his obedience?\nA: The rule which God at first revealed to man for his obedience, was the moral law.\n(Rom 2:14-15)', 'Moral Law.', 'Apologetics: Natural Law. Even people who don''t know the Bible know murder is wrong because God wrote it on their hearts.'),

-- Q41: Moral Law Summary (Ten Commandments)
('wsc_q41_seedling', 'wsc_q41', 'seedling', 'Ten Rules', 'God gave us Ten Commandments.', 'Ten Commandments.', 'Count to ten on fingers. "God gave 10 special rules."'),
('wsc_q41_sprout', 'wsc_q41', 'sprout', 'What are the rules called?', 'Q: What is the Moral Law usually called?\nA: The Ten Commandments.', 'The Ten Commandments.', 'Show a picture of stone tablets.'),
('wsc_q41_sapling', 'wsc_q41', 'sapling', 'Summarized Law', 'Q: Where is the moral law summarily comprehended?\nA: The moral law is summarily comprehended in the ten commandments.', 'Summarily comprehended.', 'Comprehended = Contained/Held. Summary = Short version.'),
('wsc_q41_tree', 'wsc_q41', 'tree', 'Q41: Ten Commandments', 'Q: Where is the moral law summarily comprehended?\nA: The moral law is summarily comprehended in the ten commandments.', 'Ten Commandments.', 'Found in Exodus 20 and Deuteronomy 5.'),
('wsc_q41_oak', 'wsc_q41', 'oak', 'Q41: The Decalogue', 'Q: Where is the moral law summarily comprehended?\nA: The moral law is summarily comprehended in the ten commandments.\n(Deut 10:4)', 'The Decalogue.', 'Background: "Deca" = 10, "Logos" = Words. The Ten Words.'),

-- Q42: Sum of the Commandments
('wsc_q42_seedling', 'wsc_q42', 'seedling', 'Love God, Love People', 'Love God and Love Others.', 'Love God. Love People.', 'The two biggest rules. Hug yourself (Love God), extend hands (Love People).'),
('wsc_q42_sprout', 'wsc_q42', 'sprout', 'The Great Commandment', 'Q: What is the sum of the Ten Commandments?\nA: To love God with all our heart and our neighbor as ourselves.', 'Love God, Love Neighbor.', 'If you love God, you won''t hurt people.'),
('wsc_q42_sapling', 'wsc_q42', 'sapling', 'Core Duty', 'Q: What is the sum of the ten commandments?\nA: The sum of the ten commandments is, to love the Lord our God with all our heart, with all our soul, with all our strength, and with all our mind; and our neighbor as ourselves.', 'Love God ... and neighbor.', 'Vertical (God) and Horizontal (Neighbor) relationships.'),
('wsc_q42_tree', 'wsc_q42', 'tree', 'Q42: Summary of Law', 'Q: What is the sum of the ten commandments?\nA: The sum of the ten commandments is, to love the Lord our God with all our heart, with all our soul, with all our strength, and with all our mind; and our neighbor as ourselves.', 'All heart, soul, strength, mind.', 'Total devotion required. Not half-hearted.'),
('wsc_q42_oak', 'wsc_q42', 'oak', 'Q42: Love Fulfills Law', 'Q: What is the sum of the ten commandments?\nA: The sum of the ten commandments is, to love the Lord our God with all our heart, with all our soul, with all our strength, and with all our mind; and our neighbor as ourselves.\n(Matt 22:37-40)', 'On these two hang all the law.', 'Theology: Law is not opposed to Love; Law defines what Love looks like.'),

-- Q43: Preface to the Commandments
('wsc_q43_seedling', 'wsc_q43', 'seedling', 'God is King', 'I am the Lord your God.', 'I am the Lord.', 'God introduces Himself before giving rules.'),
('wsc_q43_sprout', 'wsc_q43', 'sprout', 'Who gives the rules?', 'Q: Who gave the Ten Commandments?\nA: The Lord our God, who saved His people.', 'I am the Lord thy God.', 'God reminds us He saved us before He tells us what to do.'),
('wsc_q43_sapling', 'wsc_q43', 'sapling', 'The Preface', 'Q: What is the preface to the ten commandments?\nA: The preface to the ten commandments is in these words, I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.', 'House of bondage.', 'Bondage = Slavery. God is the Liberator.'),
('wsc_q43_tree', 'wsc_q43', 'tree', 'Q43: The Intro', 'Q: What is the preface to the ten commandments?\nA: The preface to the ten commandments is in these words, I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.', 'I am the Lord thy God.', 'Covenant formula: "I will be your God, you will be my people."'),
('wsc_q43_oak', 'wsc_q43', 'oak', 'Q43: Redemptive Context', 'Q: What is the preface to the ten commandments?\nA: The preface to the ten commandments is in these words, I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.\n(Ex 20:2)', 'Brought thee out of Egypt.', 'Context: Grace precedes Law. We obey because we are saved, not to get saved.'),

-- Q44: Meaning of the Preface
('wsc_q44_seedling', 'wsc_q44', 'seedling', 'Because He Saved Us', 'We obey God because He loves us.', 'Obey because He loves.', 'Why do we listen to Daddy? Because he takes care of us.'),
('wsc_q44_sprout', 'wsc_q44', 'sprout', 'Why obey?', 'Q: Why should we obey God''s rules?\nA: Because He is our God and He saved us.', 'He is the Lord our God.', 'God isn''t a stranger; He is OUR God.'),
('wsc_q44_sapling', 'wsc_q44', 'sapling', 'Obligation to Obey', 'Q: What doth the preface to the ten commandments teach us?\nA: The preface to the ten commandments teacheth us, that because God is the Lord, and our God, and redeemer, therefore we are bound to keep all his commandments.', 'Bound to keep all.', 'Bound = Tied/Required. Redeemer = Savior (Buyer back).'),
('wsc_q44_tree', 'wsc_q44', 'tree', 'Q44: Motivation', 'Q: What doth the preface to the ten commandments teach us?\nA: The preface to the ten commandments teacheth us, that because God is the Lord, and our God, and redeemer, therefore we are bound to keep all his commandments.', 'God is the Lord, and our God.', 'Motivation for obedience is gratitude, not fear.'),
('wsc_q44_oak', 'wsc_q44', 'oak', 'Q44: Gospel Motivation', 'Q: What doth the preface to the ten commandments teach us?\nA: The preface to the ten commandments teacheth us, that because God is the Lord, and our God, and redeemer, therefore we are bound to keep all his commandments.\n(Luke 1:74-75)', 'Bound to keep.', 'Ethics: Indicative (What God did) leads to Imperative (What we must do).'),

-- Q45: First Commandment
('wsc_q45_seedling', 'wsc_q45', 'seedling', 'Rule 1: God is First', 'God is Number One.', 'No other gods.', 'Hold up 1 finger. God is first. Nothing else comes before Him.'),
('wsc_q45_sprout', 'wsc_q45', 'sprout', 'The First Commandment', 'Q: What is the first commandment?\nA: Thou shalt have no other gods before me.', 'No other gods before me.', 'Don''t love toys or TV more than God.'),
('wsc_q45_sapling', 'wsc_q45', 'sapling', 'No Other Gods', 'Q: What is the first commandment?\nA: The first commandment is, Thou shalt have no other gods before me.', 'Thou shalt have no other gods.', 'What is a "god"? Anything we trust or love more than the true God.'),
('wsc_q45_tree', 'wsc_q45', 'tree', 'Q45: Commandment 1', 'Q: What is the first commandment?\nA: The first commandment is, Thou shalt have no other gods before me.', 'Before me.', 'In God''s sight. He sees who we truly worship.'),
('wsc_q45_oak', 'wsc_q45', 'oak', 'Q45: Exclusive Worship', 'Q: What is the first commandment?\nA: The first commandment is, Thou shalt have no other gods before me.\n(Ex 20:3)', 'No other gods.', 'Apologetics: Polytheism vs. Monotheism. God tolerates no rivals.'),

-- Q46: Required (1st Cmd)
('wsc_q46_seedling', 'wsc_q46', 'seedling', 'Know God', 'We must know God and love Him.', 'Know God. Love God.', 'To put God first, we have to know who He is.'),
('wsc_q46_sprout', 'wsc_q46', 'sprout', 'What does God want first?', 'Q: What does the first commandment require?\nA: That we know God and worship Him only.', 'Worship Him only.', 'Worship means giving God the best place in our heart.'),
('wsc_q46_sapling', 'wsc_q46', 'sapling', 'Knowing and Acknowledging', 'Q: What is required in the first commandment?\nA: The first commandment requireth us to know and acknowledge God to be the only true God, and our God; and to worship and glorify him accordingly.', 'Know and acknowledge God.', 'Acknowledge = Admit/Confess. He is THE God and OUR God.'),
('wsc_q46_tree', 'wsc_q46', 'tree', 'Q46: Requirements of First', 'Q: What is required in the first commandment?\nA: The first commandment requireth us to know and acknowledge God to be the only true God, and our God; and to worship and glorify him accordingly.', 'Worship and glorify him.', 'Includes private prayer and public worship.'),
('wsc_q46_oak', 'wsc_q46', 'oak', 'Q46: Duty to God', 'Q: What is required in the first commandment?\nA: The first commandment requireth us to know and acknowledge God to be the only true God, and our God; and to worship and glorify him accordingly.\n(1 Chron 28:9)', 'Only true God.', 'Theology: We must worship the correct God (Orthodoxy) correctly (Orthopraxy).'),

-- Q47: Forbidden (1st Cmd)
('wsc_q47_seedling', 'wsc_q47', 'seedling', 'Don''t Forget God', 'Do not forget God.', 'Don''t forget God.', 'It is bad to live like God isn''t there.'),
('wsc_q47_sprout', 'wsc_q47', 'sprout', 'What does God forbid?', 'Q: What does the first commandment forbid?\nA: Denying God or worshiping anyone else.', 'Denying God.', 'Atheists say "No God." Idolaters say "Other gods." Both are wrong.'),
('wsc_q47_sapling', 'wsc_q47', 'sapling', 'Atheism and Idolatry', 'Q: What is forbidden in the first commandment?\nA: The first commandment forbiddeth the denying, or not worshiping and glorifying the true God as God, and our God; and the giving of that worship and glory to any other, which is due to him alone.', 'Giving glory to any other.', 'Idolatry is giving God''s mail to someone else.'),
('wsc_q47_tree', 'wsc_q47', 'tree', 'Q47: Prohibitions of First', 'Q: What is forbidden in the first commandment?\nA: The first commandment forbiddeth the denying, or not worshiping and glorifying the true God as God, and our God; and the giving of that worship and glory to any other, which is due to him alone.', 'Denying the true God.', 'Practical Atheism: Living as if God doesn''t exist, even if you say you believe.'),
('wsc_q47_oak', 'wsc_q47', 'oak', 'Q47: Idolatry', 'Q: What is forbidden in the first commandment?\nA: The first commandment forbiddeth the denying, or not worshiping and glorifying the true God as God, and our God; and the giving of that worship and glory to any other, which is due to him alone.\n(Rom 1:21, Ps 14:1)', 'Worship due to Him alone.', 'Analysis: Is success, comfort, or approval an idol for you?'),

-- Q48: "Before Me"
('wsc_q48_seedling', 'wsc_q48', 'seedling', 'God Sees All', 'God sees everything we do.', 'God sees me.', 'Cover eyes: "I can''t see you, but God can always see us!"'),
('wsc_q48_sprout', 'wsc_q48', 'sprout', 'Does God see?', 'Q: What does "Before Me" mean?\nA: God sees everything, even our secret thoughts.', 'God sees everything.', 'We can''t hide idols in our pockets or hearts.'),
('wsc_q48_sapling', 'wsc_q48', 'sapling', 'God''s Omniscience', 'Q: What are we specially taught by these words [before me] in the first commandment?\nA: These words [before me] in the first commandment teach us, that God, who seeth all things, taketh notice of, and is much displeased with, the sin of having any other god.', 'God, who seeth all things.', 'Omniscient = All-seeing. God is displeased (sad/angry) when we love other things more.'),
('wsc_q48_tree', 'wsc_q48', 'tree', 'Q48: Coram Deo', 'Q: What are we specially taught by these words [before me] in the first commandment?\nA: These words [before me] in the first commandment teach us, that God, who seeth all things, taketh notice of, and is much displeased with, the sin of having any other god.', 'Much displeased with.', 'Coram Deo = Living before the face of God. All life is lived in His presence.'),
('wsc_q48_oak', 'wsc_q48', 'oak', 'Q48: Divine Inspection', 'Q: What are we specially taught by these words [before me] in the first commandment?\nA: These words [before me] in the first commandment teach us, that God, who seeth all things, taketh notice of, and is much displeased with, the sin of having any other god.\n(Ps 44:20-21)', 'Taketh notice of.', 'Warning: Secret sins are open scandals in heaven.'),

-- Q49: Second Commandment
('wsc_q49_seedling', 'wsc_q49', 'seedling', 'Worship God Rightly', 'Do not make statues of God.', 'No statues of God.', 'We worship God with our hearts, not with statues.'),
('wsc_q49_sprout', 'wsc_q49', 'sprout', 'The Second Commandment', 'Q: What is the second commandment?\nA: Thou shalt not make unto thee any graven image.', 'No graven image.', 'Graven image means a carved statue to worship.'),
('wsc_q49_sapling', 'wsc_q49', 'sapling', 'No Images', 'Q: What is the second commandment?\nA: The second commandment is, Thou shalt not make unto thee any graven image, or any likeness of any thing that is in heaven above, or that is in the earth beneath, or that is in the water under the earth: Thou shalt not bow down thyself to them, nor serve them.', 'No graven image or likeness.', 'God is Spirit. We cannot draw Him or make Him out of wood.'),
('wsc_q49_tree', 'wsc_q49', 'tree', 'Q49: Commandment 2', 'Q: What is the second commandment?\nA: The second commandment is, Thou shalt not make unto thee any graven image... for I the Lord thy God am a jealous God.', 'Jealous God.', 'Jealous means He wants all our love for Himself.'),
('wsc_q49_oak', 'wsc_q49', 'oak', 'Q49: Method of Worship', 'Q: What is the second commandment?\nA: The second commandment is, Thou shalt not make unto thee any graven image... (Ex 20:4-6)', 'Not bow down nor serve them.', '1st Commandment = Who to worship. 2nd Commandment = How to worship.'),

-- Q50: Required (2nd Cmd)
('wsc_q50_seedling', 'wsc_q50', 'seedling', 'Worship God''s Way', 'Worship God how He tells us.', 'Worship God''s way.', 'We don''t make up new ways to worship. We do what the Bible says.'),
('wsc_q50_sprout', 'wsc_q50', 'sprout', 'How to Worship', 'Q: What does God require in worship?\nA: To receive and keep all the worship God appointed.', 'Keep pure and entire.', 'Imagine a game; we have to play by the Rules, not cheat.'),
('wsc_q50_sapling', 'wsc_q50', 'sapling', 'Pure Worship', 'Q: What is required in the second commandment?\nA: The second commandment requireth the receiving, observing, and keeping pure and entire, all such religious worship and ordinances as God hath appointed in his word.', 'Pure and entire.', 'Pure = Don''t add bad stuff. Entire = Don''t take away good stuff.'),
('wsc_q50_tree', 'wsc_q50', 'tree', 'Q50: Regulative Principle', 'Q: What is required in the second commandment?\nA: The second commandment requireth the receiving, observing, and keeping pure and entire, all such religious worship and ordinances as God hath appointed in his word.', 'As God hath appointed.', 'Regulative Principle of Worship: If God didn''t command it, we don''t do it in worship.'),
('wsc_q50_oak', 'wsc_q50', 'oak', 'Q50: Divine Ordinances', 'Q: What is required in the second commandment?\nA: The second commandment requireth the receiving, observing, and keeping pure and entire, all such religious worship and ordinances as God hath appointed in his word.\n(Deut 32:46, Matt 28:20)', 'Religious worship and ordinances.', 'Includes prayer, reading scripture, preaching, sacraments, singing psalms/hymns.'),

-- Q51: Forbidden (2nd Cmd)
('wsc_q51_seedling', 'wsc_q51', 'seedling', 'No Fake Gods', 'Don''t pray to pictures or statues.', 'No pictures of God.', 'God is too big for a picture.'),
('wsc_q51_sprout', 'wsc_q51', 'sprout', 'What is forbidden?', 'Q: What does God forbid in worship?\nA: Worshiping images or any way God hasn''t said.', 'Worshiping by images.', 'We don''t use pictures to help us pray.'),
('wsc_q51_sapling', 'wsc_q51', 'sapling', 'False Worship', 'Q: What is forbidden in the second commandment?\nA: The second commandment forbiddeth the worshiping of God by images, or any other way not appointed in his word.', 'Way not appointed.', 'Will-worship: Making up our own ways to please God (like Colossians 2:23).'),
('wsc_q51_tree', 'wsc_q51', 'tree', 'Q51: Prohibitions of Second', 'Q: What is forbidden in the second commandment?\nA: The second commandment forbiddeth the worshiping of God by images, or any other way not appointed in his word.', 'Worshiping by images.', 'Why? Because images lie about God (making the Infinite look finite).'),
('wsc_q51_oak', 'wsc_q51', 'oak', 'Q51: Iconoclasm', 'Q: What is forbidden in the second commandment?\nA: The second commandment forbiddeth the worshiping of God by images, or any other way not appointed in his word.\n(Deut 4:15-16)', 'Way not appointed in His Word.', 'History: The Reformation removed statues to restore spiritual worship.'),

-- Q52: Reasons Annexed
('wsc_q52_seedling', 'wsc_q52', 'seedling', 'God is King Over Worship', 'God is the Boss of worship.', 'God is the King.', 'This is His house; He makes the rules.'),
('wsc_q52_sprout', 'wsc_q52', 'sprout', 'Why worship God''s way?', 'Q: Why must we worship God''s way?\nA: Because God is King and He is jealous for His glory.', 'God''s sovereignty.', 'Sovereignty means He is the Ruler.'),
('wsc_q52_sapling', 'wsc_q52', 'sapling', 'God''s Zeal', 'Q: What are the reasons annexed to the second commandment?\nA: The reasons annexed to the second commandment are, God''s sovereignty over us, his propriety in us, and the zeal he hath to his own worship.', 'Zeal he hath.', 'Zeal = Strong burning love/protection (Jealousy). Propriety = Ownership.'),
('wsc_q52_tree', 'wsc_q52', 'tree', 'Q52: Reasons for Purity', 'Q: What are the reasons annexed to the second commandment?\nA: The reasons annexed to the second commandment are, God''s sovereignty over us, his propriety in us, and the zeal he hath to his own worship.', 'Sovereignty and Ownership.', 'We belong to Him, so we must please Him, not ourselves.'),
('wsc_q52_oak', 'wsc_q52', 'oak', 'Q52: Divine Jealousy', 'Q: What are the reasons annexed to the second commandment?\nA: The reasons annexed to the second commandment are, God''s sovereignty over us, his propriety in us, and the zeal he hath to his own worship.\n(Ps 95:2-3, Ex 34:14)', 'Jealousy for worship.', 'God is not jealous OF us, but FOR us (protecting us from false gods).'),

-- Q53: Third Commandment
('wsc_q53_seedling', 'wsc_q53', 'seedling', 'Respect God''s Name', 'Say God''s name carefully.', 'Respect God''s Name.', 'Don''t say "Oh my G--" unless you are praying.'),
('wsc_q53_sprout', 'wsc_q53', 'sprout', 'The Third Commandment', 'Q: What is the third commandment?\nA: Thou shalt not take the name of the Lord thy God in vain.', 'Not take in vain.', 'In vain = For no good reason. Like using a sword to cut butter.'),
('wsc_q53_sapling', 'wsc_q53', 'sapling', 'In Vain', 'Q: What is the third commandment?\nA: The third commandment is, Thou shalt not take the name of the Lord thy God in vain: for the Lord will not hold him guiltless that taketh his name in vain.', 'Will not hold him guiltless.', 'Guiltless = Innocent. God takes this very seriously.'),
('wsc_q53_tree', 'wsc_q53', 'tree', 'Q53: Commandment 3', 'Q: What is the third commandment?\nA: The third commandment is, Thou shalt not take the name of the Lord thy God in vain: for the Lord will not hold him guiltless that taketh his name in vain.', 'Name of the Lord.', 'God''s Name represents His Character.'),
('wsc_q53_oak', 'wsc_q53', 'oak', 'Q53: Sanctity of Name', 'Q: What is the third commandment?\nA: The third commandment is, Thou shalt not take the name of the Lord thy God in vain: for the Lord will not hold him guiltless that taketh his name in vain.\n(Ex 20:7)', 'Take in vain.', 'Hebrew: "Lift up to emptiness." Using God''s name lightly or falsely.'),

-- Q54: Required (3rd Cmd)
('wsc_q54_seedling', 'wsc_q54', 'seedling', 'Use God''s Name Well', 'Use God''s name to pray and praise.', 'Pray and Praise.', 'Our mouths are for blessing God.'),
('wsc_q54_sprout', 'wsc_q54', 'sprout', 'How to use His Name', 'Q: How should we use God''s name?\nA: With fear and reverence.', 'Holy and reverent.', 'Like handling a precious diamond—carefully.'),
('wsc_q54_sapling', 'wsc_q54', 'sapling', 'Holy Reverence', 'Q: What is required in the third commandment?\nA: The third commandment requireth the holy and reverent use of God''s names, titles, attributes, ordinances, word, and works.', 'Names, titles, attributes.', 'Not just "God" or "Jesus", but "King of Kings", "Creator", etc.'),
('wsc_q54_tree', 'wsc_q54', 'tree', 'Q54: Scope of Name', 'Q: What is required in the third commandment?\nA: The third commandment requireth the holy and reverent use of God''s names, titles, attributes, ordinances, word, and works.', 'Word and works.', 'Respecting the Bible and Providence is part of respecting His Name.'),
('wsc_q54_oak', 'wsc_q54', 'oak', 'Q54: Hallowing the Name', 'Q: What is required in the third commandment?\nA: The third commandment requireth the holy and reverent use of God''s names, titles, attributes, ordinances, word, and works.\n(Matt 6:9, Ps 29:2)', 'Holy and reverent use.', 'This is the positive side of "Hallowed be Thy Name".'),

-- Q55: Forbidden (3rd Cmd)
('wsc_q55_seedling', 'wsc_q55', 'seedling', 'Don''t Joke about God', 'Never joke about God.', 'Don''t joke about God.', 'God is not a joke. He is holy.'),
('wsc_q55_sprout', 'wsc_q55', 'sprout', 'What is forbidden?', 'Q: What is forbidden in using God''s name?\nA: Profaning or abusing it.', 'Profaning or abusing.', 'Abusing = Using incorrectly (like swearing).'),
('wsc_q55_sapling', 'wsc_q55', 'sapling', 'Profaning the Name', 'Q: What is forbidden in the third commandment?\nA: The third commandment forbiddeth all profaning or abusing of anything whereby God maketh himself known.', 'Anything whereby God maketh himself known.', 'Includes making fun of the Bible or the Sacraments.'),
('wsc_q55_tree', 'wsc_q55', 'tree', 'Q55: Prohibitions of Third', 'Q: What is forbidden in the third commandment?\nA: The third commandment forbiddeth all profaning or abusing of anything whereby God maketh himself known.', 'Profaning.', 'Profane = Making common what should be special.'),
('wsc_q55_oak', 'wsc_q55', 'oak', 'Q55: Blasphemy & Perjury', 'Q: What is forbidden in the third commandment?\nA: The third commandment forbiddeth all profaning or abusing of anything whereby God maketh himself known.\n(Mal 1:6-7)', 'Abusing.', 'Includes perjury (lying under oath) and blasphemy.'),

-- Q56: Reason Annexed
('wsc_q56_seedling', 'wsc_q56', 'seedling', 'God Punishes Disrespect', 'God punishes those who use His name badly.', 'God will punish.', 'It is dangerous to play with fire; it is more dangerous to play with God''s name.'),
('wsc_q56_sprout', 'wsc_q56', 'sprout', 'Why fear?', 'Q: Why should we fear using God''s name badly?\nA: Because God will not let sinners escape.', 'He implies punishment.', 'Even if people don''t catch you, God hears.'),
('wsc_q56_sapling', 'wsc_q56', 'sapling', 'Inescapable Justice', 'Q: What is the reason annexed to the third commandment?\nA: The reason annexed to the third commandment is, that however the breakers of this commandment may escape punishment from men, yet the Lord our God will not suffer them to escape his righteous judgment.', 'Not suffer them to escape.', 'Suffer = Allow. No escape from God''s court.'),
('wsc_q56_tree', 'wsc_q56', 'tree', 'Q56: Reason for Third', 'Q: What is the reason annexed to the third commandment?\nA: The reason annexed to the third commandment is, that however the breakers of this commandment may escape punishment from men, yet the Lord our God will not suffer them to escape his righteous judgment.', 'Righteous judgment.', 'Men might laugh at swearing, but God does not.'),
('wsc_q56_oak', 'wsc_q56', 'oak', 'Q56: Divine Holiness', 'Q: What is the reason annexed to the third commandment?\nA: The reason annexed to the third commandment is, that however the breakers of this commandment may escape punishment from men, yet the Lord our God will not suffer them to escape his righteous judgment.\n(Deut 28:58-59)', 'Breakers of this commandment.', 'This command protects the transcendence of God in society.'),

-- Q57: Fourth Commandment
('wsc_q57_seedling', 'wsc_q57', 'seedling', 'God''s Special Day', 'Sunday is God''s special day.', 'Sunday is God''s day.', 'We go to church and rest.'),
('wsc_q57_sprout', 'wsc_q57', 'sprout', 'The Fourth Commandment', 'Q: What is the fourth commandment?\nA: Remember the Sabbath day, to keep it holy.', 'Remember the Sabbath.', 'Sabbath means Rest. Holy means set apart.'),
('wsc_q57_sapling', 'wsc_q57', 'sapling', 'The Sabbath', 'Q: What is the fourth commandment?\nA: The fourth commandment is, Remember the Sabbath day, to keep it holy. Six days shalt thou labor, and do all thy work: but the seventh day is the Sabbath of the Lord thy God...', 'Keep it holy.', 'Work 6 days, Rest 1 day. God''s pattern.'),
('wsc_q57_tree', 'wsc_q57', 'tree', 'Q57: Commandment 4', 'Q: What is the fourth commandment?\nA: The fourth commandment is, Remember the Sabbath day... in it thou shalt not do any work, thou, nor thy son, nor thy daughter, manservant, nor maidservant, nor thy cattle, nor thy stranger...', 'Thou nor thy son...', 'The head of the house is responsible for the whole house resting.'),
('wsc_q57_oak', 'wsc_q57', 'oak', 'Q57: Sabbath Law', 'Q: What is the fourth commandment?\nA: The fourth commandment is, Remember the Sabbath day, to keep it holy... (Ex 20:8-11)', 'Rest implied.', 'Apologetics: The Sabbath helps human flourishing (rest for workers/animals).'),

-- Q58: Required (4th Cmd)
('wsc_q58_seedling', 'wsc_q58', 'seedling', 'Keep it Holy', 'Keep Sunday special.', 'Keep it holy.', 'Treat Sunday different than Saturday.'),
('wsc_q58_sprout', 'wsc_q58', 'sprout', 'What does God require?', 'Q: What is required in the fourth commandment?\nA: Keeping holy the times God has set.', 'Sabbath days.', 'It''s a date with God.'),
('wsc_q58_sapling', 'wsc_q58', 'sapling', 'Sanctifying Time', 'Q: What is required in the fourth commandment?\nA: The fourth commandment requireth the keeping holy to God such set times as he hath appointed in his word; expressly one whole day in seven, to be a holy Sabbath to himself.', 'One whole day in seven.', 'Not just an hour, but the whole day.'),
('wsc_q58_tree', 'wsc_q58', 'tree', 'Q58: Scope of Fourth', 'Q: What is required in the fourth commandment?\nA: The fourth commandment requireth the keeping holy to God such set times as he hath appointed in his word; expressly one whole day in seven, to be a holy Sabbath to himself.', 'To Himself.', 'The day belongs to God, not to sports or catch-up work.'),
('wsc_q58_oak', 'wsc_q58', 'oak', 'Q58: Weekly Rhythm', 'Q: What is required in the fourth commandment?\nA: The fourth commandment requireth the keeping holy to God such set times as he hath appointed in his word; expressly one whole day in seven, to be a holy Sabbath to himself.\n(Lev 19:30)', 'Set times as He appointed.', 'Theology: We are creatures of time; God claims our time to sanctify us.'),

-- Q59: Which Day?
('wsc_q59_seedling', 'wsc_q59', 'seedling', 'The Lord''s Day', 'We rest on the Lord''s Day.', 'The Lord''s Day.', 'Since Jesus rose on Sunday, we worship on Sunday.'),
('wsc_q59_sprout', 'wsc_q59', 'sprout', 'When is the Sabbath?', 'Q: Which day is the Sabbath?\nA: The first day of the week, called the Lord''s Day.', 'First day of the week.', 'It used to be Saturday, now it is Sunday (Resurrection Day).'),
('wsc_q59_sapling', 'wsc_q59', 'sapling', 'Change of Day', 'Q: Which day of the seven hath God appointed to be the weekly Sabbath?\nA: From the beginning of the world to the resurrection of Christ, God appointed the seventh day of the week to be the weekly Sabbath; and the first day of the week ever since, to continue to the end of the world, which is the Christian Sabbath.', 'First day... Christian Sabbath.', 'Creation Sabbath = Day 7. Redemption Sabbath = Day 1.'),
('wsc_q59_tree', 'wsc_q59', 'tree', 'Q59: Christian Sabbath', 'Q: Which day of the seven hath God appointed to be the weekly Sabbath?\nA: From the beginning of the world to the resurrection of Christ, God appointed the seventh day of the week to be the weekly Sabbath; and the first day of the week ever since, to continue to the end of the world, which is the Christian Sabbath.', 'To continue to the end of the world.', 'It is not temporary; it is for the whole church age.'),
('wsc_q59_oak', 'wsc_q59', 'oak', 'Q59: Theology of Time', 'Q: Which day of the seven hath God appointed to be the weekly Sabbath?\nA: From the beginning of the world to the resurrection of Christ, God appointed the seventh day of the week to be the weekly Sabbath... (Acts 20:7, Rev 1:10)', 'Resurrection of Christ.', 'Apologetics: Evidence for the Resurrection—why would Jews change their holy day?'),

-- Q60: How to Sanctify
('wsc_q60_seedling', 'wsc_q60', 'seedling', 'Rest and Pray', 'We stop working and pray to God.', 'Rest and Pray.', 'No work today. It is a happy day for God.'),
('wsc_q60_sprout', 'wsc_q60', 'sprout', 'How do we keep it holy?', 'Q: How do we keep the Sabbath holy?\nA: By resting from work and worshiping God.', 'Holy resting.', 'It is not just "lazy day", it is "God day".'),
('wsc_q60_sapling', 'wsc_q60', 'sapling', 'Holy Rest', 'Q: How is the Sabbath to be sanctified?\nA: The Sabbath is to be sanctified by a holy resting all that day, even from such worldly employments and recreations as are lawful on other days.', 'Holy resting all that day.', 'Stuff that is okay on Tuesday (soccer, movies) might distract us on Sunday.'),
('wsc_q60_tree', 'wsc_q60', 'tree', 'Q60: Public and Private', 'Q: How is the Sabbath to be sanctified?\nA: The Sabbath is to be sanctified be holy resting... and spending the whole time in the public and private exercises of God''s worship, except so much as is to be taken up in the works of necessity and mercy.', 'Public and private exercises.', 'Church (public) and family worship/reading (private). Necessity = Eating/Medical. Mercy = Helping sick.'),
('wsc_q60_oak', 'wsc_q60', 'oak', 'Q60: Necessity and Mercy', 'Q: How is the Sabbath to be sanctified?\nA: ...except so much as is to be taken up in the works of necessity and mercy.\n(Matt 12:11-12)', 'Works of necessity and mercy.', 'Ethics: The Sabbath was made for man. We can feed animals and heal the sick.'),

-- Q61: Forbidden (4th Cmd)
('wsc_q61_seedling', 'wsc_q61', 'seedling', 'Don''t Waste Sunday', 'Don''t do work on Sunday.', 'Don''t work on Sunday.', 'Put the tools away. Put the homework away.'),
('wsc_q61_sprout', 'wsc_q61', 'sprout', 'What is forbidden?', 'Q: What does God forbid on the Sabbath?\nA: Working or being lazy or thinking about other things.', 'Profaning the day.', 'Thinking about video games in church is breaking the Sabbath.'),
('wsc_q61_sapling', 'wsc_q61', 'sapling', 'Sabbath Breaking', 'Q: What is forbidden in the fourth commandment?\nA: The fourth commandment forbiddeth the omission or careless performance of the duties required, and the profaning the day by idleness, or doing that which is in itself sinful.', 'Omission or careless performance.', 'Sleeping through church is "careless performance".'),
('wsc_q61_tree', 'wsc_q61', 'tree', 'Q61: Unnecessary Thoughts', 'Q: What is forbidden in the fourth commandment?\nA: ...and by all needless works, words, and thoughts, about our worldly employments or recreations.', 'Needless thoughts.', ' Mental discipline: Keeping our minds on God, not just our bodies.'),
('wsc_q61_oak', 'wsc_q61', 'oak', 'Q61: Profaning the Sabbath', 'Q: What is forbidden in the fourth commandment?\nA: The fourth commandment forbiddeth the omission or careless performance of the duties required... (Isa 58:13)', 'Worldly employments or recreations.', 'Cultural challenge: The "Weekend" mentality vs. The Lord''s Day.'),

-- Q62: Reasons Annexed
('wsc_q62_seedling', 'wsc_q62', 'seedling', 'God Gave Us Time', 'God gave us 6 days to play and work.', '6 days for us.', 'God is generous. He only asks for 1 day back.'),
('wsc_q62_sprout', 'wsc_q62', 'sprout', 'Why keep the Sabbath?', 'Q: Why should we keep the Sabbath?\nA: God gave us six days, but kept the seventh for Himself.', 'God''s example.', 'God rested, so we rest.'),
('wsc_q62_sapling', 'wsc_q62', 'sapling', 'God''s Example', 'Q: What are the reasons annexed to the fourth commandment?\nA: The reasons annexed to the fourth commandment are, God''s allowing us six days of the week for our own employments... and his own example.', 'His own example.', 'Imitatio Dei (Imitating God).'),
('wsc_q62_tree', 'wsc_q62', 'tree', 'Q62: Blessing of Sabbath', 'Q: What are the reasons annexed to the fourth commandment?\nA: ...and his blessing the Sabbath day.', 'Blessing the Sabbath day.', 'The Sabbath is not a burden; it is a blessed day. It refreshes us.'),
('wsc_q62_oak', 'wsc_q62', 'oak', 'Q62: Creation Ordinance', 'Q: What are the reasons annexed to the fourth commandment?\nA: ...God''s allowing us six days... his challenging a special propriety in the seventh... (Ex 31:15)', 'Challenging a special propriety.', 'Propriety = Ownership. Stealing Sunday is stealing from God.'),

-- Q63: Fifth Commandment
('wsc_q63_seedling', 'wsc_q63', 'seedling', 'Obey Parents', 'Obey your Mommy and Daddy.', 'Honor father and mother.', 'When they say "stop", we stop.'),
('wsc_q63_sprout', 'wsc_q63', 'sprout', 'The Fifth Commandment', 'Q: What is the fifth commandment?\nA: Honor thy father and thy mother.', 'Honor father and mother.', 'Honor means to respect, listen to, and love.'),
('wsc_q63_sapling', 'wsc_q63', 'sapling', 'Honor Parents', 'Q: What is the fifth commandment?\nA: The fifth commandment is, Honor thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee.', 'Days may be long.', 'It is the first commandment with a promise.'),
('wsc_q63_tree', 'wsc_q63', 'tree', 'Q63: Commandment 5', 'Q: What is the fifth commandment?\nA: The fifth commandment is, Honor thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee.', 'Honor.', 'Root of all authority. If we don''t obey parents, we won''t obey God.'),
('wsc_q63_oak', 'wsc_q63', 'oak', 'Q63: Parental Authority', 'Q: What is the fifth commandment?\nA: The fifth commandment is, Honor thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee.\n(Ex 20:12)', 'Honor thy father and thy mother.', 'Sociology: The family is the basic unit of society. Stability starts here.'),

-- Q64: Required (5th Cmd)
('wsc_q64_seedling', 'wsc_q64', 'seedling', 'Respect Everyone', 'Respect people who are in charge.', 'Respect everyone.', 'Teachers, police, grandmas. We listen to them.'),
('wsc_q64_sprout', 'wsc_q64', 'sprout', 'Who do we honor?', 'Q: What does the fifth commandment require?\nA: Giving honor to everyone above us, equal to us, or below us.', 'Honor everyone.', 'We are nice to little kids (below) and respectful to adults (above).'),
('wsc_q64_sapling', 'wsc_q64', 'sapling', 'Superiors, Inferiors, Equals', 'Q: What is required in the fifth commandment?\nA: The fifth commandment requireth the preserving the honor, and performing the duties, belonging to everyone in their several places and relations, as superiors, inferiors, or equals.', 'Superiors, inferiors, or equals.', 'Superiors (Parents/Rulers), Inferiors (Children/Subjects), Equals (Friends/Siblings).'),
('wsc_q64_tree', 'wsc_q64', 'tree', 'Q64: Social Duties', 'Q: What is required in the fifth commandment?\nA: The fifth commandment requireth the preserving the honor, and performing the duties, belonging to everyone in their several places and relations.', 'In their several places.', 'God calls us to different roles. We must be faithful in our station.'),
('wsc_q64_oak', 'wsc_q64', 'oak', 'Q64: Spheres of Authority', 'Q: What is required in the fifth commandment?\nA: The fifth commandment requireth the preserving the honor, and performing the duties, belonging to everyone in their several places and relations.\n(Rom 13:1, Eph 5:21)', 'Performing the duties.', 'Political Theory: Family, Church, and State act as distinct spheres of authority.'),

-- Q65: Forbidden (5th Cmd)
('wsc_q65_seedling', 'wsc_q65', 'seedling', 'Don''t Be Rude', 'Don''t be disrespectful.', 'Don''t be rude.', 'Rolling eyes or stomping feet is bad.'),
('wsc_q65_sprout', 'wsc_q65', 'sprout', 'What is forbidden?', 'Q: What does God forbid regarding parents?\nA: Disrespecting them or not doing what they say.', 'Neglecting honor.', 'If you ignore Mom, you are breaking this rule.'),
('wsc_q65_sapling', 'wsc_q65', 'sapling', 'Neglecting Honor', 'Q: What is forbidden in the fifth commandment?\nA: The fifth commandment forbiddeth the neglecting of, or doing anything against, the honor and duty which belongeth to everyone in their several places and relations.', 'Neglecting or doing against.', 'Rebellion is doing against. Ignoring is neglecting.'),
('wsc_q65_tree', 'wsc_q65', 'tree', 'Q65: Rebellion', 'Q: What is forbidden in the fifth commandment?\nA: The fifth commandment forbiddeth the neglecting of, or doing anything against, the honor and duty which belongeth to everyone in their several places and relations.', 'Against the honor.', 'Disrespect weakens society and dishonors God who established order.'),
('wsc_q65_oak', 'wsc_q65', 'oak', 'Q65: Anarchy vs Order', 'Q: What is forbidden in the fifth commandment?\nA: The fifth commandment forbiddeth the neglecting of, or doing anything against, the honor and duty which belongeth to everyone in their several places and relations.\n(Rom 13:2)', 'Doing anything against.', 'Warning against anarchic spirit. Revolution is not the Christian way; submission/reformation is.'),

-- Q66: Reason Annexed
('wsc_q66_seedling', 'wsc_q66', 'seedling', 'Long Life', 'Obey parents and God will bless you.', 'God blesses obedience.', 'Obeying keeps us safe (don''t touch hot stove!).'),
('wsc_q66_sprout', 'wsc_q66', 'sprout', 'Why obey parents?', 'Q: What promise did God give for obeying parents?\nA: Long life and blessing.', 'Promise of long life.', 'God takes care of kids who listen to wisdom.'),
('wsc_q66_sapling', 'wsc_q66', 'sapling', 'Promise of Blessing', 'Q: What is the reason annexed to the fifth commandment?\nA: The reason annexed to the fifth commandment, is a promise of long life and prosperity (as far as it shall serve for God''s glory and their own good) to all such as keep this commandment.', 'As far as... for God''s glory.', 'It''s not a magic spell for living to 100, but a general principle of blessing.'),
('wsc_q66_tree', 'wsc_q66', 'tree', 'Q66: Prosperity', 'Q: What is the reason annexed to the fifth commandment?\nA: ...promise of long life and prosperity... to all such as keep this commandment.', 'Prosperity.', 'Stable families create stable societies which survive longer.'),
('wsc_q66_oak', 'wsc_q66', 'oak', 'Q66: General Equity', 'Q: What is the reason annexed to the fifth commandment?\nA: ...promise of long life and prosperity (as far as it shall serve for God''s glory and their own good) to all such as keep this commandment.\n(Eph 6:2-3)', 'Long life... on the land.', 'Covenant blessings. Originally "The Land" (Israel), now applies to life in God''s Kingdom.'),

-- Q67: Sixth Commandment
('wsc_q67_seedling', 'wsc_q67', 'seedling', 'No Hitting', 'Do not hurt anyone.', 'Do not kill.', 'Be gentle with hands. No hitting.'),
('wsc_q67_sprout', 'wsc_q67', 'sprout', 'The Sixth Commandment', 'Q: What is the sixth commandment?\nA: Thou shalt not kill.', 'Thou shalt not kill.', 'It means we shouldn''t take away the life God gave.'),
('wsc_q67_sapling', 'wsc_q67', 'sapling', 'Do Not Kill', 'Q: What is the sixth commandment?\nA: The sixth commandment is, Thou shalt not kill.', 'Thou shalt not kill.', 'Life is sacred because God made it.'),
('wsc_q67_tree', 'wsc_q67', 'tree', 'Q67: Commandment 6', 'Q: What is the sixth commandment?\nA: The sixth commandment is, Thou shalt not kill.', 'Not kill.', 'Includes murder, suicide, and harming others.'),
('wsc_q67_oak', 'wsc_q67', 'oak', 'Q67: Sanctity of Life', 'Q: What is the sixth commandment?\nA: The sixth commandment is, Thou shalt not kill.\n(Ex 20:13)', 'Sanctity of Life.', 'Implications for abortion, euthanasia, and capital punishment (unlawful killing vs. lawful justice).'),

-- Q68: Required (6th Cmd)
('wsc_q68_seedling', 'wsc_q68', 'seedling', 'Care for Life', 'Take care of yourself and others.', 'Care for people.', 'Eat good food, look both ways before crossing street.'),
('wsc_q68_sprout', 'wsc_q68', 'sprout', 'What does God require?', 'Q: What does the sixth commandment require?\nA: To keep ourselves and others safe and alive.', 'Preserve life.', 'We protect life. We don''t play with dangerous things.'),
('wsc_q68_sapling', 'wsc_q68', 'sapling', 'Preserving Life', 'Q: What is required in the sixth commandment?\nA: The sixth commandment requireth all lawful endeavors to preserve our own life, and the life of others.', 'Preserve our own life and others.', 'Lawful endeavors = Good ways. Eating, sleeping, medicine, safety rules.'),
('wsc_q68_tree', 'wsc_q68', 'tree', 'Q68: Scope of Life', 'Q: What is required in the sixth commandment?\nA: The sixth commandment requireth all lawful endeavors to preserve our own life, and the life of others.', 'Life of others.', 'Defending the weak, feeding the hungry.'),
('wsc_q68_oak', 'wsc_q68', 'oak', 'Q68: Duty of Preservation', 'Q: What is required in the sixth commandment?\nA: The sixth commandment requireth all lawful endeavors to preserve our own life, and the life of others.\n(Ps 82:3-4)', 'Lawful endeavors.', 'Ethics: Self-defense is lawful; recklessness is not.'),

-- Q69: Forbidden (6th Cmd)
('wsc_q69_seedling', 'wsc_q69', 'seedling', 'Don''t Push', 'Do not push or bite.', 'Don''t hurt others.', 'Anger is like hitting in your heart.'),
('wsc_q69_sprout', 'wsc_q69', 'sprout', 'What is forbidden?', 'Q: What does the sixth commandment forbid?\nA: Taking away our own life or someone else''s.', 'Taking life.', 'No suicide (self-harm) and no murder.'),
('wsc_q69_sapling', 'wsc_q69', 'sapling', 'Murder and Hate', 'Q: What is forbidden in the sixth commandment?\nA: The sixth commandment forbiddeth the taking away of our own life, or the life of our neighbor unjustly, or whatsoever tendeth thereunto.', 'Taking away life... unjustly.', 'Unjustly = Without a good reason (like war or punishment). Whatsoever tendeth thereunto = Anger/Hatred.'),
('wsc_q69_tree', 'wsc_q69', 'tree', 'Q69: Roots of Murder', 'Q: What is forbidden in the sixth commandment?\nA: ...or whatsoever tendeth thereunto.', 'Tendeth thereunto.', 'Jesus said hate is heart-murder (Matt 5). Bullying "tends" to murder.'),
('wsc_q69_oak', 'wsc_q69', 'oak', 'Q69: Violating Life', 'Q: What is forbidden in the sixth commandment?\nA: The sixth commandment forbiddeth the taking away of our own life, or the life of our neighbor unjustly, or whatsoever tendeth thereunto.\n(Gen 9:6)', 'Life of our neighbor unjustly.', 'Social ethics: Racism, abortion, and reckless driving are violations.'),

-- Q70: Seventh Commandment
('wsc_q70_seedling', 'wsc_q70', 'seedling', 'Special Promises', 'Mommies and Daddies love each other.', 'Keep promises.', 'Marriage is a special promise God watches.'),
('wsc_q70_sprout', 'wsc_q70', 'sprout', 'The Seventh Commandment', 'Q: What is the seventh commandment?\nA: Thou shalt not commit adultery.', 'Husbands and wives keep promises.', 'Adultery means breaking the marriage promise.'),
('wsc_q70_sapling', 'wsc_q70', 'sapling', 'Marriage Fidelity', 'Q: What is the seventh commandment?\nA: The seventh commandment is, Thou shalt not commit adultery.', 'Thou shalt not commit adultery.', 'Adultery is when a husband or wife loves someone else in a special way meant only for them.'),
('wsc_q70_tree', 'wsc_q70', 'tree', 'Q70: Commandment 7', 'Q: What is the seventh commandment?\nA: The seventh commandment is, Thou shalt not commit adultery.', 'Adultery.', 'Protecting the covenant of marriage.'),
('wsc_q70_oak', 'wsc_q70', 'oak', 'Q70: Purity Statute', 'Q: What is the seventh commandment?\nA: The seventh commandment is, Thou shalt not commit adultery.\n(Ex 20:14)', 'Adultery.', 'Theology: Marriage reflects Christ and the Church. Adultery lies about the Gospel.'),

-- Q71: Required (7th Cmd)
('wsc_q71_seedling', 'wsc_q71', 'seedling', 'Pure Hearts', 'Have a clean heart.', 'Clean heart.', 'Think happy, good thoughts. Not dirty thoughts.'),
('wsc_q71_sprout', 'wsc_q71', 'sprout', 'What does God require?', 'Q: What does the seventh commandment require?\nA: Being pure in thought, word, and deed.', 'Pure in heart.', 'Like clear water, not muddy water.'),
('wsc_q71_sapling', 'wsc_q71', 'sapling', 'Chastity', 'Q: What is required in the seventh commandment?\nA: The seventh commandment requireth the preservation of our own and our neighbor''s chastity, in heart, speech, and behavior.', 'Chastity.', 'Chastity = Sexual purity. Keeping special things special for marriage.'),
('wsc_q71_tree', 'wsc_q71', 'tree', 'Q71: Purity in Life', 'Q: What is required in the seventh commandment?\nA: The seventh commandment requireth the preservation of our own and our neighbor''s chastity, in heart, speech, and behavior.', 'Heart, speech, and behavior.', 'Modesty in how we dress and talk is part of this.'),
('wsc_q71_oak', 'wsc_q71', 'oak', 'Q71: Positive Purity', 'Q: What is required in the seventh commandment?\nA: The seventh commandment requireth the preservation of our own and our neighbor''s chastity, in heart, speech, and behavior.\n(1 Thess 4:3-4)', 'Preservation of chastity.', 'Culture: "Purity culture" vs Biblical Chastity. It is about honoring God with our bodies.'),

-- Q72: Forbidden (7th Cmd)
('wsc_q72_seedling', 'wsc_q72', 'seedling', 'Bad Thoughts', 'Don''t think bad thoughts.', 'No bad thoughts.', 'God sees our hearts. Keep them clean.'),
('wsc_q72_sprout', 'wsc_q72', 'sprout', 'What is forbidden?', 'Q: What is forbidden in the seventh commandment?\nA: Unclean thoughts, words, and actions.', 'Unclean thoughts.', 'Watching bad things or saying dirty words.'),
('wsc_q72_sapling', 'wsc_q72', 'sapling', 'Unchastity', 'Q: What is forbidden in the seventh commandment?\nA: The seventh commandment forbiddeth all unchaste thoughts, words, and actions.', 'Unchaste thoughts, words, actions.', 'Pornography, dirty jokes, and immodest behavior.'),
('wsc_q72_tree', 'wsc_q72', 'tree', 'Q72: Guarding the Heart', 'Q: What is forbidden in the seventh commandment?\nA: The seventh commandment forbiddeth all unchaste thoughts, words, and actions.', 'All unchaste thoughts.', 'Lust is adultery in the heart (Matt 5:28).'),
('wsc_q72_oak', 'wsc_q72', 'oak', 'Q72: Sexual Immorality', 'Q: What is forbidden in the seventh commandment?\nA: The seventh commandment forbiddeth all unchaste thoughts, words, and actions.\n(Eph 5:3-4)', 'Unchaste actions.', 'Biblical definitions of sexuality vs modern fluidity.'),

-- Q73: Eighth Commandment
('wsc_q73_seedling', 'wsc_q73', 'seedling', 'Don''t Steal', 'Don''t take what isn''t yours.', 'Do not steal.', 'If it''s not yours, ask first.'),
('wsc_q73_sprout', 'wsc_q73', 'sprout', 'The Eighth Commandment', 'Q: What is the eighth commandment?\nA: Thou shalt not steal.', 'Thou shalt not steal.', 'Stealing is taking something without asking or paying.'),
('wsc_q73_sapling', 'wsc_q73', 'sapling', 'Property Rights', 'Q: What is the eighth commandment?\nA: The eighth commandment is, Thou shalt not steal.', 'Thou shalt not steal.', 'God gives everyone their own stuff. We respect that.'),
('wsc_q73_tree', 'wsc_q73', 'tree', 'Q73: Commandment 8', 'Q: What is the eighth commandment?\nA: The eighth commandment is, Thou shalt not steal.', 'Steal.', 'Includes cheating on a test (stealing answers) or downloading movies illegally.'),
('wsc_q73_oak', 'wsc_q73', 'oak', 'Q73: Right to Property', 'Q: What is the eighth commandment?\nA: The eighth commandment is, Thou shalt not steal.\n(Ex 20:15)', 'Steal.', 'Economics: Private property is a biblical right. Socialism/Communism conflicts with this.'),

-- Q74: Required (8th Cmd)
('wsc_q74_seedling', 'wsc_q74', 'seedling', 'Work Hard', 'Work for your toys.', 'Work hard.', 'God wants us to work so we can share.'),
('wsc_q74_sprout', 'wsc_q74', 'sprout', 'What does God require?', 'Q: What does the eighth commandment require?\nA: Working hard and helping others.', 'Procuring wealth.', 'We work to get things honestly.'),
('wsc_q74_sapling', 'wsc_q74', 'sapling', 'Stewardship', 'Q: What is required in the eighth commandment?\nA: The eighth commandment requireth the lawful procuring and furthering the wealth and outward estate of ourselves and others.', 'Lawful procuring.', 'Procuring = Getting. Furthering = Making grow. Stewardship.'),
('wsc_q74_tree', 'wsc_q74', 'tree', 'Q74: Generosity', 'Q: What is required in the eighth commandment?\nA: ...furthering the wealth and outward estate of ourselves and others.', 'Ourselves and others.', 'We don''t just hoard; we help others grow too.'),
('wsc_q74_oak', 'wsc_q74', 'oak', 'Q74: Biblical Economics', 'Q: What is required in the eighth commandment?\nA: The eighth commandment requireth the lawful procuring and furthering the wealth and outward estate of ourselves and others.\n(Eph 4:28)', 'Furthering the wealth.', 'Work Ethic: Work is good, not a curse. The curse made work hard, but work itself is holy.'),

-- Q75: Forbidden (8th Cmd)
('wsc_q75_seedling', 'wsc_q75', 'seedling', 'Don''t Be Lazy', 'Don''t be lazy.', 'Don''t cheat.', 'Lazy people want things without working.'),
('wsc_q75_sprout', 'wsc_q75', 'sprout', 'What is forbidden?', 'Q: What is forbidden in the eighth commandment?\nA: Stealing, cheating, or being lazy.', 'Unjust hindrance.', 'If you break someone''s toy, you are stealing their fun.'),
('wsc_q75_sapling', 'wsc_q75', 'sapling', 'Unjust Gain', 'Q: What is forbidden in the eighth commandment?\nA: The eighth commandment forbiddeth whatsoever doth, or may, unjustly hinder our own, or our neighbor''s, wealth or outward estate.', 'Unjustly hinder.', 'Gambling, cheating, or wasting money.'),
('wsc_q75_tree', 'wsc_q75', 'tree', 'Q75: Financial Sins', 'Q: What is forbidden in the eighth commandment?\nA: ...whatsoever doth, or may, unjustly hinder our own, or our neighbor''s, wealth or outward estate.', 'Hinder our own.', 'Being wasteful with your own money is a sin too.'),
('wsc_q75_oak', 'wsc_q75', 'oak', 'Q75: Systemic Theft', 'Q: What is forbidden in the eighth commandment?\nA: The eighth commandment forbiddeth whatsoever doth, or may, unjustly hinder our own, or our neighbor''s, wealth or outward estate.\n(Prov 21:6)', 'Unjustly hinder.', 'Ethics: Usury, predatory lending, and fraudulent business practices.'),

-- Q76: Ninth Commandment
('wsc_q76_seedling', 'wsc_q76', 'seedling', 'Tell the Truth', 'Always tell the truth.', 'Do not lie.', 'Lying makes God sad. He is Truth.'),
('wsc_q76_sprout', 'wsc_q76', 'sprout', 'The Ninth Commandment', 'Q: What is the ninth commandment?\nA: Thou shalt not bear false witness.', 'No false witness.', 'False witness = Lying about someone.'),
('wsc_q76_sapling', 'wsc_q76', 'sapling', 'No Lying', 'Q: What is the ninth commandment?\nA: The ninth commandment is, Thou shalt not bear false witness against thy neighbor.', 'False witness against neighbor.', 'In court, if you lie, someone gets punished wrongly.'),
('wsc_q76_tree', 'wsc_q76', 'tree', 'Q76: Commandment 9', 'Q: What is the ninth commandment?\nA: The ninth commandment is, Thou shalt not bear false witness against thy neighbor.', 'False witness.', 'Includes gossip, slander, and twisting words.'),
('wsc_q76_oak', 'wsc_q76', 'oak', 'Q76: Truth-Telling', 'Q: What is the ninth commandment?\nA: The ninth commandment is, Thou shalt not bear false witness against thy neighbor.\n(Ex 20:16)', 'Against thy neighbor.', 'Truth is the foundation of justice and relationship.'),

-- Q77: Required (9th Cmd)
('wsc_q77_seedling', 'wsc_q77', 'seedling', 'Keep Promises', 'Keep your promises.', 'Be true.', 'If you say you will do it, do it.'),
('wsc_q77_sprout', 'wsc_q77', 'sprout', 'What does God require?', 'Q: What does the ninth commandment require?\nA: Telling the truth and protecting good names.', 'Truth between man and man.', 'Speak truth to your friends.'),
('wsc_q77_sapling', 'wsc_q77', 'sapling', 'Promoting Truth', 'Q: What is required in the ninth commandment?\nA: The ninth commandment requireth the maintaining and promoting of truth between man and man, and of our own and our neighbor''s good name, especially in witness bearing.', 'Promoting of truth.', 'Don''t just "not lie", but helping the truth be known.'),
('wsc_q77_tree', 'wsc_q77', 'tree', 'Q77: Reputation', 'Q: What is required in the ninth commandment?\nA: ...and of our own and our neighbor''s good name...', 'Neighbor''s good name.', 'Defend your friend when people say bad things about them.'),
('wsc_q77_oak', 'wsc_q77', 'oak', 'Q77: Witness Bearing', 'Q: What is required in the ninth commandment?\nA: ...especially in witness bearing.\n(Zech 8:16)', 'Witness bearing.', 'Legal/Public contexts are critical, but also day-to-day honesty.'),

-- Q78: Forbidden (9th Cmd)
('wsc_q78_seedling', 'wsc_q78', 'seedling', 'Don''t Lie', 'Never tell a lie.', 'Don''t lie.', 'Remember the boy who cried wolf?'),
('wsc_q78_sprout', 'wsc_q78', 'sprout', 'What is forbidden?', 'Q: What is forbidden in the ninth commandment?\nA: Lying or hurting someone''s name.', 'Prejudicial to truth.', 'Hurting someone''s name = Gossip.'),
('wsc_q78_sapling', 'wsc_q78', 'sapling', 'Lying and Slander', 'Q: What is forbidden in the ninth commandment?\nA: The ninth commandment forbiddeth whatsoever is prejudicial to truth, or injurious to our own, or our neighbor''s, good name.', 'Prejudicial to truth.', 'Prejudicial = Biased/Harmful. Injurious = Hurtful.'),
('wsc_q78_tree', 'wsc_q78', 'tree', 'Q78: Gossip', 'Q: What is forbidden in the ninth commandment?\nA: ...or injurious to our own, or our neighbor''s, good name.', 'Injurious to good name.', 'Slander (spoken lies) and Libel (written lies).'),
('wsc_q78_oak', 'wsc_q78', 'oak', 'Q78: The 9th Violation', 'Q: What is forbidden in the ninth commandment?\nA: The ninth commandment forbiddeth whatsoever is prejudicial to truth, or injurious to our own, or our neighbor''s, good name.\n(Prov 19:5)', 'Whatsoever is prejudicial.', 'Includes silence when we should speak up, or speaking when we should be silent.'),

-- Q79: Tenth Commandment
('wsc_q79_seedling', 'wsc_q79', 'seedling', 'Don''t Be Greedy', 'Be happy with your toys.', 'Do not covet.', 'Don''t cry because your friend has a cooler toy.'),
('wsc_q79_sprout', 'wsc_q79', 'sprout', 'The Tenth Commandment', 'Q: What is the tenth commandment?\nA: Thou shalt not covet.', 'Thou shalt not covet.', 'Covet means to want something that isn''t yours really badly.'),
('wsc_q79_sapling', 'wsc_q79', 'sapling', 'Covetousness', 'Q: What is the tenth commandment?\nA: The tenth commandment is, Thou shalt not covet thy neighbor''s house, thou shalt not covet thy neighbor''s wife... nor anything that is thy neighbor''s.', 'Nor anything that is thy neighbor''s.', 'It stops us from wanting what God gave to someone else.'),
('wsc_q79_tree', 'wsc_q79', 'tree', 'Q79: Commandment 10', 'Q: What is the tenth commandment?\nA: The tenth commandment is, Thou shalt not covet thy neighbor''s house, thou shalt not covet thy neighbor''s wife... nor anything that is thy neighbor''s.', 'Thou shalt not covet.', 'This commandment checks our heart motives.'),
('wsc_q79_oak', 'wsc_q79', 'oak', 'Q79: Heart Sin', 'Q: What is the tenth commandment?\nA: The tenth commandment is, Thou shalt not covet thy neighbor''s house, thou shalt not covet thy neighbor''s wife... nor anything that is thy neighbor''s.\n(Ex 20:17)', 'Thy neighbor''s house.', 'Politics: Coveting undergirds class warfare. We should rejoice in others'' blessings.'),

-- Q80: Required (10th Cmd)
('wsc_q80_seedling', 'wsc_q80', 'seedling', 'Be Happy', 'Be happy with what God gave you.', 'Be content.', 'God knows what you need. Trust Him.'),
('wsc_q80_sprout', 'wsc_q80', 'sprout', 'What does God require?', 'Q: What does the tenth commandment require?\nA: Being happy with our own things.', 'Full contentment.', 'Say "Thank you God for my toys" instead of "I want his toys."'),
('wsc_q80_sapling', 'wsc_q80', 'sapling', 'Contentment', 'Q: What is required in the tenth commandment?\nA: The tenth commandment requireth full contentment with our own condition, with a right and charitable frame of spirit toward our neighbor and all that is his.', 'Full contentment.', 'Contentment = Being satisfied. Charitable frame = Being happy for others.'),
('wsc_q80_tree', 'wsc_q80', 'tree', 'Q80: Satisfaction', 'Q: What is required in the tenth commandment?\nA: ...full contentment with our own condition...', 'Our own condition.', 'God''s providence placed us here. Complaining is complaining against God.'),
('wsc_q80_oak', 'wsc_q80', 'oak', 'Q80: Spiritual State', 'Q: What is required in the tenth commandment?\nA: The tenth commandment requireth full contentment with our own condition, with a right and charitable frame of spirit toward our neighbor and all that is his.\n(Heb 13:5)', 'Right and charitable frame.', 'Theology: We can only maintain this frame by trusting God''s sovereignty.'),

-- Q81: Forbidden (10th Cmd)
('wsc_q81_seedling', 'wsc_q81', 'seedling', 'Don''t Say "I Want!"', 'Don''t say "I want that!"', 'Don''t be jealous.', 'Jealousy makes us grumpy.'),
('wsc_q81_sprout', 'wsc_q81', 'sprout', 'What is forbidden?', 'Q: What is forbidden in the tenth commandment?\nA: Wanting what others have.', 'Envying or grieving.', 'If sissy gets a cookie, be glad for her, don''t be mad.'),
('wsc_q81_sapling', 'wsc_q81', 'sapling', 'Envy', 'Q: What is forbidden in the tenth commandment?\nA: The tenth commandment forbiddeth all discontentment with our own estate, envying or grieving at the good of our neighbor, and all inordinate motions and affections to anything that is his.', 'Discontentment... envying.', 'Discontentment = "I don''t like what I have." Envy = "I hate that you have it."'),
('wsc_q81_tree', 'wsc_q81', 'tree', 'Q81: Inordinate Affections', 'Q: What is forbidden in the tenth commandment?\nA: ...and all inordinate motions and affections to anything that is his.', 'Inordinate motions.', 'Inordinate = Out of order/Wild. Controlling our desires.'),
('wsc_q81_oak', 'wsc_q81', 'oak', 'Q81: Root of All Evil', 'Q: What is forbidden in the tenth commandment?\nA: The tenth commandment forbiddeth all discontentment with our own estate, envying or grieving at the good of our neighbor, and all inordinate motions and affections to anything that is his.\n(Col 3:5)', 'Discontentment.', 'Psychology: Comparison is the thief of joy. Covetousness is idolatry.');




