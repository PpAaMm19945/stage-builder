-- Migration 0040: Seed Complete WSC Catechism
-- Westminster Shorter Catechism Q11-107 with age-stage progressions
-- Uses INSERT OR REPLACE to overwrite generic data migrated in 0038

-- ============================================================================
-- PHASE 1: COMPLETE WSC Q11-107 IN FORMATIONS TABLE
-- ============================================================================

-- Note: We use REPLACE to ensure we update the generic versions 
-- that might have been migrated from the legacy table in 0038.

INSERT OR REPLACE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months) VALUES

-- Questions about God's Works
('wsc_q11', 'Q11: Providence', 'liturgy', 'Wisdom', 'Memory', 
 'Q: What are God''s works of providence?\nA: God''s works of providence are, his most holy, wise, and powerful preserving and governing all his creatures, and all their actions.',
 '["Recite together", "Discuss: How does God take care of us?", "Pray"]',
 'Lead with wonder. Point to daily provisions as examples.',
 'Morning_Circle', 48, 216),

('wsc_q12', 'Q12: Special Providence', 'liturgy', 'Wisdom', 'Memory',
 'Q: What special act of providence did God exercise toward man in the estate wherein he was created?\nA: When God had created man, he entered into a covenant of life with him, upon condition of perfect obedience; forbidding him to eat of the tree of the knowledge of good and evil, upon the pain of death.',
 '["Recite together", "Discuss: What was the first covenant?", "Pray"]',
 'Connect to the story of Adam and Eve. Let the child retell the story.',
 'Meal_Table', 60, 216),

('wsc_q13', 'Q13: The Fall', 'liturgy', 'Wisdom', 'Memory',
 'Q: Did our first parents continue in the estate wherein they were created?\nA: Our first parents, being left to the freedom of their own will, fell from the estate wherein they were created, by sinning against God.',
 '["Recite together", "Discuss: What happened to Adam and Eve?", "Pray"]',
 'Be gentle. This is heavy truth. Emphasize God''s love even in judgment.',
 'Bedside', 48, 216),

('wsc_q14', 'Q14: What is Sin?', 'liturgy', 'Wisdom', 'Conscience',
 'Q: What is sin?\nA: Sin is any want of conformity unto, or transgression of, the law of God.',
 '["Recite together", "Discuss: What does it mean to disobey God?", "Pray"]',
 'Be honest about your own sin. Model confession, not condemnation.',
 'Bedside', 36, 216),

('wsc_q15', 'Q15: The First Sin', 'liturgy', 'Wisdom', 'Memory',
 'Q: What was the sin whereby our first parents fell from the estate wherein they were created?\nA: The sin whereby our first parents fell from the estate wherein they were created, was their eating the forbidden fruit.',
 '["Recite together", "Discuss: Why was eating the fruit so bad?", "Pray"]',
 'Emphasize: The issue was disobedience, not the fruit itself.',
 'Meal_Table', 48, 216),

('wsc_q16', 'Q16: The Fall of All Mankind', 'liturgy', 'Wisdom', 'Memory',
 'Q: Did all mankind fall in Adam''s first transgression?\nA: The covenant being made with Adam, not only for himself, but for his posterity; all mankind, descending from him by ordinary generation, sinned in him, and fell with him, in his first transgression.',
 '["Recite together", "Discuss: Why does Adam''s sin affect us?", "Pray"]',
 'Use family analogies: a father''s debt affects the whole family.',
 'Meal_Table', 72, 216),

('wsc_q17', 'Q17: The Estate of Sin', 'liturgy', 'Wisdom', 'Memory',
 'Q: Into what estate did the fall bring mankind?\nA: The fall brought mankind into an estate of sin and misery.',
 '["Recite together", "Discuss: What does ''misery'' mean?", "Pray"]',
 'Be age-appropriate. Young children: ''we all do wrong things.'' Older: deeper discussion.',
 'Bedside', 48, 216),

('wsc_q18', 'Q18: Sinfulness of the Estate', 'liturgy', 'Wisdom', 'Memory',
 'Q: Wherein consists the sinfulness of that estate whereinto man fell?\nA: The sinfulness of that estate whereinto man fell, consists in the guilt of Adam''s first sin, the want of original righteousness, and the corruption of his whole nature, which is commonly called Original Sin; together with all actual transgressions which proceed from it.',
 '["Recite together", "Discuss: What is original sin?", "Pray"]',
 'This is complex theology. For younger kids, simplify to: ''We are born with hearts that want to disobey.''',
 'Meal_Table', 84, 216),

('wsc_q19', 'Q19: Misery of the Estate', 'liturgy', 'Wisdom', 'Memory',
 'Q: What is the misery of that estate whereinto man fell?\nA: All mankind by their fall lost communion with God, are under his wrath and curse, and so made liable to all miseries in this life, to death itself, and to the pains of hell forever.',
 '["Recite together", "Discuss: What did sin cost us?", "Pray"]',
 'This is the bad news before the good news. Always follow with the hope of salvation.',
 'Bedside', 72, 216),

