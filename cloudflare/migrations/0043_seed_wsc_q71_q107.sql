-- Migration 0043: Seed WSC Q71-Q107
-- Continuing from Q70 (7th Commandment) through the end of the Catechism logic (Prayer).
-- Uses INSERT OR REPLACE to avoid unique constraint errors

INSERT OR REPLACE INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, guide_steps, parent_posture, context_anchor, min_age_months, max_age_months) VALUES

-- Eighth Commandment (Q71-Q75)
('wsc_q71', 'Q71: The Eighth Commandment', 'liturgy', 'Stewardship', 'Memory',
 'Q: Which is the eighth commandment?\nA: The eighth commandment is, Thou shalt not steal.\n(Exodus 20:15)',
 '["Recite together", "Discuss: Respecting others'' things", "Pray"]',
 'Teach that everything belongs to God first.',
 'Morning_Circle', 48, 216),

('wsc_q72', 'Q72: Required in Eighth', 'liturgy', 'Stewardship', 'Conscience',
 'Q: What is required in the eighth commandment?\nA: The eighth commandment requireth the lawful procuring and furthering the wealth and outward estate of ourselves and others.\n(Lev 25:35, Eph 4:28)',
 '["Recite together", "Discuss: Working hard and sharing.", "Pray"]',
 'Work is a good gift from God to help us give.',
 'Morning_Circle', 48, 216),

('wsc_q73', 'Q73: Forbidden in Eighth', 'liturgy', 'Stewardship', 'Conscience',
 'Q: What is forbidden in the eighth commandment?\nA: The eighth commandment forbiddeth whatsoever doth, or may, unjustly hinder our own, or our neighbor''s, wealth or outward estate.\n(Prov 28:19, 1 Tim 5:8)',
 '["Recite together", "Discuss: Laziness and Taking.", "Pray"]',
 'We do not take what isn''t ours, and we don''t waste what is.',
 'Morning_Circle', 48, 216),

('wsc_q74', 'Q74: Reason for Eighth', 'liturgy', 'Stewardship', 'Reason',
 'Q: What is the reason annexed to the eighth commandment?\nA: The reason annexed to the eighth commandment is, that God, who giveth to all men liberally, forbids all unjust ways of getting, keeping, or using any part of that which is another''s.\n(Heb 13:5)',
 '["Recite together", "Discuss: Trusting God''s provision.", "Pray"]',
 'God gives us what we need, so we don''t need to steal.',
 'Morning_Circle', 48, 216),

('wsc_q75', 'Q75: The Ninth Commandment', 'liturgy', 'Truth', 'Memory',
 'Q: Which is the ninth commandment?\nA: The ninth commandment is, Thou shalt not bear false witness against thy neighbor.\n(Exodus 20:16)',
 '["Recite together", "Discuss: Telling the Truth.", "Pray"]',
 'Truth matters because God is Truth.',
 'Morning_Circle', 48, 216),

('wsc_q76', 'Q76: Required in Ninth', 'liturgy', 'Truth', 'Conscience',
 'Q: What is required in the ninth commandment?\nA: The ninth commandment requireth the maintaining and promoting of truth between man and man, and of our own and our neighbor''s good name, especially in witness-bearing.\n(Zech 8:16, 3 John 12)',
 '["Recite together", "Discuss: Protecting Reputations.", "Pray"]',
 'We speak careful words that build people up.',
 'Morning_Circle', 48, 216),

('wsc_q77', 'Q77: Forbidden in Ninth', 'liturgy', 'Truth', 'Conscience',
 'Q: What is forbidden in the ninth commandment?\nA: The ninth commandment forbiddeth whatsoever is prejudicial to truth, or injurious to our own or our neighbor''s good name.\n(Prov 19:5, Luke 3:14)',
 '["Recite together", "Discuss: Lying and Gossip.", "Pray"]',
 'Lying and gossiping hurt people deeply.',
 'Morning_Circle', 48, 216),

