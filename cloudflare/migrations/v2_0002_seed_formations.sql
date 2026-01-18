-- Migration v2_0002: Seed Formations
INSERT OR REPLACE INTO formations (
  id, title, formation_type, primary_virtue, biblical_faculty, description, 
  guide_steps, parent_posture, liturgical_script, materials, duration_minutes, 
  context_anchor, cluster_tag, min_age_months, max_age_months, 
  source, content_source
) VALUES
('wsc_q1', 'Q1: Chief End of Man', 'liturgy', 'Wisdom', 'Purpose', 'Q: What is the chief end of man?
A: Man''s chief end is to glorify God, and to enjoy him forever.', '["Recite together", "Discuss: Why were we made?", "Pray"]', 'We exist for God''s glory.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q2', 'Q2: Rule of Direction', 'liturgy', 'Wisdom', 'Memory', 'Q: What rule hath God given to direct us how we may glorify and enjoy him?
A: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.', '["Recite together", "Discuss: The Bible is our rule.", "Pray"]', 'Scripture guides us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q3', 'Q3: Principal Teaching', 'liturgy', 'Wisdom', 'Memory', 'Q: What do the scriptures principally teach?
A: The scriptures principally teach what man is to believe concerning God, and what duty God requires of man.', '["Recite together", "Discuss: Faith and Duty.", "Pray"]', 'Believe and Obey.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q4', 'Q4: What is God?', 'liturgy', 'Wisdom', 'Memory', 'Q: What is God?
A: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.', '["Recite together", "Discuss: God is a Spirit.", "Pray"]', 'God is not like us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q5', 'Q5: One God', 'liturgy', 'Wisdom', 'Memory', 'Q: Are there more Gods than one?
A: There is but one only, the living and true God.', '["Recite together", "Discuss: One God.", "Pray"]', 'No other gods.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q6', 'Q6: The Trinity', 'liturgy', 'Wisdom', 'Memory', 'Q: How many persons are there in the Godhead?
A: There are three persons in the Godhead; the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.', '["Recite together", "Discuss: Three in One.", "Pray"]', 'Mystery of the Trinity.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q7', 'Q7: God''s Decrees', 'liturgy', 'Wisdom', 'Memory', 'Q: What are the decrees of God?
A: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.', '["Recite together", "Discuss: God''s Plan.", "Pray"]', 'God plans everything.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q8', 'Q8: Execution of Decrees', 'liturgy', 'Wisdom', 'Memory', 'Q: How doth God execute his decrees?
A: God executeth his decrees in the works of creation and providence.', '["Recite together", "Discuss: Making and Keeping.", "Pray"]', 'Creation and Providence.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q9', 'Q9: Work of Creation', 'liturgy', 'Wisdom', 'Memory', 'Q: What is the work of creation?
A: The work of creation is, God''s making all things of nothing, by the word of his power, in the space of six days, and all very good.', '["Recite together", "Discuss: Made from nothing.", "Pray"]', 'God speaks, it happens.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
('wsc_q10', 'Q10: Creation of Man', 'liturgy', 'Wisdom', 'Memory', 'Q: How did God create man?
A: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.', '["Recite together", "Discuss: Image of God.", "Pray"]', 'We are like mirrors of God.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core'),
'id', 'title', 'liturgy', 'primary_virtue', 'biblical_faculty', 'description', 'guide_steps', 'parent_posture', NULL, NULL, 15, 'context_anchor', 'catechism', 'min_age_months', 'max_age_months) VALUES

-- Questions about Gods Works
(wsc_q11, Q11: Providence, liturgy, Wisdom, Memory, 
 Q: What are God''s works of providence?\nA: God''s works of providence are', 'westminster_shorter', 'schoolos_core',
'wsc_q12', 'Q12: Special Providence', 'liturgy', 'Wisdom', 'Memory', 'Q: What special act of providence did God exercise toward man in the estate wherein he was created?\nA: When God had created man, he entered into a covenant of life with him, upon condition of perfect obedience; forbidding him to eat of the tree of the knowledge of good and evil, upon the pain of death.', '["Recite together", "Discuss: What was the first covenant?", "Pray"]', 'Connect to the story of Adam and Eve. Let the child retell the story.', NULL, NULL, 15, 'Meal_Table', 'catechism', 60, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q13', 'Q13: The Fall', 'liturgy', 'Wisdom', 'Memory', 'Q: Did our first parents continue in the estate wherein they were created?\nA: Our first parents, being left to the freedom of their own will, fell from the estate wherein they were created, by sinning against God.', '["Recite together", "Discuss: What happened to Adam and Eve?", "Pray"]', 'Be gentle. This is heavy truth. Emphasize God''s love even in judgment.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q14', 'Q14: What is Sin?', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is sin?\nA: Sin is any want of conformity unto, or transgression of, the law of God.', '["Recite together", "Discuss: What does it mean to disobey God?", "Pray"]', 'Be honest about your own sin. Model confession, not condemnation.', NULL, NULL, 15, 'Bedside', 'catechism', 36, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q15', 'Q15: The First Sin', 'liturgy', 'Wisdom', 'Memory', 'Q: What was the sin whereby our first parents fell from the estate wherein they were created?\nA: The sin whereby our first parents fell from the estate wherein they were created, was their eating the forbidden fruit.', '["Recite together", "Discuss: Why was eating the fruit so bad?", "Pray"]', 'Emphasize: The issue was disobedience, not the fruit itself.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q16', 'Q16: The Fall of All Mankind', 'liturgy', 'Wisdom', 'Memory', 'Q: Did all mankind fall in Adam''s first transgression?\nA: The covenant being made with Adam, not only for himself, but for his posterity; all mankind, descending from him by ordinary generation, sinned in him, and fell with him, in his first transgression.', '["Recite together", "Discuss: Why does Adam''s sin affect us?", "Pray"]', 'Use family analogies: a father''s debt affects the whole family.', NULL, NULL, 15, 'Meal_Table', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q17', 'Q17: The Estate of Sin', 'liturgy', 'Wisdom', 'Memory', 'Q: Into what estate did the fall bring mankind?\nA: The fall brought mankind into an estate of sin and misery.', '["Recite together", "Discuss: What does ''misery'' mean?", "Pray"]', 'Be age-appropriate. Young children: ''we all do wrong things.'' Older: deeper discussion.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q18', 'Q18: Sinfulness of the Estate', 'liturgy', 'Wisdom', 'Memory', 'Q: Wherein consists the sinfulness of that estate whereinto man fell?\nA: The sinfulness of that estate whereinto man fell, consists in the guilt of Adam''s first sin, the want of original righteousness, and the corruption of his whole nature, which is commonly called Original Sin; together with all actual transgressions which proceed from it.', '["Recite together", "Discuss: What is original sin?", "Pray"]', 'This is complex theology. For younger kids, simplify to: ''We are born with hearts that want to disobey.''', NULL, NULL, 15, 'Meal_Table', 'catechism', 84, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q19', 'Q19: Misery of the Estate', 'liturgy', 'Wisdom', 'Memory', 'Q: What is the misery of that estate whereinto man fell?\nA: All mankind by their fall lost communion with God, are under his wrath and curse, and so made liable to all miseries in this life, to death itself, and to the pains of hell forever.', '["Recite together", "Discuss: What did sin cost us?", "Pray"]', 'This is the bad news before the good news. Always follow with the hope of salvation.', NULL, NULL, 15, 'Bedside', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q20', 'Q20: The Covenant of Grace', 'liturgy', 'Wisdom', 'Affection', 'Q: Did God leave all mankind to perish in the estate of sin and misery?\nA: God having, out of his mere good pleasure, from all eternity, elected some to everlasting life, did enter into a covenant of grace, to deliver them out of the estate of sin and misery, and to bring them into an estate of salvation by a Redeemer.', '["Recite together", "Celebrate: God didn''t leave us!", "Pray"]', 'This is the GOOD NEWS! Let your joy be visible. This is the gospel.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q21-28)
(wsc_q21', 'Q21: Who is the Redeemer?', 'liturgy', 'Wisdom', 'Affection', 'Q: Who is the Redeemer of God''s elect?\nA: The only Redeemer of God''s elect is the Lord Jesus Christ, who, being the eternal Son of God, became man, and so was, and continueth to be, God and man in two distinct natures, and one person, forever.', '["Recite together", "Discuss: Why did Jesus have to be both God and man?", "Pray"]', 'Celebrate Jesus! Let your love for Him show.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q22', 'Q22: The Incarnation', 'liturgy', 'Wisdom', 'Memory', 'Q: How did Christ, being the Son of God, become man?\nA: Christ, the Son of God, became man, by taking to himself a true body, and a reasonable soul, being conceived by the power of the Holy Ghost, in the womb of the virgin Mary, and born of her, yet without sin.', '["Recite together", "Discuss: How is Jesus'' birth different from ours?", "Pray"]', 'The miracle of Christmas is that God became a baby.', NULL, NULL, 15, 'Bedside', 'catechism', 60, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q23', 'Q23: Christ''s Offices', 'liturgy', 'Wisdom', 'Memory', 'Q: What offices doth Christ execute as our Redeemer?\nA: Christ, as our Redeemer, executeth the offices of a prophet, of a priest, and of a king, both in his estate of humiliation and exaltation.', '["Recite together", "Discuss: What does a prophet/priest/king do?", "Pray"]', 'Use concrete examples: prophets speak God''s word, priests bring us to God, kings rule.', NULL, NULL, 15, 'Meal_Table', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q24', 'Q24: Christ as Prophet', 'liturgy', 'Wisdom', 'Memory', 'Q: How doth Christ execute the office of a prophet?\nA: Christ executeth the office of a prophet, in revealing to us, by his word and Spirit, the will of God for our salvation.', '["Recite together", "Discuss: How does Jesus teach us?", "Pray"]', 'Point to the Bible: Jesus teaches us through His Word.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 60, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q25', 'Q25: Christ as Priest', 'liturgy', 'Wisdom', 'Memory', 'Q: How doth Christ execute the office of a priest?\nA: Christ executeth the office of a priest, in his once offering up of himself a sacrifice to satisfy divine justice, and reconcile us to God; and in making continual intercession for us.', '["Recite together", "Discuss: What did Jesus sacrifice?", "Pray"]', 'The cross is central. Jesus gave Himself for us.', NULL, NULL, 15, 'Bedside', 'catechism', 60, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q26', 'Q26: Christ as King', 'liturgy', 'Wisdom', 'Memory', 'Q: How doth Christ execute the office of a king?\nA: Christ executeth the office of a king, in subduing us to himself, in ruling and defending us, and in restraining and conquering all his and our enemies.', '["Recite together", "Discuss: How does Jesus protect us?", "Pray"]', 'Jesus is a good King who fights for us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 60, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q27', 'Q27: Christ''s Humiliation', 'liturgy', 'Wisdom', 'Memory', 'Q: Wherein did Christ''s humiliation consist?\nA: Christ''s humiliation consisted in his being born, and that in a low condition, made under the law, undergoing the miseries of this life, the wrath of God, and the cursed death of the cross; in being buried, and continuing under the power of death for a time.', '["Recite together", "Discuss: Why did Jesus suffer so much?", "Pray"]', 'He did this for love. Let gratitude fill your voice.', NULL, NULL, 15, 'Bedside', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q28', 'Q28: Christ''s Exaltation', 'liturgy', 'Wisdom', 'Affection', 'Q: Wherein consisteth Christ''s exaltation?\nA: Christ''s exaltation consisteth in his rising again from the dead on the third day, in ascending up into heaven, in sitting at the right hand of God the Father, and in coming to judge the world at the last day.', '["Recite together", "Celebrate the resurrection!", "Pray"]', 'HE IS RISEN! This is victory. Let your voice show triumph.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q29-38)
(wsc_q29', 'Q29: Partakers of Redemption', 'liturgy', 'Wisdom', 'Memory', 'Q: How are we made partakers of the redemption purchased by Christ?\nA: We are made partakers of the redemption purchased by Christ, by the effectual application of it to us by his Holy Spirit.', '["Recite together", "Discuss: Who applies salvation to us?", "Pray"]', 'The Holy Spirit is God working in us.', NULL, NULL, 15, 'Meal_Table', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q30', 'Q30: The Spirit''s Application', 'liturgy', 'Wisdom', 'Memory', 'Q: How doth the Spirit apply to us the redemption purchased by Christ?\nA: The Spirit applieth to us the redemption purchased by Christ, by working faith in us, and thereby uniting us to Christ in our effectual calling.', '["Recite together", "Discuss: What does faith do?", "Pray"]', 'Faith is the hand that receives the gift.', NULL, NULL, 15, 'Meal_Table', 'catechism', 84, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q31', 'Q31: Effectual Calling', 'liturgy', 'Wisdom', 'Memory', 'Q: What is effectual calling?\nA: Effectual calling is the work of God''s Spirit, whereby, convincing us of our sin and misery, enlightening our minds in the knowledge of Christ, and renewing our wills, he doth persuade and enable us to embrace Jesus Christ, freely offered to us in the gospel.', '["Recite together", "Discuss: How does God call us?", "Pray"]', 'God opens our eyes and changes our hearts.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 84, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q32', 'Q32: Benefits of Effectual Calling', 'liturgy', 'Wisdom', 'Affection', 'Q: What benefits do they that are effectually called partake of in this life?\nA: They that are effectually called do in this life partake of justification, adoption, and sanctification, and the several benefits which in this life do either accompany or flow from them.', '["Recite together", "Discuss: What gifts do we receive?", "Pray"]', 'These are treasures: declared righteous, made children, being made holy.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 84, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q33', 'Q33: Justification', 'liturgy', 'Wisdom', 'Memory', 'Q: What is justification?\nA: Justification is an act of God''s free grace, wherein he pardoneth all our sins, and accepteth us as righteous in his sight, only for the righteousness of Christ imputed to us, and received by faith alone.', '["Recite together", "Discuss: How are we made right with God?", "Pray"]', 'Not by our works, but by Christ''s work FOR us.', NULL, NULL, 15, 'Meal_Table', 'catechism', 84, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q34', 'Q34: Adoption', 'liturgy', 'Wisdom', 'Affection', 'Q: What is adoption?\nA: Adoption is an act of God''s free grace, whereby we are received into the number, and have a right to all the privileges, of the sons of God.', '["Recite together", "Celebrate: We are God''s children!", "Pray"]', 'We are not servants, but sons and daughters!', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q35', 'Q35: Sanctification', 'liturgy', 'Wisdom', 'Memory', 'Q: What is sanctification?\nA: Sanctification is the work of God''s free grace, whereby we are renewed in the whole man after the image of God, and are enabled more and more to die unto sin, and live unto righteousness.', '["Recite together", "Discuss: How does God change us?", "Pray"]', 'God is making us more like Jesus, little by little.', NULL, NULL, 15, 'Bedside', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q36', 'Q36: Benefits of Justification, Adoption, Sanctification', 'liturgy', 'Wisdom', 'Memory', 'Q: What are the benefits which in this life do accompany or flow from justification, adoption, and sanctification?\nA: The benefits which in this life do accompany or flow from justification, adoption, and sanctification, are, assurance of God''s love, peace of conscience, joy in the Holy Ghost, increase of grace, and perseverance therein to the end.', '["Recite together", "Discuss: What blessings do Christians have NOW?", "Pray"]', 'Peace, joy, assurance—these are PRESENT realities.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 84, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q37', 'Q37: Benefits at Death', 'liturgy', 'Wisdom', 'Affection', 'Q: What benefits do believers receive from Christ at death?\nA: The souls of believers are at their death made perfect in holiness, and do immediately pass into glory; and their bodies, being still united to Christ, do rest in their graves till the resurrection.', '["Recite together", "Discuss: What happens when Christians die?", "Pray"]', 'Death is not the end for believers—it is the beginning of glory.', NULL, NULL, 15, 'Bedside', 'catechism', 72, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q38', 'Q38: Benefits at Resurrection', 'liturgy', 'Wisdom', 'Affection', 'Q: What benefits do believers receive from Christ at the resurrection?\nA: At the resurrection, believers being raised up in glory, shall be openly acknowledged and acquitted in the day of judgment, and made perfectly blessed in the full enjoying of God to all eternity.', '["Recite together", "Celebrate our hope!", "Pray"]', 'This is our HOPE! We will be with God forever.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 72, '216);

-- Continue with Q39-107 in next migration to keep file size manageable', 'westminster_shorter', 'schoolos_core',
'id', 'title', 'liturgy', 'primary_virtue', 'biblical_faculty', 'description', 'guide_steps', 'parent_posture', NULL, NULL, 15, 'context_anchor', 'catechism', 'min_age_months', 'max_age_months) VALUES

-- Introduction to Duty and the Moral Law (Q39-Q42)
(wsc_q39', 'westminster_shorter', 'schoolos_core',
'wsc_q40', 'Q40: Rule of Obedience', 'liturgy', 'Wisdom', 'Memory', 'Q: What did God at first reveal to man for the rule of his obedience?\nA: The rule which God at first revealed to man for his obedience, was the moral law.\n(Rom 2:14-15)', '["Recite together", "Discuss: How do we know what is right?", "Pray"]', 'God writes His law on our hearts and in His Word.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q41', 'Q41: The Moral Law', 'liturgy', 'Wisdom', 'Memory', 'Q: Where is the moral law summarily comprehended?\nA: The moral law is summarily comprehended in the ten commandments.\n(Deut 10:4, Matt 19:17)', '["Recite together", "List the 10 Commandments (briefly)", "Pray"]', 'The Ten Commandments act as a summary of God''s will.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q42', 'Q42: Sum of the Commandments', 'liturgy', 'Love', 'Affection', 'Q: What is the sum of the ten commandments?\nA: The sum of the ten commandments is, to love the Lord our God with all our heart, with all our soul, with all our strength, and with all our mind; and our neighbor as ourselves.\n(Matt 22:37-40)', '["Recite together", "Discuss: Love God and Love Neighbor", "Pray"]', 'It all comes down to love. Love God, love people.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q43-Q44)
(wsc_q43', 'Q43: Preface to Commandments', 'liturgy', 'Wisdom', 'Memory', 'Q: What is the preface to the ten commandments?\nA: The preface to the ten commandments is in these words, I am the Lord thy God, which have brought thee out of the land of Egypt, out of the house of bondage.\n(Exodus 20:2)', '["Recite together", "Discuss: Who gave the commandments?", "Pray"]', 'Before He gave rules, He gave redemption. He saved them first.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q44', 'Q44: Teaching of the Preface', 'liturgy', 'Wisdom', 'Reason', 'Q: What doth the preface to the ten commandments teach us?\nA: The preface to the ten commandments teacheth us, that because God is the Lord, and our God, and Redeemer, therefore we are bound to keep all his commandments.\n(Luke 1:74-75)', '["Recite together", "Discuss: Why do we obey?", "Pray"]', 'We obey because we belong to Him and He bought us.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q45-Q48)
(wsc_q45', 'Q45: The First Commandment', 'liturgy', 'Wisdom', 'Memory', 'Q: Which is the first commandment?\nA: The first commandment is, Thou shalt have no other gods before me.\n(Exodus 20:3)', '["Recite together", "Identify ''other gods'' (idols)", "Pray"]', 'God must be number one. Nothing else can take His place.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q46', 'Q46: Required in First', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is required in the first commandment?\nA: The first commandment requireth us to know and acknowledge God to be the only true God, and our God; and to worship and glorify him accordingly.\n(1 Chron 28:9)', '["Recite together", "Discuss: How do we acknowledge God?", "Pray"]', 'Knowing God is the most important thing in life.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q47', 'Q47: Forbidden in First', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is forbidden in the first commandment?\nA: The first commandment forbiddeth the denying, or not worshipping and glorifying the true God as God, and our God; and the giving of that worship and glory to any other, which is due to him alone.\n(Psalm 14:1, Rom 1:21)', '["Recite together", "Discuss: What does it mean to deny God?", "Pray"]', 'We must not give God''s glory to anyone else.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q48', 'Q48: Meaning of ''Before Me''', 'liturgy', 'Wisdom', 'Reason', 'Q: What are we specifically taught by these words [before me] in the first commandment?\nA: These words [before me] in the first commandment teach us, That God, who seeth all things, taketh notice of, and is much displeased with, the sin of having any other god.\n(Psalm 44:20-21)', '["Recite together", "Discuss: Does God see everything?", "Pray"]', 'God sees our hearts. He knows what we love most.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q49-Q52)
(wsc_q49', 'Q49: The Second Commandment', 'liturgy', 'Wisdom', 'Memory', 'Q: Which is the second commandment?\nA: The second commandment is, Thou shalt not make unto thee any graven image, or any likeness of anything that is in heaven above, or that is in the earth beneath, or that is in the water under the earth: thou shalt not bow down thyself to them, nor serve them: for I the Lord thy God am a jealous God, visiting the iniquity of the fathers upon the children unto the third and fourth generation of them that hate me; and showing mercy unto thousands of them that love me, and keep my commandments.\n(Exodus 20:4-6)', '["Recite together", "Discuss: How do we worship correctly?", "Pray"]', 'We worship God in the way He asks, not how we imagine.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q50', 'Q50: Required in Second', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is required in the second commandment?\nA: The second commandment requireth the receiving, observing, and keeping pure and entire, all such religious worship and ordinances as God hath appointed in his word.\n(Deut 32:46)', '["Recite together", "Discuss: What has God appointed for worship?", "Pray"]', 'We stick to what the Bible says for worship.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q51', 'Q51: Forbidden in Second', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is forbidden in the second commandment?\nA: The second commandment forbiddeth the worshipping of God by images, or any other way not appointed in his word.\n(Deut 4:15-19)', '["Recite together", "Discuss: Why no images of God?", "Pray"]', 'God is Spirit. No picture can show His glory.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q52', 'Q52: Reasons for Second', 'liturgy', 'Wisdom', 'Reason', 'Q: What are the reasons annexed to the second commandment?\nA: The reasons annexed to the second commandment are, God''s sovereignty over us, his propriety in us, and the zeal he hath to his own worship.\n(Psalm 95:2-3)', '["Recite together", "Discuss: God is a jealous God.", "Pray"]', 'God cares deeply about how we approach Him.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q53-Q56)
(wsc_q53', 'Q53: The Third Commandment', 'liturgy', 'Wisdom', 'Memory', 'Q: Which is the third commandment?\nA: The third commandment is, Thou shalt not take the name of the Lord thy God in vain: for the Lord will not hold him guiltless that taketh his name in vain.\n(Exodus 20:7)', '["Recite together", "Discuss: Respecting God''s Name", "Pray"]', 'God''s name is holy. Speak it with love and awe.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q54', 'Q54: Required in Third', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is required in the third commandment?\nA: The third commandment requireth the holy and reverent use of God''s names, titles, attributes, ordinances, word, and works.\n(Psalm 29:2)', '["Recite together", "Discuss: How to speak of God.", "Pray"]', 'When we talk about God/Bible/Church, we show respect.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q55', 'Q55: Forbidden in Third', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is forbidden in the third commandment?\nA: The third commandment forbiddeth all profaning or abusing of anything whereby God maketh himself known.\n(Matt 5:34-37)', '["Recite together", "Discuss: What is vain use?", "Pray"]', 'Using God''s name as a swear word or a joke is dangerous.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q56', 'Q56: Reason for Third', 'liturgy', 'Wisdom', 'Reason', 'Q: What is the reason annexed to the third commandment?\nA: The reason annexed to the third commandment is, that however the breakers of this commandment may escape punishment from men, yet the Lord our God will not suffer them to escape his righteous judgment.\n(Deut 28:58-59)', '["Recite together", "Discuss: God will judge.", "Pray"]', 'We might fool people, but we cannot fool God.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q57-Q62)
(wsc_q57', 'Q57: The Fourth Commandment', 'liturgy', 'Wisdom', 'Memory', 'Q: Which is the fourth commandment?\nA: The fourth commandment is, Remember the sabbath day, to keep it holy. Six days shalt thou labor, and do all thy work: but the seventh day is the sabbath of the Lord thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates: for in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the Lord blessed the sabbath day, and hallowed it.\n(Exodus 20:8-11)', '["Recite together", "Discuss: Rest and Worship", "Pray"]', 'God gave us a gift: a day to stop and rest in Him.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q58', 'Q58: Required in Fourth', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is required in the fourth commandment?\nA: The fourth commandment requireth the keeping holy to God such set times as he hath appointed in his word; expressly one whole day in seven, to be a holy sabbath to himself.\n(Lev 19:30)', '["Recite together", "Discuss: One day in seven.", "Pray"]', 'We set aside one whole day for God.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q59', 'Q59: Which Day?', 'liturgy', 'Wisdom', 'Memory', 'Q: Which day of the seven hath God appointed to be the weekly sabbath?\nA: From the beginning of the world to the resurrection of Christ, God appointed the seventh day of the week to be the weekly sabbath; and the first day of the week ever since, to continue to the end of the world, which is the Christian sabbath.\n(Acts 20:7, Rev 1:10)', '["Recite together", "Discuss: Why Sunday?", "Pray"]', 'We celebrate Sunday because Jesus rose on that day!', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q60', 'Q60: Sanctifying the Sabbath', 'liturgy', 'Wisdom', 'Conscience', 'Q: How is the sabbath to be sanctified?\nA: The sabbath is to be sanctified by a holy resting all that day, even from such worldly employments and recreations as are lawful on other days; and spending the whole time in the public and private exercises of God''s worship, except so much as is to be taken up in the works of necessity and mercy.\n(Isa 58:13-14)', '["Recite together", "Discuss: Works of Mercy", "Pray"]', 'Rest, worship, and helping others are good for Sunday.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q61', 'Q61: Forbidden in Fourth', 'liturgy', 'Wisdom', 'Conscience', 'Q: What is forbidden in the fourth commandment?\nA: The fourth commandment forbiddeth the omission or careless performance of the duties required, and the profaning the day by idleness, or doing that which is in itself sinful, or by unnecessary thoughts, words, or works, about our worldly employments or recreations.\n(Neh 13:15-22)', '["Recite together", "Discuss: Keeping it special.", "Pray"]', 'Don''t treat Sunday just like every other day.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q62', 'Q62: Reasons for Fourth', 'liturgy', 'Wisdom', 'Reason', 'Q: What are the reasons annexed to the fourth commandment?\nA: The reasons annexed to the fourth commandment are, God''s allowing us six days of the week for our own employments, his challenging a special propriety in the seventh, his own example, and his blessing the sabbath day.\n(Exodus 31:15-17)', '["Recite together", "Discuss: God''s Example", "Pray"]', 'God worked and then rested. We do the same.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q63-Q66)
(wsc_q63', 'Q63: The Fifth Commandment', 'liturgy', 'Love', 'Memory', 'Q: Which is the fifth commandment?\nA: The fifth commandment is, Honor thy father and thy mother: that thy days may be long upon the land which the Lord thy God giveth thee.\n(Exodus 20:12)', '["Recite together", "Discuss: Honor parents.", "Pray"]', 'Honor means listening, respecting, and obeying.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q64', 'Q64: Required in Fifth', 'liturgy', 'Love', 'Conscience', 'Q: What is required in the fifth commandment?\nA: The fifth commandment requireth the preserving the honor, and performing the duties, belonging to everyone in their several places and relations, as superiors, inferiors, or equals.\n(Eph 5:21, Rom 13:1)', '["Recite together", "Discuss: Respecting others.", "Pray"]', 'We respect bosses, leaders, and each other too.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q65', 'Q65: Forbidden in Fifth', 'liturgy', 'Love', 'Conscience', 'Q: What is forbidden in the fifth commandment?\nA: The fifth commandment forbiddeth the neglecting of, or doing anything against, the honor and duty which belongeth to everyone in their several places and relations.\n(Rom 13:7-8)', '["Recite together", "Discuss: Disrespect", "Pray"]', 'Disrespect and rebellion hurt our relationships.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q66', 'Q66: Reason for Fifth', 'liturgy', 'Love', 'Reason', 'Q: What is the reason annexed to the fifth commandment?\nA: The reason annexed to the fifth commandment is, a promise of long life and prosperity (as far as it shall serve for God''s glory and their own good) to all such as keep this commandment.\n(Eph 6:2-3)', '["Recite together", "Discuss: The Promise", "Pray"]', 'God blesses order in the family and society.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q67-Q69)
(wsc_q67', 'Q67: The Sixth Commandment', 'liturgy', 'Love', 'Memory', 'Q: Which is the sixth commandment?\nA: The sixth commandment is, Thou shalt not kill.\n(Exodus 20:13)', '["Recite together", "Discuss: Value of Life", "Pray"]', 'All life is precious because God makes it.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q68', 'Q68: Required in Sixth', 'liturgy', 'Love', 'Conscience', 'Q: What is required in the sixth commandment?\nA: The sixth commandment requireth all lawful endeavors to preserve our own life, and the life of others.\n(Psalm 82:3-4)', '["Recite together", "Discuss: Protecting Life", "Pray"]', 'We specificially try to help people live and thrive.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q69', 'Q69: Forbidden in Sixth', 'liturgy', 'Love', 'Conscience', 'Q: What is forbidden in the sixth commandment?\nA: The sixth commandment forbiddeth the taking away of our own life, or the life of our neighbor unjustly, or whatsoever tendeth thereunto.\n(Gen 9:6)', '["Recite together", "Discuss: Anger and Harm", "Pray"]', 'Jesus says even hating someone is like murder in the heart.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q70)
(wsc_q70', 'Q70: The Seventh Commandment', 'liturgy', 'Love', 'Memory', 'Q: Which is the seventh commandment?\nA: The seventh commandment is, Thou shalt not commit adultery.\n(Exodus 20:14)', '["Recite together", "Discuss: Promises", "Pray"]', 'Husbands and wives promise to belong only to each other.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'7th Commandment) through the end of the Catechism logic (Prayer).
-- Uses INSERT OR REPLACE to avoid unique constraint errors

INSERT OR REPLACE INTO formations (id', 'title', 'liturgy', 'primary_virtue', 'biblical_faculty', 'description', 'guide_steps', 'parent_posture', NULL, NULL, 15, 'context_anchor', 'catechism', 'min_age_months', 'max_age_months) VALUES

-- Eighth Commandment (Q71-Q75)
(wsc_q71', 'westminster_shorter', 'schoolos_core',
'wsc_q72', 'Q72: Required in Eighth', 'liturgy', 'Stewardship', 'Conscience', 'Q: What is required in the eighth commandment?\nA: The eighth commandment requireth the lawful procuring and furthering the wealth and outward estate of ourselves and others.\n(Lev 25:35, Eph 4:28)', '["Recite together", "Discuss: Working hard and sharing.", "Pray"]', 'Work is a good gift from God to help us give.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q73', 'Q73: Forbidden in Eighth', 'liturgy', 'Stewardship', 'Conscience', 'Q: What is forbidden in the eighth commandment?\nA: The eighth commandment forbiddeth whatsoever doth, or may, unjustly hinder our own, or our neighbor''s, wealth or outward estate.\n(Prov 28:19, 1 Tim 5:8)', '["Recite together", "Discuss: Laziness and Taking.", "Pray"]', 'We do not take what isn''t ours, and we don''t waste what is.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q74', 'Q74: Reason for Eighth', 'liturgy', 'Stewardship', 'Reason', 'Q: What is the reason annexed to the eighth commandment?\nA: The reason annexed to the eighth commandment is, that God, who giveth to all men liberally, forbids all unjust ways of getting, keeping, or using any part of that which is another''s.\n(Heb 13:5)', '["Recite together", "Discuss: Trusting God''s provision.", "Pray"]', 'God gives us what we need, so we don''t need to steal.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q75', 'Q75: The Ninth Commandment', 'liturgy', 'Truth', 'Memory', 'Q: Which is the ninth commandment?\nA: The ninth commandment is, Thou shalt not bear false witness against thy neighbor.\n(Exodus 20:16)', '["Recite together", "Discuss: Telling the Truth.", "Pray"]', 'Truth matters because God is Truth.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q76', 'Q76: Required in Ninth', 'liturgy', 'Truth', 'Conscience', 'Q: What is required in the ninth commandment?\nA: The ninth commandment requireth the maintaining and promoting of truth between man and man, and of our own and our neighbor''s good name, especially in witness-bearing.\n(Zech 8:16, 3 John 12)', '["Recite together", "Discuss: Protecting Reputations.", "Pray"]', 'We speak careful words that build people up.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q77', 'Q77: Forbidden in Ninth', 'liturgy', 'Truth', 'Conscience', 'Q: What is forbidden in the ninth commandment?\nA: The ninth commandment forbiddeth whatsoever is prejudicial to truth, or injurious to our own or our neighbor''s good name.\n(Prov 19:5, Luke 3:14)', '["Recite together", "Discuss: Lying and Gossip.", "Pray"]', 'Lying and gossiping hurt people deeply.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q78-Q81)
(wsc_q78', 'Q78: The Tenth Commandment', 'liturgy', 'Contentment', 'Memory', 'Q: Which is the tenth commandment?\nA: The tenth commandment is, Thou shalt not covet thy neighbor''s house, thou shalt not covet thy neighbor''s wife, nor his manservant, nor his maidservant, nor his ox, nor his ass, nor anything that is thy neighbor''s.\n(Exodus 20:17)', '["Recite together", "Discuss: Wanting what others have.", "Pray"]', 'God gives us exactly what is best for us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q79', 'Q79: Required in Tenth', 'liturgy', 'Contentment', 'Conscience', 'Q: What is required in the tenth commandment?\nA: The tenth commandment requireth full contentment with our own condition, with a right and charitable frame of spirit toward our neighbor and all that is his.\n(Heb 13:5, Rom 12:15)', '["Recite together", "Discuss: Being Happy with what we have.", "Pray"]', 'Contentment means being happy with God''s plan for us.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q80', 'Q80: Forbidden in Tenth', 'liturgy', 'Contentment', 'Conscience', 'Q: What is forbidden in the tenth commandment?\nA: The tenth commandment forbiddeth all discontentment with our own estate, envying or grieving at the good of our neighbor, and all inordinate motions and affections to anything that is his.\n(1 Cor 10:10, Gal 5:26)', '["Recite together", "Discuss: Jealousy.", "Pray"]', 'Jealousy makes our hearts sick. Rejoice with others.', NULL, NULL, 15, 'Morning_Circle', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q81', 'Q81: No Man Able to Keep', 'liturgy', 'Humility', 'Conscience', '-- NOTE: Mapping logic continues from users preferred numbering
 Q: Is any man able perfectly to keep the commandments of God?\nA: No mere man since the fall is able in this life perfectly to keep the commandments of God', 'but doth daily break them in thought', 'word', NULL, NULL, 15, 'and deed.\n(Eccl 7:20', 'catechism', 'Rom 3:23),
 ["Recite together"', '"Discuss: Nobody is perfect."', 'westminster_shorter', 'schoolos_core',
'wsc_q82', 'Q82: All Transgressions', 'liturgy', 'Humility', 'Reason', 'Q: Are all transgressions of the law equally heinous?\nA: Some sins in themselves, and by reason of several aggravations, are more heinous in the sight of God than others.\n(John 19:11)', '["Recite together", "Discuss: Big sins and little sins?", "Pray"]', 'Some sins hurt more, but all are sins.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q83', 'Q83: Deserve for Sin', 'liturgy', 'Humility', 'Conscience', 'Q: What doth every sin deserve?\nA: Every sin deserveth God''s wrath and curse, both in this life, and that which is to come.\n(Gal 3:10, Matt 25:41)', '["Recite together", "Discuss: The seriousness of sin.", "Pray"]', 'Sin is deadly serious. It separates us from God.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q84', 'Q84: Redemption', 'liturgy', 'Faith', 'Reason', 'Q: What doth God require of us, that we may escape his wrath and curse due to us for sin?\nA: To escape the wrath and curse of God due to us for sin, God requireth of us faith in Jesus Christ, repentance unto life, with the diligent use of all the outward means whereby Christ communicateth to us the benefits of redemption.\n(Acts 20:21)', '["Recite together", "Discuss: Faith and Repentance.", "Pray"]', 'We need faith in Jesus and a turning away from sin.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q85', 'Q85: Faith in Jesus', 'liturgy', 'Faith', 'Conscience', 'Q: What is faith in Jesus Christ?\nA: Faith in Jesus Christ is a saving grace, whereby we receive and rest upon him alone for salvation, as he is offered to us in the gospel.\n(Heb 10:39, John 1:12)', '["Recite together", "Discuss: Trusting Jesus alone.", "Pray"]', 'Faith is trusting Jesus to save us.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q86', 'Q86: Repentance unto Life', 'liturgy', 'Faith', 'Conscience', 'Q: What is repentance unto life?\nA: Repentance unto life is a saving grace, whereby a sinner, out of a true sense of his sin, and apprehension of the mercy of God in Christ, doth, with grief and hatred of his sin, turn from it unto God, with full purpose of, and endeavor after, new obedience.\n(Acts 11:18, Joel 2:12-13)', '["Recite together", "Discuss: Turning around.", "Pray"]', 'Repentance means being sorry and changing direction.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q87-Q97)
(wsc_q87', 'Q87: Means of Grace', 'liturgy', 'Wisdom', 'Reason', 'Q: What are the outward and ordinary means whereby Christ communicateth to us the benefits of redemption?\nA: The outward and ordinary means whereby Christ communicateth to us the benefits of redemption are, his ordinances, especially the word, sacraments, and prayer; all which are made effectual to the elect for salvation.\n(Matt 28:19-20, Acts 2:42)', '["Recite together", "Discuss: How God grows us.", "Pray"]', 'God uses Bible, Sacraments, and Prayer to feed us.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q88', 'Q88: Word Made Effectual', 'liturgy', 'Wisdom', 'Reason', 'Q: How is the word made effectual to salvation?\nA: The Spirit of God maketh the reading, but especially the preaching of the word, an effectual means of convincing and converting sinners, and of building them up in holiness and comfort, through faith, unto salvation.\n(Neh 8:8, Rom 10:14-17)', '["Recite together", "Discuss: Reading and Preaching.", "Pray"]', 'The Holy Spirit makes the Bible come alive in our hearts.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q89', 'Q89: How to Read the Word', 'liturgy', 'Wisdom', 'Conscience', 'Q: How is the word to be read and heard, that it may become effectual to salvation?\nA: That the word may become effectual to salvation, we must attend thereunto with diligence, preparation, and prayer; receive it with faith and love, lay it up in our hearts, and practice it in our lives.\n(Prov 8:34, Psalm 119:11)', '["Recite together", "Discuss: Listening carefully.", "Pray"]', 'We get ready to hear God speak.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q90', 'Q90: Sacraments Effective', 'liturgy', 'Worship', 'Reason', 'Q: How do the sacraments become effectual means of salvation?\nA: The sacraments become effectual means of salvation, not from any virtue in them, or in him that doth administer them; but only by the blessing of Christ, and the working of his Spirit in them that by faith receive them.\n(1 Pet 3:21, 1 Cor 3:7)', '["Recite together", "Discuss: It is not magic.", "Pray"]', 'Sacraments work because Jesus blesses them, not because of the water or bread.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q91', 'Q91: Nature of Sacrament', 'liturgy', 'Worship', 'Memory', 'Q: What is a sacrament?\nA: A sacrament is an holy ordinance instituted by Christ; wherein, by sensible signs, Christ, and the benefits of the new covenant, are represented, sealed, and applied to believers.\n(Gen 17:7, 10)', '["Recite together", "Discuss: Signs and Seals.", "Pray"]', 'A sacrament is a picture we can see and touch.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q92', 'Q92: New Testament Sacraments', 'liturgy', 'Worship', 'Memory', 'Q: Which are the sacraments of the New Testament?\nA: The sacraments of the New Testament are, Baptism, and the Lord''s Supper.\n(Matt 28:19, 1 Cor 11:23)', '["Recite together", "Discuss: Two Sacraments.", "Pray"]', 'Jesus gave us two special ceremonies: Baptism and Communion.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q93', 'Q93: Baptism', 'liturgy', 'Worship', 'Memory', 'Q: What is baptism?\nA: Baptism is a sacrament, wherein the washing with water in the name of the Father, and of the Son, and of the Holy Ghost, doth signify and seal our ingrafting into Christ, and partaking of the benefits of the covenant of grace, and our engagement to be the Lord''s.\n(Matt 28:19, Rom 6:3-4)', '["Recite together", "Discuss: Washing with water.", "Pray"]', 'Baptism is God''s mark on us, washing us clean.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q94', 'Q94: Baptism Subjects', 'liturgy', 'Worship', 'Reason', 'Q: To whom is baptism to be administered?\nA: Baptism is not to be administered to any that are out of the visible church, till they profess their faith in Christ, and obedience to him; but the infants of such as are members of the visible church are to be baptized.\n(Acts 2:38-39, Gen 17:7)', '["Recite together", "Discuss: Believers and their children.", "Pray"]', 'God includes children in His family promise.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q95', 'Q95: Lord''s Supper', 'liturgy', 'Worship', 'Memory', 'Q: What is the Lord''s supper?\nA: The Lord''s supper is a sacrament, wherein, by giving and receiving bread and wine, according to Christ''s appointment, his death is showed forth; and the worthy receivers are, not after a corporal and carnal manner, but by faith, made partakers of his body and blood, with all his benefits, to their spiritual nourishment and growth in grace.\n(1 Cor 11:23-26)', '["Recite together", "Discuss: Bread and Wine.", "Pray"]', 'We remember Jesus'' death and He feeds our spirits.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q96', 'Q96: Worthy Receiving', 'liturgy', 'Worship', 'Conscience', 'Q: What is required to the worthy receiving of the Lord''s supper?\nA: It is required of them that would worthily partake of the Lord''s supper, that they examine themselves of their knowledge to discern the Lord''s body, of their faith to feed upon him, of their repentance, love, and new obedience; lest, coming unworthily, they eat and drink judgment to themselves.\n(1 Cor 11:27-29)', '["Recite together", "Discuss: Checking our hearts.", "Pray"]', 'We must trust and love Jesus when we come to His table.', NULL, NULL, 15, 'Meal_Table', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q97', 'Q97: Prayer', 'liturgy', 'Dependence', 'Memory', 'Q: What is prayer?\nA: Prayer is an offering up of our desires unto God, for things agreeable to his will, in the name of Christ, with confession of our sins, and thankful acknowledgment of his mercies.\n(Psalm 62:8, John 16:23)', '["Recite together", "Discuss: Talking to God.", "Pray"]', 'Prayer is asking God for what He wants for us.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'Q98-Q106)
(wsc_q98', 'Q98: Rule of Prayer', 'liturgy', 'Dependence', 'Memory', 'Q: What rule hath God given for our direction in prayer?\nA: The whole word of God is of use to direct us in prayer; but the special rule of direction is that form of prayer which Christ taught his disciples, commonly called the Lord''s prayer.\n(Matt 6:9)', '["Recite together", "Discuss: The Lord''s Prayer.", "Pray"]', 'Jesus gave us a perfect example of how to pray.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q99', 'Q99: Preface of Lord''s Prayer', 'liturgy', 'Dependence', 'Memory', 'Q: What doth the preface of the Lord''s prayer teach us?\nA: The preface of the Lord''s prayer (which is, Our Father which art in heaven) teacheth us to draw near to God with all holy reverence and confidence, as children to a father, able and ready to help us; and that we should pray with and for others.\n(Rom 8:15)', '["Recite together", "Discuss: Our Father.", "Pray"]', 'God is our Dad in heaven who loves to help us.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q100', 'Q100: First Petition', 'liturgy', 'Worship', 'Memory', 'Q: What do we pray for in the first petition?\nA: In the first petition (which is, Hallowed be thy name) we pray, that God would enable us and others to glorify him in all that whereby he maketh himself known; and that he would dispose all things to his own glory.\n(Psalm 67:1-3)', '["Recite together", "Discuss: God''s Name is special.", "Pray"]', 'We ask that everyone would honor God.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q101', 'Q101: Second Petition', 'liturgy', 'Hope', 'Memory', 'Q: What do we pray for in the second petition?\nA: In the second petition (which is, Thy kingdom come) we pray, that Satan''s kingdom may be destroyed; and that the kingdom of grace may be advanced, ourselves and others brought into it, and kept in it; and that the kingdom of glory may be hastened.\n(Psalm 68:1)', '["Recite together", "Discuss: God''s Kingdom.", "Pray"]', 'We want Jesus to rule everywhere.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q102', 'Q102: Third Petition', 'liturgy', 'Obedience', 'Memory', 'Q: What do we pray for in the third petition?\nA: In the third petition (which is, Thy will be done in earth, as it is in heaven) we pray, that God, by his grace, would make us able and willing to know, obey, and submit to his will in all things, as the angels do in heaven.\n(Psalm 103:20-21)', '["Recite together", "Discuss: Obeying like angels.", "Pray"]', 'We ask God to help us obey Him happily.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q103', 'Q103: Fourth Petition', 'liturgy', 'Dependence', 'Memory', 'Q: What do we pray for in the fourth petition?\nA: In the fourth petition (which is, Give us this day our daily bread) we pray, that of God''s free gift we may receive a competent portion of the good things of this life, and enjoy his blessing with them.\n(Prov 30:8)', '["Recite together", "Discuss: Daily needs.", "Pray"]', 'We trust God to feed and take care of us today.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q104', 'Q104: Fifth Petition', 'liturgy', 'Repentance', 'Memory', 'Q: What do we pray for in the fifth petition?\nA: In the fifth petition (which is, And forgive us our debts, as we forgive our debtors) we pray, that God, for Christ''s sake, would freely pardon all our sins; which we are the rather encouraged to ask, because by his grace we are enabled from the heart to forgive others.\n(Psalm 51:1, Matt 6:14-15)', '["Recite together", "Discuss: Forgiving others.", "Pray"]', 'We ask for forgiveness and promise to forgive others too.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q105', 'Q105: Sixth Petition', 'liturgy', 'Dependence', 'Memory', 'Q: What do we pray for in the sixth petition?\nA: In the sixth petition (which is, And lead us not into temptation, but deliver us from evil) we pray, that God would either keep us from being tempted to sin, or support and deliver us when we are tempted.\n(Matt 26:41)', '["Recite together", "Discuss: Keep us safe from sin.", "Pray"]', 'We ask God to keep us from places where we might sin.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'wsc_q106', 'Q106: Conquest of Prayer', 'liturgy', 'Worship', 'Memory', 'Q: What doth the conclusion of the Lord''s prayer teach us?\nA: The conclusion of the Lord''s prayer (which is, For thine is the kingdom, and the power, and the glory, for ever. Amen) teacheth us to take our encouragement in prayer from God only, and in our prayers to praise him, ascribing kingdom, power, and glory to him; and, in testimony of our desire, and assurance to be heard, we say, Amen.\n(1 Chron 29:11, Rev 22:20)', '["Recite together", "Discuss: Amen!", "Pray"]', 'We end by praising God because He is King.', NULL, NULL, 15, 'Bedside', 'catechism', 48, 216, 'westminster_shorter', 'schoolos_core',
'id', 'title', 'liturgy', 'primary_virtue', 'biblical_faculty', 'description', NULL, NULL, 'liturgical_script', NULL, 10, 'context_anchor', 'hymn', 'min_age_months', 'max_age_months) VALUES
(hymn_a_mighty_fortress_is_our_god', 'trinity_hymnal', 'schoolos_core',
'hymn_all_people_that_on_earth_do_dwell', 'All People That on Earth Do Dwell', 'liturgy', 'Worship', 'Affection', '1. All people that on earth do dwell,
Sing to the Lord with cheerful voice.
Him serve with fear, His praise forth tell;
Come ye before Hi...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. All people that on earth do dwell,<br>
Sing to the Lord with cheerful voice.<br>
Him serve with fear, His praise forth tell;<br>
Come ye before Him and rejoice.
</div>

<div class="hymn-verse">
2. The Lord, ye know, is God indeed;<br>
Without our aid He did us make;<br>
We are His folk, He doth us feed,<br>
And for His sheep He doth us take.
</div>

<div class="hymn-verse">
3. O enter then His gates with praise;<br>
Approach with joy His courts unto;<br>
Praise, laud, and bless His Name always,<br>
For it is seemly so to do.
</div>

<div class="hymn-verse">
4. For why? the Lord our God is good;<br>
His mercy is forever sure;<br>
His truth at all times firmly stood,<br>
And shall from age to age endure.
</div>

<div class="hymn-author">William Kethe, 1561</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_amazing_grace', 'Amazing Grace', 'liturgy', 'Worship', 'Affection', '1. Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found;
Was blind, but now I see.

...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Amazing grace! How sweet the sound<br>
That saved a wretch like me!<br>
I once was lost, but now am found;<br>
Was blind, but now I see.
</div>

<div class="hymn-verse">
2. ''Twas grace that taught my heart to fear,<br>
And grace my fears relieved;<br>
How precious did that grace appear<br>
The hour I first believed.
</div>

<div class="hymn-verse">
3. Through many dangers, toils and snares,<br>
I have already come;<br>
''Tis grace hath brought me safe thus far,<br>
And grace will lead me home.
</div>

<div class="hymn-verse">
4. The Lord has promised good to me,<br>
His word my hope secures;<br>
He will my shield and portion be,<br>
As long as life endures.
</div>

<div class="hymn-verse">
5. When we''ve been there ten thousand years,<br>
Bright shining as the sun,<br>
We''ve no less days to sing God''s praise<br>
Than when we''d first begun.
</div>

<div class="hymn-author">John Newton, 1779</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_holy_holy_holy', 'Holy, Holy, Holy!', 'liturgy', 'Worship', 'Affection', '1. Holy, holy, holy! Lord God Almighty!
Early in the morning our song shall rise to thee.
Holy, holy, holy! Merciful and mighty!
God in t...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Holy, holy, holy! Lord God Almighty!<br>
Early in the morning our song shall rise to thee.<br>
Holy, holy, holy! Merciful and mighty!<br>
God in three Persons, blessed Trinity!
</div>

<div class="hymn-verse">
2. Holy, holy, holy! All the saints adore thee,<br>
casting down their golden crowns around the glassy sea;<br>
cherubim and seraphim falling down before thee,<br>
which wert, and art, and evermore shalt be.
</div>

<div class="hymn-verse">
3. Holy, holy, holy! Though the darkness hide thee,<br>
though the eye of sinful man thy glory may not see,<br>
only thou art holy; there is none beside thee<br>
perfect in power, in love and purity.
</div>

<div class="hymn-verse">
4. Holy, holy, holy! Lord God Almighty!<br>
All thy works shall praise thy name in earth and sky and sea.<br>
Holy, holy, holy! Merciful and mighty!<br>
God in three Persons, blessed Trinity!
</div>

<div class="hymn-author">Reginald Heber, 1826</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_how_firm_a_foundation', 'How Firm a Foundation', 'liturgy', 'Worship', 'Affection', '1. How firm a foundation, ye saints of the Lord,
Is laid for your faith in His excellent Word!
What more can He say than to you He hath said,<...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. How firm a foundation, ye saints of the Lord,<br>
Is laid for your faith in His excellent Word!<br>
What more can He say than to you He hath said,<br>
You, who unto Jesus for refuge have fled?
</div>

<div class="hymn-verse">
2. "Fear not, I am with thee, O be not dismayed,<br>
For I am thy God and will still give thee aid;<br>
I''ll strengthen and help thee, and cause thee to stand<br>
Upheld by My righteous, omnipotent hand."
</div>

<div class="hymn-verse">
3. "When through the deep waters I call thee to go,<br>
The rivers of sorrow shall not overflow;<br>
For I will be with thee, thy troubles to bless,<br>
And sanctify to thee thy deepest distress."
</div>

<div class="hymn-verse">
4. "When through fiery trials thy pathways shall lie,<br>
My grace, all sufficient, shall be thy supply;<br>
The flame shall not hurt thee; I only design<br>
Thy dross to consume, and thy gold to refine."
</div>

<div class="hymn-verse">
5. "The soul that on Jesus has leaned for repose,<br>
I will not, I will not desert to its foes;<br>
That soul, though all hell should endeavor to shake,<br>
I''ll never, no never, no never forsake."
</div>

<div class="hymn-author">K. in John Rippon''s Selection of Hymns, 1787</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_it_is_well_with_my_soul', 'It Is Well with My Soul', 'liturgy', 'Worship', 'Affection', '1. When peace, like a river, attendeth my way,
When sorrows like sea billows roll;
Whatever my lot, Thou has taught me to say,
It is well...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. When peace, like a river, attendeth my way,<br>
When sorrows like sea billows roll;<br>
Whatever my lot, Thou has taught me to say,<br>
It is well, it is well, with my soul.
</div>

<div class="hymn-chorus">
Chorus:<br>
It is well, with my soul,<br>
It is well, with my soul,<br>
It is well, it is well, with my soul.
</div>

<div class="hymn-verse">
2. Though Satan should buffet, though trials should come,<br>
Let this blest assurance control,<br>
That Christ has regarded my helpless estate,<br>
And hath shed His own blood for my soul.
</div>

<div class="hymn-verse">
3. My sin, oh, the bliss of this glorious thought!<br>
My sin, not in part but the whole,<br>
Is nailed to the cross, and I bear it no more,<br>
Praise the Lord, praise the Lord, O my soul!
</div>

<div class="hymn-verse">
4. And Lord, haste the day when my faith shall be sight,<br>
The clouds be rolled back as a scroll;<br>
The trump shall resound, and the Lord shall descend,<br>
Even so, it is well with my soul.
</div>

<div class="hymn-author">Horatio G. Spafford, 1873</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_love_divine_all_loves_excelling', 'Love Divine, All Loves Excelling', 'liturgy', 'Worship', 'Affection', '1. Love divine, all loves excelling,
Joy of heaven, to earth come down;
Fix in us thy humble dwelling,
All thy faithful mercies crown.<br...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Love divine, all loves excelling,<br>
Joy of heaven, to earth come down;<br>
Fix in us thy humble dwelling,<br>
All thy faithful mercies crown.<br>
Jesus, thou art all compassion,<br>
Pure, unbounded love thou art;<br>
Visit us with thy salvation,<br>
Enter every trembling heart.
</div>

<div class="hymn-verse">
2. Breathe, O breathe thy loving Spirit<br>
Into every troubled breast!<br>
Let us all in thee inherit,<br>
Let us find that second rest.<br>
Take away our bent to sinning,<br>
Alpha and Omega be;<br>
End of faith, as its beginning,<br>
Set our hearts at liberty.
</div>

<div class="hymn-verse">
3. Come, Almighty to deliver,<br>
Let us all thy life receive;<br>
Suddenly return, and never,<br>
Never more thy temples leave.<br>
Thee we would be always blessing,<br>
Serve thee as thy hosts above,<br>
Pray, and praise thee without ceasing,<br>
Glory in thy perfect love.
</div>

<div class="hymn-verse">
4. Finish then thy new creation,<br>
Pure and spotless let us be;<br>
Let us see thy great salvation<br>
Perfectly restored in thee:<br>
Changed from glory into glory,<br>
Till in heaven we take our place,<br>
Till we cast our crowns before thee,<br>
Lost in wonder, love, and praise.
</div>

<div class="hymn-author">Charles Wesley, 1747</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_praise_to_the_lord_the_almighty', 'Praise to the Lord, the Almighty', 'liturgy', 'Worship', 'Affection', '1. Praise to the Lord, the Almighty, the King of creation!
O my soul, praise Him, for He is thy health and salvation!
All ye who hear,
No...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Praise to the Lord, the Almighty, the King of creation!<br>
O my soul, praise Him, for He is thy health and salvation!<br>
All ye who hear,<br>
Now to His temple draw near;<br>
Praise Him in glad adoration.
</div>

<div class="hymn-verse">
2. Praise to the Lord, who o''er all things so wondrously reigneth,<br>
Shelters thee under His wings, yea, so gently sustaineth!<br>
Hast thou not seen<br>
How thy desires ever have been<br>
Granted in what He ordaineth?
</div>

<div class="hymn-verse">
3. Praise to the Lord, who hath fearfully, wondrously, made thee;<br>
Health hath vouchsafed and, when heedlessly falling, hath stayed thee.<br>
What need or grief<br>
Ever hath failed of relief?<br>
Wings of His mercy did shade thee.
</div>

<div class="hymn-verse">
4. Praise to the Lord, who doth prosper thy work and defend thee;<br>
Surely His goodness and mercy here daily attend thee.<br>
Ponder anew<br>
What the Almighty can do,<br>
If with His love He befriend thee.
</div>

<div class="hymn-verse">
5. Praise to the Lord, O let all that is in me adore Him!<br>
All that hath life and breath, come now with praises before Him.<br>
Let the Amen<br>
Sound from His people again,<br>
Gladly for aye we adore Him.
</div>

<div class="hymn-author">Joachim Neander, 1680; tr. Catherine Winkworth, 1863</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_be_thou_my_vision', 'Be Thou My Vision', 'liturgy', 'Worship', 'Affection', '1. Be Thou my Vision, O Lord of my heart;
Naught be all else to me, save that Thou art.
Thou my best Thought, by day or by night,
Waking ...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Be Thou my Vision, O Lord of my heart;<br>
Naught be all else to me, save that Thou art.<br>
Thou my best Thought, by day or by night,<br>
Waking or sleeping, Thy presence my light.
</div>

<div class="hymn-verse">
2. Be Thou my Wisdom, and Thou my true Word;<br>
I ever with Thee and Thou with me, Lord;<br>
Thou my great Father, I Thy true son;<br>
Thou in me dwelling, and I with Thee one.
</div>

<div class="hymn-verse">
3. Be Thou my battle Shield, Sword for the fight;<br>
Be Thou my Dignity, Thou my Delight;<br>
Thou my soul''s Shelter, Thou my high Tower:<br>
Raise Thou me heavenward, O Power of my power.
</div>

<div class="hymn-verse">
4. Riches I heed not, nor man''s empty praise,<br>
Thou mine Inheritance, now and always:<br>
Thou and Thou only, first in my heart,<br>
High King of Heaven, my Treasure Thou art.
</div>

<div class="hymn-verse">
5. High King of Heaven, my victory won,<br>
May I reach Heaven''s joys, O bright Heaven''s Sun!<br>
Heart of my own heart, whatever befall,<br>
Still be my Vision, O Ruler of all.
</div>

<div class="hymn-author">Ancient Irish, 8th Cent.; tr. Mary E. Byrne, 1905</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_great_is_thy_faithfulness', 'Great Is Thy Faithfulness', 'liturgy', 'Worship', 'Affection', '1. Great is Thy faithfulness, O God my Father;
There is no shadow of turning with Thee;
Thou changest not, Thy compassions, they fail not;...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Great is Thy faithfulness, O God my Father;<br>
There is no shadow of turning with Thee;<br>
Thou changest not, Thy compassions, they fail not;<br>
As Thou hast been, Thou forever will be.
</div>

<div class="hymn-chorus">
Chorus:<br>
Great is Thy faithfulness!<br>
Great is Thy faithfulness!<br>
Morning by morning new mercies I see.<br>
All I have needed Thy hand hath provided;<br>
Great is Thy faithfulness, Lord, unto me!
</div>

<div class="hymn-verse">
2. Summer and winter and springtime and harvest,<br>
Sun, moon and stars in their courses above<br>
Join with all nature in manifold witness<br>
To Thy great faithfulness, mercy and love.
</div>

<div class="hymn-verse">
3. Pardon for sin and a peace that endureth,<br>
Thine own dear presence to cheer and to guide;<br>
Strength for today and bright hope for tomorrow,<br>
Blessings all mine, with ten thousand beside!
</div>

<div class="hymn-author">Thomas O. Chisholm, 1923</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_rock_of_ages', 'Rock of Ages', 'liturgy', 'Worship', 'Affection', '1. Rock of Ages, cleft for me,
Let me hide myself in Thee;
Let the water and the blood,
From Thy wounded side which flowed,
Be of si...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Rock of Ages, cleft for me,<br>
Let me hide myself in Thee;<br>
Let the water and the blood,<br>
From Thy wounded side which flowed,<br>
Be of sin the double cure;<br>
Save from wrath and make me pure.
</div>

<div class="hymn-verse">
2. Not the labor of my hands<br>
Can fulfill Thy law''s demands;<br>
Could my zeal no respite know,<br>
Could my tears forever flow,<br>
All for sin could not atone;<br>
Thou must save, and Thou alone.
</div>

<div class="hymn-verse">
3. Nothing in my hand I bring,<br>
Simply to the cross I cling;<br>
Naked, come to Thee for dress;<br>
Helpless, look to Thee for grace;<br>
Foul, I to the fountain fly;<br>
Wash me, Savior, or I die.
</div>

<div class="hymn-verse">
4. While I draw this fleeting breath,<br>
When mine eyes shall close in death,<br>
When I soar to worlds unknown,<br>
See Thee on Thy judgment throne,<br>
Rock of Ages, cleft for me,<br>
Let me hide myself in Thee.
</div>

<div class="hymn-author">Augustus M. Toplady, 1776</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_come_thou_fount_of_every_blessing', 'Come, Thou Fount of Every Blessing', 'liturgy', 'Worship', 'Affection', '1. Come, Thou Fount of every blessing,
Tune my heart to sing Thy grace;
Streams of mercy, never ceasing,
Call for songs of loudest praise...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Come, Thou Fount of every blessing,<br>
Tune my heart to sing Thy grace;<br>
Streams of mercy, never ceasing,<br>
Call for songs of loudest praise.<br>
Teach me some melodious sonnet,<br>
Sung by flaming tongues above.<br>
Praise the mount! I''m fixed upon it,<br>
Mount of Thy redeeming love.
</div>

<div class="hymn-verse">
2. Here I raise my Ebenezer;<br>
Hither by Thy help I''m come;<br>
And I hope, by Thy good pleasure,<br>
Safely to arrive at home.<br>
Jesus sought me when a stranger,<br>
Wandering from the fold of God;<br>
He, to rescue me from danger,<br>
Interposed His precious blood.
</div>

<div class="hymn-verse">
3. O to grace how great a debtor<br>
Daily I''m constrained to be!<br>
Let Thy goodness, like a fetter,<br>
Bind my wandering heart to Thee.<br>
Prone to wander, Lord, I feel it,<br>
Prone to leave the God I love;<br>
Here''s my heart, O take and seal it,<br>
Seal it for Thy courts above.
</div>

<div class="hymn-author">Robert Robinson, 1758</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_crown_him_with_many_crowns', 'Crown Him with Many Crowns', 'liturgy', 'Worship', 'Affection', '1. Crown Him with many crowns,
The Lamb upon His throne;
Hark! how the heavenly anthem drowns
All music but its own;
Awake, my soul,...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Crown Him with many crowns,<br>
The Lamb upon His throne;<br>
Hark! how the heavenly anthem drowns<br>
All music but its own;<br>
Awake, my soul, and sing<br>
Of Him who died for thee,<br>
And hail Him as thy matchless King<br>
Through all eternity.
</div>

<div class="hymn-verse">
2. Crown Him the Lord of life,<br>
Who triumphed o''er the grave,<br>
And rose victorious in the strife<br>
For those He came to save.<br>
His glories now we sing,<br>
Who died, and rose on high,<br>
Who died eternal life to bring,<br>
And lives that death may die.
</div>

<div class="hymn-verse">
3. Crown Him the Lord of love,<br>
Behold His hands and side,<br>
Rich wounds, yet visible above,<br>
In beauty glorified.<br>
No angel in the sky<br>
Can fully bear that sight,<br>
But downward bends his burning eye<br>
At mysteries so bright.
</div>

<div class="hymn-verse">
4. Crown Him the Lord of years,<br>
The Potentate of time,<br>
Creator of the rolling spheres,<br>
Ineffably sublime.<br>
All hail, Redeemer, hail!<br>
For Thou hast died for me;<br>
Thy praise shall never, never fail<br>
Throughout eternity.
</div>

<div class="hymn-author">Matthew Bridges, 1851</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_christ_the_lord_is_risen_today', 'Christ the Lord Is Risen Today', 'liturgy', 'Worship', 'Affection', '1. Christ the Lord is risen today, Alleluia!
Sons of men and angels say, Alleluia!
Raise your joys and triumphs high, Alleluia!
Sing, ye ...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Christ the Lord is risen today, Alleluia!<br>
Sons of men and angels say, Alleluia!<br>
Raise your joys and triumphs high, Alleluia!<br>
Sing, ye heavens, and earth reply, Alleluia!
</div>

<div class="hymn-verse">
2. Lives again our glorious King, Alleluia!<br>
Where, O death, is now thy sting? Alleluia!<br>
Once He died our souls to save, Alleluia!<br>
Where thy victory, O grave? Alleluia!
</div>

<div class="hymn-verse">
3. Love''s redeeming work is done, Alleluia!<br>
Fought the fight, the battle won, Alleluia!<br>
Death in vain forbids Him rise, Alleluia!<br>
Christ has opened paradise, Alleluia!
</div>

<div class="hymn-verse">
4. Soar we now where Christ has led, Alleluia!<br>
Following our exalted Head, Alleluia!<br>
Made like Him, like Him we rise, Alleluia!<br>
Ours the cross, the grave, the skies, Alleluia!
</div>

<div class="hymn-author">Charles Wesley, 1739</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_man_of_sorrows_what_a_name', 'Man of Sorrows! What a Name', 'liturgy', 'Worship', 'Affection', '1. Man of Sorrows! what a name
For the Son of God, who came
Ruined sinners to reclaim.
Hallelujah! What a Savior!


<div class="...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Man of Sorrows! what a name<br>
For the Son of God, who came<br>
Ruined sinners to reclaim.<br>
Hallelujah! What a Savior!
</div>

<div class="hymn-verse">
2. Bearing shame and scoffing rude,<br>
In my place condemned He stood;<br>
Sealed my pardon with His blood.<br>
Hallelujah! What a Savior!
</div>

<div class="hymn-verse">
3. Guilty, vile, and helpless we;<br>
Spotless Lamb of God was He;<br>
"Full atonement!" can it be?<br>
Hallelujah! What a Savior!
</div>

<div class="hymn-verse">
4. Lifted up was He to die;<br>
"It is finished!" was His cry;<br>
Now in Heaven exalted high.<br>
Hallelujah! What a Savior!
</div>

<div class="hymn-verse">
5. When He comes, our glorious King,<br>
All His ransomed home to bring,<br>
Then anew this song we''ll sing:<br>
Hallelujah! What a Savior!
</div>

<div class="hymn-author">Philip P. Bliss, 1875</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_the_church_s_one_foundation', 'The Church''s One Foundation', 'liturgy', 'Worship', 'Affection', '1. The Church''s one foundation
Is Jesus Christ her Lord;
She is His new creation
By water and the Word:
From heaven He came and soug...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. The Church''s one foundation<br>
Is Jesus Christ her Lord;<br>
She is His new creation<br>
By water and the Word:<br>
From heaven He came and sought her<br>
To be His holy Bride;<br>
With His own blood He bought her,<br>
And for her life He died.
</div>

<div class="hymn-verse">
2. Elect from every nation,<br>
Yet one o''er all the earth,<br>
Her charter of salvation,<br>
One Lord, one faith, one birth;<br>
One holy name she blesses,<br>
Partakes one holy food,<br>
And to one hope she presses,<br>
With every grace endued.
</div>

<div class="hymn-verse">
3. Though with a scornful wonder<br>
Men see her sore oppressed,<br>
By schisms rent asunder,<br>
By heresies distressed,<br>
Yet saints their watch are keeping,<br>
Their cry goes up, "How long?"<br>
And soon the night of weeping<br>
Shall be the morn of song.
</div>

<div class="hymn-verse">
4. The Church shall never perish!<br>
Her dear Lord to defend,<br>
To guide, sustain, and cherish,<br>
Is with her to the end:<br>
Though there be those who hate her,<br>
And false sons in her pale,<br>
Against both foe and traitor<br>
She ever shall prevail.
</div>

<div class="hymn-author">Samuel J. Stone, 1866</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_guide_me_o_thou_great_jehovah', 'Guide Me, O Thou Great Jehovah', 'liturgy', 'Worship', 'Affection', '1. Guide me, O Thou great Jehovah,
Pilgrim through this barren land;
I am weak, but Thou art mighty,
Hold me with Thy powerful hand.
...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Guide me, O Thou great Jehovah,<br>
Pilgrim through this barren land;<br>
I am weak, but Thou art mighty,<br>
Hold me with Thy powerful hand.<br>
Bread of heaven, Bread of heaven,<br>
Feed me till I want no more;<br>
Feed me till I want no more.
</div>

<div class="hymn-verse">
2. Open now the crystal fountain,<br>
Whence the healing stream doth flow;<br>
Let the fire and cloudy pillar<br>
Lead me all my journey through.<br>
Strong Deliverer, strong Deliverer,<br>
Be Thou still my Strength and Shield;<br>
Be Thou still my Strength and Shield.
</div>

<div class="hymn-verse">
3. When I tread the verge of Jordan,<br>
Bid my anxious fears subside;<br>
Death of death, and hell''s Destruction,<br>
Land me safe on Canaan''s side.<br>
Songs of praises, songs of praises,<br>
I will ever give to Thee;<br>
I will ever give to Thee.
</div>

<div class="hymn-author">William Williams, 1745</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_what_a_friend_we_have_in_jesus', 'What a Friend We Have in Jesus', 'liturgy', 'Worship', 'Affection', '1. What a friend we have in Jesus,
All our sins and griefs to bear!
What a privilege to carry
Everything to God in prayer!
O what pe...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. What a friend we have in Jesus,<br>
All our sins and griefs to bear!<br>
What a privilege to carry<br>
Everything to God in prayer!<br>
O what peace we often forfeit,<br>
O what needless pain we bear,<br>
All because we do not carry<br>
Everything to God in prayer.
</div>

<div class="hymn-verse">
2. Have we trials and temptations?<br>
Is there trouble anywhere?<br>
We should never be discouraged;<br>
Take it to the Lord in prayer.<br>
Can we find a friend so faithful<br>
Who will all our sorrows share?<br>
Jesus knows our every weakness;<br>
Take it to the Lord in prayer.
</div>

<div class="hymn-verse">
3. Are we weak and heavy laden,<br>
Cumbered with a load of care?<br>
Precious Savior, still our refuge,<br>
Take it to the Lord in prayer.<br>
Do thy friends despise, forsake thee?<br>
Take it to the Lord in prayer!<br>
In His arms He''ll take and shield thee,<br>
Thou wilt find a solace there.
</div>

<div class="hymn-author">Joseph M. Scriven, 1855</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_blessed_assurance', 'Blessed Assurance', 'liturgy', 'Worship', 'Affection', '1. Blessed assurance, Jesus is mine!
O what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed i...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Blessed assurance, Jesus is mine!<br>
O what a foretaste of glory divine!<br>
Heir of salvation, purchase of God,<br>
Born of His Spirit, washed in His blood.
</div>

<div class="hymn-chorus">
Chorus:<br>
This is my story, this is my song,<br>
Praising my Savior all the day long;<br>
This is my story, this is my song,<br>
Praising my Savior all the day long.
</div>

<div class="hymn-verse">
2. Perfect submission, perfect delight,<br>
Visions of rapture now burst on my sight;<br>
Angels descending, bring from above<br>
Echoes of mercy, whispers of love.
</div>

<div class="hymn-verse">
3. Perfect submission, all is at rest,<br>
I in my Savior am happy and blest;<br>
Watching and waiting, looking above,<br>
Filled with His goodness, lost in His love.
</div>

<div class="hymn-author">Fanny J. Crosby, 1873</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_to_god_be_the_glory', 'To God Be the Glory', 'liturgy', 'Worship', 'Affection', '1. To God be the glory, great things He hath done;
So loved He the world that He gave us His Son,
Who yielded His life an atonement for sin,<b...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. To God be the glory, great things He hath done;<br>
So loved He the world that He gave us His Son,<br>
Who yielded His life an atonement for sin,<br>
And opened the lifegate that all may go in.
</div>

<div class="hymn-chorus">
Chorus:<br>
Praise the Lord, praise the Lord,<br>
Let the earth hear His voice!<br>
Praise the Lord, praise the Lord,<br>
Let the people rejoice!<br>
O come to the Father, through Jesus the Son,<br>
And give Him the glory, great things He hath done.
</div>

<div class="hymn-verse">
2. O perfect redemption, the purchase of blood,<br>
To every believer the promise of God;<br>
The vilest offender who truly believes,<br>
That moment from Jesus a pardon receives.
</div>

<div class="hymn-verse">
3. Great things He hath taught us, great things He hath done,<br>
And great our rejoicing through Jesus the Son;<br>
But purer, and higher, and greater will be<br>
Our wonder, our transport, when Jesus we see.
</div>

<div class="hymn-author">Fanny J. Crosby, 1875</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_all_hail_the_power_of_jesus_name', 'All Hail the Power of Jesus'' Name', 'liturgy', 'Worship', 'Affection', '1. All hail the power of Jesus'' name!
Let angels prostrate fall;
Bring forth the royal diadem,
And crown Him Lord of all;
Bring fort...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. All hail the power of Jesus'' name!<br>
Let angels prostrate fall;<br>
Bring forth the royal diadem,<br>
And crown Him Lord of all;<br>
Bring forth the royal diadem,<br>
And crown Him Lord of all.
</div>

<div class="hymn-verse">
2. Ye chosen seed of Israel''s race,<br>
Ye ransomed from the fall,<br>
Hail Him who saves you by His grace,<br>
And crown Him Lord of all;<br>
Hail Him who saves you by His grace,<br>
And crown Him Lord of all.
</div>

<div class="hymn-verse">
3. Let every kindred, every tribe<br>
On this terrestrial ball,<br>
To Him all majesty ascribe,<br>
And crown Him Lord of all;<br>
To Him all majesty ascribe,<br>
And crown Him Lord of all.
</div>

<div class="hymn-verse">
4. O that with yonder sacred throng<br>
We at His feet may fall!<br>
We''ll join the everlasting song,<br>
And crown Him Lord of all;<br>
We''ll join the everlasting song,<br>
And crown Him Lord of all.
</div>

<div class="hymn-author">Edward Perronet, 1779</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_fairest_lord_jesus', 'Fairest Lord Jesus', 'liturgy', 'Worship', 'Affection', '1. Fairest Lord Jesus, Ruler of all nature,
O Thou of God and man the Son,
Thee will I cherish, Thee will I honor,
Thou, my soul''s glory,...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Fairest Lord Jesus, Ruler of all nature,<br>
O Thou of God and man the Son,<br>
Thee will I cherish, Thee will I honor,<br>
Thou, my soul''s glory, joy and crown.
</div>

<div class="hymn-verse">
2. Fair are the meadows, fairer still the woodlands,<br>
Robed in the blooming garb of spring:<br>
Jesus is fairer, Jesus is purer,<br>
Who makes the woeful heart to sing.
</div>

<div class="hymn-verse">
3. Fair is the sunshine, fairer still the moonlight,<br>
And all the twinkling starry host:<br>
Jesus shines brighter, Jesus shines purer<br>
Than all the angels heaven can boast.
</div>

<div class="hymn-verse">
4. Beautiful Savior! Lord of all the nations!<br>
Son of God and Son of Man!<br>
Glory and honor, praise, adoration,<br>
Now and forevermore be Thine.
</div>

<div class="hymn-author">Anonymous German Hymn, 1677</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_he_leadeth_me', 'He Leadeth Me', 'liturgy', 'Worship', 'Affection', '1. He leadeth me, O blessed thought!
O words with heavenly comfort fraught!
Whate''er I do, where''er I be,
Still ''tis God''s hand that lead...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. He leadeth me, O blessed thought!<br>
O words with heavenly comfort fraught!<br>
Whate''er I do, where''er I be,<br>
Still ''tis God''s hand that leadeth me.
</div>

<div class="hymn-chorus">
Chorus:<br>
He leadeth me, He leadeth me,<br>
By His own hand He leadeth me;<br>
His faithful follower I would be,<br>
For by His hand He leadeth me.
</div>

<div class="hymn-verse">
2. Sometimes mid scenes of deepest gloom,<br>
Sometimes where Eden''s bowers bloom,<br>
By waters still, o''er troubled sea,<br>
Still ''tis His hand that leadeth me.
</div>

<div class="hymn-verse">
3. Lord, I would place my hand in Thine,<br>
Nor ever murmur nor repine;<br>
Content, whatever lot I see,<br>
Since ''tis Thy hand that leadeth me.
</div>

<div class="hymn-verse">
4. And when my task on earth is done,<br>
When, by Thy grace, the victory''s won,<br>
E''en death''s cold wave I will not flee,<br>
Since God through Jordan leadeth me.
</div>

<div class="hymn-author">Joseph H. Gilmore, 1862</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_i_need_thee_every_hour', 'I Need Thee Every Hour', 'liturgy', 'Worship', 'Affection', '1. I need Thee every hour,
Most gracious Lord;
No tender voice like Thine
Can peace afford.



Chorus:...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. I need Thee every hour,<br>
Most gracious Lord;<br>
No tender voice like Thine<br>
Can peace afford.
</div>

<div class="hymn-chorus">
Chorus:<br>
I need Thee, O I need Thee;<br>
Every hour I need Thee;<br>
O bless me now, my Savior,<br>
I come to Thee.
</div>

<div class="hymn-verse">
2. I need Thee every hour,<br>
Stay Thou nearby;<br>
Temptations lose their power<br>
When Thou art nigh.
</div>

<div class="hymn-verse">
3. I need Thee every hour,<br>
In joy or pain;<br>
Come quickly and abide,<br>
Or life is vain.
</div>

<div class="hymn-verse">
4. I need Thee every hour,<br>
Teach me Thy will;<br>
And Thy rich promises<br>
In me fulfill.
</div>

<div class="hymn-author">Annie S. Hawks, 1872</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_jesus_paid_it_all', 'Jesus Paid It All', 'liturgy', 'Worship', 'Affection', '1. I hear the Savior say,
"Thy strength indeed is small;
Child of weakness, watch and pray,
Find in Me thine all in all."


<div...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. I hear the Savior say,<br>
"Thy strength indeed is small;<br>
Child of weakness, watch and pray,<br>
Find in Me thine all in all."
</div>

<div class="hymn-chorus">
Chorus:<br>
Jesus paid it all,<br>
All to Him I owe;<br>
Sin had left a crimson stain,<br>
He washed it white as snow.
</div>

<div class="hymn-verse">
2. Lord, now indeed I find<br>
Thy power, and Thine alone,<br>
Can change the leper''s spots<br>
And melt the heart of stone.
</div>

<div class="hymn-verse">
3. For nothing good have I<br>
Whereby Thy grace to claim;<br>
I''ll wash my garments white<br>
In the blood of Calvary''s Lamb.
</div>

<div class="hymn-verse">
4. And when, before the throne,<br>
I stand in Him complete,<br>
"Jesus died my soul to save,"<br>
My lips shall still repeat.
</div>

<div class="hymn-author">Elvina M. Hall, 1865</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_just_as_i_am', 'Just as I Am', 'liturgy', 'Worship', 'Affection', '1. Just as I am, without one plea,
But that Thy blood was shed for me,
And that Thou bidst me come to Thee,
O Lamb of God, I come, I come...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Just as I am, without one plea,<br>
But that Thy blood was shed for me,<br>
And that Thou bidst me come to Thee,<br>
O Lamb of God, I come, I come.
</div>

<div class="hymn-verse">
2. Just as I am, and waiting not<br>
To rid my soul of one dark blot,<br>
To Thee, whose blood can cleanse each spot,<br>
O Lamb of God, I come, I come.
</div>

<div class="hymn-verse">
3. Just as I am, though tossed about<br>
With many a conflict, many a doubt,<br>
Fightings and fears within, without,<br>
O Lamb of God, I come, I come.
</div>

<div class="hymn-verse">
4. Just as I am, poor, wretched, blind;<br>
Sight, riches, healing of the mind,<br>
Yea, all I need in Thee to find,<br>
O Lamb of God, I come, I come.
</div>

<div class="hymn-author">Charlotte Elliott, 1835</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_nearer_my_god_to_thee', 'Nearer, My God, to Thee', 'liturgy', 'Worship', 'Affection', '1. Nearer, my God, to Thee,
Nearer to Thee!
E''en though it be a cross
That raiseth me,
Still all my song shall be,
Nearer, my G...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Nearer, my God, to Thee,<br>
Nearer to Thee!<br>
E''en though it be a cross<br>
That raiseth me,<br>
Still all my song shall be,<br>
Nearer, my God, to Thee.<br>
Nearer, my God, to Thee,<br>
Nearer to Thee!
</div>

<div class="hymn-verse">
2. Though like the wanderer,<br>
The sun gone down,<br>
Darkness be over me,<br>
My rest a stone,<br>
Yet in my dreams I''d be<br>
Nearer, my God, to Thee.<br>
Nearer, my God, to Thee,<br>
Nearer to Thee!
</div>

<div class="hymn-verse">
3. There let the way appear,<br>
Steps unto heaven;<br>
All that Thou sendest me,<br>
In mercy given;<br>
Angels to beckon me<br>
Nearer, my God, to Thee.<br>
Nearer, my God, to Thee,<br>
Nearer to Thee!
</div>

<div class="hymn-verse">
4. Or if, on joyful wing<br>
Cleaving the sky,<br>
Sun, moon, and stars forgot,<br>
Upward I fly,<br>
Still all my song shall be,<br>
Nearer, my God, to Thee.<br>
Nearer, my God, to Thee,<br>
Nearer to Thee!
</div>

<div class="hymn-author">Sarah F. Adams, 1841</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_o_for_a_thousand_tongues_to_sing', 'O For a Thousand Tongues to Sing', 'liturgy', 'Worship', 'Affection', '1. O for a thousand tongues to sing
My great Redeemer''s praise,
The glories of my God and King,
The triumphs of His grace.


<di...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. O for a thousand tongues to sing<br>
My great Redeemer''s praise,<br>
The glories of my God and King,<br>
The triumphs of His grace.
</div>

<div class="hymn-verse">
2. My gracious Master and my God,<br>
Assist me to proclaim,<br>
To spread through all the earth abroad<br>
The honors of Thy name.
</div>

<div class="hymn-verse">
3. Jesus! the name that charms our fears,<br>
That bids our sorrows cease;<br>
''Tis music in the sinner''s ears,<br>
''Tis life and health and peace.
</div>

<div class="hymn-verse">
4. He breaks the power of canceled sin,<br>
He sets the prisoner free;<br>
His blood can make the foulest clean,<br>
His blood availed for me.
</div>

<div class="hymn-author">Charles Wesley, 1739</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_stand_up_stand_up_for_jesus', 'Stand Up, Stand Up for Jesus', 'liturgy', 'Worship', 'Affection', '1. Stand up, stand up for Jesus,
Ye soldiers of the cross;
Lift high His royal banner,
It must not suffer loss.
From victory unto vi...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Stand up, stand up for Jesus,<br>
Ye soldiers of the cross;<br>
Lift high His royal banner,<br>
It must not suffer loss.<br>
From victory unto victory<br>
His army He shall lead,<br>
Till every foe is vanquished,<br>
And Christ is Lord indeed.
</div>

<div class="hymn-verse">
2. Stand up, stand up for Jesus,<br>
The trumpet call obey;<br>
Forth to the mighty conflict,<br>
In this His glorious day.<br>
Ye that are men now serve Him<br>
Against unnumbered foes;<br>
Let courage rise with danger,<br>
And strength to strength oppose.
</div>

<div class="hymn-verse">
3. Stand up, stand up for Jesus,<br>
Stand in His strength alone;<br>
The arm of flesh will fail you,<br>
Ye dare not trust your own.<br>
Put on the gospel armor,<br>
Each piece put on with prayer;<br>
Where duty calls or danger,<br>
Be never wanting there.
</div>

<div class="hymn-verse">
4. Stand up, stand up for Jesus,<br>
The strife will not be long;<br>
This day the noise of battle,<br>
The next the victor''s song.<br>
To him that overcometh,<br>
A crown of life shall be;<br>
He with the King of glory<br>
Shall reign eternally.
</div>

<div class="hymn-author">George Duffield, Jr., 1858</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_sweet_hour_of_prayer', 'Sweet Hour of Prayer', 'liturgy', 'Worship', 'Affection', '1. Sweet hour of prayer! sweet hour of prayer!
That calls me from a world of care,
And bids me at my Father''s throne
Make all my wants an...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Sweet hour of prayer! sweet hour of prayer!<br>
That calls me from a world of care,<br>
And bids me at my Father''s throne<br>
Make all my wants and wishes known.<br>
In seasons of distress and grief,<br>
My soul has often found relief,<br>
And oft escaped the tempter''s snare,<br>
By thy return, sweet hour of prayer!
</div>

<div class="hymn-verse">
2. Sweet hour of prayer! sweet hour of prayer!<br>
Thy wings shall my petition bear<br>
To Him whose truth and faithfulness<br>
Engage the waiting soul to bless.<br>
And since He bids me seek His face,<br>
Believe His word, and trust His grace,<br>
I''ll cast on Him my every care,<br>
And wait for thee, sweet hour of prayer!
</div>

<div class="hymn-verse">
3. Sweet hour of prayer! sweet hour of prayer!<br>
May I thy consolation share,<br>
Till, from Mount Pisgah''s lofty height,<br>
I view my home and take my flight.<br>
This robe of flesh I''ll drop and rise<br>
To seize the everlasting prize,<br>
And shout, while passing through the air,<br>
"Farewell, farewell, sweet hour of prayer!"
</div>

<div class="hymn-author">William W. Walford, 1845</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_take_my_life_and_let_it_be', 'Take My Life and Let It Be', 'liturgy', 'Worship', 'Affection', '1. Take my life and let it be
Consecrated, Lord, to Thee;
Take my moments and my days,
Let them flow in ceaseless praise,
Let them f...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Take my life and let it be<br>
Consecrated, Lord, to Thee;<br>
Take my moments and my days,<br>
Let them flow in ceaseless praise,<br>
Let them flow in ceaseless praise.
</div>

<div class="hymn-verse">
2. Take my hands and let them move<br>
At the impulse of Thy love;<br>
Take my feet and let them be<br>
Swift and beautiful for Thee,<br>
Swift and beautiful for Thee.
</div>

<div class="hymn-verse">
3. Take my voice and let me sing<br>
Always, only, for my King;<br>
Take my lips and let them be<br>
Filled with messages from Thee,<br>
Filled with messages from Thee.
</div>

<div class="hymn-verse">
4. Take my silver and my gold;<br>
Not a mite would I withhold;<br>
Take my intellect and use<br>
Every power as Thou shalt choose,<br>
Every power as Thou shalt choose.
</div>

<div class="hymn-verse">
5. Take my will and make it Thine;<br>
It shall be no longer mine.<br>
Take my heart, it is Thine own;<br>
It shall be Thy royal throne,<br>
It shall be Thy royal throne.
</div>

<div class="hymn-author">Frances R. Havergal, 1874</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_there_is_a_fountain_filled_with_blood', 'There Is a Fountain Filled with Blood', 'liturgy', 'Worship', 'Affection', '1. There is a fountain filled with blood
Drawn from Immanuel''s veins;
And sinners, plunged beneath that flood,
Lose all their guilty stai...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. There is a fountain filled with blood<br>
Drawn from Immanuel''s veins;<br>
And sinners, plunged beneath that flood,<br>
Lose all their guilty stains.
</div>

<div class="hymn-verse">
2. The dying thief rejoiced to see<br>
That fountain in his day;<br>
And there may I, though vile as he,<br>
Wash all my sins away.
</div>

<div class="hymn-verse">
3. Dear dying Lamb, Thy precious blood<br>
Shall never lose its power,<br>
Till all the ransomed church of God<br>
Be saved, to sin no more.
</div>

<div class="hymn-verse">
4. E''er since, by faith, I saw the stream<br>
Thy flowing wounds supply,<br>
Redeeming love has been my theme,<br>
And shall be till I die.
</div>

<div class="hymn-verse">
5. Then in a nobler, sweeter song,<br>
I''ll sing Thy power to save,<br>
When this poor lisping, stammering tongue<br>
Lies silent in the grave.
</div>

<div class="hymn-author">William Cowper, 1772</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_tis_so_sweet_to_trust_in_jesus', '''Tis So Sweet to Trust in Jesus', 'liturgy', 'Worship', 'Affection', '1. ''Tis so sweet to trust in Jesus,
Just to take Him at His word;
Just to rest upon His promise,
Just to know, "Thus saith the Lord."
</...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. ''Tis so sweet to trust in Jesus,<br>
Just to take Him at His word;<br>
Just to rest upon His promise,<br>
Just to know, "Thus saith the Lord."
</div>

<div class="hymn-chorus">
Chorus:<br>
Jesus, Jesus, how I trust Him!<br>
How I''ve proved Him o''er and o''er!<br>
Jesus, Jesus, precious Jesus!<br>
O for grace to trust Him more!
</div>

<div class="hymn-verse">
2. O how sweet to trust in Jesus,<br>
Just to trust His cleansing blood;<br>
Just in simple faith to plunge me<br>
''Neath the healing, cleansing flood!
</div>

<div class="hymn-verse">
3. Yes, ''tis sweet to trust in Jesus,<br>
Just from sin and self to cease;<br>
Just from Jesus simply taking<br>
Life and rest, and joy and peace.
</div>

<div class="hymn-verse">
4. I''m so glad I learned to trust Thee,<br>
Precious Jesus, Savior, Friend;<br>
And I know that Thou art with me,<br>
Wilt be with me to the end.
</div>

<div class="hymn-author">Louisa M. R. Stead, 1882</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_trust_and_obey', 'Trust and Obey', 'liturgy', 'Worship', 'Affection', '1. When we walk with the Lord
In the light of His Word,
What a glory He sheds on our way!
While we do His good will,
He abides with ...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. When we walk with the Lord<br>
In the light of His Word,<br>
What a glory He sheds on our way!<br>
While we do His good will,<br>
He abides with us still,<br>
And with all who will trust and obey.
</div>

<div class="hymn-chorus">
Chorus:<br>
Trust and obey,<br>
for there''s no other way<br>
To be happy in Jesus,<br>
but to trust and obey.
</div>

<div class="hymn-verse">
2. Not a shadow can rise,<br>
Not a cloud in the skies,<br>
But His smile quickly drives it away;<br>
Not a doubt or a fear,<br>
Not a sigh or a tear,<br>
Can abide while we trust and obey.
</div>

<div class="hymn-verse">
3. Not a burden we bear,<br>
Not a sorrow we share,<br>
But our toil He doth richly repay;<br>
Not a grief or a loss,<br>
Not a frown or a cross,<br>
But is blest if we trust and obey.
</div>

<div class="hymn-verse">
4. But we never can prove<br>
The delights of His love<br>
Until all on the altar we lay;<br>
For the favor He shows,<br>
And the joy He bestows,<br>
Are for them who will trust and obey.
</div>

<div class="hymn-verse">
5. Then in fellowship sweet<br>
We will sit at His feet,<br>
Or we''ll walk by His side in the way;<br>
What He says we will do,<br>
Where He sends we will go;<br>
Never fear, only trust and obey.
</div>

<div class="hymn-author">John H. Sammis, 1887</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_turn_your_eyes_upon_jesus', 'Turn Your Eyes upon Jesus', 'liturgy', 'Worship', 'Affection', '1. O soul, are you weary and troubled?
No light in the darkness you see?
There''s light for a look at the Savior,
And life more abundant a...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. O soul, are you weary and troubled?<br>
No light in the darkness you see?<br>
There''s light for a look at the Savior,<br>
And life more abundant and free!
</div>

<div class="hymn-chorus">
Chorus:<br>
Turn your eyes upon Jesus,<br>
Look full in His wonderful face,<br>
And the things of earth will grow strangely dim,<br>
In the light of His glory and grace.
</div>

<div class="hymn-verse">
2. Through death into life everlasting<br>
He passed, and we follow Him there;<br>
O''er us sin no more hath dominion—<br>
For more than conquerors we are!
</div>

<div class="hymn-verse">
3. His Word shall not fail you—He promised;<br>
Believe Him, and all will be well:<br>
Then go to a world that is dying,<br>
His perfect salvation to tell!
</div>

<div class="hymn-author">Helen H. Lemmel, 1922</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_when_i_survey_the_wondrous_cross', 'When I Survey the Wondrous Cross', 'liturgy', 'Worship', 'Affection', '1. When I survey the wondrous cross
On which the Prince of glory died,
My richest gain I count but loss,
And pour contempt on all my prid...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. When I survey the wondrous cross<br>
On which the Prince of glory died,<br>
My richest gain I count but loss,<br>
And pour contempt on all my pride.
</div>

<div class="hymn-verse">
2. Forbid it, Lord, that I should boast,<br>
Save in the death of Christ my God;<br>
All the vain things that charm me most,<br>
I sacrifice them to His blood.
</div>

<div class="hymn-verse">
3. See, from His head, His hands, His feet,<br>
Sorrow and love flow mingled down:<br>
Did e''er such love and sorrow meet,<br>
Or thorns compose so rich a crown?
</div>

<div class="hymn-verse">
4. Were the whole realm of nature mine,<br>
That were a present far too small;<br>
Love so amazing, so divine,<br>
Demands my soul, my life, my all.
</div>

<div class="hymn-author">Isaac Watts, 1707</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_at_the_cross', 'At the Cross', 'liturgy', 'Worship', 'Affection', '1. Alas! and did my Savior bleed?
And did my Sovereign die?
Would He devote that sacred head
For such a worm as I?


<div class=...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Alas! and did my Savior bleed?<br>
And did my Sovereign die?<br>
Would He devote that sacred head<br>
For such a worm as I?
</div>

<div class="hymn-chorus">
Chorus:<br>
At the cross, at the cross where I first saw the light,<br>
And the burden of my heart rolled away,<br>
It was there by faith I received my sight,<br>
And now I am happy all the day!
</div>

<div class="hymn-verse">
2. Was it for crimes that I have done<br>
He groaned upon the tree?<br>
Amazing pity! grace unknown!<br>
And love beyond degree!
</div>

<div class="hymn-verse">
3. Well might the sun in darkness hide<br>
And shut his glories in,<br>
When Christ, the mighty Maker died,<br>
For man the creature''s sin.
</div>

<div class="hymn-verse">
4. But drops of grief can ne''er repay<br>
The debt of love I owe:<br>
Here, Lord, I give myself away<br>
''Tis all that I can do.
</div>

<div class="hymn-author">Isaac Watts, 1707 (Refrain: Ralph E. Hudson, 1885)</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_count_your_blessings', 'Count Your Blessings', 'liturgy', 'Worship', 'Affection', '1. When upon life''s billows you are tempest tossed,
When you are discouraged, thinking all is lost,
Count your many blessings, name them one b...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. When upon life''s billows you are tempest tossed,<br>
When you are discouraged, thinking all is lost,<br>
Count your many blessings, name them one by one,<br>
And it will surprise you what the Lord hath done.
</div>

<div class="hymn-chorus">
Chorus:<br>
Count your blessings, name them one by one,<br>
Count your blessings, see what God hath done!<br>
Count your blessings, name them one by one,<br>
Count your many blessings, see what God hath done.
</div>

<div class="hymn-verse">
2. Are you ever burdened with a load of care?<br>
Does the cross seem heavy you are called to bear?<br>
Count your many blessings, every doubt will fly,<br>
And you will be singing as the days go by.
</div>

<div class="hymn-verse">
3. When you look at others with their lands and gold,<br>
Think that Christ has promised you His wealth untold;<br>
Count your many blessings, money cannot buy<br>
Your reward in heaven, nor your home on high.
</div>

<div class="hymn-verse">
4. So, amid the conflict whether great or small,<br>
Do not be discouraged, God is over all;<br>
Count your many blessings, angels will attend,<br>
Help and comfort give you to your journey''s end.
</div>

<div class="hymn-author">Johnson Oatman Jr., 1897</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_doxology', 'Doxology', 'liturgy', 'Worship', 'Affection', 'Praise God, from whom all blessings flow;
Praise Him, all creatures here below;
Praise Him above, ye heavenly host;
Praise Father, Son, a...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
Praise God, from whom all blessings flow;<br>
Praise Him, all creatures here below;<br>
Praise Him above, ye heavenly host;<br>
Praise Father, Son, and Holy Ghost.<br>
Amen.
</div>

<div class="hymn-author">Thomas Ken, 1674</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_glory_be_to_the_father', 'Glory Be to the Father', 'liturgy', 'Worship', 'Affection', 'Glory be to the Father, and to the Son,
and to the Holy Ghost;
As it was in the beginning, is now, and ever shall be,
world without end. ...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
Glory be to the Father, and to the Son,<br>
and to the Holy Ghost;<br>
As it was in the beginning, is now, and ever shall be,<br>
world without end. Amen, Amen.
</div>

<div class="hymn-author">Lesser Doxology, 2nd Century</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_god_of_our_fathers', 'God of Our Fathers', 'liturgy', 'Worship', 'Affection', '1. God of our fathers, whose almighty hand
Leads forth in beauty all the starry band
Of shining worlds in splendor through the skies,
Our...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. God of our fathers, whose almighty hand<br>
Leads forth in beauty all the starry band<br>
Of shining worlds in splendor through the skies,<br>
Our grateful songs before Thy throne arise.
</div>

<div class="hymn-verse">
2. Thy love divine hath led us in the past,<br>
In this free land by Thee our lot is cast;<br>
Be Thou our ruler, guardian, guide and stay,<br>
Thy word our law, Thy paths our chosen way.
</div>

<div class="hymn-verse">
3. From war''s alarms, from deadly pestilence,<br>
Be Thy strong arm our ever sure defense;<br>
Thy true religion in our hearts increase,<br>
Thy bounteous goodness nourish us in peace.
</div>

<div class="hymn-verse">
4. Refresh Thy people on their toilsome way,<br>
Lead us from night to never-ending day;<br>
Fill all our lives with love and grace divine,<br>
And glory, laud, and praise be ever Thine.
</div>

<div class="hymn-author">Daniel C. Roberts, 1876</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_have_thine_own_way_lord', 'Have Thine Own Way, Lord', 'liturgy', 'Worship', 'Affection', '1. Have Thine own way, Lord! Have Thine own way!
Thou art the Potter, I am the clay.
Mold me and make me after Thy will,
While I am waiti...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Have Thine own way, Lord! Have Thine own way!<br>
Thou art the Potter, I am the clay.<br>
Mold me and make me after Thy will,<br>
While I am waiting, yielded and still.
</div>

<div class="hymn-verse">
2. Have Thine own way, Lord! Have Thine own way!<br>
Search me and try me, Master, today!<br>
Whiter than snow, Lord, wash me just now,<br>
As in Thy presence humbly I bow.
</div>

<div class="hymn-verse">
3. Have Thine own way, Lord! Have Thine own way!<br>
Wounded and weary, help me, I pray!<br>
Power, all power, surely is Thine!<br>
Touch me and heal me, Savior divine.
</div>

<div class="hymn-verse">
4. Have Thine own way, Lord! Have Thine own way!<br>
Hold o''er my being absolute sway!<br>
Fill with Thy Spirit till all shall see<br>
Christ only, always, living in me.
</div>

<div class="hymn-author">Adelaide A. Pollard, 1902</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_higher_ground', 'Higher Ground', 'liturgy', 'Worship', 'Affection', '1. I''m pressing on the upward way,
New heights I''m gaining every day;
Still praying as I''m onward bound,
"Lord, plant my feet on higher g...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. I''m pressing on the upward way,<br>
New heights I''m gaining every day;<br>
Still praying as I''m onward bound,<br>
"Lord, plant my feet on higher ground."
</div>

<div class="hymn-chorus">
Chorus:<br>
Lord, lift me up and let me stand,<br>
By faith, on Heaven''s tableland,<br>
A higher plane than I have found;<br>
Lord, plant my feet on higher ground.
</div>

<div class="hymn-verse">
2. My heart has no desire to stay<br>
Where doubts arise and fears dismay;<br>
Though some may dwell where these abound,<br>
My prayer, my aim, is higher ground.
</div>

<div class="hymn-verse">
3. I want to live above the world,<br>
Though Satan''s darts at me are hurled;<br>
For faith has caught the joyful sound,<br>
The song of saints on higher ground.
</div>

<div class="hymn-verse">
4. I want to scale the utmost height<br>
And catch a gleam of glory bright;<br>
But still I''ll pray till heaven I''ve found,<br>
"Lord, plant my feet on higher ground."
</div>

<div class="hymn-author">Johnson Oatman Jr., 1898</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_i_surrender_all', 'I Surrender All', 'liturgy', 'Worship', 'Affection', '1. All to Jesus I surrender,
All to Him I freely give;
I will ever love and trust Him,
In His presence daily live.


<div class=...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. All to Jesus I surrender,<br>
All to Him I freely give;<br>
I will ever love and trust Him,<br>
In His presence daily live.
</div>

<div class="hymn-chorus">
Chorus:<br>
I surrender all,<br>
I surrender all,<br>
All to Thee, my blessed Savior,<br>
I surrender all.
</div>

<div class="hymn-verse">
2. All to Jesus I surrender,<br>
Humbly at His feet I bow,<br>
Worldly pleasures all forsaken,<br>
Take me, Jesus, take me now.
</div>

<div class="hymn-verse">
3. All to Jesus I surrender,<br>
Make me, Savior, wholly Thine;<br>
Let me feel Thy Holy Spirit,<br>
Truly know that Thou art mine.
</div>

<div class="hymn-verse">
4. All to Jesus I surrender,<br>
Lord, I give myself to Thee;<br>
Fill me with Thy love and power,<br>
Let Thy blessing fall on me.
</div>

<div class="hymn-author">Judson W. Van DeVenter, 1896</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_in_the_garden', 'In the Garden', 'liturgy', 'Worship', 'Affection', '1. I come to the garden alone,
While the dew is still on the roses,
And the voice I hear, falling on my ear,
The Son of God discloses.
<...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. I come to the garden alone,<br>
While the dew is still on the roses,<br>
And the voice I hear, falling on my ear,<br>
The Son of God discloses.
</div>

<div class="hymn-chorus">
Chorus:<br>
And He walks with me, and He talks with me,<br>
And He tells me I am His own,<br>
And the joy we share as we tarry there,<br>
None other has ever known.
</div>

<div class="hymn-verse">
2. He speaks, and the sound of His voice<br>
Is so sweet the birds hush their singing,<br>
And the melody that He gave to me<br>
Within my heart is ringing.
</div>

<div class="hymn-verse">
3. I''d stay in the garden with Him<br>
Though the night around me be falling,<br>
But He bids me go; through the voice of woe<br>
His voice to me is calling.
</div>

<div class="hymn-author">C. Austin Miles, 1913</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_leaning_on_the_everlasting_arms', 'Leaning on the Everlasting Arms', 'liturgy', 'Worship', 'Affection', '1. What a fellowship, what a joy divine,
Leaning on the everlasting arms;
What a blessedness, what a peace is mine,
Leaning on the everla...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. What a fellowship, what a joy divine,<br>
Leaning on the everlasting arms;<br>
What a blessedness, what a peace is mine,<br>
Leaning on the everlasting arms.
</div>

<div class="hymn-chorus">
Chorus:<br>
Leaning, leaning,<br>
Safe and secure from all alarms;<br>
Leaning, leaning,<br>
Leaning on the everlasting arms.
</div>

<div class="hymn-verse">
2. O how sweet to walk in this pilgrim way,<br>
Leaning on the everlasting arms;<br>
O how bright the path grows from day to day,<br>
Leaning on the everlasting arms.
</div>

<div class="hymn-verse">
3. What have I to dread, what have I to fear,<br>
Leaning on the everlasting arms?<br>
I have blessed peace with my Lord so near,<br>
Leaning on the everlasting arms.
</div>

<div class="hymn-author">Elisha A. Hoffman, 1887</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_my_jesus_i_love_thee', 'My Jesus, I Love Thee', 'liturgy', 'Worship', 'Affection', '1. My Jesus, I love Thee, I know Thou art mine;
For Thee all the follies of sin I resign.
My gracious Redeemer, my Savior art Thou;
If ev...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. My Jesus, I love Thee, I know Thou art mine;<br>
For Thee all the follies of sin I resign.<br>
My gracious Redeemer, my Savior art Thou;<br>
If ever I loved Thee, my Jesus, ''tis now.
</div>

<div class="hymn-verse">
2. I love Thee because Thou has first loved me,<br>
And purchased my pardon on Calvary''s tree.<br>
I love Thee for wearing the thorns on Thy brow;<br>
If ever I loved Thee, my Jesus, ''tis now.
</div>

<div class="hymn-verse">
3. I''ll love Thee in life, I will love Thee in death,<br>
And praise Thee as long as Thou lendest me breath;<br>
And say when the death dew lies cold on my brow,<br>
If ever I loved Thee, my Jesus, ''tis now.
</div>

<div class="hymn-verse">
4. In mansions of glory and endless delight,<br>
I''ll ever adore Thee in heaven so bright;<br>
I''ll sing with the glittering crown on my brow,<br>
If ever I loved Thee, my Jesus, ''tis now.
</div>

<div class="hymn-author">William R. Featherston, 1864</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_revive_us_again', 'Revive Us Again', 'liturgy', 'Worship', 'Affection', '1. We praise Thee, O God! For the Son of Thy love,
For Jesus Who died, and is now gone above.



Chorus:
Ha...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. We praise Thee, O God! For the Son of Thy love,<br>
For Jesus Who died, and is now gone above.
</div>

<div class="hymn-chorus">
Chorus:<br>
Hallelujah! Thine the glory.<br>
Hallelujah! Amen.<br>
Hallelujah! Thine the glory.<br>
Revive us again.
</div>

<div class="hymn-verse">
2. We praise Thee, O God! For Thy Spirit of light,<br>
Who has shown us our Savior, and scattered our night.
</div>

<div class="hymn-verse">
3. All glory and praise to the Lamb that was slain,<br>
Who has borne all our sins, and has cleansed every stain.
</div>

<div class="hymn-verse">
4. Revive us again; fill each heart with Thy love;<br>
May each soul be rekindled with fire from above.
</div>

<div class="hymn-author">William P. Mackay, 1863</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_softly_and_tenderly', 'Softly and Tenderly', 'liturgy', 'Worship', 'Affection', '1. Softly and tenderly Jesus is calling,
Calling for you and for me;
See, on the portals He''s waiting and watching,
Watching for you and ...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Softly and tenderly Jesus is calling,<br>
Calling for you and for me;<br>
See, on the portals He''s waiting and watching,<br>
Watching for you and for me.
</div>

<div class="hymn-chorus">
Chorus:<br>
Come home, come home,<br>
You who are weary, come home;<br>
Earnestly, tenderly, Jesus is calling,<br>
Calling, O sinner, come home!
</div>

<div class="hymn-verse">
2. Why should we tarry when Jesus is pleading,<br>
Pleading for you and for me?<br>
Why should we linger and heed not His mercies,<br>
Mercies for you and for me?
</div>

<div class="hymn-verse">
3. Time is now fleeting, the moments are passing,<br>
Passing from you and from me;<br>
Shadows are gathering, deathbeds are coming,<br>
Coming for you and for me.
</div>

<div class="hymn-verse">
4. O for the wonderful love He has promised,<br>
Promised for you and for me!<br>
Though we have sinned, He has mercy and pardon,<br>
Pardon for you and for me.
</div>

<div class="hymn-author">Will L. Thompson, 1880</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'hymn_faith_of_our_fathers', 'Faith of Our Fathers', 'liturgy', 'Worship', 'Affection', '1. Faith of our fathers, living still,
In spite of dungeon, fire and sword;
O how our hearts beat high with joy
Whene''er we hear that glo...', NULL, NULL, '<div class="hymn">

<div class="hymn-verse">
1. Faith of our fathers, living still,<br>
In spite of dungeon, fire and sword;<br>
O how our hearts beat high with joy<br>
Whene''er we hear that glorious word!
</div>

<div class="hymn-chorus">
Chorus:<br>
Faith of our fathers, holy faith!<br>
We will be true to thee till death.
</div>

<div class="hymn-verse">
2. Faith of our fathers, we will strive<br>
To win all nations unto thee;<br>
And through the truth that comes from God,<br>
We all shall then be truly free.
</div>

<div class="hymn-verse">
3. Faith of our fathers, we will love<br>
Both friend and foe in all our strife;<br>
And preach thee, too, as love knows how<br>
By kindly words and virtuous life.
</div>

<div class="hymn-author">Frederick W. Faber, 1849</div>
</div>', NULL, 10, 'Morning_Circle', 'hymn', 48, 216, 'trinity_hymnal', 'schoolos_core',
'id', 'title', 'liturgy', 'primary_virtue', 'Memory', 'description', NULL, NULL, 'liturgical_script', NULL, 5, 'context_anchor', 'scripture', 'min_age_months', 'max_age_months) VALUES
(verse_week_01', 'esv', 'schoolos_core',
'verse_week_02', 'Week 2: Image of God', 'liturgy', 'Identity', 'Memory', 'Genesis 1:27', NULL, NULL, 'So God created man in his own image, in the image of God created he him; male and female created he them.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_03', 'Week 3: The Promise', 'liturgy', 'Hope', 'Memory', 'Genesis 3:15', NULL, NULL, 'And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_04', 'Week 4: The Covenant', 'liturgy', 'Faithfulness', 'Memory', 'Genesis 9:13', NULL, NULL, 'I do set my bow in the cloud, and it shall be for a token of a covenant between me and the earth.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_05', 'Week 5: The Call', 'liturgy', 'Faith', 'Memory', 'Genesis 12:3', NULL, NULL, 'And I will bless them that bless thee, and curse him that curseth thee: and in thee shall all families of the earth be blessed.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_06', 'Week 6: Providence', 'liturgy', 'Trust', 'Memory', 'Genesis 50:20', NULL, NULL, 'But as for you, ye thought evil against me; but God meant it unto good, to bring to pass, as it is this day, to save much people alive.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_07', 'Week 7: The Name', 'liturgy', 'Awe', 'Memory', 'Exodus 3:14', NULL, NULL, 'And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_08', 'Week 8: Deliverance', 'liturgy', 'Salvation', 'Memory', 'Exodus 14:14', NULL, NULL, 'The LORD shall fight for you, and ye shall hold your peace.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_09', 'Week 9: No Other Gods', 'liturgy', 'Worship', 'Memory', 'Exodus 20:3', NULL, NULL, 'Thou shalt have no other gods before me.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_10', 'Week 10: Holiness', 'liturgy', 'Holiness', 'Memory', 'Leviticus 19:2', NULL, NULL, 'Speak unto all the congregation of the children of Israel, and say unto them, Ye shall be holy: for I the LORD your God am holy.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_11', 'Week 11: The Blessing', 'liturgy', 'Peace', 'Memory', 'Numbers 6:24-26', NULL, NULL, 'The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_12', 'Week 12: Obedience', 'liturgy', 'Obedience', 'Memory', 'Deuteronomy 5:33', NULL, NULL, 'Ye shall walk in all the ways which the LORD your God hath commanded you, that ye may live, and that it may be well with you.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_13', 'Week 13: The Great Commandment', 'liturgy', 'Love', 'Memory', 'Deuteronomy 6:5', NULL, NULL, 'And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'Josh - Mal)
(verse_week_14', 'Week 14: Courage', 'liturgy', 'Courage', 'Memory', 'Joshua 1:9', NULL, NULL, 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_15', 'Week 15: Loyalty', 'liturgy', 'Loyalty', 'Memory', 'Ruth 1:16', NULL, NULL, 'And Ruth said, Intreat me not to leave thee, or to return from following after thee: for whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_16', 'Week 16: The Heart', 'liturgy', 'Humility', 'Memory', '1 Samuel 16:7', NULL, NULL, 'For the LORD seeth not as man seeth; for man looketh on the outward appearance, but the LORD looketh on the heart.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_17', 'Week 17: God''s Greatness', 'liturgy', 'Reverence', 'Memory', '2 Samuel 7:22', NULL, NULL, 'Wherefore thou art great, O LORD God: for there is none like thee, neither is there any God beside thee, according to all that we have heard with our ears.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_18', 'Week 18: God Alone', 'liturgy', 'Truth', 'Memory', '1 Kings 8:60', NULL, NULL, 'That all the people of the earth may know that the LORD is God, and that there is none else.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_19', 'Week 19: The Joy of the Lord', 'liturgy', 'Joy', 'Memory', 'Nehemiah 8:10', NULL, NULL, 'Then he said unto them, Go your way, eat the fat, and drink the sweet, and send portions unto them for whom nothing is prepared: for this day is holy unto our Lord: neither be ye sorry; for the joy of the LORD is your strength.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_20', 'Week 20: The Redeemer', 'liturgy', 'Hope', 'Memory', 'Job 19:25', NULL, NULL, 'For I know that my redeemer liveth, and that he shall stand at the latter day upon the earth.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_21', 'Week 21: God''s Glory', 'liturgy', 'Wonder', 'Memory', 'Psalm 19:1', NULL, NULL, 'The heavens declare the glory of God; and the firmament sheweth his handywork.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_22', 'Week 22: The Shepherd', 'liturgy', 'Comfort', 'Memory', 'Psalm 23:1', NULL, NULL, 'The LORD is my shepherd; I shall not want.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_23', 'Week 23: God''s Word', 'liturgy', 'Wisdom', 'Memory', 'Psalm 119:105', NULL, NULL, 'Thy word is a lamp unto my feet, and a light unto my path.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_24', 'Week 24: Trust in the Lord', 'liturgy', 'Trust', 'Memory', 'Proverbs 3:5-6', NULL, NULL, 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_25', 'Week 25: The Messiah', 'liturgy', 'Peace', 'Memory', 'Isaiah 9:6', NULL, NULL, 'For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_26', 'Week 26: What God Requires', 'liturgy', 'Justice', 'Memory', 'Micah 6:8', NULL, NULL, 'He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'Jesus'' Life & Early Church)
(verse_week_27', 'Week 27: Jesus Saves', 'liturgy', 'Salvation', 'Memory', 'Matthew 1:21', NULL, NULL, 'And she shall bring forth a son, and thou shalt call his name JESUS: for he shall save his people from their sins.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_28', 'Week 28: Good Tidings', 'liturgy', 'Joy', 'Memory', 'Luke 2:10-11', NULL, NULL, 'And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people. For unto you is born this day in the city of David a Saviour, which is Christ the Lord.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_29', 'Week 29: The Word Made Flesh', 'liturgy', 'Truth', 'Memory', 'John 1:14', NULL, NULL, 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_30', 'Week 30: The Kingdom', 'liturgy', 'Repentance', 'Memory', 'Mark 1:15', NULL, NULL, 'The time is fulfilled, and the kingdom of God is at hand: repent ye, and believe the gospel.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_31', 'Week 31: Light of the World', 'liturgy', 'Purpose', 'Memory', 'Matthew 5:16', NULL, NULL, 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_32', 'Week 32: Rest', 'liturgy', 'Rest', 'Memory', 'Matthew 11:28', NULL, NULL, 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_33', 'Week 33: A Ransom for Many', 'liturgy', 'Service', 'Memory', 'Mark 10:45', NULL, NULL, 'For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_34', 'Week 34: Seek and Save', 'liturgy', 'Compassion', 'Memory', 'Luke 19:10', NULL, NULL, 'For the Son of man is come to seek and to save that which was lost.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_35', 'Week 35: God So Loved', 'liturgy', 'Love', 'Memory', 'John 3:16', NULL, NULL, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_36', 'Week 36: The Way', 'liturgy', 'Truth', 'Memory', 'John 14:6', NULL, NULL, 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_37', 'Week 37: The Great Commission', 'liturgy', 'Mission', 'Memory', 'Matthew 28:19-20', NULL, NULL, 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_38', 'Week 38: Resurrection Power', 'liturgy', 'Power', 'Memory', 'John 11:25', NULL, NULL, 'Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_39', 'Week 39: Witnesses', 'liturgy', 'Courage', 'Memory', 'Acts 1:8', NULL, NULL, 'But ye shall receive power, after that the Holy Ghost is come upon you: and ye shall be witnesses unto me both in Jerusalem, and in all Judaea, and in Samaria, and unto the uttermost part of the earth.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'Doctrine & Hope)
(verse_week_40', 'Week 40: Power of the Gospel', 'liturgy', 'Faith', 'Memory', 'Romans 1:16', NULL, NULL, 'For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_41', 'Week 41: Justified by Grace', 'liturgy', 'Grace', 'Memory', 'Romans 3:23-24', NULL, NULL, 'For all have sinned, and come short of the glory of God; Being justified freely by his grace through the redemption that is in Christ Jesus.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_42', 'Week 42: No Condemnation', 'liturgy', 'Freedom', 'Memory', 'Romans 8:1', NULL, NULL, 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_43', 'Week 43: New Creation', 'liturgy', 'Transformation', 'Memory', '2 Corinthians 5:17', NULL, NULL, 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_44', 'Week 44: Fruit of the Spirit', 'liturgy', 'Self-Control', 'Memory', 'Galatians 5:22-23', NULL, NULL, 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_45', 'Week 45: Saved by Grace', 'liturgy', 'Humility', 'Memory', 'Ephesians 2:8-9', NULL, NULL, 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_46', 'Week 46: The Fullness of God', 'liturgy', 'Supremacy', 'Memory', 'Colossians 1:16-17', NULL, NULL, 'For by him were all things created, that are in heaven, and that are in earth... and he is before all things, and by him all things consist.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_47', 'Week 47: Work as Worship', 'liturgy', 'Diligence', 'Memory', 'Colossians 3:23', NULL, NULL, 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_48', 'Week 48: Rejoice Always', 'liturgy', 'Joy', 'Memory', 'Philippians 4:4', NULL, NULL, 'Rejoice in the Lord alway: and again I say, Rejoice.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_49', 'Week 49: God-Breathed', 'liturgy', 'Wisdom', 'Memory', '2 Timothy 3:16', NULL, NULL, 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_50', 'Week 50: Faith', 'liturgy', 'Faith', 'Memory', 'Hebrews 11:1', NULL, NULL, 'Now faith is the substance of things hoped for, the evidence of things not seen.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_51', 'Week 51: Love One Another', 'liturgy', 'Love', 'Memory', '1 John 4:19', NULL, NULL, 'We love him, because he first loved us.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'verse_week_52', 'Week 52: All Things New', 'liturgy', 'Hope', 'Memory', 'Revelation 21:4', NULL, NULL, 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.', NULL, 5, 'Morning_Circle', 'scripture', 48, 216, 'esv', 'schoolos_core',
'id', 'title', 'liturgy', 'primary_virtue', 'biblical_faculty', 'description', NULL, NULL, 'liturgical_script', NULL, 20, 'context_anchor', 'history', 'min_age_months', 'max_age_months) VALUES
(hist_story_01_god_made_africa', 'schoolos_history', 'schoolos_core',
'hist_story_02_the_river_of_time', 'The River of Time', 'liturgy', 'Wonder', 'Imagination', '# The River of Time

## Spread 1 (Pages 1-2)

![A stunning textual aerial shot of the Nile River winding through the golden desert sands, creating a ribbon of lush green vegetation. 8k resolution, cinematic.]

Close your eyes and imagine a river that never ends. This is the Nile, the father of rivers. For thousands of years, it has engaged the desert in a hug of green.

---

## Spread 2 (Pages 3-4)

![Ancient Egyptian farmers working in the fields as the Nile waters recede, leaving dark, rich soil. Pyramids are visible in the far distance in the morning mist.]

In the land of Egypt, the people learned the rhythm of the river. Every year, it flooded and brought rich black soil. They called their land ''Kemet'', the Black Land.

---

## Spread 3 (Pages 5-6)

![A photorealistic close-up of the Narmer Palette or King Narmer himself wearing the Double Crown, standing tall with a royal scepter. Ancient Egyptian palace background.]

A powerful King named Narmer united the people of the river. He wore a special double crown—white and red—to show he ruled everything from the delta to the valley.

---

## Spread 4 (Pages 7-8)

![The Great Pyramids of Giza under construction, with wooden scaffolding and hundreds of workers hauling stones. The sun is setting, casting long shadows.]

The Egyptians wanted to live forever. The mighty Pharaohs built mountains of stone called Pyramids to reach the stars. They thought they were gods.

---

## Spread 5 (Pages 9-10)

![Joseph standing in an Egyptian prison cell, a single shaft of light hitting his face. He looks peaceful and wise despite his surroundings. Realistic texture.]

But a true man of God came to Egypt. His name was Joseph. He didn''t come as a king, but as a slave. Yet God was with him.

---

## Spread 6 (Pages 11-12)

![Joseph, now dressed in fine Egyptian linen and gold chains, standing beside Pharaoh on a balcony overlooking grain silos being filled. A crowd cheers below.]

Joseph helped the Pharaoh understand a strange dream. Because Joseph listened to God, he saved Egypt from a terrible time of hunger.

---

## Spread 7 (Pages 13-14)

![Moses standing before a seated, arrogant Pharaoh in a grand throne room. Moses holds a wooden staff. The atmosphere is tense and dramatic.]

Years later, God’s people were trapped in Egypt. They cried out for help. God sent Moses to tell the Pharaoh, ''Let my people go!''

---

## Spread 8 (Pages 15-16)

![A split page showing a bust of Akhenaten on one side and a regal, photorealistic portrait of Queen Cleopatra on the other, wearing Greek-Egyptian royal attire.]

Egypt saw many other rulers. There was Akhenaten, who tried to pray to only one sun god. And the famous Queen Cleopatra, the very last Pharaoh.

---

## Spread 9 (Pages 17-18)

![Roman soldiers marching past the Sphinx, which is partially buried in sand. The sky is slightly overcast, signaling a change in history.]

Over time, the great power of the Pharaohs faded. Rome took over the land. The old temples became silent ruins buried in the sand.

---

## Spread 10 (Pages 19-20)

![A peaceful night scene on the Nile. A small boat carries Mary, Joseph, and baby Jesus. The stars reflect in the water.]

But the story wasn''t over. The River Nile still flowed. And soon, a new message would come to Egypt—a message about a baby who also escaped to the Nile for safety.

---

## Spread 11 (Pages 21-22)

![Modern day view of the pyramids with a bustling Cairo in the background, bridging the ancient and the modern. Golden hour.]

Today, we remember Egypt not just for its stone piles, but as a place where God showed His mighty power and kept His people safe.

---

## Spread 12 (Pages 23-24)

![A parchment map focusing on the Nile River. It highlights ''Upper Egypt'' in the south and ''Lower Egypt'' (the Delta) in the north. The Red Sea is also visible.]

Map: The Black Land. See the long blue line of the Nile flowing North. Find the Delta at the top where it meets the sea. This is Egypt.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_03_the_green_sahara', 'The Green Sahara', 'liturgy', 'Wonder', 'Imagination', '# The Green Sahara

## Spread 1 (Pages 1-2)

![A split image. Left side: Hot, dry sand dunes of the modern Sahara. Right side: The same landscape but lush, green, and full of grass and lakes.]

Imagine standing in the Sahara desert. Today, it is hot and sandy. But if you could travel back in time, you would see something amazing.

---

## Spread 2 (Pages 3-4)

![A prehistoric scene of the ''Green Sahara''. A lake with hippos, and people fishing in dug-out canoes. Giraffes grazing in the background.]

Thousands of years ago, the Sahara was green! It was a land of flowing rivers, splashing hippos, and tall giraffes. People lived there happily.

---

## Spread 3 (Pages 5-6)

![A close-up of ancient rock art on a sandstone cave wall, depicting cattle and hunters. A hand of a modern child is reaching out to touch it (implied).]

These people were the children of Phut. They painted pictures on the rocks of the animals they saw. We can still see these paintings today.

---

## Spread 4 (Pages 7-8)

![A time-lapse style composite showing the landscape transitioning from green savanna to dry scrubland, and finally to desert dunes. The mood is melancholic.]

Slowly, the rain stopped falling. The grass turned brown. The lakes dried up. The sand took over. The people had to move.

---

## Spread 5 (Pages 9-10)

![Ancient engineers digging a ''foggara'' tunnel in the desert rock. Water flows through a stone channel, irrigating a small oasis garden.]

Some people learned to live in the desert. They were called the Garamantes. They dug deep tunnels to find water hidden underground.

---

## Spread 6 (Pages 11-12)

![A caravan of camels walking through a sandstorm, carrying goods. The riders are wrapped in indigo cloth. The sun is a hazy ball of white.]

They rode horses and chariots across the sands. Later, they used camels. The camel was the ''ship of the desert'' that helped them trade.

---

## Spread 7 (Pages 13-14)

![The ancient harbor of Carthage. It is circular and filled with wooden warships (triremes). The city rises white and majestic in the background.]

On the coast, huge ships arrived. The Phoenicians built a great city called Carthage. It was famous for its purple cloth and mighty ships.

---

## Spread 8 (Pages 15-16)

![A dramatic scene of Hannibal’s army crossing the snowy Alps. War elephants are tramping through the snow, soldiers bracing against the wind.]

Carthage became powerful. But a city called Rome wanted to be the boss. They fought huge wars. A general named Hannibal even rode elephants over mountains!

---

## Spread 9 (Pages 17-18)

![An Amazigh family in a mountain village, wearing traditional wool cloaks. They look proud and resilient. Roman ruins are visible in the far distance.]

In the end, Rome won. But the people of Phut—the Amazigh—stayed strong. They kept their own language and their own ways.

---

## Spread 10 (Pages 19-20)

![A simple early Christian meeting in a North African home. Light streams in from a window. People are listening intently to a reader.]

God had a plan for these tough people. Soon, the news of Jesus would come to their cities and farms, and they would become heroes of the faith.

---

## Spread 11 (Pages 21-22)

![A lone tree standing in the desert (an acacia), symbolizing resilience. The sun is setting, painting the sky in deep purples and oranges.]

The desert may remain, but the history of the Green Sahara reminds us that the world is always changing in God''s hands.

---

## Spread 12 (Pages 23-24)

![A parchment map of North Africa. It shows the Atlas Mountains and the Mediterranean coast. A dot for ''Carthage'' and symbols for ''Oases'' in the desert.]

Map: The Changing Land. This map shows North Africa. The green spots show where the oasis cities were. Carthage is on the coast.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_04_the_iron_kingdom', 'The Iron Kingdom', 'liturgy', 'Wonder', 'Imagination', '# The Iron Kingdom

## Spread 1 (Pages 1-2)

![A sweeping view of the Nubian desert with the smaller, steeper pyramids of Meroe in the background. The sand is reddish-gold.]

South of Egypt, in the land of Cush, a new kind of kingdom was born. This was a land of gold mines and strong warriors.

---

## Spread 2 (Pages 3-4)

![A dramatic low-angle shot of a Kushite King (pharaoh) wearing the distinct cap-crown with two cobras. He looks regal and powerful. Temple columns behind him.]

The people of Cush were powerful. Once, their kings marched north and became the Pharaohs of Egypt! We call them the Black Pharaohs.

---

## Spread 3 (Pages 5-6)

![The city of Meroe at its height. Smoke rises from iron smelting furnaces. The city is bustling with trade and activity.]

But their true home was the city of Meroe. Meroe was not just a city of stone; it was a city of fire and iron.

---

## Spread 4 (Pages 7-8)

![Close up of an ancient blacksmith striking glowing red iron on an anvil. Sparks fly. He is focused and skilled. Realistic detail.]

The people learned the secret of smelting iron. They made strong tools for farming and sharp spears for hunting. Iron made them rich.

---

## Spread 5 (Pages 9-10)

![Queen Amanirenas leading her army into battle. She is fierce, riding a war chariot or horse, holding a spear. Roman soldiers are retreating in the distance.]

Meroe was also famous for its Queens, called ''Kandakes''. When the Romans tried to attack, a one-eyed Queen named Amanirenas led her army to stop them!

---

## Spread 6 (Pages 11-12)

![A stone stele covered in Meroitic script. A scholar or scribe is carving into it. In the background, merchants trade ivory and cloth.]

The Cushites wrote in their own special alphabet. They built temples and palaces. They traded with India and Arabia.

---

## Spread 7 (Pages 13-14)

![The Ethiopian Eunuch sitting in a grand chariot on a desert road. He is reading a scroll intently. Philip the Evangelist is approaching on foot.]

One day, a man from Cush was riding his chariot home from Jerusalem. He was reading a scroll from the prophet Isaiah.

---

## Spread 8 (Pages 15-16)

![Philip baptizing the Ethiopian official in a small desert oasis pool. The official looks joyful and at peace. The chariot waits nearby.]

God sent a man named Philip to explain the scroll. The man from Cush believed the good news about Jesus! He took that joy back to Africa.

---

## Spread 9 (Pages 17-18)

![King Ezana standing on a balcony of his palace in the highlands. He holds a coin with a Cross on it, showing it to the people.]

Later, a new kingdom called Aksum grew in the mountains. A King named Ezana decided to follow Jesus, too.

---

## Spread 10 (Pages 19-20)

![Ruins of the Meroe pyramids under a starry night sky. The Milky Way is visible. The scene is quiet and majestic.]

The fires of Meroe eventually went out, but the history of the Iron Kingdom shows us the strength and skill of Africa''s ancient people.

---

## Spread 11 (Pages 21-22)

![A montage spread showing an iron spearhead, a gold bracelet, and a piece of pottery from Meroe. Artifacts on a museum table.]

They were builders, warriors, and believers. Their story is written in the iron and the stone.

---

## Spread 12 (Pages 23-24)

![A parchment map of the varying Nile cataracts (waterfalls). It marks ''Meroe'', ''Napata'', and ''Aksum''. The Red Sea trade routes are dotted lines.]

Map: The Land of the Bow. This map shows the Nile bending in an ''S'' shape. The city of Meroe is between the rivers. The Red Sea is to the East.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_05_the_garden_of_faith', 'The Garden of Faith', 'liturgy', 'Wonder', 'Imagination', '# The Garden of Faith

## Spread 1 (Pages 1-2)

![Endless golden wheat fields in North Africa under a bright blue sky. Roman-style aqueducts run through the fields. Farmers harvesting.]

After the wars with Rome, North Africa became a peaceful garden. Fields of wheat stretched as far as the eye could see.

---

## Spread 2 (Pages 3-4)

![A diverse group of early Christians (Romans, Amazigh, others) gathered in a courtyard for a meal (Agape feast). Warm, inviting lighting.]

It was here, in this rich land, that the church of Jesus began to grow like a strong tree. People of all kinds became Christians.

---

## Spread 3 (Pages 5-6)

![A Roman official reading a decree in a public square. Soldiers stand guard. The people look worried. Shadowy and tense atmosphere.]

But the Roman Emperor wanted everyone to worship him. He didn''t like the Christians because they said, ''Jesus is Lord.''

---

## Spread 4 (Pages 7-8)

![Perpetua in prison, talking to her elderly father. She points to a water pitcher on the floor. Her face is calm and resolute.]

A young mother named Perpetua was arrested. She was very brave. Even when her father begged her to give up, she pointed to a pitcher.

---

## Spread 5 (Pages 9-10)

![Close up of Perpetua''s face, filled with grace and strength. Soft lighting highlights her expression of faith.]

''Can you call this pitcher by any other name?'' she asked. ''No,'' said her father. ''In the same way, I cannot call myself anything but a Christian.''

---

## Spread 6 (Pages 11-12)

![A symbolic image of seeds falling into the ground and sprouting into strong green plants. In the background, the silhouette of the Roman arena.]

Perpetua and her friend Felicitas gave their lives for Jesus. Their courage made the church grow even stronger. The blood of martyrs was like seed.

---

## Spread 7 (Pages 13-14)

![A young, troubled Augustine sitting in a garden in Milan, looking distressed. A scroll lies on the ground next to him.]

Years later, a brilliant young man named Augustine lived in Africa. He made many mistakes and looked for happiness in wrong places.

---

## Spread 8 (Pages 15-16)

![Augustine under a fig tree. He is reading a Bible with a look of realization and peace. A light shines on the page.]

But his mother, Monica, prayed for him every day. Finally, in a garden, Augustine heard a child''s voice say, ''Take up and read.''

---

## Spread 9 (Pages 17-18)

![Bishop Augustine sitting in his study in Hippo, writing with a quill. Shelves of scrolls behind him. He looks wise and kind.]

Augustine became a great Bishop. He wrote books that taught the whole world about God’s grace and the City of God.

---

## Spread 10 (Pages 19-20)

![The ruins of the Hippo Basilica at sunset. The stones are old, but the cross still stands or is implied in the architecture.]

Enemies eventually attacked the cities of North Africa, but the wisdom of Augustine and the courage of Perpetua could never be destroyed.

---

## Spread 11 (Pages 21-22)

![A heavenly city shining in the clouds above the African landscape, representing the ''City of God''. Artistic and inspiring.]

They remind us that the strongest kingdom is not Rome or Carthage, but the Kingdom of God.

---

## Spread 12 (Pages 23-24)

![A parchment map of the North African coast. It marks ''Carthage'' and ''Hippo Regius''. Olive branches decorate the corners.]

Map: The Coast of Saints. This map shows the cities of Carthage and Hippo along the Mediterranean Sea. The land is green and fertile.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_06_the_desert_prayer', 'The Desert Prayer', 'liturgy', 'Wonder', 'Imagination', '# The Desert Prayer

## Spread 1 (Pages 1-2)

![The crowded streets of ancient Alexandria. The Great Library is in the background. Merchants, scholars, and soldiers bustle about.]

In the busy city of Alexandria, Egypt, scholars argued and studied. It was a place of noise and crowds.

---

## Spread 2 (Pages 3-4)

![Young Antony handing out bags of coins and goods to the poor people of his village. He looks light and free.]

A young man named Antony heard Jesus'' words in church: ''Sell what you have and give to the poor.'' Antony did exactly that!

---

## Spread 3 (Pages 5-6)

![Antony walking alone into the vast, rocky Egyptian desert. The city is far behind him. The landscape is stark and empty.]

He moved away from the noisy city. He went deep into the quiet desert. He wanted to fill his mind only with God.

---

## Spread 4 (Pages 7-8)

![Antony praying inside a small, dim cave. A candle flickers. He looks focused and holy.]

Antony lived in a cave or an old fort. He prayed and sang psalms. Sometimes it was hard, but God helped him.

---

## Spread 5 (Pages 9-10)

![A wide shot of the desert with many small caves or huts scattered around. Monks are walking or working in small gardens.]

Soon, other people wanted to find peace too. They followed Antony to the desert. They became the first monks.

---

## Spread 6 (Pages 11-12)

![A monk seated on a palm mat weaving a basket. His lips are moving in silent prayer. His face is weathered but kind.]

These monks were like athletes for God. They trained their hearts to love. They wove baskets and prayed without ceasing.

---

## Spread 7 (Pages 13-14)

![Athanasius and an aged Antony embracing or talking. Athanasius is dressed as a Bishop, Antony in simple monk skins.]

A great leader named Athanasius knew Antony. Athanasius fought for the truth that Jesus is fully God. Antony supported him.

---

## Spread 8 (Pages 15-16)

![An ancient manuscript depicting the sayings of the Desert Fathers. A monk is copying the text in a scriptorium.]

The wisdom of the desert fathers spread all over the world. They taught us that silence can be better than speaking.

---

## Spread 9 (Pages 17-18)

![A Coptic church from the outside, with its distinct dome and cross. It stands firm amidst a changing city landscape.]

Later, sad times came. Armies from Arabia brought a new religion called Islam. But the Christians of Egypt stayed true.

---

## Spread 10 (Pages 19-20)

![Modern Coptic Christians attending a service. The priest is swinging incense. Beautiful icons of saints are on the walls.]

Today, the Coptic Christians of Egypt still pray the prayers of St. Antony. They are proud of their ancient faith.

---

## Spread 11 (Pages 21-22)

![A beautiful sunset over the desert. The silhouette of a monastery (like St. Catherine''s or St. Antony''s) is visible on a mountain.]

The desert is not empty. It is full of the memory of prayer.

---

## Spread 12 (Pages 23-24)

![A parchment map of the Egyptian Eastern Desert. It marks ''Alexandria'' and the location of ''St. Antony''s Monastery''. The desert is textured like sand.]

Map: The Desert Cells. This map shows the Nile Delta and the Red Sea. Small crosses mark where the monasteries were in the desert.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_07_the_cross_on_the_coin', 'The Cross on the Coin', 'liturgy', 'Wonder', 'Imagination', '# The Cross on the Coin

## Spread 1 (Pages 1-2)

![The misty highlands of Ethiopia. The obelisks (stelae) of Aksum rise up through the mist. Lush green terraces.]

High in the mountains of East Africa, the Kingdom of Aksum touched the clouds. It was a rich land of trade and ivory.

---

## Spread 2 (Pages 3-4)

![The port of Adulis on the Red Sea. Ships are being loaded with elephant tusks and gold. Diverse traders are bargaining.]

Aksum was powerful. It controlled the Red Sea ports. Ships from India and Rome came to buy its goods.

---

## Spread 3 (Pages 5-6)

![Two young boys standing nervously before the King of Aksum. The court is lavish, filled with gold and leopard skins.]

One day, two Christian boys from Syria, Frumentius and Aedesius, were shipwrecked. They were taken to the King''s palace.

---

## Spread 4 (Pages 7-8)

![Frumentius teaching a young Prince Ezana. They are looking at a scroll. The atmosphere is warm and mentorship-focused.]

The boys were smart and kind. They helped the Queen raise her young son, Ezana, who would become the King.

---

## Spread 5 (Pages 9-10)

![King Ezana, now an adult, sitting on his throne deep in thought. A cross is visible in the background design.]

Frumentius told Ezana about Jesus. When Ezana grew up and became King, he did something amazing.

---

## Spread 6 (Pages 11-12)

![Close up of a gold Aksumite coin. On one side, the face of Ezana. On the other, a distinct Cross. The metal glints in the light.]

For years, the coins of Aksum showed the sun and moon gods. But Ezana changed them. He put the Cross of Christ on the coins!

---

## Spread 7 (Pages 13-14)

![A public ceremony where King Ezana is proclaiming his faith. A large stone tablet with inscriptions (Greek, Sabaean, Ge''ez) stands nearby.]

He declared, ''I will rule by the power of the Lord of Heaven.'' Aksum became one of the first Christian kingdoms in the world.

---

## Spread 8 (Pages 15-16)

![The monastery of Debre Damo atop a flat-topped mountain (amba). Monks are climbing up a rope to get to it.]

Monks called the ''Nine Saints'' came to Aksum. They built monasteries on top of steep cliffs where they were safe to pray.

---

## Spread 9 (Pages 17-18)

![A monk writing in a heavy, leather-bound book. He is using red and black ink to write the Ge''ez script artfully.]

They translated the Bible into Ge''ez, the language of the people. Now everyone could hear the Word of God.

---

## Spread 10 (Pages 19-20)

![A procession of Ethiopian priests carrying ceremonial crosses and colorful umbrellas. The landscape is mountainous and green.]

Aksum declined later, but the faith did not die. It moved deeper into the mountains, kept safe by the people.

---

## Spread 11 (Pages 21-22)

![A child''s hand holding an ancient Aksumite coin against the backdrop of a modern Ethiopian church.]

King Ezana’s coins are small, but they tell a huge story of a King who chose the Cross.

---

## Spread 12 (Pages 23-24)

![A parchment map of the Horn of Africa/Ethiopia. It marks ''Aksum'', ''Adulis'', and the ''Blue Nile''. Mountains are drawn in relief.]

Map: The Highland Kingdom. This map shows the Red Sea and the mountains of Ethiopia. Aksum is the capital in the north.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_08_the_great_trek_south', 'The Great Trek South', 'liturgy', 'Wonder', 'Imagination', '# The Great Trek South

## Spread 1 (Pages 1-2)

![A village scene in West Africa (near Nigeria/Cameroon). Families are packing bundles. Children are helping. There is a sense of anticipation.]

A long time ago, a great adventure began. Families in West Africa started to pack up their belongings. They were moving.

---

## Spread 2 (Pages 3-4)

![A wide shot of a large group of people walking through a lush forest path. Sunbeams filter through the trees. They carry baskets and tools.]

Why did they move? Maybe their families were growing big. Maybe they were looking for new land. We call this the Bantu Migration.

---

## Spread 3 (Pages 5-6)

![Close up of a farmer planting yams with an iron hoe. The tool looks sturdy and effective compared to stone or wood.]

These travelers had a secret weapon. It wasn’t a sword—it was knowledge. They knew how to make iron and grow yams.

---

## Spread 4 (Pages 7-8)

![People in dugout canoes navigating a wide, misty river (the Congo). The jungle is dense on both sides.]

As they moved south and east, they cut through the thick rainforests. They built canoes to paddle down the mighty Congo River.

---

## Spread 5 (Pages 9-10)

![A meeting between a Bantu group (taller, with iron spears) and a Khoisan group (smaller, with bows). They are exchanging goods cautiously.]

They met other people who lived in the forests, the Pygmies and the Khoisan. Sometimes they fought, but often they traded and shared ideas.

---

## Spread 6 (Pages 11-12)

![A conceptual image showing a ''tree'' of languages branching out across a map of Africa. Words float in the air.]

The Bantu people brought their language with them. Today, millions of people in Africa speak languages that are cousins to each other!

---

## Spread 7 (Pages 13-14)

![A vast herd of ''Ankole'' cattle (long horns) grazing on the savanna. Herders watch over them. The sky is big and blue.]

They also brought their cows. In the grassy plains of the south, their herds grew huge. Cattle became their bank account.

---

## Spread 8 (Pages 15-16)

![An aerial view of a traditional circular African village (kraal). Huts surround a central cattle pen. Smoke rises from cooking fires.]

They built villages in circles, with the cattle in the middle to keep them safe. This was the ''kraal''.

---

## Spread 9 (Pages 17-18)

![Travelers reaching the coast of South Africa. They look out at the ocean, tired but triumphant.]

It took thousands of years, but these families walked all the way to the bottom of the continent.

---

## Spread 10 (Pages 19-20)

![A happy scene of a village celebration. Drums are playing, people are dancing. Iron jewelry glints in the firelight.]

They filled the land with farms, iron, and songs. They are the ancestors of many of us today.

---

## Spread 11 (Pages 21-22)

![A young child planting a seed in the ground. Behind him, a vision of many future cities and nations rises.]

The Great Trek wasn''t just a walk; it was the planting of a whole continent.

---

## Spread 12 (Pages 23-24)

![A parchment map of Sub-Saharan Africa. Large arrows sweep from Nigeria/Cameroon down into the Congo, East Africa, and South Africa.]

Map: The Moving Families. This map shows arrows moving from West Africa down to the South and East. It looks like a flowing river of people.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'hist_story_09_the_churches_in_the_rock', 'The Churches in the Rock', 'liturgy', 'Wonder', 'Imagination', '# The Churches in the Rock

## Spread 1 (Pages 1-2)

![Baby Lalibela lying in a crib. A swarm of bees hovers gently around him, symbolizing his future greatness. His mother looks on in wonder.]

In the hidden mountains of Ethiopia, a King was born. His name was Lalibela. Legend says bees surrounded him as a baby!

---

## Spread 2 (Pages 3-4)

![King Lalibela standing on a mountain ridge, looking towards the horizon with a longing expression. The terrain is rugged and dry.]

Lalibela grew up to be a very holy King. He wanted his people to see the holy city of Jerusalem, but the journey was too dangerous.

---

## Spread 3 (Pages 5-6)

![King Lalibela asleep, having a vision. Angels are showing him blueprints of churches descending from heaven.]

So, Lalibela had a dream. He would build a New Jerusalem right here in Ethiopia. But he wouldn''t build it *up*.

---

## Spread 4 (Pages 7-8)

![Workers standing on top of a flat rock surface, chiseling downwards. A trench is beginning to form. Dust flies in the air.]

He commanded his workers to carve the churches *down* into the solid red rock! They used hammers and chisels.

---

## Spread 5 (Pages 9-10)

![A night scene. The site is deserted of humans, but glowing, transparent angels are continuing the carving work on the stone.]

It was hard work. But stories say that while the men worked by day, the angels worked by night to help them.

---

## Spread 6 (Pages 11-12)

![A stunning high-angle shot looking down into the cruciform (cross-shaped) pit of the Church of St. George (Bet Giyorgis). The red rock contrasts with the green moss.]

They carved eleven amazing churches. The most famous one is shaped like a perfect cross. It is called St. George''s.

---

## Spread 7 (Pages 13-14)

![Interior of a rock-hewn church. Light beams stream through cross-shaped windows. A priest is reading a Bible near a pillar.]

Inside, the churches are hollowed out, with columns and windows. It feels like standing inside a mountain.

---

## Spread 8 (Pages 15-16)

![A pilgrim walking through a narrow, high-walled stone trench connecting the churches. The sky is a strip of blue above.]

Connecting the churches are deep tunnels and trenches. It is like a secret maze dedicated to God.

---

## Spread 9 (Pages 17-18)

![Medieval European mapmakers discussing a map. They point to a mythical figure of a King labeled ''Prester John'' in Africa.]

Europeans heard rumors of a powerful Christian King in Africa named ''Prester John''. They searched for him everywhere.

---

## Spread 10 (Pages 19-20)

![A meeting between Portuguese explorers and an Ethiopian Emperor. Both look regal. They are exchanging gifts.]

They didn''t find Prester John, but they found the faithful kings of Ethiopia, keeping the flame of Jesus alive.

---

## Spread 11 (Pages 21-22)

![A wide shot of the Lalibela complex at dawn. Pilgrims draped in white shamma cloth are gathering for prayer.]

King Lalibela’s churches still stand today. They are a miracle in stone.

---

## Spread 12 (Pages 23-24)

![A parchment map of the Ethiopian highlands. It marks ''Lalibela''. A small illustration of a cross-shaped church is on the map.]

Map: The Hidden City. This map shows the highlands of Lasta. It marks the ''New Jerusalem'' of Lalibela.

---', NULL, NULL, '', NULL, 20, 'Bedside', 'history', 48, 120, 'schoolos_history', 'schoolos_core',
'Active History for Ancient Africa)
-- Ages 6-12 (72-144 months)
-- Focus: "Fathers of Soroti" (Ham', 'Cush', 'skill', 'Ethiopia', 'Carthage)
-- Type: Skill
-- Virtue: Wisdom

INSERT OR REPLACE INTO formations (
  id', 'title', 'formation_type', 'cluster_tag', NULL, 'primary_virtue', 'biblical_faculty', 'duration_minutes', 'history', 'guide_steps', 'materials', 'schoolos_history', 'schoolos_core',
'hist_skill_02_shaduf', 'Engineer a Functioning Nile Shaduf', 'skill', 'Wisdom', 'Reason', 'The Egyptians used wisdom to water their crops in the desert. Building a shaduf (counterweight water lifter) teaches the child about leverage, stewardship of resources, and the ingenuity God gave to ancient people.', '["Create a vertical stand using sturdy sticks or a small wooden frame.", "Attach a long horizontal pole on a pivot point (fulcrum).", "On one end, hang a counterweight (clay ball or stone).", "On the other end, hang a bucket using string.", "Test the mechanism: does the weight help lift the full bucket?"]', 'Encourage trial and error. Ask, "Why is it easier to lift the water with the weight?"', NULL, '["Sturdy sticks/dowels", "String/Twine", "Small bucket or cup", "Clay or stone for weight", "Large container of water"]', 45, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_03_nubian_bow', 'Design a Nubian Archer''s Target', 'skill', 'Wisdom', 'Reason', 'Cush was known as the "Land of the Bow." Their archers were famous for their skill and focus. We create a target to practice aim, reminding us that wisdom requires a focal point—God''s truth.', '["Cut a large circle out of cardboard.", "Paint concentric rings: White (outer), Blue, Red, and Gold (bullseye).", "Discuss how the Nubian archers protected their kingdom.", "Set up the target in a safe place.", "Practice hitting the mark with a toy bow or beanbags."]', 'Focus on the concept of "missing the mark" (sin) and "hitting the mark" (righteousness).', NULL, '["Large Cardboard", "Paints (White, Blue, Red, Yellow)", "Toy Bow and Arrows (or Beanbags)", "String for hanging"]', 30, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_04_meroe_iron', 'Model a Meroitic Iron Furnace', 'skill', 'Wisdom', 'Reason', 'Meroe was an industrial city where iron was smelted from rock. We simulate this transformation by building a model furnace, learning how God provided iron for tools and strength.', '["Form a chimney shape using clay or a plastic bottle covered in foil.", "Create air vents at the bottom for ''draft''.", "Place red tissue paper and small stones inside to represent the fire and ore.", "Paint the exterior to look like baked mud/brick.", "Discuss how heat transforms the rock into useful metal."]', 'Marvel at the chemistry God embedded in creation. Stone becomes metal!', NULL, '["Air-dry clay or Plastic bottle", "Aluminum foil", "Red and Orange Tissue Paper", "Small stones", "Paints"]', 45, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_05_ezana_coins', 'Mint King Ezana''s Cross Coins', 'skill', 'Wisdom', 'Reason', 'Changing the money changed the message of the Kingdom. By minting coins with the Cross, King Ezana declared who really ruled Aksum. We imitate this act of public faith.', '["Roll out a flat sheet of clay or salt dough.", "Use a round cutter to make coin blanks.", "Carve a Cross into the wet clay.", "Add the inscription ''TOYTOAPECHTHXWRA'' (May this please the country) or a simple Cross.", "Paint gold or silver when dry."]', 'Discuss how money shows what a country values. What would our money look like?', NULL, '["Salt dough or Modeling Clay", "Round cookie cutter", "Toothpicks for carving", "Gold/Silver paint"]', 40, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_06_lalibela_carve', 'Carve a Church from "Rock"', 'skill', 'Wisdom', 'Reason', 'The churches of Lalibela were not built up, but carved down. This deductive process teaches patience and vision, reminding us that sometimes God carves away our rough edges to make us beautiful.', '["Take a large bar of soft soap or a block of floral foam.", "Draw a cross shape on the top surface.", "Carefully carve away the material ''outside'' the cross.", "Dig down to create the walls and windows.", "Reveal the church hidden inside the block."]', 'Emphasize "Reduction." We are removing what doesn''t belong to reveal the form.', NULL, '["Large bar of soap or Floral Foam", "Plastic knives or carving tools", "Sketch of Church of St. George (Lalibela)"]', 45, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_07_carthage_dye', 'Experiment with "Tyrian Purple" Dye', 'skill', 'Wisdom', 'Reason', 'Carthage grew rich trading purple cloth. This chemistry experiment helps the child understand the value of color in the ancient world and the beauty God put in nature.', '["Crush dark berries (blackberries/blueberries) or red cabbage to create a dye bath.", "Add a little vinegar to set the color.", "Dip strips of white cotton cloth into the dye.", "Experiment with tie-dye patterns or full immersion.", "Let dry and observe the rich color."]', 'Talk about value. Why was purple for kings? Because it was hard to get.', NULL, '["Blackberries, Blueberries, or Red Cabbage", "Vinegar", "White cotton fabric strips", "Bowl and masher", "Gloves"]', 40, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_08_phoenician_boat', 'Build a Carthaginian Trade Ship', 'skill', 'Wisdom', 'Reason', 'The Phoenicians were master navigators. Building a model ship teaches buoyancy and design, reflecting on how God guides us through the waters of life.', '["Shape a hull using wood scraps, styrofoam, or cardboard.", "Attach a mast and a square sail (typical of ancient ships).", "Draw an eye on the prow (a Phoenician tradition).", "Test the boat in a tub of water.", "Load it with ''cargo'' to see how much it can carry."]', 'Discuss navigation. How did they find their way without GPS? (Stars/Sun).', NULL, '["Wood scraps/Styrofoam", "Cloth for sail", "Glue/Tape", "Markers", "Tub of water"]', 45, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_09_sahara_art', 'Create Rock Art of the Green Sahara', 'skill', 'Wisdom', 'Reason', 'Before it was a desert, the Sahara was a garden. We remember this lost world by recreating the rock art left by the ancestors, realizing that the world changes, but God remains.', '["Crumple brown paper to create a ''rock'' texture.", "Mix charcoal or earth-toned paints (red, ochre).", "Paint silhouettes of giraffes, cattle, and swimming humans.", "Use handprints as signatures, just like the ancients.", "Display the art as a ''cave wall''."]', 'Imagine the Sahara as a green place. How does the environment shape how we live?', NULL, '["Brown packing paper or paper bags", "Charcoal", "Red/Brown Paint", "Sponges or fingers"]', 30, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'hist_skill_10_augustine_book', 'Bind a Saint Augustine Journal', 'skill', 'Wisdom', 'Reason', 'St. Augustine wrote his heart out to God in his ''Confessions''. We learn the craft of bookbinding to create a space for our own thoughts and prayers.', '["Fold several sheets of paper in half to make a ''signature''.", "Sew the spine using a simple pamphlet stitch.", "Glue a cover made of cardstock or fabric/leather scraps.", "Write ''Tolle Lege'' (Take Up and Read) on the cover.", "Write the first entry: A prayer or a memory."]', 'Reflect on the power of writing our story. Augustine changed the world with his book.', NULL, '["Quality paper", "Cardstock or leather scrap", "Needle and heavy thread", "Awl or push-pin", "Glue"]', 45, 'Anytime', 'history', 72, 144, 'schoolos_history', 'schoolos_core',
'0-48 months)
-- Domain: cognitive', 'motor', 'skill', 'Love', NULL, 'language', 'min_age_months', NULL, NULL, 'domain', 'description', 'Anytime', 'social-emotional', 'pre-academic

-- COGNITIVE ACTIVITIES (10)
INSERT INTO activities (id', 'title', 'schoolos_skills', 'schoolos_core',
'cognitive-002', 'Shape Sorter Discovery', 'skill', 'Wisdom', NULL, 'Match shapes to their corresponding holes to build spatial reasoning', '["Present the shape sorter", "Demonstrate putting one shape through", "Let child explore freely", "Guide gently if frustrated", "Name the shapes as they play"]', NULL, NULL, '["Shape sorter toy", "Extra blocks if available"]', 15, 'Anytime', 'cognitive', 12, 24, 'schoolos_skills', 'schoolos_core',
'cognitive-003', 'Simple Puzzles', 'skill', 'Wisdom', NULL, 'Work together on age-appropriate puzzles to develop problem-solving', '["Start with pieces removed", "Point to the empty spaces", "Let child try to fit pieces", "Offer hints about colors or shapes", "Complete together and celebrate"]', NULL, NULL, '["2-4 piece wooden puzzle", "Knob puzzles for younger ones"]', 20, 'Anytime', 'cognitive', 18, 36, 'schoolos_skills', 'schoolos_core',
'cognitive-004', 'Color Matching Game', 'skill', 'Wisdom', NULL, 'Sort objects by color to reinforce color recognition', '["Spread out colored objects", "Place one object in each container", "Ask child to find more of same color", "Name colors together", "Mix and try again"]', NULL, NULL, '["Colored blocks or toys", "Sorting bowls or containers", "Color cards"]', 15, 'Anytime', 'cognitive', 24, 36, 'schoolos_skills', 'schoolos_core',
'cognitive-005', 'Counting Steps', 'skill', 'Wisdom', NULL, 'Count everyday objects and steps to introduce number concepts', '["Count steps as you climb together", "Count toys during cleanup", "Use fingers to show numbers", "Make it a game - how many?", "Celebrate correct counts"]', NULL, NULL, '["Stairs or steps", "Small toys to count", "Fingers"]', 10, 'Anytime', 'cognitive', 24, 48, 'schoolos_skills', 'schoolos_core',
'cognitive-006', 'Memory Card Game', 'skill', 'Wisdom', NULL, 'Find matching pairs to strengthen memory and concentration', '["Lay cards face down in grid", "Turn over two cards", "Look for matches", "Take turns with child", "Celebrate found pairs"]', NULL, NULL, '["6-8 matching picture cards", "Flat surface"]', 15, 'Anytime', 'cognitive', 30, 48, 'schoolos_skills', 'schoolos_core',
'cognitive-007', 'Pattern Play', 'skill', 'Wisdom', NULL, 'Create simple patterns with objects to develop logical thinking', '["Create simple AB pattern", "Say the pattern aloud: red-blue-red-blue", "Ask what comes next?", "Let child continue pattern", "Try new patterns together"]', NULL, NULL, '["Colored blocks", "Beads", "Stickers"]', 15, 'Anytime', 'cognitive', 30, 48, 'schoolos_skills', 'schoolos_core',
'cognitive-008', 'Cause and Effect Toys', 'skill', 'Wisdom', NULL, 'Explore toys that respond to actions to understand cause and effect', '["Show the toy to baby", "Demonstrate the action slowly", "Encourage baby to try", "Celebrate when it works", "Repeat and explore"]', NULL, NULL, '["Pop-up toys", "Musical buttons", "Light-up toys"]', 10, 'Anytime', 'cognitive', 6, 18, 'schoolos_skills', 'schoolos_core',
'cognitive-009', 'Size Sorting', 'skill', 'Wisdom', NULL, 'Arrange objects from smallest to largest', '["Present objects mixed up", "Find the biggest one together", "Find the smallest", "Arrange in order", "Stack or nest if possible"]', NULL, NULL, '["Nesting cups", "Different sized balls", "Stacking rings"]', 15, 'Anytime', 'cognitive', 24, 36, 'schoolos_skills', 'schoolos_core',
'cognitive-010', 'Simple Categories', 'skill', 'Wisdom', NULL, 'Sort objects into groups based on type', '["Mix different types of toys", "Pick up one and name the category", "Ask child to find more animals", "Sort into containers", "Count each group"]', NULL, NULL, '["Mixed toy animals", "Toy vehicles", "Sorting containers"]', 15, 'Anytime', 'cognitive', 30, 48, 'schoolos_skills', 'schoolos_core',
'motor-002', 'Reaching and Grasping', 'skill', 'Stewardship', NULL, 'Practice grabbing objects to develop hand control', '["Hold toy within baby reach", "Shake gently to attract attention", "Let baby grab and explore", "Offer different textures", "Praise attempts"]', NULL, NULL, '["Soft rattles", "Textured toys", "Hanging mobile"]', 10, 'Anytime', 'motor', 3, 9, 'schoolos_skills', 'schoolos_core',
'motor-003', 'Ball Rolling', 'skill', 'Stewardship', NULL, 'Roll balls back and forth to build coordination and social play', '["Sit facing your child", "Roll ball gently toward them", "Encourage rolling it back", "Celebrate each roll", "Try different sized balls"]', NULL, NULL, '["Soft ball", "Large lightweight ball", "Flat surface"]', 15, 'Anytime', 'motor', 9, 24, 'schoolos_skills', 'schoolos_core',
'motor-004', 'Stacking Blocks', 'skill', 'Stewardship', NULL, 'Build towers to develop fine motor skills and hand control', '["Demonstrate stacking two blocks", "Let child try to stack", "Celebrate towers of any height", "Knock down together for fun", "Try building again"]', NULL, NULL, '["Soft blocks", "Wooden blocks", "Cardboard boxes"]', 15, 'Anytime', 'motor', 12, 36, 'schoolos_skills', 'schoolos_core',
'motor-005', 'Walking Practice', 'skill', 'Stewardship', NULL, 'Support early walking with fun movement activities', '["Clear a safe walking path", "Hold hands for support", "Use push toys for stability", "Celebrate steps taken", "Let child set the pace"]', NULL, NULL, '["Push toy", "Stable furniture", "Safe walking space"]', 15, 'Anytime', 'motor', 9, 18, 'schoolos_skills', 'schoolos_core',
'motor-006', 'Scribbling Fun', 'skill', 'Stewardship', NULL, 'Make marks on paper to develop pre-writing skills', '["Secure paper to surface", "Demonstrate making marks", "Let child scribble freely", "Describe their marks", "Display their artwork"]', NULL, NULL, '["Large crayons", "Big paper", "Tape to secure paper"]', 10, 'Anytime', 'motor', 12, 24, 'schoolos_skills', 'schoolos_core',
'motor-007', 'Threading and Lacing', 'skill', 'Stewardship', NULL, 'Push laces through holes to build fine motor precision', '["Show how to push lace through", "Start with just a few holes", "Guide hands if needed", "Celebrate progress", "Try different patterns"]', NULL, NULL, '["Large beads", "Thick lace or string", "Lacing cards"]', 15, 'Anytime', 'motor', 24, 48, 'schoolos_skills', 'schoolos_core',
'motor-008', 'Playdough Sculpting', 'skill', 'Stewardship', NULL, 'Squeeze, roll, and shape playdough for hand strength', '["Let child explore freely first", "Demonstrate rolling and squishing", "Make shapes together", "Use tools to create", "Name what you make"]', NULL, NULL, '["Playdough", "Rolling pin", "Cookie cutters", "Plastic knife"]', 20, 'Anytime', 'motor', 18, 48, 'schoolos_skills', 'schoolos_core',
'motor-009', 'Climbing Safe Structures', 'skill', 'Stewardship', NULL, 'Navigate climbing equipment for gross motor development', '["Choose age-appropriate equipment", "Stay close for safety", "Encourage climbing up", "Help with coming down", "Celebrate bravery"]', NULL, NULL, '["Safe climbing structure", "Soft landing surface", "Adult supervision"]', 20, 'Anytime', 'motor', 18, 48, 'schoolos_skills', 'schoolos_core',
'motor-010', 'Pouring and Scooping', 'skill', 'Stewardship', NULL, 'Transfer materials between containers for coordination', '["Set up pouring station", "Demonstrate pouring slowly", "Let child practice", "Try with spoons too", "Clean up together"]', NULL, NULL, '["Cups", "Spoons", "Rice or water", "Large container"]', 15, 'Anytime', 'motor', 18, 36, 'schoolos_skills', 'schoolos_core',
'language-002', 'Picture Book Reading', 'skill', 'Wisdom', NULL, 'Explore simple picture books together', '["Choose a colorful book", "Point to pictures", "Name objects simply", "Let child turn pages", "Read at their pace"]', NULL, NULL, '["Board books", "Picture books", "Touch-and-feel books"]', 15, 'Anytime', 'language', 6, 24, 'schoolos_skills', 'schoolos_core',
'language-003', 'Nursery Rhymes', 'skill', 'Wisdom', NULL, 'Sing and perform action rhymes together', '["Choose familiar rhymes", "Add hand motions", "Repeat favorites often", "Pause for child to fill in words", "Make it silly and fun"]', NULL, NULL, '["No materials needed", "Optional: picture cards"]', 10, 'Anytime', 'language', 6, 36, 'schoolos_skills', 'schoolos_core',
'language-004', 'Animal Sounds Game', 'skill', 'Wisdom', NULL, 'Match animals to their sounds', '["Show an animal", "Make its sound", "Ask what does it say?", "Let child attempt sounds", "Play guessing games"]', NULL, NULL, '["Animal toys or pictures", "Animal sound book"]', 10, 'Anytime', 'language', 12, 30, 'schoolos_skills', 'schoolos_core',
'language-005', 'Simple Instructions', 'skill', 'Wisdom', NULL, 'Follow one and two-step directions', '["Give simple command: get the ball", "Wait for response", "Celebrate success", "Try two steps: get ball and bring it", "Make it a game"]', NULL, NULL, '["Toys around the room", "Everyday objects"]', 10, 'Anytime', 'language', 18, 36, 'schoolos_skills', 'schoolos_core',
'language-006', 'Story Time', 'skill', 'Wisdom', NULL, 'Read age-appropriate stories with expression', '["Choose engaging stories", "Use different voices", "Point to illustrations", "Ask simple questions", "Let child retell parts"]', NULL, NULL, '["Picture books", "Story books", "Favorite characters"]', 20, 'Anytime', 'language', 18, 48, 'schoolos_skills', 'schoolos_core',
'language-007', 'Naming Body Parts', 'skill', 'Wisdom', NULL, 'Learn and point to body parts', '["Point to your nose", "Ask where is your nose?", "Use songs like head shoulders", "Practice on dolls too", "Add new parts gradually"]', NULL, NULL, '["Mirror", "Doll or stuffed animal"]', 10, 'Anytime', 'language', 12, 24, 'schoolos_skills', 'schoolos_core',
'language-008', 'Conversation Practice', 'skill', 'Wisdom', NULL, 'Take turns in simple conversations', '["Ask open questions", "Wait for responses", "Expand on their words", "Model full sentences", "Listen actively"]', NULL, NULL, '["No materials needed", "Props for pretend play"]', 15, 'Anytime', 'language', 24, 48, 'schoolos_skills', 'schoolos_core',
'language-009', 'Describing Pictures', 'skill', 'Wisdom', NULL, 'Talk about what you see in images', '["Look at a picture together", "Ask what do you see?", "Add details they miss", "Ask about colors and actions", "Create stories about pictures"]', NULL, NULL, '["Picture books", "Photos", "Magazines"]', 15, 'Anytime', 'language', 24, 48, 'schoolos_skills', 'schoolos_core',
'language-010', 'Letter Introduction', 'skill', 'Wisdom', NULL, 'Begin recognizing letters in the environment', '["Start with name letters", "Point out letters on signs", "Sing alphabet song", "Match letters together", "Make it playful not pressured"]', NULL, NULL, '["Alphabet books", "Magnetic letters", "Letter puzzles"]', 15, 'Anytime', 'language', 30, 48, 'schoolos_skills', 'schoolos_core',
'social-002', 'Peek-a-Boo', 'skill', 'Love', NULL, 'Play the classic hiding game', '["Cover your face briefly", "Say peek-a-boo!", "Watch for anticipation", "Let baby try covering", "Add variations"]', NULL, NULL, '["Blanket or hands", "Scarf"]', 10, 'Anytime', 'social-emotional', 4, 18, 'schoolos_skills', 'schoolos_core',
'social-003', 'Gentle Play with Others', 'skill', 'Love', NULL, 'Practice kind touch with peers or toys', '["Model gentle touch", "Say gentle hands", "Practice on stuffed toys", "Praise kind behavior", "Redirect rough play"]', NULL, NULL, '["Soft toys", "Dolls", "Stuffed animals"]', 15, 'Anytime', 'social-emotional', 12, 36, 'schoolos_skills', 'schoolos_core',
'social-004', 'Turn Taking Games', 'skill', 'Love', NULL, 'Share toys and take turns in simple games', '["Say my turn, your turn", "Keep turns short", "Celebrate waiting", "Model patience", "Praise sharing"]', NULL, NULL, '["Stacking toys", "Ball", "Building blocks"]', 15, 'Anytime', 'social-emotional', 18, 36, 'schoolos_skills', 'schoolos_core',
'social-005', 'Emotion Naming', 'skill', 'Love', NULL, 'Identify and name feelings', '["Name your feelings aloud", "Point out character feelings", "Ask how do you feel?", "Validate all emotions", "Discuss coping strategies"]', NULL, NULL, '["Emotion cards", "Mirror", "Books about feelings"]', 15, 'Anytime', 'social-emotional', 18, 48, 'schoolos_skills', 'schoolos_core',
'social-006', 'Pretend Tea Party', 'skill', 'Love', NULL, 'Practice social scenarios through play', '["Set up the tea party", "Include stuffed guests", "Model polite phrases", "Take turns serving", "Practice thank you and please"]', NULL, NULL, '["Tea set", "Stuffed animals", "Play food"]', 20, 'Anytime', 'social-emotional', 24, 48, 'schoolos_skills', 'schoolos_core',
'social-007', 'Helper Tasks', 'skill', 'Love', NULL, 'Participate in household tasks together', '["Choose simple tasks", "Work side by side", "Praise helping efforts", "Make it fun not chore-like", "Thank them for help"]', NULL, NULL, '["Child-safe cleaning tools", "Laundry basket", "Dustpan"]', 15, 'Anytime', 'social-emotional', 18, 48, 'schoolos_skills', 'schoolos_core',
'social-008', 'Greeting Practice', 'skill', 'Love', NULL, 'Learn to say hello and goodbye', '["Practice at arrivals and departures", "Use puppets to model", "Wave and say words", "Make it a routine", "Praise attempts"]', NULL, NULL, '["Puppets or toys", "Door to practice"]', 10, 'Anytime', 'social-emotional', 12, 30, 'schoolos_skills', 'schoolos_core',
'social-009', 'Sharing Stories', 'skill', 'Love', NULL, 'Share personal experiences in simple terms', '["Ask about their day", "Share your own stories", "Use photos as prompts", "Listen attentively", "Ask follow-up questions"]', NULL, NULL, '["Photos", "Drawings", "Props from events"]', 15, 'Anytime', 'social-emotional', 30, 48, 'schoolos_skills', 'schoolos_core',
'social-010', 'Problem Solving Together', 'skill', 'Love', NULL, 'Work through simple conflicts or challenges', '["Present a simple problem", "Ask what could we do?", "Discuss options together", "Try solutions", "Reflect on what worked"]', NULL, NULL, '["Scenario cards", "Puppets", "Books about problems"]', 15, 'Anytime', 'social-emotional', 30, 48, 'schoolos_skills', 'schoolos_core',
'sensory-002', 'Water Play', 'skill', 'Wonder', NULL, 'Explore water with hands and simple tools', '["Set up water station", "Let child splash freely", "Add pouring toys", "Describe wet cold splashy", "Supervise closely"]', NULL, NULL, '["Basin of water", "Cups", "Sponges", "Floating toys"]', 20, 'Anytime', 'pre-academic', 6, 48, 'schoolos_skills', 'schoolos_core',
'sensory-003', 'Sensory Bin Exploration', 'skill', 'Wonder', NULL, 'Dig and discover in textured bins', '["Fill bin with chosen material", "Hide small toys inside", "Let child explore freely", "Add scooping tools", "Supervise for safety"]', NULL, NULL, '["Bin with rice or pasta", "Scoops and containers", "Hidden toys"]', 20, 'Anytime', 'pre-academic', 12, 48, 'schoolos_skills', 'schoolos_core',
'sensory-004', 'Music and Movement', 'skill', 'Wonder', NULL, 'Respond to different types of music', '["Play different music", "Move together to the beat", "Use fast and slow songs", "Add simple instruments", "Follow child lead"]', NULL, NULL, '["Music player", "Various music styles", "Instruments"]', 15, 'Anytime', 'pre-academic', 6, 48, 'schoolos_skills', 'schoolos_core',
'sensory-005', 'Finger Painting', 'skill', 'Wonder', NULL, 'Create art with fingers and hands', '["Cover work surface", "Put paint on paper", "Demonstrate finger movements", "Let child explore freely", "Describe colors and textures"]', NULL, NULL, '["Finger paint", "Large paper", "Smock or old clothes", "Wipes"]', 20, 'Anytime', 'pre-academic', 12, 48, 'schoolos_skills', 'schoolos_core',
'sensory-006', 'Nature Walk Sensory Hunt', 'skill', 'Wonder', NULL, 'Explore outdoor textures and sounds', '["Go outside together", "Touch different plants and bark", "Listen for sounds", "Collect safe natural items", "Discuss discoveries"]', NULL, NULL, '["Collection bag", "Outdoor space", "Magnifying glass optional"]', 30, 'Anytime', 'pre-academic', 12, 48, 'schoolos_skills', 'schoolos_core',
'sensory-007', 'Bubble Play', 'skill', 'Wonder', NULL, 'Pop and chase bubbles', '["Blow bubbles for child", "Encourage popping", "Let them try blowing", "Chase bubbles together", "Describe big small pop!"]', NULL, NULL, '["Bubble solution", "Bubble wands", "Outdoor or large indoor space"]', 15, 'Anytime', 'pre-academic', 6, 36, 'schoolos_skills', 'schoolos_core',
'sensory-008', 'Scent Exploration', 'skill', 'Wonder', NULL, 'Safely smell different scents', '["Choose safe mild scents", "Let child sniff from distance", "Name the smells", "Ask like or not like?", "Compare scents"]', NULL, NULL, '["Safe scented items: vanilla, lemon, lavender", "Cotton balls", "Small containers"]', 10, 'Anytime', 'pre-academic', 18, 48, 'schoolos_skills', 'schoolos_core',
'sensory-009', 'Light and Shadow Play', 'skill', 'Wonder', NULL, 'Explore light, shadows, and reflections', '["Make shadows on walls", "Use flashlight to explore", "Add colored cellophane", "Play shadow puppets", "Discuss light and dark"]', NULL, NULL, '["Flashlight", "Translucent objects", "Dark room optional"]', 15, 'Anytime', 'pre-academic', 12, 48, 'schoolos_skills', 'schoolos_core',
'sensory-010', 'Messy Play', 'skill', 'Wonder', NULL, 'Engage with messy materials like shaving cream or foam', '["Cover tray with foam", "Add to foam slowly", "Draw in the foam", "Hide and find toys", "Embrace the mess!"]', NULL, NULL, '["Shaving cream or foam", "Large tray", "Smock", "Small toys to hide"]', 20, 'Anytime', 'pre-academic', 18, 48, 'schoolos_skills', 'schoolos_core',
'0-60 months)
-- Research sources: CDC Developmental Milestones', 'AAP Guidelines', 'skill', 'Wisdom', NULL, 'Zero to Three', 'memory', NULL, NULL, 'pre-academic

-- ============================================================================
-- COGNITIVE ACTIVITIES (25 additional)
-- Focus: Problem-solving', 'social-emotional', 'Anytime', 'Harvard Center on Developing Child
-- Domain: cognitive', 'motor', 'language', 'schoolos_skills', 'schoolos_core',
'cognitive-012', 'Treasure Basket', 'skill', 'Wisdom', NULL, 'Explore a collection of safe household objects', '["Fill basket with safe objects", "Let baby explore freely", "Name objects as they touch", "Rotate items weekly", "Supervise closely"]', NULL, NULL, '["Basket", "Wooden spoon", "Metal cup", "Fabric scraps", "Natural sponge"]', 15, 'Anytime', 'cognitive', 6, 12, 'schoolos_skills', 'schoolos_core',
'emerging problem-solving)
(cognitive-013', 'Container Fill and Dump', 'skill', 'Wisdom', NULL, 'Practice putting objects in and taking them out', '["Show putting toys in container", "Dump them out together", "Count as you fill", "Try different containers", "Let child lead"]', NULL, NULL, '["Large container", "Soft blocks", "Small toys"]', 15, 'Anytime', 'cognitive', 12, 24, 'schoolos_skills', 'schoolos_core',
'cognitive-014', 'Simple Shape Matching', 'skill', 'Wisdom', NULL, 'Match basic shapes like circles and squares', '["Present two shapes first", "Point to matching holes", "Guide hand if needed", "Celebrate matches", "Add more shapes gradually"]', NULL, NULL, '["Shape puzzle board", "Shape cutouts"]', 10, 'Anytime', 'cognitive', 12, 24, 'schoolos_skills', 'schoolos_core',
'cognitive-015', 'Hidden Sound Game', 'skill', 'Wisdom', NULL, 'Find where sounds are coming from', '["Hide musical toy nearby", "Activate the sound", "Ask where is it?", "Celebrate when found", "Increase difficulty gradually"]', NULL, NULL, '["Musical toy", "Blanket or box to hide under"]', 10, 'Anytime', 'cognitive', 12, 24, 'schoolos_skills', 'schoolos_core',
'growing logic)
(cognitive-016', 'Matching Pairs Game', 'skill', 'Wisdom', NULL, 'Find objects that go together', '["Show how items match", "Mix items up", "Ask child to find pairs", "Name matches together", "Add more pairs over time"]', NULL, NULL, '["Paired objects: sock pairs, shoe pairs", "Sorting mat"]', 15, 'Anytime', 'cognitive', 24, 36, 'schoolos_skills', 'schoolos_core',
'cognitive-017', 'Simple Sequencing', 'skill', 'Wisdom', NULL, 'Put picture cards in order', '["Show completed sequence first", "Mix up cards", "What happens first?", "Build story together", "Try new sequences"]', NULL, NULL, '["3-step sequence cards", "Flat surface"]', 15, 'Anytime', 'cognitive', 24, 36, 'schoolos_skills', 'schoolos_core',
'cognitive-018', 'Building Instructions', 'skill', 'Wisdom', NULL, 'Follow simple steps to build something', '["Show finished structure", "Build step by step together", "Let child try independently", "Celebrate completion", "Try variations"]', NULL, NULL, '["Large blocks", "Picture guide", "Model to copy"]', 20, 'Anytime', 'cognitive', 24, 36, 'schoolos_skills', 'schoolos_core',
'complex thinking)
(cognitive-019', 'Treasure Map Hunt', 'skill', 'Wisdom', NULL, 'Follow simple map directions to find hidden items', '["Draw simple room map", "Mark treasure spot with X", "Guide map reading", "Celebrate discovery", "Let child make maps"]', NULL, NULL, '["Simple hand-drawn map", "Hidden treasure", "Landmarks"]', 20, 'Anytime', 'cognitive', 36, 48, 'schoolos_skills', 'schoolos_core',
'cognitive-020', 'What Comes Next?', 'skill', 'Wisdom', NULL, 'Predict what happens next in stories or activities', '["Pause during familiar stories", "What do you think happens?", "Accept all predictions", "Discuss actual outcomes", "Apply to real life"]', NULL, NULL, '["Familiar storybooks", "Sequence pictures"]', 15, 'Anytime', 'cognitive', 36, 48, 'schoolos_skills', 'schoolos_core',
'cognitive-021', 'Problem-Solving Play', 'skill', 'Wisdom', NULL, 'Think through solutions to simple challenges', '["Set up a challenge: get car across", "Ask how can we do it?", "Try child solutions", "Discuss what worked", "Create new challenges"]', NULL, NULL, '["Blocks", "Toy cars", "Ramps and obstacles"]', 20, 'Anytime', 'cognitive', 36, 48, 'schoolos_skills', 'schoolos_core',
'school readiness)
(cognitive-022', 'Classification Games', 'skill', 'Wisdom', NULL, 'Sort objects by multiple attributes', '["Sort by color first", "Try sorting by size", "Sort by both attributes", "Explain sorting choices", "Create own categories"]', NULL, NULL, '["Various small objects", "Sorting containers", "Attribute cards"]', 20, 'Anytime', 'cognitive', 48, 60, 'schoolos_skills', 'schoolos_core',
'cognitive-023', 'Memory Challenge', 'skill', 'Wisdom', NULL, 'Remember and recall increasing information', '["Start with 4-6 cards", "Take turns finding pairs", "Increase difficulty", "Discuss memory strategies", "Celebrate improvements"]', NULL, NULL, '["Memory card sets", "Objects to memorize"]', 15, 'Anytime', 'cognitive', 48, 60, 'schoolos_skills', 'schoolos_core',
'cognitive-024', 'Simple Experiments', 'skill', 'Wisdom', NULL, 'Make predictions and test them', '["What do you think will happen?", "Let child test prediction", "Observe together", "Was prediction correct?", "Try new experiments"]', NULL, NULL, '["Safe experiment materials", "Recording paper"]', 25, 'Anytime', 'cognitive', 48, 60, 'schoolos_skills', 'schoolos_core',
'cognitive-025', 'Story Problems', 'skill', 'Wisdom', NULL, 'Solve simple word problems together', '["Tell simple story problem", "Use toys to act it out", "Find the answer together", "Explain thinking", "Create own problems"]', NULL, NULL, '["Small toys for counting", "Story prompts"]', 15, 'Anytime', 'cognitive', 48, 60, 'schoolos_skills', 'schoolos_core',
'motor-012', 'Supported Sitting', 'skill', 'Stewardship', NULL, 'Practice sitting with assistance', '["Provide support around hips", "Offer toys to hold", "Gradually reduce support", "Catch when tipping", "Build sitting time slowly"]', NULL, NULL, '["Boppy or support pillow", "Toys for lap"]', 10, 'Anytime', 'motor', 4, 9, 'schoolos_skills', 'schoolos_core',
'motor-013', 'Cruising Practice', 'skill', 'Stewardship', NULL, 'Move along furniture while standing', '["Place toys along furniture", "Encourage stepping sideways", "Stay nearby for safety", "Celebrate progress", "Clear obstacles"]', NULL, NULL, '["Stable furniture at right height", "Motivating toys"]', 15, 'Anytime', 'motor', 8, 14, 'schoolos_skills', 'schoolos_core',
'mobile toddler)
(motor-014', 'Push and Pull Toys', 'skill', 'Stewardship', NULL, 'Walk while pushing or pulling toys', '["Start with push toys", "Progress to pull toys", "Encourage varied routes", "Add obstacles to navigate", "Race together sometimes"]', NULL, NULL, '["Push cart", "Pull-along toy on string"]', 15, 'Anytime', 'motor', 12, 24, 'schoolos_skills', 'schoolos_core',
'motor-015', 'Outdoor Exploration Walk', 'skill', 'Stewardship', NULL, 'Navigate uneven outdoor surfaces', '["Walk on grass", "Try walking on slight slopes", "Step over small objects", "Navigate around obstacles", "Go at child pace"]', NULL, NULL, '["Safe outdoor space", "Comfortable shoes"]', 20, 'Anytime', 'motor', 12, 24, 'schoolos_skills', 'schoolos_core',
'motor-016', 'Crayon Grip Practice', 'skill', 'Stewardship', NULL, 'Develop proper writing grip through drawing', '["Offer thick crayons", "Model proper grip gently", "Let child explore", "Focus on process not product", "Praise attempts"]', NULL, NULL, '["Thick crayons or triangular crayons", "Large paper", "Tape"]', 15, 'Anytime', 'motor', 18, 24, 'schoolos_skills', 'schoolos_core',
'coordination development)
(motor-017', 'Obstacle Course', 'skill', 'Stewardship', NULL, 'Navigate through a simple course', '["Create simple course", "Demonstrate each section", "Guide through first time", "Add challenges gradually", "Celebrate completion"]', NULL, NULL, '["Cushions", "Tunnel", "Stepping stones", "Hoop"]', 20, 'Anytime', 'motor', 24, 36, 'schoolos_skills', 'schoolos_core',
'motor-018', 'Scissors Introduction', 'skill', 'Stewardship', NULL, 'Learn to snip with safety scissors', '["Start with playdough cutting", "Progress to paper strips", "Focus on hand position", "Short sessions only", "Celebrate snips"]', NULL, NULL, '["Safety scissors", "Paper strips", "Playdough"]', 15, 'Anytime', 'motor', 24, 36, 'schoolos_skills', 'schoolos_core',
'motor-019', 'Kicking Practice', 'skill', 'Stewardship', NULL, 'Kick large balls toward targets', '["Start with stationary ball", "Demonstrate kicking motion", "Set up easy targets", "Celebrate all attempts", "Vary distances"]', NULL, NULL, '["Large soft ball", "Cones or targets"]', 15, 'Anytime', 'motor', 24, 36, 'schoolos_skills', 'schoolos_core',
'refined skills)
(motor-020', 'Tricycle Riding', 'skill', 'Stewardship', NULL, 'Pedal and steer a tricycle', '["Start on flat surface", "Practice pedaling motion", "Add steering gradually", "Set simple courses", "Always use helmet"]', NULL, NULL, '["Appropriately sized tricycle", "Safe riding area", "Helmet"]', 20, 'Anytime', 'motor', 36, 48, 'schoolos_skills', 'schoolos_core',
'motor-021', 'Ball Throwing and Catching', 'skill', 'Stewardship', NULL, 'Practice throwing and catching skills', '["Start with underhand throws", "Practice catching large balls", "Use bean bags first", "Gradually increase distance", "Make it a game"]', NULL, NULL, '["Soft balls of various sizes", "Bucket for targets"]', 15, 'Anytime', 'motor', 36, 48, 'schoolos_skills', 'schoolos_core',
'motor-022', 'Buttoning Practice', 'skill', 'Stewardship', NULL, 'Button and unbutton large buttons', '["Start with unbuttoning", "Use large buttons first", "Work on flat surface first", "Progress to own clothes", "Celebrate independence"]', NULL, NULL, '["Busy board with buttons", "Large button clothing", "Button snake toy"]', 15, 'Anytime', 'motor', 36, 48, 'schoolos_skills', 'schoolos_core',
'school readiness skills)
(motor-023', 'Skipping and Hopping', 'skill', 'Stewardship', NULL, 'Master skipping and single-foot hopping', '["Practice hopping on one foot", "Try galloping first", "Progress to skipping", "Use music for rhythm", "Practice both feet"]', NULL, NULL, '["Open space", "Music optional", "Chalk for markers"]', 15, 'Anytime', 'motor', 48, 60, 'schoolos_skills', 'schoolos_core',
'motor-024', 'Cutting Shapes', 'skill', 'Stewardship', NULL, 'Cut along curved and straight lines', '["Start with straight lines", "Progress to curves", "Try simple shapes", "Focus on control not speed", "Display finished work"]', NULL, NULL, '["Child scissors", "Paper with lines and shapes", "Templates"]', 15, 'Anytime', 'motor', 48, 60, 'schoolos_skills', 'schoolos_core',
'motor-025', 'Letter Formation', 'skill', 'Stewardship', NULL, 'Practice forming letters and numbers', '["Start with finger tracing", "Form in sand or paint", "Progress to paper", "Focus on important letters first", "Keep it playful"]', NULL, NULL, '["Sand tray", "Finger paint", "Large paper", "Markers"]', 20, 'Anytime', 'motor', 48, 60, 'schoolos_skills', 'schoolos_core',
'language-012', 'Sound Effects Play', 'skill', 'Wisdom', NULL, 'Make sounds for objects and actions', '["Make sounds for actions: vroom, splash", "Repeat consistently", "Encourage imitation", "Pair with actions", "Use during daily routines"]', NULL, NULL, '["Toy vehicles", "Animal toys", "Action books"]', 10, 'Anytime', 'language', 6, 12, 'schoolos_skills', 'schoolos_core',
'first words explosion)
(language-013', 'First Words Books', 'skill', 'Wisdom', NULL, 'Point and name simple pictures', '["Point to pictures", "Name clearly", "Wait for attempts", "Expand on child words", "Revisit favorites often"]', NULL, NULL, '["Simple picture books", "Word cards"]', 15, 'Anytime', 'language', 12, 24, 'schoolos_skills', 'schoolos_core',
'language-014', 'Action Word Games', 'skill', 'Wisdom', NULL, 'Learn verbs through movement', '["Say and do: jump, clap, spin", "Invite child to copy", "Name actions child does", "Use in songs", "Practice throughout day"]', NULL, NULL, '["Open space", "Action picture cards"]', 15, 'Anytime', 'language', 12, 24, 'schoolos_skills', 'schoolos_core',
'language-015', 'What Sound Does It Make?', 'skill', 'Wisdom', NULL, 'Learn animal and vehicle sounds', '["Present one animal", "Make its sound", "Ask what does cow say?", "Accept approximations", "Use in songs and stories"]', NULL, NULL, '["Animal toys", "Sound books", "Vehicle toys"]', 10, 'Anytime', 'language', 12, 24, 'schoolos_skills', 'schoolos_core',
'sentence building)
(language-016', 'Expanding Sentences', 'skill', 'Wisdom', NULL, 'Build on single words to phrases', '["Listen for child words", "Repeat and add words: Ball becomes Big red ball", "Model complete sentences", "Avoid correcting directly", "Celebrate communication"]', NULL, NULL, '["Toys for play", "Daily activities"]', 15, 'Anytime', 'language', 24, 36, 'schoolos_skills', 'schoolos_core',
'language-017', 'Puppet Conversations', 'skill', 'Wisdom', NULL, 'Practice dialogue with puppets', '["Give puppet a voice", "Have puppet ask questions", "Let child respond", "Create simple dialogues", "Act out daily situations"]', NULL, NULL, '["Puppets or sock puppets", "Props for scenarios"]', 15, 'Anytime', 'language', 24, 36, 'schoolos_skills', 'schoolos_core',
'language-018', 'Category Naming', 'skill', 'Wisdom', NULL, 'Name items within categories', '["Name a category: foods", "List items together", "Take turns adding items", "Try new categories", "Make a game of it"]', NULL, NULL, '["Category sorting items", "Picture cards"]', 15, 'Anytime', 'language', 24, 36, 'schoolos_skills', 'schoolos_core',
'narrative skills)
(language-019', 'Story Retelling', 'skill', 'Wisdom', NULL, 'Retell familiar stories', '["Read familiar story", "Ask child to tell it back", "Use props as prompts", "Accept child version", "Fill in missing parts together"]', NULL, NULL, '["Favorite storybooks", "Story props"]', 20, 'Anytime', 'language', 36, 48, 'schoolos_skills', 'schoolos_core',
'language-020', 'Rhyming Games', 'skill', 'Wisdom', NULL, 'Find and make rhyming words', '["Say word pairs: cat-hat", "Ask if they rhyme", "Play rhyme matching", "Make up silly rhymes", "Read rhyming books"]', NULL, NULL, '["Rhyming word cards", "Rhyming books"]', 15, 'Anytime', 'language', 36, 48, 'schoolos_skills', 'schoolos_core',
'language-021', 'Question Practice', 'skill', 'Wisdom', NULL, 'Ask and answer who/what/where/when/why', '["Look at pictures together", "Ask WH questions", "Model complete answers", "Let child ask questions too", "Discuss throughout day"]', NULL, NULL, '["Picture books", "Story scenes"]', 15, 'Anytime', 'language', 36, 48, 'schoolos_skills', 'schoolos_core',
'literacy foundation)
(language-022', 'First Sound Identification', 'skill', 'Wisdom', NULL, 'Identify beginning sounds in words', '["Say word emphasizing first sound: BBBall", "Ask what sound starts ball?", "Sort pictures by first sound", "Make it a game", "Connect to letter names"]', NULL, NULL, '["Picture cards", "Sound sorting mats"]', 15, 'Anytime', 'language', 48, 60, 'schoolos_skills', 'schoolos_core',
'language-023', 'Making Up Stories', 'skill', 'Wisdom', NULL, 'Create original stories', '["Offer story starter", "Ask what happens next?", "Add to child ideas", "Encourage creativity", "Write down or record stories"]', NULL, NULL, '["Story starter cards", "Character toys", "Drawing materials"]', 20, 'Anytime', 'language', 48, 60, 'schoolos_skills', 'schoolos_core',
'language-024', 'Following Multi-Step Directions', 'skill', 'Wisdom', NULL, 'Complete 3-4 step instructions', '["Give clear multi-step directions", "Start with 2 steps, build up", "Avoid repeating", "Praise completion", "Make it a helpful game"]', NULL, NULL, '["Varied objects", "Activity supplies"]', 15, 'Anytime', 'language', 48, 60, 'schoolos_skills', 'schoolos_core',
'language-025', 'Print Awareness Activities', 'skill', 'Wisdom', NULL, 'Notice letters and words everywhere', '["Point out words on signs", "Find letters in names", "Read labels together", "Play I Spy with letters", "Connect to child experience"]', NULL, NULL, '["Environmental print", "Signs", "Labels", "Books"]', 15, 'Anytime', 'language', 48, 60, 'schoolos_skills', 'schoolos_core',
'social-012', 'Interactive Games', 'skill', 'Love', NULL, 'Play simple social games', '["Play patty-cake", "Do where are your toes games", "Play simple finger games", "Sing interactive songs", "Follow baby lead"]', NULL, NULL, '["No materials needed"]', 10, 'Anytime', 'social-emotional', 6, 12, 'schoolos_skills', 'schoolos_core',
'emerging autonomy)
(social-013', 'Big Feelings Naming', 'skill', 'Love', NULL, 'Name emotions as child experiences them', '["Name feelings: You look frustrated", "Validate all emotions", "Stay calm yourself", "Offer comfort", "Keep language simple"]', NULL, NULL, '["Emotion picture cards optional"]', 10, 'Anytime', 'social-emotional', 12, 24, 'schoolos_skills', 'schoolos_core',
'social-014', 'Parallel Play Practice', 'skill', 'Love', NULL, 'Play alongside without pressure to share', '["Sit near child", "Do same activity nearby", "Comment on both play", "Later start brief interactions", "Follow child comfort level"]', NULL, NULL, '["Duplicate toys if possible", "Same activity materials"]', 15, 'Anytime', 'social-emotional', 12, 24, 'schoolos_skills', 'schoolos_core',
'social-015', 'Daily Routine Practice', 'skill', 'Love', NULL, 'Participate in predictable daily routines', '["Keep routines consistent", "Narrate what comes next", "Give small jobs in routine", "Celebrate participation", "Use transition songs"]', NULL, NULL, '["Visual schedule cards optional", "Routine items"]', 15, 'Anytime', 'social-emotional', 12, 24, 'schoolos_skills', 'schoolos_core',
'developing self-control)
(social-016', 'Calm Corner Setup', 'skill', 'Love', NULL, 'Create a cozy spot for calming', '["Set up cozy space together", "Stock with calming items", "Practice using when calm", "Guide there when upset", "Model using it yourself"]', NULL, NULL, '["Soft pillows or beanbag", "Calm toys", "Books about feelings"]', 15, 'Anytime', 'social-emotional', 24, 36, 'schoolos_skills', 'schoolos_core',
'social-017', 'Feelings Faces', 'skill', 'Love', NULL, 'Match expressions to emotions', '["Show emotion faces", "Name the feeling", "Make faces in mirror", "Create with playdough", "Connect to experiences"]', NULL, NULL, '["Emotion face cards", "Mirror", "Play dough faces"]', 15, 'Anytime', 'social-emotional', 24, 36, 'schoolos_skills', 'schoolos_core',
'social-018', 'Waiting Practice Games', 'skill', 'Love', NULL, 'Practice short waits in fun ways', '["Use short waits first", "Make waiting a game", "Use timer or song", "Celebrate successful waits", "Gradually increase time"]', NULL, NULL, '["Timer or song", "Surprise to wait for"]', 10, 'Anytime', 'social-emotional', 24, 36, 'schoolos_skills', 'schoolos_core',
'perspective taking)
(social-019', 'How Would They Feel?', 'skill', 'Love', NULL, 'Guess how others might feel', '["Read story together", "Ask how character feels", "Discuss why they might feel that way", "Connect to child experiences", "Praise empathy attempts"]', NULL, NULL, '["Picture books", "Story scenarios", "Puppets"]', 15, 'Anytime', 'social-emotional', 36, 48, 'schoolos_skills', 'schoolos_core',
'social-020', 'Friendly Behavior Practice', 'skill', 'Love', NULL, 'Role-play being a good friend', '["Act out friendship scenarios", "Practice nice words", "Show caring actions", "Discuss kind choices", "Apply to real situations"]', NULL, NULL, '["Puppets or dolls", "Friendship scenario cards"]', 20, 'Anytime', 'social-emotional', 36, 48, 'schoolos_skills', 'schoolos_core',
'social-021', 'Breathing Exercises', 'skill', 'Love', NULL, 'Learn simple calming breaths', '["Blow pinwheels slowly", "Pretend to smell flower, blow candle", "Practice when calm", "Use during upset times", "Model yourself"]', NULL, NULL, '["Pinwheel", "Bubble wand", "Feather"]', 10, 'Anytime', 'social-emotional', 36, 48, 'schoolos_skills', 'schoolos_core',
'complex social skills)
(social-022', 'Conflict Resolution Practice', 'skill', 'Love', NULL, 'Work through disagreements peacefully', '["Teach stop, think, act", "Use visual reminder", "Practice with puppets first", "Guide real conflicts", "Celebrate peaceful solutions"]', NULL, NULL, '["Problem-solving steps poster", "Feelings cards", "Puppet scenarios"]', 20, 'Anytime', 'social-emotional', 48, 60, 'schoolos_skills', 'schoolos_core',
'social-023', 'Kindness Missions', 'skill', 'Love', NULL, 'Do kind deeds for others', '["Plan a kind act together", "Help child prepare", "Do the kind deed", "Discuss how it felt", "Notice kindness from others"]', NULL, NULL, '["Kindness cards", "Materials for kind acts"]', 20, 'Anytime', 'social-emotional', 48, 60, 'schoolos_skills', 'schoolos_core',
'social-024', 'Managing Disappointment', 'skill', 'Love', NULL, 'Cope when things do not go as planned', '["Acknowledge the disappointment", "Validate feelings", "Offer coping strategies", "Problem-solve if possible", "Practice with small disappointments"]', NULL, NULL, '["Calm down strategies cards", "Comfort items"]', 15, 'Anytime', 'social-emotional', 48, 60, 'schoolos_skills', 'schoolos_core',
'social-025', 'Group Game Skills', 'skill', 'Love', NULL, 'Practice taking turns and following rules', '["Start with simple games", "Model good sportsmanship", "Practice waiting for turn", "Handle winning and losing", "Emphasize fun together"]', NULL, NULL, '["Simple board games", "Card games", "Group activity supplies"]', 20, 'Anytime', 'social-emotional', 48, 60, 'schoolos_skills', 'schoolos_core',
'preacademic-002', 'Cause Effect Exploration', 'skill', 'Wonder', NULL, 'Discover that actions make things happen', '["Show button press makes sound", "Encourage baby to try", "Celebrate when they do it", "Offer variety of cause-effect toys", "Narrate what happens"]', NULL, NULL, '["Light-up toys", "Music makers", "Rattles"]', 15, 'Anytime', 'pre-academic', 6, 12, 'schoolos_skills', 'schoolos_core',
'early concepts)
(preacademic-003', 'Big and Little', 'skill', 'Wonder', NULL, 'Sort objects by size', '["Present big and little versions", "Name big and little", "Sort into containers", "Find big and little around room", "Use in daily life"]', NULL, NULL, '["Objects in two sizes", "Containers in two sizes"]', 15, 'Anytime', 'pre-academic', 12, 24, 'schoolos_skills', 'schoolos_core',
'preacademic-004', 'One and Two', 'skill', 'Wonder', NULL, 'Understand quantities of one and two', '["Start with one: here is one ball", "Add another: now two balls", "Practice with snacks", "Use in daily routines", "Reinforce often"]', NULL, NULL, '["Small toys", "Snacks for counting"]', 10, 'Anytime', 'pre-academic', 18, 24, 'schoolos_skills', 'schoolos_core',
'preacademic-005', 'Simple Matching', 'skill', 'Wonder', NULL, 'Match identical objects', '["Show two identical items", "Find the match", "Start with 2-3 pairs", "Increase as mastered", "Use real objects first"]', NULL, NULL, '["Pairs of identical objects", "Matching cards"]', 15, 'Anytime', 'pre-academic', 12, 24, 'schoolos_skills', 'schoolos_core',
'growing concepts)
(preacademic-006', 'AB Pattern Making', 'skill', 'Wonder', NULL, 'Create and extend simple patterns', '["Start pattern: red blue red blue", "Say pattern aloud", "What comes next?", "Let child continue", "Create own patterns"]', NULL, NULL, '["Colored blocks", "Pattern strips", "Beads"]', 15, 'Anytime', 'pre-academic', 24, 36, 'schoolos_skills', 'schoolos_core',
'preacademic-007', 'Counting to Five', 'skill', 'Wonder', NULL, 'Count objects up to five', '["Count slowly touching each object", "Start with 3, build to 5", "Count everyday things", "Make it playful", "Correct gently if skipping"]', NULL, NULL, '["Small countable objects", "Number cards"]', 15, 'Anytime', 'pre-academic', 24, 36, 'schoolos_skills', 'schoolos_core',
'preacademic-008', 'Shape Hunt', 'skill', 'Wonder', NULL, 'Find shapes in the environment', '["Review target shape", "Hunt for shapes inside or outside", "Point and name found shapes", "Check guesses with card", "Try different shapes"]', NULL, NULL, '["Shape cards for reference", "Environment to explore"]', 15, 'Anytime', 'pre-academic', 24, 36, 'schoolos_skills', 'schoolos_core',
'pre-math and literacy)
(preacademic-009', 'Graphing Activities', 'skill', 'Wonder', NULL, 'Sort and display data visually', '["Decide what to sort", "Make columns for each type", "Place objects or stickers", "Count each column", "Compare: which has more?"]', NULL, NULL, '["Objects to sort", "Grid paper", "Colored stickers"]', 20, 'Anytime', 'pre-academic', 36, 48, 'schoolos_skills', 'schoolos_core',
'preacademic-010', 'Name Writing Practice', 'skill', 'Wonder', NULL, 'Work toward writing own name', '["Practice letters in name", "Start with first letter", "Use multi-sensory approaches", "Keep it fun not pressured", "Write name often for child to see"]', NULL, NULL, '["Name cards", "Sand tray", "Large markers", "Paper"]', 15, 'Anytime', 'pre-academic', 36, 48, 'schoolos_skills', 'schoolos_core',
'preacademic-011', 'Simple Measuring', 'skill', 'Wonder', NULL, 'Use non-standard units to measure', '["Choose unit: blocks", "Measure objects together", "Record number of blocks", "Compare measurements", "Try different units"]', NULL, NULL, '["Paper clips", "Blocks", "String", "Things to measure"]', 20, 'Anytime', 'pre-academic', 36, 48, 'schoolos_skills', 'schoolos_core',
'school readiness)
(preacademic-012', 'Number Recognition Games', 'skill', 'Wonder', NULL, 'Recognize numerals 1-10', '["Match numeral to quantity", "Play number bingo", "Find numbers in environment", "Write numerals in sand", "Use dice for games"]', NULL, NULL, '["Number cards", "Number puzzles", "Numeral dice"]', 15, 'Anytime', 'pre-academic', 48, 60, 'schoolos_skills', 'schoolos_core',
'preacademic-013', 'Beginning Addition', 'skill', 'Wonder', NULL, 'Combine small groups', '["Start with stories: 2 cars and 1 more", "Use objects to demonstrate", "Count all together", "Use fingers sometimes", "Keep numbers small 1-5"]', NULL, NULL, '["Small toys for counting", "Story problems"]', 15, 'Anytime', 'pre-academic', 48, 60, 'schoolos_skills', 'schoolos_core',
'preacademic-014', 'Letter of the Week', 'skill', 'Wonder', NULL, 'Focus on one letter at a time', '["Introduce letter name and sound", "Find objects starting with it", "Create letter with materials", "Point out in books", "Avoid drilling"]', NULL, NULL, '["Letter cards", "Objects starting with letter", "Craft supplies"]', 20, 'Anytime', 'pre-academic', 48, 60, 'schoolos_skills', 'schoolos_core',
'preacademic-015', 'Science Exploration', 'skill', 'Wonder', NULL, 'Observe and describe natural phenomena', '["Collect safe natural items", "Observe closely together", "Describe what you notice", "Draw or photograph findings", "Wonder together about nature"]', NULL, NULL, '["Magnifying glass", "Natural objects", "Recording materials"]', 25, 'Anytime', 'pre-academic', 48, 60, 'schoolos_skills', 'schoolos_core',
'Phase 5)
-- Adds 6 spiritual formation activities + 2 Charlotte Mason essentials

-- NEW-001: Morning Prayer
INSERT INTO activities (id', 'title', 'habit', 'Wonder', NULL, 'description', 'instructions', NULL, NULL, 'materials', 'duration_minutes', 'Anytime', 'spiritual', 'min_age_months', 'max_age_months', 'schoolos_spiritual', 'schoolos_core',
'id', 'title', 'habit', 'Stewardship', NULL, 'description', 'instructions
) VALUES 
-- Holding
(dp_attentive_holding', NULL, NULL, NULL, 'duration_minutes', 'context_embedding', 'daily_practice', 'min_age_months', 'max_age_months', 'schoolos_daily', 'schoolos_core',
'dp_gentle_touch', 'Gentle Touch', 'habit', 'Love', NULL, 'Stroke baby''s arms and legs slowly. Just connection.', '["Lay baby on a soft surface and gently stroke their arms and legs."]', NULL, NULL, NULL, 5, 'holding', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_speaking_scripture', 'Speaking Scripture', 'habit', 'Wonder', NULL, 'Speak a short phrase: "You are fearfully and wonderfully made."', '["While holding baby, softly speak the scripture verse over them."]', NULL, NULL, NULL, 5, 'holding', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_calm_feeding', 'Calm Feeding Presence', 'habit', 'Love', NULL, 'During feeding, speak softly or hum. Let this be unhurried.', '["Minimize distractions during feeding and hum or speak softly."]', NULL, NULL, NULL, 15, 'feeding', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_respectful_body', 'Respectful Body Naming', 'habit', 'Stewardship', NULL, 'During diaper changes, gently name body parts.', '["As you wipe or dress baby, gently touch and name their body parts."]', NULL, NULL, NULL, 3, 'diapering', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_bedtime_words', 'Predictable Bedtime Words', 'habit', 'Wonder', NULL, 'Use the same phrase each night: "The Lord bless you."', '["As the final step of bedtime, say the same blessing phrase."]', NULL, NULL, NULL, 2, 'sleep', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_outdoor_stillness', 'Outdoor Stillness', 'habit', 'Wisdom', NULL, 'Step outside. Let baby feel the air, hear the sounds.', '["Step outdoors and simply stand still, letting baby feel the breeze."]', NULL, NULL, NULL, 5, 'outdoor', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_singing_hymns', 'Singing Hymns', 'habit', 'Wonder', NULL, 'Sing a familiar hymn quietly. Repetition is comforting.', '["Sing a favorite hymn quietly to baby while rocking or sitting."]', NULL, NULL, NULL, 5, 'Anytime', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_responsive_cooing', 'Responsive Cooing', 'habit', 'Wisdom', NULL, 'When baby makes sounds, respond with similar sounds.', '["Wait for baby to make a sound, then make the same sound back."]', NULL, NULL, NULL, 5, 'Anytime', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_naming_light', 'Naming Light and Sound', 'habit', 'Wisdom', NULL, 'Point to light sources, name sounds: "That''s the wind."', '["Point out a light or window and name it for baby."]', NULL, NULL, NULL, 5, 'Anytime', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_watching_movement', 'Watching Movement Together', 'habit', 'Wisdom', NULL, 'Watch leaves, shadows, or a mobile. Point and describe.', '["Find moving leaves or shadows and point them out to baby."]', NULL, NULL, NULL, 5, 'Anytime', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core',
'dp_prayer_over_baby', 'Prayer Over Baby', 'habit', 'Wonder', NULL, 'Pray aloud over your baby. Simple words.', '["Place your hand gently on baby and pray a simple blessing."]', NULL, NULL, NULL, 2, 'Anytime', 'daily_practice', 0, 12, 'schoolos_daily', 'schoolos_core';