('wsc_q20', 'Q20: The Covenant of Grace', 'liturgy', 'Wisdom', 'Affection',
 'Q: Did God leave all mankind to perish in the estate of sin and misery?\nA: God having, out of his mere good pleasure, from all eternity, elected some to everlasting life, did enter into a covenant of grace, to deliver them out of the estate of sin and misery, and to bring them into an estate of salvation by a Redeemer.',
 '["Recite together", "Celebrate: God didn''t leave us!", "Pray"]',
 'This is the GOOD NEWS! Let your joy be visible. This is the gospel.',
 'Morning_Circle', 48, 216),

-- Questions about Christ the Redeemer (Q21-28)
('wsc_q21', 'Q21: Who is the Redeemer?', 'liturgy', 'Wisdom', 'Affection',
 'Q: Who is the Redeemer of God''s elect?\nA: The only Redeemer of God''s elect is the Lord Jesus Christ, who, being the eternal Son of God, became man, and so was, and continueth to be, God and man in two distinct natures, and one person, forever.',
 '["Recite together", "Discuss: Why did Jesus have to be both God and man?", "Pray"]',
 'Celebrate Jesus! Let your love for Him show.',
 'Morning_Circle', 48, 216),

('wsc_q22', 'Q22: The Incarnation', 'liturgy', 'Wisdom', 'Memory',
 'Q: How did Christ, being the Son of God, become man?\nA: Christ, the Son of God, became man, by taking to himself a true body, and a reasonable soul, being conceived by the power of the Holy Ghost, in the womb of the virgin Mary, and born of her, yet without sin.',
 '["Recite together", "Discuss: How is Jesus'' birth different from ours?", "Pray"]',
 'The miracle of Christmas is that God became a baby.',
 'Bedside', 60, 216),

('wsc_q23', 'Q23: Christ''s Offices', 'liturgy', 'Wisdom', 'Memory',
 'Q: What offices doth Christ execute as our Redeemer?\nA: Christ, as our Redeemer, executeth the offices of a prophet, of a priest, and of a king, both in his estate of humiliation and exaltation.',
 '["Recite together", "Discuss: What does a prophet/priest/king do?", "Pray"]',
 'Use concrete examples: prophets speak God''s word, priests bring us to God, kings rule.',
 'Meal_Table', 72, 216),

('wsc_q24', 'Q24: Christ as Prophet', 'liturgy', 'Wisdom', 'Memory',
 'Q: How doth Christ execute the office of a prophet?\nA: Christ executeth the office of a prophet, in revealing to us, by his word and Spirit, the will of God for our salvation.',
 '["Recite together", "Discuss: How does Jesus teach us?", "Pray"]',
 'Point to the Bible: Jesus teaches us through His Word.',
 'Morning_Circle', 60, 216),

('wsc_q25', 'Q25: Christ as Priest', 'liturgy', 'Wisdom', 'Memory',
 'Q: How doth Christ execute the office of a priest?\nA: Christ executeth the office of a priest, in his once offering up of himself a sacrifice to satisfy divine justice, and reconcile us to God; and in making continual intercession for us.',
 '["Recite together", "Discuss: What did Jesus sacrifice?", "Pray"]',
 'The cross is central. Jesus gave Himself for us.',
 'Bedside', 60, 216),

('wsc_q26', 'Q26: Christ as King', 'liturgy', 'Wisdom', 'Memory',
 'Q: How doth Christ execute the office of a king?\nA: Christ executeth the office of a king, in subduing us to himself, in ruling and defending us, and in restraining and conquering all his and our enemies.',
 '["Recite together", "Discuss: How does Jesus protect us?", "Pray"]',
 'Jesus is a good King who fights for us.',
 'Morning_Circle', 60, 216),

('wsc_q27', 'Q27: Christ''s Humiliation', 'liturgy', 'Wisdom', 'Memory',
 'Q: Wherein did Christ''s humiliation consist?\nA: Christ''s humiliation consisted in his being born, and that in a low condition, made under the law, undergoing the miseries of this life, the wrath of God, and the cursed death of the cross; in being buried, and continuing under the power of death for a time.',
 '["Recite together", "Discuss: Why did Jesus suffer so much?", "Pray"]',
 'He did this for love. Let gratitude fill your voice.',
 'Bedside', 72, 216),

('wsc_q28', 'Q28: Christ''s Exaltation', 'liturgy', 'Wisdom', 'Affection',
 'Q: Wherein consisteth Christ''s exaltation?\nA: Christ''s exaltation consisteth in his rising again from the dead on the third day, in ascending up into heaven, in sitting at the right hand of God the Father, and in coming to judge the world at the last day.',
 '["Recite together", "Celebrate the resurrection!", "Pray"]',
 'HE IS RISEN! This is victory. Let your voice show triumph.',
 'Morning_Circle', 48, 216),