-- Tenth Commandment (Q78-Q81)
('wsc_q78', 'Q78: The Tenth Commandment', 'liturgy', 'Contentment', 'Memory',
 'Q: Which is the tenth commandment?\nA: The tenth commandment is, Thou shalt not covet thy neighbor''s house, thou shalt not covet thy neighbor''s wife, nor his manservant, nor his maidservant, nor his ox, nor his ass, nor anything that is thy neighbor''s.\n(Exodus 20:17)',
 '["Recite together", "Discuss: Wanting what others have.", "Pray"]',
 'God gives us exactly what is best for us.',
 'Morning_Circle', 48, 216),

('wsc_q79', 'Q79: Required in Tenth', 'liturgy', 'Contentment', 'Conscience',
 'Q: What is required in the tenth commandment?\nA: The tenth commandment requireth full contentment with our own condition, with a right and charitable frame of spirit toward our neighbor and all that is his.\n(Heb 13:5, Rom 12:15)',
 '["Recite together", "Discuss: Being Happy with what we have.", "Pray"]',
 'Contentment means being happy with God''s plan for us.',
 'Morning_Circle', 48, 216),

('wsc_q80', 'Q80: Forbidden in Tenth', 'liturgy', 'Contentment', 'Conscience',
 'Q: What is forbidden in the tenth commandment?\nA: The tenth commandment forbiddeth all discontentment with our own estate, envying or grieving at the good of our neighbor, and all inordinate motions and affections to anything that is his.\n(1 Cor 10:10, Gal 5:26)',
 '["Recite together", "Discuss: Jealousy.", "Pray"]',
 'Jealousy makes our hearts sick. Rejoice with others.',
 'Morning_Circle', 48, 216),

('wsc_q81', 'Q81: No Man Able to Keep', 'liturgy', 'Humility', 'Conscience',
 -- NOTE: Mapping logic continues from user's preferred numbering
 'Q: Is any man able perfectly to keep the commandments of God?\nA: No mere man since the fall is able in this life perfectly to keep the commandments of God, but doth daily break them in thought, word, and deed.\n(Eccl 7:20, Rom 3:23)',
 '["Recite together", "Discuss: Nobody is perfect.", "Pray"]',
 'We all break God''s law. We need a Savior.',
 'Bedside', 48, 216),

('wsc_q82', 'Q82: All Transgressions', 'liturgy', 'Humility', 'Reason',
 'Q: Are all transgressions of the law equally heinous?\nA: Some sins in themselves, and by reason of several aggravations, are more heinous in the sight of God than others.\n(John 19:11)',
 '["Recite together", "Discuss: Big sins and little sins?", "Pray"]',
 'Some sins hurt more, but all are sins.',
 'Bedside', 48, 216),

('wsc_q83', 'Q83: Deserve for Sin', 'liturgy', 'Humility', 'Conscience',
 'Q: What doth every sin deserve?\nA: Every sin deserveth God''s wrath and curse, both in this life, and that which is to come.\n(Gal 3:10, Matt 25:41)',
 '["Recite together", "Discuss: The seriousness of sin.", "Pray"]',
 'Sin is deadly serious. It separates us from God.',
 'Bedside', 48, 216),

('wsc_q84', 'Q84: Redemption', 'liturgy', 'Faith', 'Reason',
 'Q: What doth God require of us, that we may escape his wrath and curse due to us for sin?\nA: To escape the wrath and curse of God due to us for sin, God requireth of us faith in Jesus Christ, repentance unto life, with the diligent use of all the outward means whereby Christ communicateth to us the benefits of redemption.\n(Acts 20:21)',
 '["Recite together", "Discuss: Faith and Repentance.", "Pray"]',
 'We need faith in Jesus and a turning away from sin.',
 'Bedside', 48, 216),

('wsc_q85', 'Q85: Faith in Jesus', 'liturgy', 'Faith', 'Conscience',
 'Q: What is faith in Jesus Christ?\nA: Faith in Jesus Christ is a saving grace, whereby we receive and rest upon him alone for salvation, as he is offered to us in the gospel.\n(Heb 10:39, John 1:12)',
 '["Recite together", "Discuss: Trusting Jesus alone.", "Pray"]',
 'Faith is trusting Jesus to save us.',
 'Bedside', 48, 216),

