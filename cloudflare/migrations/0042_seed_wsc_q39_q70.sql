-- Migration 0042: Seed WSC Q39-Q70
-- Continuing the Westminster Shorter Catechism from Q39 to Q70
-- Uses INSERT OR REPLACE to avoid unique constraint errors

INSERT OR REPLACE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months) VALUES

-- Introduction to Duty and the Moral Law (Q39-Q42)
('wsc_q39', 'Q39: Duty of Man', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is the duty which God requireth of man?\nA: The duty which God requireth of man, is obedience to his revealed will.\n(Micah 6:8, 1 Sam 15:22)',
 '["Recite together", "Discuss: What does God ask of us?", "Pray"]',
 'Obedience is how we show our love to God.',
 'Morning_Circle', 48, 216),

('wsc_q40', 'Q40: Rule of Obedience', 'liturgy', 'Wisdom', 'Memory',
 'Q: What did God at first reveal to man for the rule of his obedience?\nA: The rule which God at first revealed to man for his obedience, was the moral law.\n(Rom 2:14-15)',
 '["Recite together", "Discuss: How do we know what is right?", "Pray"]',
 'God writes His law on our hearts and in His Word.',
 'Morning_Circle', 48, 216),

('wsc_q41', 'Q41: The Moral Law', 'liturgy', 'Wisdom', 'Memory',
 'Q: Where is the moral law summarily comprehended?\nA: The moral law is summarily comprehended in the ten commandments.\n(Deut 10:4, Matt 19:17)',
 '["Recite together", "List the 10 Commandments (briefly)", "Pray"]',
 'The Ten Commandments act as a summary of God''s will.',
 'Morning_Circle', 48, 216),

('wsc_q42', 'Q42: Sum of the Commandments', 'liturgy', 'Love', 'Affection',
 'Q: What is the sum of the ten commandments?\nA: The sum of the ten commandments is, to love the Lord our God with all our heart, with all our soul, with all our strength, and with all our mind; and our neighbor as ourselves.\n(Matt 22:37-40)',
 '["Recite together", "Discuss: Love God and Love Neighbor", "Pray"]',
 'It all comes down to love. Love God, love people.',
 'Morning_Circle', 48, 216),

-- The Preface (Q43-Q44)
('wsc_q43', 'Q43: Preface to Commandments', 'liturgy', 'Wisdom', 'Memory',
 'Q: What is the preface to the ten commandments?\nA: The preface to the ten commandments is in these words, I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.\n(Exodus 20:2)',
 '["Recite together", "Discuss: Who gave the commandments?", "Pray"]',
 'Before He gave rules, He gave redemption. He saved them first.',
 'Meal_Table', 48, 216),

('wsc_q44', 'Q44: Teaching of the Preface', 'liturgy', 'Wisdom', 'Reason',
 'Q: What doth the preface to the ten commandments teach us?\nA: The preface to the ten commandments teacheth us, that because God is the Lord, and our God, and Redeemer, therefore we are bound to keep all his commandments.\n(Luke 1:74-75)',
 '["Recite together", "Discuss: Why do we obey?", "Pray"]',
 'We obey because we belong to Him and He bought us.',
 'Meal_Table', 48, 216),

-- First Commandment (Q45-Q48)
('wsc_q45', 'Q45: The First Commandment', 'liturgy', 'Wisdom', 'Memory',
 'Q: Which is the first commandment?\nA: The first commandment is, Thou shalt have no other gods before me.\n(Exodus 20:3)',
 '["Recite together", "Identify ''other gods'' (idols)", "Pray"]',
 'God must be number one. Nothing else can take His place.',
 'Bedside', 48, 216),

('wsc_q46', 'Q46: Required in First', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is required in the first commandment?\nA: The first commandment requireth us to know and acknowledge God to be the only true God, and our God; and to worship and glorify him accordingly.\n(1 Chron 28:9)',
 '["Recite together", "Discuss: How do we acknowledge God?", "Pray"]',
 'Knowing God is the most important thing in life.',
 'Bedside', 48, 216),