-- Questions about Salvation Applied (Q29-38)
('wsc_q29', 'Q29: Partakers of Redemption', 'liturgy', 'Wisdom', 'Memory',
 'Q: How are we made partakers of the redemption purchased by Christ?\nA: We are made partakers of the redemption purchased by Christ, by the effectual application of it to us by his Holy Spirit.',
 '["Recite together", "Discuss: Who applies salvation to us?", "Pray"]',
 'The Holy Spirit is God working in us.',
 'Meal_Table', 72, 216),

('wsc_q30', 'Q30: The Spirit''s Application', 'liturgy', 'Wisdom', 'Memory',
 'Q: How doth the Spirit apply to us the redemption purchased by Christ?\nA: The Spirit applieth to us the redemption purchased by Christ, by working faith in us, and thereby uniting us to Christ in our effectual calling.',
 '["Recite together", "Discuss: What does faith do?", "Pray"]',
 'Faith is the hand that receives the gift.',
 'Meal_Table', 84, 216),

('wsc_q31', 'Q31: Effectual Calling', 'liturgy', 'Wisdom', 'Memory',
 'Q: What is effectual calling?\nA: Effectual calling is the work of God''s Spirit, whereby, convincing us of our sin and misery, enlightening our minds in the knowledge of Christ, and renewing our wills, he doth persuade and enable us to embrace Jesus Christ, freely offered to us in the gospel.',
 '["Recite together", "Discuss: How does God call us?", "Pray"]',
 'God opens our eyes and changes our hearts.',
 'Morning_Circle', 84, 216),

('wsc_q32', 'Q32: Benefits of Effectual Calling', 'liturgy', 'Wisdom', 'Affection',
 'Q: What benefits do they that are effectually called partake of in this life?\nA: They that are effectually called do in this life partake of justification, adoption, and sanctification, and the several benefits which in this life do either accompany or flow from them.',
 '["Recite together", "Discuss: What gifts do we receive?", "Pray"]',
 'These are treasures: declared righteous, made children, being made holy.',
 'Morning_Circle', 84, 216),

('wsc_q33', 'Q33: Justification', 'liturgy', 'Wisdom', 'Memory',
 'Q: What is justification?\nA: Justification is an act of God''s free grace, wherein he pardoneth all our sins, and accepteth us as righteous in his sight, only for the righteousness of Christ imputed to us, and received by faith alone.',
 '["Recite together", "Discuss: How are we made right with God?", "Pray"]',
 'Not by our works, but by Christ''s work FOR us.',
 'Meal_Table', 84, 216),

('wsc_q34', 'Q34: Adoption', 'liturgy', 'Wisdom', 'Affection',
 'Q: What is adoption?\nA: Adoption is an act of God''s free grace, whereby we are received into the number, and have a right to all the privileges, of the sons of God.',
 '["Recite together", "Celebrate: We are God''s children!", "Pray"]',
 'We are not servants, but sons and daughters!',
 'Morning_Circle', 48, 216),

('wsc_q35', 'Q35: Sanctification', 'liturgy', 'Wisdom', 'Memory',
 'Q: What is sanctification?\nA: Sanctification is the work of God''s free grace, whereby we are renewed in the whole man after the image of God, and are enabled more and more to die unto sin, and live unto righteousness.',
 '["Recite together", "Discuss: How does God change us?", "Pray"]',
 'God is making us more like Jesus, little by little.',
 'Bedside', 72, 216),

('wsc_q36', 'Q36: Benefits of Justification, Adoption, Sanctification', 'liturgy', 'Wisdom', 'Memory',
 'Q: What are the benefits which in this life do accompany or flow from justification, adoption, and sanctification?\nA: The benefits which in this life do accompany or flow from justification, adoption, and sanctification, are, assurance of God''s love, peace of conscience, joy in the Holy Ghost, increase of grace, and perseverance therein to the end.',
 '["Recite together", "Discuss: What blessings do Christians have NOW?", "Pray"]',
 'Peace, joy, assurance—these are PRESENT realities.',
 'Morning_Circle', 84, 216),

('wsc_q37', 'Q37: Benefits at Death', 'liturgy', 'Wisdom', 'Affection',
 'Q: What benefits do believers receive from Christ at death?\nA: The souls of believers are at their death made perfect in holiness, and do immediately pass into glory; and their bodies, being still united to Christ, do rest in their graves till the resurrection.',
 '["Recite together", "Discuss: What happens when Christians die?", "Pray"]',
 'Death is not the end for believers—it is the beginning of glory.',
 'Bedside', 72, 216),

('wsc_q38', 'Q38: Benefits at Resurrection', 'liturgy', 'Wisdom', 'Affection',
 'Q: What benefits do believers receive from Christ at the resurrection?\nA: At the resurrection, believers being raised up in glory, shall be openly acknowledged and acquitted in the day of judgment, and made perfectly blessed in the full enjoying of God to all eternity.',
 '["Recite together", "Celebrate our hope!", "Pray"]',
 'This is our HOPE! We will be with God forever.',
 'Morning_Circle', 72, 216);

-- Continue with Q39-107 in next migration to keep file size manageable