('wsc_q86', 'Q86: Repentance unto Life', 'liturgy', 'Faith', 'Conscience',
 'Q: What is repentance unto life?\nA: Repentance unto life is a saving grace, whereby a sinner, out of a true sense of his sin, and apprehension of the mercy of God in Christ, doth, with grief and hatred of his sin, turn from it unto God, with full purpose of, and endeavor after, new obedience.\n(Acts 11:18, Joel 2:12-13)',
 '["Recite together", "Discuss: Turning around.", "Pray"]',
 'Repentance means being sorry and changing direction.',
 'Bedside', 48, 216),

-- Means of Grace (Q87-Q97)
('wsc_q87', 'Q87: Means of Grace', 'liturgy', 'Wisdom', 'Reason',
 'Q: What are the outward and ordinary means whereby Christ communicateth to us the benefits of redemption?\nA: The outward and ordinary means whereby Christ communicateth to us the benefits of redemption are, his ordinances, especially the word, sacraments, and prayer; all which are made effectual to the elect for salvation.\n(Matt 28:19-20, Acts 2:42)',
 '["Recite together", "Discuss: How God grows us.", "Pray"]',
 'God uses Bible, Sacraments, and Prayer to feed us.',
 'Meal_Table', 48, 216),

('wsc_q88', 'Q88: Word Made Effectual', 'liturgy', 'Wisdom', 'Reason',
 'Q: How is the word made effectual to salvation?\nA: The Spirit of God maketh the reading, but especially the preaching of the word, an effectual means of convincing and converting sinners, and of building them up in holiness and comfort, through faith, unto salvation.\n(Neh 8:8, Rom 10:14-17)',
 '["Recite together", "Discuss: Reading and Preaching.", "Pray"]',
 'The Holy Spirit makes the Bible come alive in our hearts.',
 'Meal_Table', 48, 216),

('wsc_q89', 'Q89: How to Read the Word', 'liturgy', 'Wisdom', 'Conscience',
 'Q: How is the word to be read and heard, that it may become effectual to salvation?\nA: That the word may become effectual to salvation, we must attend thereunto with diligence, preparation, and prayer; receive it with faith and love, lay it up in our hearts, and practice it in our lives.\n(Prov 8:34, Psalm 119:11)',
 '["Recite together", "Discuss: Listening carefully.", "Pray"]',
 'We get ready to hear God speak.',
 'Meal_Table', 48, 216),

('wsc_q90', 'Q90: Sacraments Effective', 'liturgy', 'Worship', 'Reason',
 'Q: How do the sacraments become effectual means of salvation?\nA: The sacraments become effectual means of salvation, not from any virtue in them, or in him that doth administer them; but only by the blessing of Christ, and the working of his Spirit in them that by faith receive them.\n(1 Pet 3:21, 1 Cor 3:7)',
 '["Recite together", "Discuss: It is not magic.", "Pray"]',
 'Sacraments work because Jesus blesses them, not because of the water or bread.',
 'Meal_Table', 48, 216),

('wsc_q91', 'Q91: Nature of Sacrament', 'liturgy', 'Worship', 'Memory',
 'Q: What is a sacrament?\nA: A sacrament is an holy ordinance instituted by Christ; wherein, by sensible signs, Christ, and the benefits of the new covenant, are represented, sealed, and applied to believers.\n(Gen 17:7, 10)',
 '["Recite together", "Discuss: Signs and Seals.", "Pray"]',
 'A sacrament is a picture we can see and touch.',
 'Meal_Table', 48, 216),

('wsc_q92', 'Q92: New Testament Sacraments', 'liturgy', 'Worship', 'Memory',
 'Q: Which are the sacraments of the New Testament?\nA: The sacraments of the New Testament are, Baptism, and the Lord''s Supper.\n(Matt 28:19, 1 Cor 11:23)',
 '["Recite together", "Discuss: Two Sacraments.", "Pray"]',
 'Jesus gave us two special ceremonies: Baptism and Communion.',
 'Meal_Table', 48, 216),