('wsc_q47', 'Q47: Forbidden in First', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is forbidden in the first commandment?\nA: The first commandment forbiddeth the denying, or not worshipping and glorifying the true God as God, and our God; and the giving of that worship and glory to any other, which is due to him alone.\n(Psalm 14:1, Rom 1:21)',
 '["Recite together", "Discuss: What does it mean to deny God?", "Pray"]',
 'We must not give God''s glory to anyone else.',
 'Bedside', 48, 216),

('wsc_q48', 'Q48: Meaning of ''Before Me''', 'liturgy', 'Wisdom', 'Reason',
 'Q: What are we specifically taught by these words [before me] in the first commandment?\nA: These words [before me] in the first commandment teach us, That God, who seeth all things, taketh notice of, and is much displeased with, the sin of having any other god.\n(Psalm 44:20-21)',
 '["Recite together", "Discuss: Does God see everything?", "Pray"]',
 'God sees our hearts. He knows what we love most.',
 'Bedside', 48, 216),

-- Second Commandment (Q49-Q52)
('wsc_q49', 'Q49: The Second Commandment', 'liturgy', 'Wisdom', 'Memory',
 'Q: Which is the second commandment?\nA: The second commandment is, Thou shalt not make unto thee any graven image, or any likeness of anything that is in heaven above, or that is in the earth beneath, or that is in the water under the earth: thou shalt not bow down thyself to them, nor serve them: for I the Lord thy God am a jealous God, visiting the iniquity of the fathers upon the children unto the third and fourth generation of them that hate me; and showing mercy unto thousands of them that love me, and keep my commandments.\n(Exodus 20:4-6)',
 '["Recite together", "Discuss: How do we worship correctly?", "Pray"]',
 'We worship God in the way He asks, not how we imagine.',
 'Morning_Circle', 48, 216),

('wsc_q50', 'Q50: Required in Second', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is required in the second commandment?\nA: The second commandment requireth the receiving, observing, and keeping pure and entire, all such religious worship and ordinances as God hath appointed in his word.\n(Deut 32:46)',
 '["Recite together", "Discuss: What has God appointed for worship?", "Pray"]',
 'We stick to what the Bible says for worship.',
 'Morning_Circle', 48, 216),

('wsc_q51', 'Q51: Forbidden in Second', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is forbidden in the second commandment?\nA: The second commandment forbiddeth the worshipping of God by images, or any other way not appointed in his word.\n(Deut 4:15-19)',
 '["Recite together", "Discuss: Why no images of God?", "Pray"]',
 'God is Spirit. No picture can show His glory.',
 'Morning_Circle', 48, 216),

('wsc_q52', 'Q52: Reasons for Second', 'liturgy', 'Wisdom', 'Reason',
 'Q: What are the reasons annexed to the second commandment?\nA: The reasons annexed to the second commandment are, God''s sovereignty over us, his propriety in us, and the zeal he hath to his own worship.\n(Psalm 95:2-3)',
 '["Recite together", "Discuss: God is a jealous God.", "Pray"]',
 'God cares deeply about how we approach Him.',
 'Morning_Circle', 48, 216),

-- Third Commandment (Q53-Q56)
('wsc_q53', 'Q53: The Third Commandment', 'liturgy', 'Wisdom', 'Memory',
 'Q: Which is the third commandment?\nA: The third commandment is, Thou shalt not take the name of the Lord thy God in vain: for the Lord will not hold him guiltless that taketh his name in vain.\n(Exodus 20:7)',
 '["Recite together", "Discuss: Respecting God''s Name", "Pray"]',
 'God''s name is holy. Speak it with love and awe.',
 'Meal_Table', 48, 216),

('wsc_q54', 'Q54: Required in Third', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is required in the third commandment?\nA: The third commandment requireth the holy and reverent use of God''s names, titles, attributes, ordinances, word, and works.\n(Psalm 29:2)',
 '["Recite together", "Discuss: How to speak of God.", "Pray"]',
 'When we talk about God/Bible/Church, we show respect.',
 'Meal_Table', 48, 216),

