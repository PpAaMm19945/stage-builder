-- Migration 0029: Seed All 50 Reformed Hymns
-- Source: public/books/reformed-hymns/ markdown files
-- Note: Hymns 1-5 (Amazing Grace, Great Is Thy Faithfulness, Be Thou My Vision, A Mighty Fortress, Holy Holy Holy) 
--       already exist from 0017_seed_liturgy_content.sql, so we start from hymn 6

-- Use INSERT OR IGNORE to avoid duplicates if re-run
INSERT OR IGNORE INTO liturgy_items (id, type, source, sequence_number, title, content, reference) VALUES

-- Hymn 6: It Is Well with My Soul
('hymn_it_is_well', 'hymn', 'classic_hymns', 6, 'It Is Well with My Soul', 
'When peace, like a river, attendeth my way,
When sorrows like sea billows roll;
Whatever my lot, Thou has taught me to say,
It is well, it is well, with my soul.

Chorus:
It is well, with my soul,
It is well, with my soul,
It is well, it is well, with my soul.', 'Horatio G. Spafford, 1873'),

-- Hymn 7: Love Divine, All Loves Excelling
('hymn_love_divine', 'hymn', 'classic_hymns', 7, 'Love Divine, All Loves Excelling',
'Love divine, all loves excelling,
Joy of heaven, to earth come down;
Fix in us thy humble dwelling,
All thy faithful mercies crown.
Jesus, thou art all compassion,
Pure, unbounded love thou art;
Visit us with thy salvation,
Enter every trembling heart.', 'Charles Wesley, 1747'),

-- Hymn 8: Praise to the Lord, the Almighty
('hymn_praise_to_lord', 'hymn', 'classic_hymns', 8, 'Praise to the Lord, the Almighty',
'Praise to the Lord, the Almighty, the King of creation!
O my soul, praise Him, for He is thy health and salvation!
All ye who hear,
Now to His temple draw near;
Praise Him in glad adoration.', 'Joachim Neander, 1680'),

-- Hymn 9 (already seeded as #3): Skip

-- Hymn 10: Great Is Thy Faithfulness (already seeded as #2): Skip

-- Hymn 11: Rock of Ages
('hymn_rock_of_ages', 'hymn', 'classic_hymns', 11, 'Rock of Ages',
'Rock of Ages, cleft for me,
Let me hide myself in Thee;
Let the water and the blood,
From Thy wounded side which flowed,
Be of sin the double cure;
Save from wrath and make me pure.', 'Augustus M. Toplady, 1776'),

-- Hymn 12: Come, Thou Fount of Every Blessing
('hymn_come_thou_fount', 'hymn', 'classic_hymns', 12, 'Come, Thou Fount of Every Blessing',
'Come, Thou Fount of every blessing,
Tune my heart to sing Thy grace;
Streams of mercy, never ceasing,
Call for songs of loudest praise.
Teach me some melodious sonnet,
Sung by flaming tongues above.
Praise the mount! I''m fixed upon it,
Mount of Thy redeeming love.', 'Robert Robinson, 1758'),

-- Hymn 13: Crown Him with Many Crowns
('hymn_crown_him', 'hymn', 'classic_hymns', 13, 'Crown Him with Many Crowns',
'Crown Him with many crowns,
The Lamb upon His throne;
Hark! how the heavenly anthem drowns
All music but its own;
Awake, my soul, and sing
Of Him who died for thee,
And hail Him as thy matchless King
Through all eternity.', 'Matthew Bridges, 1851'),

-- Hymn 14: Christ the Lord Is Risen Today
('hymn_christ_risen', 'hymn', 'classic_hymns', 14, 'Christ the Lord Is Risen Today',
'Christ the Lord is risen today, Alleluia!
Sons of men and angels say, Alleluia!
Raise your joys and triumphs high, Alleluia!
Sing, ye heavens, and earth reply, Alleluia!', 'Charles Wesley, 1739'),

-- Hymn 15: Man of Sorrows! What a Name
('hymn_man_of_sorrows', 'hymn', 'classic_hymns', 15, 'Man of Sorrows! What a Name',
'Man of Sorrows! what a name
For the Son of God, who came
Ruined sinners to reclaim.
Hallelujah! What a Savior!', 'Philip P. Bliss, 1875'),

-- Hymn 16: The Church''s One Foundation
('hymn_church_foundation', 'hymn', 'classic_hymns', 16, 'The Church''s One Foundation',
'The Church''s one foundation
Is Jesus Christ her Lord;
She is His new creation
By water and the Word:
From heaven He came and sought her
To be His holy Bride;
With His own blood He bought her,
And for her life He died.', 'Samuel J. Stone, 1866'),

-- Hymn 17: Guide Me, O Thou Great Jehovah
('hymn_guide_me', 'hymn', 'classic_hymns', 17, 'Guide Me, O Thou Great Jehovah',
'Guide me, O Thou great Jehovah,
Pilgrim through this barren land;
I am weak, but Thou art mighty,
Hold me with Thy powerful hand.
Bread of heaven, Bread of heaven,
Feed me till I want no more.', 'William Williams, 1745'),

-- Hymn 18: What a Friend We Have in Jesus
('hymn_what_a_friend', 'hymn', 'classic_hymns', 18, 'What a Friend We Have in Jesus',
'What a friend we have in Jesus,
All our sins and griefs to bear!
What a privilege to carry
Everything to God in prayer!
O what peace we often forfeit,
O what needless pain we bear,
All because we do not carry
Everything to God in prayer.', 'Joseph M. Scriven, 1855'),

-- Hymn 19: Blessed Assurance
('hymn_blessed_assurance', 'hymn', 'classic_hymns', 19, 'Blessed Assurance',
'Blessed assurance, Jesus is mine!
O what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed in His blood.

Chorus:
This is my story, this is my song,
Praising my Savior all the day long.', 'Fanny J. Crosby, 1873'),

-- Hymn 20: To God Be the Glory
('hymn_to_god_glory', 'hymn', 'classic_hymns', 20, 'To God Be the Glory',
'To God be the glory, great things He hath done;
So loved He the world that He gave us His Son,
Who yielded His life an atonement for sin,
And opened the lifegate that all may go in.

Chorus:
Praise the Lord, praise the Lord,
Let the earth hear His voice!', 'Fanny J. Crosby, 1875'),

-- Hymn 21: All Hail the Power of Jesus'' Name
('hymn_all_hail_power', 'hymn', 'classic_hymns', 21, 'All Hail the Power of Jesus'' Name',
'All hail the power of Jesus'' name!
Let angels prostrate fall;
Bring forth the royal diadem,
And crown Him Lord of all.', 'Edward Perronet, 1779'),

-- Hymn 22: Fairest Lord Jesus
('hymn_fairest_lord', 'hymn', 'classic_hymns', 22, 'Fairest Lord Jesus',
'Fairest Lord Jesus, Ruler of all nature,
O Thou of God and man the Son,
Thee will I cherish, Thee will I honor,
Thou, my soul''s glory, joy and crown.', 'Anonymous German Hymn, 1677'),

-- Hymn 23: He Leadeth Me
('hymn_he_leadeth', 'hymn', 'classic_hymns', 23, 'He Leadeth Me',
'He leadeth me, O blessed thought!
O words with heavenly comfort fraught!
Whate''er I do, where''er I be,
Still ''tis God''s hand that leadeth me.

Chorus:
He leadeth me, He leadeth me,
By His own hand He leadeth me.', 'Joseph H. Gilmore, 1862'),

-- Hymn 24: I Need Thee Every Hour
('hymn_i_need_thee', 'hymn', 'classic_hymns', 24, 'I Need Thee Every Hour',
'I need Thee every hour,
Most gracious Lord;
No tender voice like Thine
Can peace afford.

Chorus:
I need Thee, O I need Thee;
Every hour I need Thee.', 'Annie S. Hawks, 1872'),

-- Hymn 25: Jesus Paid It All
('hymn_jesus_paid', 'hymn', 'classic_hymns', 25, 'Jesus Paid It All',
'I hear the Savior say,
"Thy strength indeed is small;
Child of weakness, watch and pray,
Find in Me thine all in all."

Chorus:
Jesus paid it all,
All to Him I owe;
Sin had left a crimson stain,
He washed it white as snow.', 'Elvina M. Hall, 1865'),

-- Hymn 26: Just as I Am
('hymn_just_as_i_am', 'hymn', 'classic_hymns', 26, 'Just as I Am',
'Just as I am, without one plea,
But that Thy blood was shed for me,
And that Thou bidst me come to Thee,
O Lamb of God, I come, I come.', 'Charlotte Elliott, 1835'),

-- Hymn 27: Nearer, My God, to Thee
('hymn_nearer_my_god', 'hymn', 'classic_hymns', 27, 'Nearer, My God, to Thee',
'Nearer, my God, to Thee,
Nearer to Thee!
E''en though it be a cross
That raiseth me,
Still all my song shall be,
Nearer, my God, to Thee.', 'Sarah F. Adams, 1841'),

-- Hymn 28: O For a Thousand Tongues to Sing
('hymn_thousand_tongues', 'hymn', 'classic_hymns', 28, 'O For a Thousand Tongues to Sing',
'O for a thousand tongues to sing
My great Redeemer''s praise,
The glories of my God and King,
The triumphs of His grace.', 'Charles Wesley, 1739'),

-- Hymn 29: Stand Up, Stand Up for Jesus
('hymn_stand_up', 'hymn', 'classic_hymns', 29, 'Stand Up, Stand Up for Jesus',
'Stand up, stand up for Jesus,
Ye soldiers of the cross;
Lift high His royal banner,
It must not suffer loss.', 'George Duffield, Jr., 1858'),

-- Hymn 30: Sweet Hour of Prayer
('hymn_sweet_hour', 'hymn', 'classic_hymns', 30, 'Sweet Hour of Prayer',
'Sweet hour of prayer! sweet hour of prayer!
That calls me from a world of care,
And bids me at my Father''s throne
Make all my wants and wishes known.', 'William W. Walford, 1845'),

-- Hymn 31: Take My Life and Let It Be
('hymn_take_my_life', 'hymn', 'classic_hymns', 31, 'Take My Life and Let It Be',
'Take my life and let it be
Consecrated, Lord, to Thee;
Take my moments and my days,
Let them flow in ceaseless praise.', 'Frances R. Havergal, 1874'),

-- Hymn 32: There Is a Fountain Filled with Blood
('hymn_fountain_blood', 'hymn', 'classic_hymns', 32, 'There Is a Fountain Filled with Blood',
'There is a fountain filled with blood
Drawn from Immanuel''s veins;
And sinners, plunged beneath that flood,
Lose all their guilty stains.', 'William Cowper, 1772'),

-- Hymn 33: ''Tis So Sweet to Trust in Jesus
('hymn_tis_so_sweet', 'hymn', 'classic_hymns', 33, '''Tis So Sweet to Trust in Jesus',
'''Tis so sweet to trust in Jesus,
Just to take Him at His word;
Just to rest upon His promise,
Just to know, "Thus saith the Lord."

Chorus:
Jesus, Jesus, how I trust Him!
How I''ve proved Him o''er and o''er!', 'Louisa M. R. Stead, 1882'),

-- Hymn 34: Trust and Obey
('hymn_trust_obey', 'hymn', 'classic_hymns', 34, 'Trust and Obey',
'When we walk with the Lord
In the light of His Word,
What a glory He sheds on our way!

Chorus:
Trust and obey,
for there''s no other way
To be happy in Jesus,
but to trust and obey.', 'John H. Sammis, 1887'),

-- Hymn 35: Turn Your Eyes upon Jesus
('hymn_turn_eyes', 'hymn', 'classic_hymns', 35, 'Turn Your Eyes upon Jesus',
'O soul, are you weary and troubled?
No light in the darkness you see?
There''s light for a look at the Savior,
And life more abundant and free!

Chorus:
Turn your eyes upon Jesus,
Look full in His wonderful face.', 'Helen H. Lemmel, 1922'),

-- Hymn 36: When I Survey the Wondrous Cross
('hymn_survey_cross', 'hymn', 'classic_hymns', 36, 'When I Survey the Wondrous Cross',
'When I survey the wondrous cross
On which the Prince of glory died,
My richest gain I count but loss,
And pour contempt on all my pride.', 'Isaac Watts, 1707'),

-- Hymn 37: At the Cross
('hymn_at_the_cross', 'hymn', 'classic_hymns', 37, 'At the Cross',
'Alas! and did my Savior bleed?
And did my Sovereign die?
Would He devote that sacred head
For such a worm as I?

Chorus:
At the cross, at the cross where I first saw the light,
And the burden of my heart rolled away.', 'Isaac Watts, 1707'),

-- Hymn 38: Count Your Blessings
('hymn_count_blessings', 'hymn', 'classic_hymns', 38, 'Count Your Blessings',
'When upon life''s billows you are tempest tossed,
When you are discouraged, thinking all is lost,
Count your many blessings, name them one by one,
And it will surprise you what the Lord hath done.

Chorus:
Count your blessings, name them one by one.', 'Johnson Oatman Jr., 1897'),

-- Hymn 39: Doxology
('hymn_doxology', 'hymn', 'classic_hymns', 39, 'Doxology',
'Praise God, from whom all blessings flow;
Praise Him, all creatures here below;
Praise Him above, ye heavenly host;
Praise Father, Son, and Holy Ghost. Amen.', 'Thomas Ken, 1674'),

-- Hymn 40: Glory Be to the Father
('hymn_gloria_patri', 'hymn', 'classic_hymns', 40, 'Glory Be to the Father',
'Glory be to the Father, and to the Son,
and to the Holy Ghost;
As it was in the beginning, is now, and ever shall be,
world without end. Amen, Amen.', 'Lesser Doxology, 2nd Century'),

-- Hymn 41: God of Our Fathers
('hymn_god_of_fathers', 'hymn', 'classic_hymns', 41, 'God of Our Fathers',
'God of our fathers, whose almighty hand
Leads forth in beauty all the starry band
Of shining worlds in splendor through the skies,
Our grateful songs before Thy throne arise.', 'Daniel C. Roberts, 1876'),

-- Hymn 42: Have Thine Own Way, Lord
('hymn_have_thine_way', 'hymn', 'classic_hymns', 42, 'Have Thine Own Way, Lord',
'Have Thine own way, Lord! Have Thine own way!
Thou art the Potter, I am the clay.
Mold me and make me after Thy will,
While I am waiting, yielded and still.', 'Adelaide A. Pollard, 1902'),

-- Hymn 43: Higher Ground
('hymn_higher_ground', 'hymn', 'classic_hymns', 43, 'Higher Ground',
'I''m pressing on the upward way,
New heights I''m gaining every day;
Still praying as I''m onward bound,
"Lord, plant my feet on higher ground."

Chorus:
Lord, lift me up and let me stand,
By faith, on Heaven''s tableland.', 'Johnson Oatman Jr., 1898'),

-- Hymn 44: I Surrender All
('hymn_i_surrender', 'hymn', 'classic_hymns', 44, 'I Surrender All',
'All to Jesus I surrender,
All to Him I freely give;
I will ever love and trust Him,
In His presence daily live.

Chorus:
I surrender all,
I surrender all.', 'Judson W. Van DeVenter, 1896'),

-- Hymn 45: In the Garden
('hymn_in_garden', 'hymn', 'classic_hymns', 45, 'In the Garden',
'I come to the garden alone,
While the dew is still on the roses,
And the voice I hear, falling on my ear,
The Son of God discloses.

Chorus:
And He walks with me, and He talks with me,
And He tells me I am His own.', 'C. Austin Miles, 1913'),

-- Hymn 46: Leaning on the Everlasting Arms
('hymn_leaning', 'hymn', 'classic_hymns', 46, 'Leaning on the Everlasting Arms',
'What a fellowship, what a joy divine,
Leaning on the everlasting arms;
What a blessedness, what a peace is mine,
Leaning on the everlasting arms.

Chorus:
Leaning, leaning,
Safe and secure from all alarms.', 'Elisha A. Hoffman, 1887'),

-- Hymn 47: My Jesus, I Love Thee
('hymn_my_jesus', 'hymn', 'classic_hymns', 47, 'My Jesus, I Love Thee',
'My Jesus, I love Thee, I know Thou art mine;
For Thee all the follies of sin I resign.
My gracious Redeemer, my Savior art Thou;
If ever I loved Thee, my Jesus, ''tis now.', 'William R. Featherston, 1864'),

-- Hymn 48: Revive Us Again
('hymn_revive_us', 'hymn', 'classic_hymns', 48, 'Revive Us Again',
'We praise Thee, O God! For the Son of Thy love,
For Jesus Who died, and is now gone above.

Chorus:
Hallelujah! Thine the glory.
Hallelujah! Amen.
Revive us again.', 'William P. Mackay, 1863'),

-- Hymn 49: Softly and Tenderly
('hymn_softly_tenderly', 'hymn', 'classic_hymns', 49, 'Softly and Tenderly',
'Softly and tenderly Jesus is calling,
Calling for you and for me;
See, on the portals He''s waiting and watching,
Watching for you and for me.

Chorus:
Come home, come home,
You who are weary, come home.', 'Will L. Thompson, 1880'),

-- Hymn 50: Faith of Our Fathers
('hymn_faith_fathers', 'hymn', 'classic_hymns', 50, 'Faith of Our Fathers',
'Faith of our fathers, living still,
In spite of dungeon, fire and sword;
O how our hearts beat high with joy
Whene''er we hear that glorious word!

Chorus:
Faith of our fathers, holy faith!
We will be true to thee till death.', 'Frederick W. Faber, 1849'),

-- Hymn 2: All People That on Earth Do Dwell (Psalm 100)
('hymn_all_people', 'hymn', 'classic_hymns', 51, 'All People That on Earth Do Dwell',
'All people that on earth do dwell,
Sing to the Lord with cheerful voice.
Him serve with fear, His praise forth tell;
Come ye before Him and rejoice.', 'William Kethe, 1561'),

-- Hymn 5: How Firm a Foundation
('hymn_how_firm', 'hymn', 'classic_hymns', 52, 'How Firm a Foundation',
'How firm a foundation, ye saints of the Lord,
Is laid for your faith in His excellent Word!
What more can He say than to you He hath said,
You, who unto Jesus for refuge have fled?', 'K. in Rippon''s Selection, 1787');