('wsc_q93', 'Q93: Baptism', 'liturgy', 'Worship', 'Memory',
 'Q: What is baptism?\nA: Baptism is a sacrament, wherein the washing with water in the name of the Father, and of the Son, and of the Holy Ghost, doth signify and seal our ingrafting into Christ, and partaking of the benefits of the covenant of grace, and our engagement to be the Lord''s.\n(Matt 28:19, Rom 6:3-4)',
 '["Recite together", "Discuss: Washing with water.", "Pray"]',
 'Baptism is God''s mark on us, washing us clean.',
 'Meal_Table', 48, 216),

('wsc_q94', 'Q94: Baptism Subjects', 'liturgy', 'Worship', 'Reason',
 'Q: To whom is baptism to be administered?\nA: Baptism is not to be administered to any that are out of the visible church, till they profess their faith in Christ, and obedience to him; but the infants of such as are members of the visible church are to be baptized.\n(Acts 2:38-39, Gen 17:7)',
 '["Recite together", "Discuss: Believers and their children.", "Pray"]',
 'God includes children in His family promise.',
 'Meal_Table', 48, 216),

('wsc_q95', 'Q95: Lord''s Supper', 'liturgy', 'Worship', 'Memory',
 'Q: What is the Lord''s supper?\nA: The Lord''s supper is a sacrament, wherein, by giving and receiving bread and wine, according to Christ''s appointment, his death is showed forth; and the worthy receivers are, not after a corporal and carnal manner, but by faith, made partakers of his body and blood, with all his benefits, to their spiritual nourishment and growth in grace.\n(1 Cor 11:23-26)',
 '["Recite together", "Discuss: Bread and Wine.", "Pray"]',
 'We remember Jesus'' death and He feeds our spirits.',
 'Meal_Table', 48, 216),

('wsc_q96', 'Q96: Worthy Receiving', 'liturgy', 'Worship', 'Conscience',
 'Q: What is required to the worthy receiving of the Lord''s supper?\nA: It is required of them that would worthily partake of the Lord''s supper, that they examine themselves of their knowledge to discern the Lord''s body, of their faith to feed upon him, of their repentance, love, and new obedience; lest, coming unworthily, they eat and drink judgment to themselves.\n(1 Cor 11:27-29)',
 '["Recite together", "Discuss: Checking our hearts.", "Pray"]',
 'We must trust and love Jesus when we come to His table.',
 'Meal_Table', 48, 216),

('wsc_q97', 'Q97: Prayer', 'liturgy', 'Dependence', 'Memory',
 'Q: What is prayer?\nA: Prayer is an offering up of our desires unto God, for things agreeable to his will, in the name of Christ, with confession of our sins, and thankful acknowledgment of his mercies.\n(Psalm 62:8, John 16:23)',
 '["Recite together", "Discuss: Talking to God.", "Pray"]',
 'Prayer is asking God for what He wants for us.',
 'Bedside', 48, 216),

-- Prayer (Q98-Q106)
('wsc_q98', 'Q98: Rule of Prayer', 'liturgy', 'Dependence', 'Memory',
 'Q: What rule hath God given for our direction in prayer?\nA: The whole word of God is of use to direct us in prayer; but the special rule of direction is that form of prayer which Christ taught his disciples, commonly called the Lord''s prayer.\n(Matt 6:9)',
 '["Recite together", "Discuss: The Lord''s Prayer.", "Pray"]',
 'Jesus gave us a perfect example of how to pray.',
 'Bedside', 48, 216),

('wsc_q99', 'Q99: Preface of Lord''s Prayer', 'liturgy', 'Dependence', 'Memory',
 'Q: What doth the preface of the Lord''s prayer teach us?\nA: The preface of the Lord''s prayer (which is, Our Father which art in heaven) teacheth us to draw near to God with all holy reverence and confidence, as children to a father, able and ready to help us; and that we should pray with and for others.\n(Rom 8:15)',
 '["Recite together", "Discuss: Our Father.", "Pray"]',
 'God is our Dad in heaven who loves to help us.',
 'Bedside', 48, 216),