('wsc_q55', 'Q55: Forbidden in Third', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is forbidden in the third commandment?\nA: The third commandment forbiddeth all profaning or abusing of anything whereby God maketh himself known.\n(Matt 5:34-37)',
 '["Recite together", "Discuss: What is vain use?", "Pray"]',
 'Using God''s name as a swear word or a joke is dangerous.',
 'Meal_Table', 48, 216),

('wsc_q56', 'Q56: Reason for Third', 'liturgy', 'Wisdom', 'Reason',
 'Q: What is the reason annexed to the third commandment?\nA: The reason annexed to the third commandment is, that however the breakers of this commandment may escape punishment from men, yet the Lord our God will not suffer them to escape his righteous judgment.\n(Deut 28:58-59)',
 '["Recite together", "Discuss: God will judge.", "Pray"]',
 'We might fool people, but we cannot fool God.',
 'Meal_Table', 48, 216),

-- Fourth Commandment (Q57-Q62)
('wsc_q57', 'Q57: The Fourth Commandment', 'liturgy', 'Wisdom', 'Memory',
 'Q: Which is the fourth commandment?\nA: The fourth commandment is, Remember the sabbath day, to keep it holy. Six days shalt thou labor, and do all thy work: but the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: for in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.\n(Exodus 20:8-11)',
 '["Recite together", "Discuss: Rest and Worship", "Pray"]',
 'God gave us a gift: a day to stop and rest in Him.',
 'Morning_Circle', 48, 216),

('wsc_q58', 'Q58: Required in Fourth', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is required in the fourth commandment?\nA: The fourth commandment requireth the keeping holy to God such set times as he hath appointed in his word; expressly one whole day in seven, to be a holy sabbath to himself.\n(Lev 19:30)',
 '["Recite together", "Discuss: One day in seven.", "Pray"]',
 'We set aside one whole day for God.',
 'Morning_Circle', 48, 216),

('wsc_q59', 'Q59: Which Day?', 'liturgy', 'Wisdom', 'Memory',
 'Q: Which day of the seven hath God appointed to be the weekly sabbath?\nA: From the beginning of the world to the resurrection of Christ, God appointed the seventh day of the week to be the weekly sabbath; and the first day of the week ever since, to continue to the end of the world, which is the Christian sabbath.\n(Acts 20:7, Rev 1:10)',
 '["Recite together", "Discuss: Why Sunday?", "Pray"]',
 'We celebrate Sunday because Jesus rose on that day!',
 'Morning_Circle', 48, 216),

('wsc_q60', 'Q60: Sanctifying the Sabbath', 'liturgy', 'Wisdom', 'Conscience',
 'Q: How is the sabbath to be sanctified?\nA: The sabbath is to be sanctified by a holy resting all that day, even from such worldly employments and recreations as are lawful on other days; and spending the whole time in the public and private exercises of God''s worship, except so much as is to be taken up in the works of necessity and mercy.\n(Isa 58:13-14)',
 '["Recite together", "Discuss: Works of Mercy", "Pray"]',
 'Rest, worship, and helping others are good for Sunday.',
 'Morning_Circle', 48, 216),

('wsc_q61', 'Q61: Forbidden in Fourth', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is forbidden in the fourth commandment?\nA: The fourth commandment forbiddeth the omission or careless performance of the duties required, and the profaning the day by idleness, or doing that which is in itself sinful, or by unnecessary thoughts, words, or works, about our worldly employments or recreations.\n(Neh 13:15-22)',
 '["Recite together", "Discuss: Keeping it special.", "Pray"]',
 'Don''t treat Sunday just like every other day.',
 'Morning_Circle', 48, 216),

('wsc_q62', 'Q62: Reasons for Fourth', 'liturgy', 'Wisdom', 'Reason',
 'Q: What are the reasons annexed to the fourth commandment?\nA: The reasons annexed to the fourth commandment are, God''s allowing us six days of the week for our own employments, his challenging a special propriety in the seventh, his own example, and his blessing the sabbath day.\n(Exodus 31:15-17)',
 '["Recite together", "Discuss: God''s Example", "Pray"]',
 'God worked and then rested. We do the same.',
 'Morning_Circle', 48, 216),

-- Fifth Commandment (Q63-Q66)
('wsc_q63', 'Q63: The Fifth Commandment', 'liturgy', 'Love', 'Memory',
 'Q: Which is the fifth commandment?\nA: The fifth commandment is, Honor thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee.\n(Exodus 20:12)',
 '["Recite together", "Discuss: Honor parents.", "Pray"]',
 'Honor means listening, respecting, and obeying.',
 'Meal_Table', 48, 216),

('wsc_q64', 'Q64: Required in Fifth', 'liturgy', 'Love', 'Conscience',
 'Q: What is required in the fifth commandment?\nA: The fifth commandment requireth the preserving the honor, and performing the duties, belonging to everyone in their several places and relations, as superiors, inferiors, or equals.\n(Eph 5:21, Rom 13:1)',
 '["Recite together", "Discuss: Respecting others.", "Pray"]',
 'We respect bosses, leaders, and each other too.',
 'Meal_Table', 48, 216),

('wsc_q65', 'Q65: Forbidden in Fifth', 'liturgy', 'Love', 'Conscience',
 'Q: What is forbidden in the fifth commandment?\nA: The fifth commandment forbiddeth the neglecting of, or doing anything against, the honor and duty which belongeth to everyone in their several places and relations.\n(Rom 13:7-8)',
 '["Recite together", "Discuss: Disrespect", "Pray"]',
 'Disrespect and rebellion hurt our relationships.',
 'Meal_Table', 48, 216),

('wsc_q66', 'Q66: Reason for Fifth', 'liturgy', 'Love', 'Reason',
 'Q: What is the reason annexed to the fifth commandment?\nA: The reason annexed to the fifth commandment is, a promise of long life and prosperity (as far as it shall serve for God''s glory and their own good) to all such as keep this commandment.\n(Eph 6:2-3)',
 '["Recite together", "Discuss: The Promise", "Pray"]',
 'God blesses order in the family and society.',
 'Meal_Table', 48, 216),

-- Sixth Commandment (Q67-Q69)
('wsc_q67', 'Q67: The Sixth Commandment', 'liturgy', 'Love', 'Memory',
 'Q: Which is the sixth commandment?\nA: The sixth commandment is, Thou shalt not kill.\n(Exodus 20:13)',
 '["Recite together", "Discuss: Value of Life", "Pray"]',
 'All life is precious because God makes it.',
 'Bedside', 48, 216),

('wsc_q68', 'Q68: Required in Sixth', 'liturgy', 'Love', 'Conscience',
 'Q: What is required in the sixth commandment?\nA: The sixth commandment requireth all lawful endeavors to preserve our own life, and the life of others.\n(Psalm 82:3-4)',
 '["Recite together", "Discuss: Protecting Life", "Pray"]',
 'We specificially try to help people live and thrive.',
 'Bedside', 48, 216),

('wsc_q69', 'Q69: Forbidden in Sixth', 'liturgy', 'Love', 'Conscience',
 'Q: What is forbidden in the sixth commandment?\nA: The sixth commandment forbiddeth the taking away of our own life, or the life of our neighbor unjustly, or whatsoever tendeth thereunto.\n(Gen 9:6)',
 '["Recite together", "Discuss: Anger and Harm", "Pray"]',
 'Jesus says even hating someone is like murder in the heart.',
 'Bedside', 48, 216),

-- Seventh Commandment (Q70)
('wsc_q70', 'Q70: The Seventh Commandment', 'liturgy', 'Love', 'Memory',
 'Q: Which is the seventh commandment?\nA: The seventh commandment is, Thou shalt not commit adultery.\n(Exodus 20:14)',
 '["Recite together", "Discuss: Promises", "Pray"]',
 'Husbands and wives promise to belong only to each other.',
 'Bedside', 48, 216);