('wsc_q100', 'Q100: First Petition', 'liturgy', 'Worship', 'Memory',
 'Q: What do we pray for in the first petition?\nA: In the first petition (which is, Hallowed be thy name) we pray, that God would enable us and others to glorify him in all that whereby he maketh himself known; and that he would dispose all things to his own glory.\n(Psalm 67:1-3)',
 '["Recite together", "Discuss: God''s Name is special.", "Pray"]',
 'We ask that everyone would honor God.',
 'Bedside', 48, 216),

('wsc_q101', 'Q101: Second Petition', 'liturgy', 'Hope', 'Memory',
 'Q: What do we pray for in the second petition?\nA: In the second petition (which is, Thy kingdom come) we pray, that Satan''s kingdom may be destroyed; and that the kingdom of grace may be advanced, ourselves and others brought into it, and kept in it; and that the kingdom of glory may be hastened.\n(Psalm 68:1)',
 '["Recite together", "Discuss: God''s Kingdom.", "Pray"]',
 'We want Jesus to rule everywhere.',
 'Bedside', 48, 216),

('wsc_q102', 'Q102: Third Petition', 'liturgy', 'Obedience', 'Memory',
 'Q: What do we pray for in the third petition?\nA: In the third petition (which is, Thy will be done in earth, as it is in heaven) we pray, that God, by his grace, would make us able and willing to know, obey, and submit to his will in all things, as the angels do in heaven.\n(Psalm 103:20-21)',
 '["Recite together", "Discuss: Obeying like angels.", "Pray"]',
 'We ask God to help us obey Him happily.',
 'Bedside', 48, 216),

('wsc_q103', 'Q103: Fourth Petition', 'liturgy', 'Dependence', 'Memory',
 'Q: What do we pray for in the fourth petition?\nA: In the fourth petition (which is, Give us this day our daily bread) we pray, that of God''s free gift we may receive a competent portion of the good things of this life, and enjoy his blessing with them.\n(Prov 30:8)',
 '["Recite together", "Discuss: Daily needs.", "Pray"]',
 'We trust God to feed and take care of us today.',
 'Bedside', 48, 216),

('wsc_q104', 'Q104: Fifth Petition', 'liturgy', 'Repentance', 'Memory',
 'Q: What do we pray for in the fifth petition?\nA: In the fifth petition (which is, And forgive us our debts, as we forgive our debtors) we pray, that God, for Christ''s sake, would freely pardon all our sins; which we are the rather encouraged to ask, because by his grace we are enabled from the heart to forgive others.\n(Psalm 51:1, Matt 6:14-15)',
 '["Recite together", "Discuss: Forgiving others.", "Pray"]',
 'We ask for forgiveness and promise to forgive others too.',
 'Bedside', 48, 216),

('wsc_q105', 'Q105: Sixth Petition', 'liturgy', 'Dependence', 'Memory',
 'Q: What do we pray for in the sixth petition?\nA: In the sixth petition (which is, And lead us not into temptation, but deliver us from evil) we pray, that God would either keep us from being tempted to sin, or support and deliver us when we are tempted.\n(Matt 26:41)',
 '["Recite together", "Discuss: Keep us safe from sin.", "Pray"]',
 'We ask God to keep us from places where we might sin.',
 'Bedside', 48, 216),

('wsc_q106', 'Q106: Conquest of Prayer', 'liturgy', 'Worship', 'Memory',
 'Q: What doth the conclusion of the Lord''s prayer teach us?\nA: The conclusion of the Lord''s prayer (which is, For thine is the kingdom, and the power, and the glory, for ever. Amen) teacheth us to take our encouragement in prayer from God only, and in our prayers to praise him, ascribing kingdom, power, and glory to him; and, in testimony of our desire, and assurance to be heard, we say, Amen.\n(1 Chron 29:11, Rev 22:20)',
 '["Recite together", "Discuss: Amen!", "Pray"]',
 'We end by praising God because He is King.',
 'Bedside', 48, 216);