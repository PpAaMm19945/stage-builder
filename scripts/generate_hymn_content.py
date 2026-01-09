import json
import os
import sys
import time

HYMN_DATA_1 = [
    {
        "sequence": 51,
        "title": "Joy to the World",
        "author": "Isaac Watts, 1719",
        "verses": [
            "Joy to the world, the Lord is come!\nLet earth receive her King;\nLet every heart prepare Him room,\nAnd heaven and nature sing,\nAnd heaven and nature sing,\nAnd heaven, and heaven, and nature sing.",
            "Joy to the earth, the Savior reigns!\nLet men their songs employ;\nWhile fields and floods, rocks, hills and plains\nRepeat the sounding joy,\nRepeat the sounding joy,\nRepeat, repeat, the sounding joy.",
            "No more let sins and sorrows grow,\nNor thorns infest the ground;\nHe comes to make His blessings flow\nFar as the curse is found,\nFar as the curse is found,\nFar as, far as, the curse is found.",
            "He rules the world with truth and grace,\nAnd makes the nations prove\nThe glories of His righteousness,\nAnd wonders of His love,\nAnd wonders of His love,\nAnd wonders, wonders, of His love."
        ]
    },
    {
        "sequence": 52,
        "title": "Hark! The Herald Angels Sing",
        "author": "Charles Wesley, 1739",
        "verses": [
            "Hark! the herald angels sing,\n\"Glory to the newborn King:\npeace on earth, and mercy mild,\nGod and sinners reconciled!\"\nJoyful, all ye nations, rise,\njoin the triumph of the skies;\nwith th'angelic hosts proclaim,\n\"Christ is born in Bethlehem!\"",
            "Christ, by highest heaven adored,\nChrist, the everlasting Lord,\nlate in time behold him come,\noffspring of the Virgin's womb:\nveiled in flesh the Godhead see;\nhail th'incarnate Deity,\npleased with us in flesh to dwell,\nJesus, our Immanuel.",
            "Hail the heaven-born Prince of Peace!\nHail the Sun of Righteousness!\nLight and life to all he brings,\nrisen with healing in his wings.\nMild he lays his glory by,\nborn that man no more may die,\nborn to raise the sons of earth,\nborn to give them second birth."
        ],
        "chorus": "Hark! the herald angels sing,\n\"Glory to the newborn King\""
    },
    {
        "sequence": 53,
        "title": "O Come, All Ye Faithful",
        "author": "John F. Wade, 1743; tr. Frederick Oakeley, 1841",
        "verses": [
            "O come, all ye faithful, joyful and triumphant,\nO come ye, O come ye to Bethlehem;\ncome and behold him born the King of angels;",
            "God of God, Light of Light,\nlo! he abhors not the Virgin's womb;\nvery God, begotten, not created;",
            "Sing, choirs of angels, sing in exultation,\nsing, all ye citizens of heaven above;\nglory to God in the highest;"
        ],
        "chorus": "O come, let us adore him,\nO come, let us adore him,\nO come, let us adore him,\nChrist the Lord."
    },
    {
        "sequence": 54,
        "title": "Silent Night",
        "author": "Joseph Mohr, 1818; tr. John F. Young, 1863",
        "verses": [
            "Silent night, holy night,\nall is calm, all is bright\nround yon virgin mother and child.\nHoly infant, so tender and mild,\nsleep in heavenly peace,\nsleep in heavenly peace.",
            "Silent night, holy night,\nshepherds quake at the sight;\nglories stream from heaven afar,\nheavenly hosts sing Alleluia!\nChrist the Savior is born,\nChrist the Savior is born!",
            "Silent night, holy night,\nSon of God, love's pure light;\nradiant beams from thy holy face\nwith the dawn of redeeming grace,\nJesus, Lord, at thy birth,\nJesus, Lord, at thy birth."
        ]
    },
    {
        "sequence": 55,
        "title": "Angels We Have Heard on High",
        "author": "French Carol; tr. James Chadwick, 1862",
        "verses": [
            "Angels we have heard on high\nSweetly singing o'er the plains,\nAnd the mountains in reply\nEchoing their joyous strains.",
            "Shepherds, why this jubilee?\nWhy your joyous strains prolong?\nWhat the gladsome tidings be\nWhich inspire your heavenly song?",
            "Come to Bethlehem and see\nHim whose birth the angels sing,\nCome, adore on bended knee,\nChrist the Lord, the newborn King."
        ],
        "chorus": "Gloria, in excelsis Deo!\nGloria, in excelsis Deo!"
    },
    {
        "sequence": 56,
        "title": "The First Noel",
        "author": "Traditional English Carol",
        "verses": [
            "The first Noel the angel did say\nwas to certain poor shepherds in fields as they lay;\nin fields where they lay keeping their sheep,\non a cold winter's night that was so deep.",
            "They looked up and saw a star\nshining in the east, beyond them far;\nand to the earth it gave great light,\nand so it continued both day and night.",
            "And by the light of that same star\nthree wise men came from country far;\nto seek for a king was their intent,\nand to follow the star wherever it went."
        ],
        "chorus": "Noel, Noel, Noel, Noel,\nborn is the King of Israel."
    },
    {
        "sequence": 57,
        "title": "O Little Town of Bethlehem",
        "author": "Phillips Brooks, 1868",
        "verses": [
            "O little town of Bethlehem,\nhow still we see thee lie!\nAbove thy deep and dreamless sleep\nthe silent stars go by.\nYet in thy dark streets shineth\nthe everlasting Light;\nthe hopes and fears of all the years\nare met in thee tonight.",
            "For Christ is born of Mary,\nand gathered all above,\nwhile mortals sleep, the angels keep\ntheir watch of wondering love.\nO morning stars, together\nproclaim the holy birth,\nand praises sing to God the King,\nand peace to men on earth.",
            "How silently, how silently,\nthe wondrous gift is giv'n!\nSo God imparts to human hearts\nthe blessings of his heav'n.\nNo ear may hear his coming,\nbut in this world of sin,\nwhere meek souls will receive him, still\nthe dear Christ enters in."
        ]
    },
    {
        "sequence": 58,
        "title": "Away in a Manger",
        "author": "Anonymous, 1885",
        "verses": [
            "Away in a manger, no crib for a bed,\nthe little Lord Jesus laid down his sweet head.\nThe stars in the bright sky looked down where he lay,\nthe little Lord Jesus asleep on the hay.",
            "The cattle are lowing, the baby awakes,\nbut little Lord Jesus, no crying he makes.\nI love thee, Lord Jesus! Look down from the sky,\nand stay by my cradle till morning is nigh.",
            "Be near me, Lord Jesus, I ask thee to stay\nclose by me forever, and love me, I pray.\nBless all the dear children in thy tender care,\nand fit us for heaven to live with thee there."
        ]
    },
    {
        "sequence": 59,
        "title": "What Child Is This?",
        "author": "William C. Dix, 1865",
        "verses": [
            "What child is this, who, laid to rest,\non Mary's lap is sleeping?\nWhom angels greet with anthems sweet,\nwhile shepherds watch are keeping?",
            "Why lies he in such mean estate\nwhere ox and ass are feeding?\nGood Christian, fear: for sinners here\nthe silent Word is pleading.",
            "So bring him incense, gold, and myrrh,\ncome, peasant, king, to own him.\nThe King of kings salvation brings;\nlet loving hearts enthrone him."
        ],
        "chorus": "This, this is Christ the King,\nwhom shepherds guard and angels sing:\nhaste, haste to bring him laud,\nthe babe, the son of Mary."
    },
    {
        "sequence": 60,
        "title": "God Rest Ye Merry, Gentlemen",
        "author": "Traditional English Carol",
        "verses": [
            "God rest ye merry, gentlemen,\nlet nothing you dismay,\nremember Christ our Savior\nwas born on Christmas Day\nto save us all from Satan's power\nwhen we were gone astray.",
            "From God our heavenly Father\na blessed angel came;\nand unto certain shepherds\nbrought tidings of the same:\nhow that in Bethlehem was born\nthe Son of God by name."
        ],
        "chorus": "O tidings of comfort and joy, comfort and joy;\nO tidings of comfort and joy."
    },
    {
        "sequence": 61,
        "title": "Immortal, Invisible, God Only Wise",
        "author": "Walter C. Smith, 1867",
        "verses": [
            "Immortal, invisible, God only wise,\nin light inaccessible hid from our eyes,\nmost blessed, most glorious, the Ancient of Days,\nalmighty, victorious, thy great name we praise.",
            "Unresting, unhasting, and silent as light,\nnor wanting, nor wasting, thou rulest in might;\nthy justice like mountains high soaring above\nthy clouds which are fountains of goodness and love.",
            "Great Father of glory, pure Father of light,\nthine angels adore thee, all veiling their sight;\nall praise we would render: O help us to see\n'tis only the splendor of light hideth thee."
        ]
    },
    {
        "sequence": 62,
        "title": "O Worship the King",
        "author": "Robert Grant, 1833",
        "verses": [
            "O worship the King all-glorious above,\nO gratefully sing his power and his love;\nour shield and defender, the Ancient of Days,\npavilioned in splendor and girded with praise.",
            "O tell of his might, O sing of his grace,\nwhose robe is the light, whose canopy space,\nhis chariots of wrath the deep thunderclouds form,\nand dark is his path on the wings of the storm.",
            "Thy bountiful care, what tongue can recite?\nIt breathes in the air, it shines in the light;\nit streams from the hills, it descends to the plain,\nand sweetly distills in the dew and the rain.",
            "Frail children of dust, and feeble as frail,\nin thee do we trust, nor find thee to fail;\nthy mercies how tender, how firm to the end,\nour Maker, Defender, Redeemer, and Friend!"
        ]
    },
    {
        "sequence": 63,
        "title": "This Is My Father's World",
        "author": "Maltbie D. Babcock, 1901",
        "verses": [
            "This is my Father's world,\nand to my listening ears\nall nature sings, and round me rings\nthe music of the spheres.\nThis is my Father's world:\nI rest me in the thought\nof rocks and trees, of skies and seas;\nhis hand the wonders wrought.",
            "This is my Father's world,\nthe birds their carols raise,\nthe morning light, the lily white,\ndeclare their Maker's praise.\nThis is my Father's world:\nhe shines in all that's fair;\nin the rustling grass I hear him pass;\nhe speaks to me everywhere.",
            "This is my Father's world.\nO let me ne'er forget\nthat though the wrong seems oft so strong,\nGod is the ruler yet.\nThis is my Father's world:\nthe battle is not done:\nJesus who died shall be satisfied,\nand earth and heaven be one."
        ]
    },
    {
        "sequence": 64,
        "title": "For the Beauty of the Earth",
        "author": "Folliott S. Pierpoint, 1864",
        "verses": [
            "For the beauty of the earth,\nfor the glory of the skies,\nfor the love which from our birth\nover and around us lies.",
            "For the beauty of each hour\nof the day and of the night,\nhill and vale, and tree and flower,\nsun and moon and stars of light.",
            "For the joy of ear and eye,\nfor the heart and mind's delight,\nfor the mystic harmony\nlinking sense to sound and sight.",
            "For the joy of human love,\nbrother, sister, parent, child,\nfriends on earth and friends above,\nfor all gentle thoughts and mild."
        ],
        "chorus": "Lord of all, to thee we raise\nthis our hymn of grateful praise."
    },
    {
        "sequence": 65,
        "title": "Come, Thou Almighty King",
        "author": "Anonymous, 1757",
        "verses": [
            "Come, thou Almighty King,\nhelp us thy name to sing,\nhelp us to praise:\nFather, all-glorious,\no'er all victorious,\ncome, and reign over us,\nAncient of Days.",
            "Come, thou Incarnate Word,\ngird on thy mighty sword,\nour prayer attend:\ncome, and thy people bless,\nand give thy word success;\nSpirit of holiness,\non us descend.",
            "Come, Holy Comforter,\nthy sacred witness bear\nin this glad hour:\nthou who almighty art,\nnow rule in every heart,\nand ne'er from us depart,\nSpirit of power."
        ]
    },
    {
        "sequence": 66,
        "title": "I Sing the Mighty Power of God",
        "author": "Isaac Watts, 1715",
        "verses": [
            "I sing the mighty power of God,\nthat made the mountains rise,\nthat spread the flowing seas abroad,\nand built the lofty skies.\nI sing the wisdom that ordained\nthe sun to rule the day;\nthe moon shines full at his command,\nand all the stars obey.",
            "I sing the goodness of the Lord,\nthat filled the earth with food,\nhe formed the creatures with his word,\nand then pronounced them good.\nLord, how thy wonders are displayed,\nwhere'er I turn mine eye,\nif I survey the ground I tread,\nor gaze upon the sky!",
            "There's not a plant or flower below,\nbut makes thy glories known,\nand clouds arise, and tempests blow,\nby order from thy throne;\nwhile all that borrows life from thee\nis ever in thy care;\nand everywhere that man can be,\nthou, God, art present there."
        ]
    },
    {
        "sequence": 67,
        "title": "Joyful, Joyful, We Adore Thee",
        "author": "Henry van Dyke, 1907",
        "verses": [
            "Joyful, joyful, we adore thee,\nGod of glory, Lord of love;\nhearts unfold like flowers before thee,\nopening to the sun above.\nMelt the clouds of sin and sadness;\ndrive the dark of doubt away;\nGiver of immortal gladness,\nfill us with the light of day!",
            "All thy works with joy surround thee,\nearth and heaven reflect thy rays,\nstars and angels sing around thee,\ncenter of unbroken praise.\nField and forest, vale and mountain,\nflowery meadow, flashing sea,\nchanting bird and flowing fountain\ncall us to rejoice in thee.",
            "Thou art giving and forgiving,\never blessing, ever blest,\nwellspring of the joy of living,\nocean depth of happy rest!\nThou our Father, Christ our Brother,\nall who live in love are thine;\nteach us how to love each other,\nlift us to the joy divine."
        ]
    },
    {
        "sequence": 68,
        "title": "For All the Saints",
        "author": "William W. How, 1864",
        "verses": [
            "For all the saints, who from their labors rest,\nwho thee by faith before the world confessed,\nthy name, O Jesus, be forever blest.\nAlleluia, Alleluia!",
            "Thou wast their rock, their fortress, and their might;\nthou, Lord, their captain in the well-fought fight;\nthou, in the darkness drear, their one true light.\nAlleluia, Alleluia!",
            "O may thy soldiers, faithful, true, and bold,\nfight as the saints who nobly fought of old,\nand win with them the victor's crown of gold.\nAlleluia, Alleluia!",
            "But lo! there breaks a yet more glorious day:\nthe saints triumphant rise in bright array;\nthe King of glory passes on his way.\nAlleluia, Alleluia!"
        ]
    },
    {
        "sequence": 69,
        "title": "All Creatures of Our God and King",
        "author": "Francis of Assisi, 1225; tr. William H. Draper, 1919",
        "verses": [
            "All creatures of our God and King,\nlift up your voice and with us sing,\nalleluia, alleluia!\nThou burning sun with golden beam,\nthou silver moon with softer gleam,",
            "Thou rushing wind that art so strong,\nye clouds that sail in heaven along,\nO praise him, alleluia!\nThou rising morn, in praise rejoice,\nye lights of evening, find a voice,",
            "Let all things their Creator bless,\nand worship him in humbleness,\nO praise him, alleluia!\nPraise, praise the Father, praise the Son,\nand praise the Spirit, Three in One,"
        ],
        "chorus": "O praise him, O praise him,\nalleluia, alleluia, alleluia!"
    },
    {
        "sequence": 70,
        "title": "Praise, My Soul, the King of Heaven",
        "author": "Henry F. Lyte, 1834",
        "verses": [
            "Praise, my soul, the King of heaven,\nto his feet thy tribute bring;\nransomed, healed, restored, forgiven,\nwho, like me, his praise should sing?\nPraise him, praise him, praise him, praise him,\npraise the everlasting King.",
            "Praise him for his grace and favor\nto our fathers in distress;\npraise him, still the same forever,\nslow to chide and swift to bless;\npraise him, praise him, praise him, praise him,\nglorious in his faithfulness.",
            "Father-like, he tends and spares us,\nwell our feeble frame he knows;\nin his hands he gently bears us,\nrescues us from all our foes;\npraise him, praise him, praise him, praise him,\nwidely as his mercy flows."
        ]
    },
    {
        "sequence": 71,
        "title": "And Can It Be That I Should Gain?",
        "author": "Charles Wesley, 1738",
        "verses": [
            "And can it be that I should gain\nan interest in the Savior's blood?\nDied he for me, who caused his pain?\nFor me, who him to death pursued?\nAmazing love! How can it be\nthat thou, my God, shouldst die for me?",
            "He left his Father's throne above\n(so free, so infinite his grace!),\nemptied himself of all but love,\nand bled for Adam's helpless race.\n'Tis mercy all, immense and free,\nfor O my God, it found out me!",
            "Long my imprisoned spirit lay,\nfast bound in sin and nature's night;\nthine eye diffused a quickening ray;\nI woke, the dungeon flamed with light;\nmy chains fell off, my heart was free,\nI rose, went forth, and followed thee.",
            "No condemnation now I dread;\nJesus, and all in him, is mine;\nalive in him, my living Head,\nand clothed in righteousness divine,\nbold I approach the eternal throne,\nand claim the crown, through Christ my own."
        ],
        "chorus": "Amazing love! How can it be\nthat thou, my God, shouldst die for me?"
    },
    {
        "sequence": 72,
        "title": "Jesus, Lover of My Soul",
        "author": "Charles Wesley, 1740",
        "verses": [
            "Jesus, lover of my soul,\nlet me to thy bosom fly,\nwhile the nearer waters roll,\nwhile the tempest still is high:\nhide me, O my Savior, hide,\ntill the storm of life is past;\nsafe into the haven guide,\nO receive my soul at last!",
            "Other refuge have I none;\nhangs my helpless soul on thee;\nleave, ah! leave me not alone,\nstill support and comfort me.\nAll my trust on thee is stayed,\nall my help from thee I bring;\ncover my defenseless head\nwith the shadow of thy wing.",
            "Plenteous grace with thee is found,\ngrace to cover all my sin;\nlet the healing streams abound;\nmake and keep me pure within.\nThou of life the fountain art,\nfreely let me take of thee;\nspring thou up within my heart,\nrise to all eternity."
        ]
    },
    {
        "sequence": 73,
        "title": "O Sacred Head, Now Wounded",
        "author": "Paul Gerhardt, 1656; tr. James W. Alexander, 1830",
        "verses": [
            "O sacred Head, now wounded,\nwith grief and shame weighed down;\nnow scornfully surrounded\nwith thorns, thine only crown;\nO sacred Head, what glory,\nwhat bliss till now was thine!\nYet, though despised and gory,\nI joy to call thee mine.",
            "What thou, my Lord, hast suffered\nwas all for sinners' gain:\nmine, mine was the transgression,\nbut thine the deadly pain.\nLo, here I fall, my Savior!\n'Tis I deserve thy place;\nlook on me with thy favor,\nvouchsafe to me thy grace.",
            "What language shall I borrow\nto thank thee, dearest Friend,\nfor this thy dying sorrow,\nthy pity without end?\nO make me thine forever;\nand should I fainting be,\nLord, let me never, never\noutlive my love to thee."
        ]
    },
    {
        "sequence": 74,
        "title": "The Old Rugged Cross",
        "author": "George Bennard, 1913",
        "verses": [
            "On a hill far away stood an old rugged cross,\nthe emblem of suffering and shame;\nand I love that old cross where the dearest and best\nfor a world of lost sinners was slain.",
            "O that old rugged cross, so despised by the world,\nhas a wondrous attraction for me;\nfor the dear Lamb of God left his glory above\nto bear it to dark Calvary.",
            "In that old rugged cross, stained with blood so divine,\na wondrous beauty I see,\nfor 'twas on that old cross Jesus suffered and died,\nto pardon and sanctify me."
        ],
        "chorus": "So I'll cherish the old rugged cross,\ntill my trophies at last I lay down;\nI will cling to the old rugged cross,\nand exchange it some day for a crown."
    },
    {
        "sequence": 75,
        "title": "Thine Be the Glory",
        "author": "Edmond Budry, 1884; tr. Richard B. Hoyle, 1923",
        "verses": [
            "Thine be the glory, risen, conquering Son;\nendless is the victory, thou o'er death hast won;\nangels in bright raiment rolled the stone away,\nkept the folded grave-clothes where thy body lay.",
            "Lo! Jesus meets us, risen from the tomb;\nlovingly he greets us, scatters fear and gloom;\nlet the church with gladness, hymns of triumph sing,\nfor her Lord now liveth, death hath lost its sting.",
            "No more we doubt thee, glorious Prince of life;\nlife is naught without thee; aid us in our strife;\nmake us more than conquerors, through thy deathless love:\nbring us safe through Jordan to thy home above."
        ],
        "chorus": "Thine be the glory, risen, conquering Son;\nendless is the victory, thou o'er death hast won."
    }
]

HYMN_DATA_2 = [
    {
        "sequence": 76,
        "title": "I Know That My Redeemer Lives",
        "author": "Samuel Medley, 1775",
        "verses": [
            "I know that my Redeemer lives;\nwhat comfort this sweet sentence gives!\nHe lives, he lives, who once was dead;\nhe lives, my ever-living Head.",
            "He lives triumphant from the grave,\nhe lives eternally to save,\nhe lives all-glorious in the sky,\nhe lives exalted there on high.",
            "He lives to bless me with his love,\nhe lives to plead for me above,\nhe lives my hungry soul to feed,\nhe lives to help in time of need.",
            "He lives, all glory to his name!\nHe lives, my Jesus, still the same.\nOh, the sweet joy this sentence gives:\nI know that my Redeemer lives!"
        ]
    },
    {
        "sequence": 77,
        "title": "Jesus Shall Reign Where'er the Sun",
        "author": "Isaac Watts, 1719",
        "verses": [
            "Jesus shall reign where'er the sun\ndoes his successive journeys run;\nhis kingdom stretch from shore to shore,\ntill moons shall wax and wane no more.",
            "To him shall endless prayer be made,\nand praises throng to crown his head;\nhis name like sweet perfume shall rise\nwith every morning sacrifice.",
            "People and realms of every tongue\ndwell on his love with sweetest song;\nand infant voices shall proclaim\ntheir early blessings on his name.",
            "Let every creature rise and bring\npeculiar honors to our King;\nangels descend with songs again,\nand earth repeat the loud amen!"
        ]
    },
    {
        "sequence": 78,
        "title": "My Hope Is Built on Nothing Less",
        "author": "Edward Mote, 1834",
        "verses": [
            "My hope is built on nothing less\nthan Jesus' blood and righteousness;\nI dare not trust the sweetest frame,\nbut wholly lean on Jesus' name.",
            "When darkness veils his lovely face,\nI rest on his unchanging grace;\nin every high and stormy gale,\nmy anchor holds within the veil.",
            "His oath, his covenant, his blood,\nsupport me in the whelming flood;\nwhen all around my soul gives way,\nhe then is all my hope and stay.",
            "When he shall come with trumpet sound,\nO may I then in him be found;\ndressed in his righteousness alone,\nfaultless to stand before the throne."
        ],
        "chorus": "On Christ, the solid Rock, I stand;\nall other ground is sinking sand,\nall other ground is sinking sand."
    },
    {
        "sequence": 79,
        "title": "Nothing but the Blood",
        "author": "Robert Lowry, 1876",
        "verses": [
            "What can wash away my sin?\nNothing but the blood of Jesus;\nwhat can make me whole again?\nNothing but the blood of Jesus.",
            "For my pardon, this I see,\nnothing but the blood of Jesus;\nfor my cleansing this my plea,\nnothing but the blood of Jesus.",
            "Nothing can for sin atone,\nnothing but the blood of Jesus;\nnaught of good that I have done,\nnothing but the blood of Jesus.",
            "This is all my hope and peace,\nnothing but the blood of Jesus;\nthis is all my righteousness,\nnothing but the blood of Jesus."
        ],
        "chorus": "Oh! precious is the flow\nthat makes me white as snow;\nno other fount I know,\nnothing but the blood of Jesus."
    },
    {
        "sequence": 80,
        "title": "Alas! and Did My Savior Bleed",
        "author": "Isaac Watts, 1707",
        "verses": [
            "Alas! and did my Savior bleed\nand did my Sovereign die?\nWould he devote that sacred head\nfor such a worm as I?",
            "Was it for crimes that I have done\nhe groaned upon the tree?\nAmazing pity! grace unknown!\nAnd love beyond degree!",
            "Well might the sun in darkness hide\nand shut his glories in,\nwhen Christ, the mighty Maker, died\nfor man the creature's sin.",
            "But drops of grief can ne'er repay\nthe debt of love I owe:\nhere, Lord, I give myself away;\n'tis all that I can do."
        ]
    },
    {
        "sequence": 81,
        "title": "Abide with Me",
        "author": "Henry F. Lyte, 1847",
        "verses": [
            "Abide with me: fast falls the eventide;\nthe darkness deepens; Lord, with me abide:\nwhen other helpers fail and comforts flee,\nhelp of the helpless, O abide with me.",
            "Swift to its close ebbs out life's little day;\nearth's joys grow dim, its glories pass away;\nchange and decay in all around I see;\nO thou who changest not, abide with me.",
            "I need thy presence every passing hour;\nwhat but thy grace can foil the tempter's power?\nWho, like thyself, my guide and stay can be?\nThrough cloud and sunshine, Lord, abide with me.",
            "Hold thou thy cross before my closing eyes;\nshine through the gloom and point me to the skies;\nheaven's morning breaks, and earth's vain shadows flee;\nin life, in death, O Lord, abide with me."
        ]
    },
    {
        "sequence": 82,
        "title": "Day by Day",
        "author": "Lina Sandell, 1865; tr. Andrew L. Skoog, 1898",
        "verses": [
            "Day by day, and with each passing moment,\nstrength I find, to meet my trials here;\ntrusting in my Father's wise bestowment,\nI've no cause for worry or for fear.\nHe whose heart is kind beyond all measure\ngives unto each day what he deems best--\nlovingly, its part of pain and pleasure,\nmingling toil with peace and rest.",
            "Every day the Lord himself is near me\nwith a special mercy for each hour;\nall my cares he fain would bear, and cheer me,\nhe whose name is Counselor and Power.\nThe protection of his child and treasure\nis a charge that on himself he laid;\n\"As thy days, thy strength shall be in measure,\"\nthis the pledge to me he made.",
            "Help me then in every tribulation\nso to trust thy promises, O Lord,\nthat I lose not faith's sweet consolation\noffered me within thy holy Word.\nHelp me, Lord, when toil and trouble meeting,\ne'er to take, as from a father's hand,\none by one, the days, the moments fleeting,\ntill I reach the promised land."
        ]
    },
    {
        "sequence": 83,
        "title": "God Will Take Care of You",
        "author": "Civilla D. Martin, 1904",
        "verses": [
            "Be not dismayed whate'er betide,\nGod will take care of you;\nbeneath his wings of love abide,\nGod will take care of you.",
            "Through days of toil when heart doth fail,\nGod will take care of you;\nwhen dangers fierce your path assail,\nGod will take care of you.",
            "All you may need he will provide,\nGod will take care of you;\nnothing you ask will be denied,\nGod will take care of you."
        ],
        "chorus": "God will take care of you,\nthrough every day, o'er all the way;\nhe will take care of you,\nGod will take care of you."
    },
    {
        "sequence": 84,
        "title": "He Hideth My Soul",
        "author": "Fanny Crosby, 1890",
        "verses": [
            "A wonderful Savior is Jesus my Lord,\na wonderful Savior to me;\nhe hideth my soul in the cleft of the rock,\nwhere rivers of pleasure I see.",
            "A wonderful Savior is Jesus my Lord,\nhe taketh my burden away;\nhe holdeth me up, and I shall not be moved,\nhe giveth me strength as my day.",
            "With numberless blessings each moment he crowns,\nand filled with his fullness divine,\nI sing in my rapture, O glory to God\nfor such a Redeemer as mine!"
        ],
        "chorus": "He hideth my soul in the cleft of the rock\nthat shadows a dry, thirsty land;\nhe hideth my life in the depths of his love,\nand covers me there with his hand,\nand covers me there with his hand."
    },
    {
        "sequence": 85,
        "title": "Jesus, Keep Me Near the Cross",
        "author": "Fanny Crosby, 1869",
        "verses": [
            "Jesus, keep me near the cross,\nthere a precious fountain\nfree to all, a healing stream\nflows from Calvary's mountain.",
            "Near the cross, a trembling soul,\nlove and mercy found me;\nthere the bright and morning star\nsheds its beams around me.",
            "Near the cross I'll watch and wait\nhoping, trusting ever,\ntill I reach the golden strand\njust beyond the river."
        ],
        "chorus": "In the cross, in the cross,\nbe my glory ever;\ntill my raptured soul shall find\nrest beyond the river."
    },
    {
        "sequence": 86,
        "title": "Pass Me Not, O Gentle Savior",
        "author": "Fanny Crosby, 1868",
        "verses": [
            "Pass me not, O gentle Savior,\nhear my humble cry;\nwhile on others thou art calling,\ndo not pass me by.",
            "Let me at a throne of mercy\nfind a sweet relief,\nkneeling there in deep contrition;\nhelp my unbelief.",
            "Trusting only in thy merit,\nwould I seek thy face;\nheal my wounded, broken spirit,\nsave me by thy grace.",
            "Thou the Spring of all my comfort,\nmore than life to me,\nwhom have I on earth beside thee?\nWhom in heaven but thee?"
        ],
        "chorus": "Savior, Savior,\nhear my humble cry;\nwhile on others thou art calling,\ndo not pass me by."
    },
    {
        "sequence": 87,
        "title": "Savior, Like a Shepherd Lead Us",
        "author": "Dorothy A. Thrupp, 1836",
        "verses": [
            "Savior, like a shepherd lead us,\nmuch we need thy tender care;\nin thy pleasant pastures feed us,\nfor our use thy folds prepare.\nBlessed Jesus, blessed Jesus!\nThou hast bought us, thine we are.\nBlessed Jesus, blessed Jesus!\nThou hast bought us, thine we are.",
            "We are thine, do thou befriend us,\nbe the guardian of our way;\nkeep thy flock, from sin defend us,\nseek us when we go astray.\nBlessed Jesus, blessed Jesus!\nHear, O hear us when we pray.\nBlessed Jesus, blessed Jesus!\nHear, O hear us when we pray.",
            "Thou hast promised to receive us,\npoor and sinful though we be;\nthou hast mercy to relieve us,\ngrace to cleanse and power to free.\nBlessed Jesus, blessed Jesus!\nWe will early turn to thee.\nBlessed Jesus, blessed Jesus!\nWe will early turn to thee."
        ]
    },
    {
        "sequence": 88,
        "title": "Sun of My Soul",
        "author": "John Keble, 1820",
        "verses": [
            "Sun of my soul, thou Savior dear,\nit is not night if thou be near;\nO may no earth-born cloud arise\nto hide thee from thy servant's eyes.",
            "When the soft dews of kindly sleep\nmy weary eyelids gently steep,\nbe my last thought, how sweet to rest\nforever on my Savior's breast.",
            "Abide with me from morn till eve,\nfor without thee I cannot live;\nabide with me when night is nigh,\nfor without thee I dare not die."
        ]
    },
    {
        "sequence": 89,
        "title": "Tell Me the Old, Old Story",
        "author": "A. Catherine Hankey, 1866",
        "verses": [
            "Tell me the old, old story\nof unseen things above,\nof Jesus and his glory,\nof Jesus and his love.\nTell me the story simply,\nas to a little child,\nfor I am weak and weary,\nand helpless and defiled.",
            "Tell me the story slowly,\nthat I may take it in--\nthat wonderful redemption,\nGod's remedy for sin.\nTell me the story often,\nfor I forget so soon;\nthe early dew of morning\nhas passed away at noon.",
            "Tell me the story softly,\nwith earnest tones and grave;\nremember I'm the sinner\nwhom Jesus came to save.\nTell me the story always,\nif you would really be,\nin any time of trouble,\na comforter to me."
        ],
        "chorus": "Tell me the old, old story,\ntell me the old, old story,\ntell me the old, old story,\nof Jesus and his love."
    },
    {
        "sequence": 90,
        "title": "Standing on the Promises",
        "author": "R. Kelso Carter, 1886",
        "verses": [
            "Standing on the promises of Christ my King,\nthrough eternal ages let his praises ring,\nglory in the highest, I will shout and sing,\nstanding on the promises of God.",
            "Standing on the promises that cannot fail,\nwhen the howling storms of doubt and fear assail,\nby the living Word of God I shall prevail,\nstanding on the promises of God.",
            "Standing on the promises I now can see\nperfect, present cleansing in the blood for me;\nstanding in the liberty where Christ makes free,\nstanding on the promises of God."
        ],
        "chorus": "Standing, standing,\nstanding on the promises of God my Savior;\nstanding, standing,\nI'm standing on the promises of God."
    },
    {
        "sequence": 91,
        "title": "Blest Be the Tie That Binds",
        "author": "John Fawcett, 1782",
        "verses": [
            "Blest be the tie that binds\nour hearts in Christian love;\nthe fellowship of kindred minds\nis like to that above.",
            "Before our Father's throne\nwe pour our ardent prayers;\nour fears, our hopes, our aims are one,\nour comforts and our cares.",
            "We share our mutual woes,\nour mutual burdens bear,\nand often for each other flows\nthe sympathizing tear.",
            "When we asunder part,\nit gives us inward pain;\nbut we shall still be joined in heart,\nand hope to meet again."
        ]
    },
    {
        "sequence": 92,
        "title": "Onward, Christian Soldiers",
        "author": "Sabine Baring-Gould, 1865",
        "verses": [
            "Onward, Christian soldiers, marching as to war,\nwith the cross of Jesus going on before.\nChrist, the royal Master, leads against the foe;\nforward into battle see his banners go!",
            "Like a mighty army moves the church of God;\nbrothers, we are treading where the saints have trod.\nWe are not divided, all one body we,\none in hope and doctrine, one in charity.",
            "Onward, then, ye people, join our happy throng,\nblend with ours your voices in the triumph song.\nGlory, laud, and honor unto Christ the King,\nthis through countless ages men and angels sing."
        ],
        "chorus": "Onward, Christian soldiers, marching as to war,\nwith the cross of Jesus going on before."
    },
    {
        "sequence": 93,
        "title": "Rescue the Perishing",
        "author": "Fanny Crosby, 1869",
        "verses": [
            "Rescue the perishing, care for the dying,\nsnatch them in pity from sin and the grave;\nweep o'er the erring one, lift up the fallen,\ntell them of Jesus, the mighty to save.",
            "Though they are slighting him, still he is waiting,\nwaiting the penitent child to receive;\nplead with them earnestly, plead with them gently;\nhe will forgive if they only believe.",
            "Down in the human heart, crushed by the tempter,\nfeelings lie buried that grace can restore;\ntouched by a loving heart, wakened by kindness,\nchords that were broken will vibrate once more.",
            "Rescue the perishing, duty demands it;\nstrength for thy labor the Lord will provide;\nback to the narrow way patiently win them;\ntell the poor wanderer a Savior has died."
        ],
        "chorus": "Rescue the perishing, care for the dying,\nJesus is merciful, Jesus will save."
    },
    {
        "sequence": 94,
        "title": "Shall We Gather at the River",
        "author": "Robert Lowry, 1864",
        "verses": [
            "Shall we gather at the river,\nwhere bright angel feet have trod,\nwith its crystal tide forever\nflowing by the throne of God?",
            "On the margin of the river,\nwashing up its silver spray,\nwe will walk and worship ever,\nall the happy golden day.",
            "Soon we'll reach the shining river,\nsoon our pilgrimage will cease;\nsoon our happy hearts will quiver\nwith the melody of peace."
        ],
        "chorus": "Yes, we'll gather at the river,\nthe beautiful, the beautiful river;\ngather with the saints at the river\nthat flows by the throne of God."
    },
    {
        "sequence": 95,
        "title": "When the Roll Is Called Up Yonder",
        "author": "James M. Black, 1893",
        "verses": [
            "When the trumpet of the Lord shall sound and time shall be no more,\nand the morning breaks, eternal, bright and fair;\nwhen the saved of earth shall gather over on the other shore,\nand the roll is called up yonder, I'll be there.",
            "On that bright and cloudless morning when the dead in Christ shall rise,\nand the glory of his resurrection share;\nwhen his chosen ones shall gather to their home beyond the skies,\nand the roll is called up yonder, I'll be there.",
            "Let us labor for the Master from the dawn till setting sun,\nlet us talk of all his wondrous love and care;\nthen when all of life is over and our work on earth is done,\nand the roll is called up yonder, I'll be there."
        ],
        "chorus": "When the roll is called up yonder,\nwhen the roll is called up yonder,\nwhen the roll is called up yonder,\nwhen the roll is called up yonder, I'll be there."
    },
    {
        "sequence": 96,
        "title": "We Gather Together",
        "author": "Adrianus Valerius, 1597; tr. Theodore Baker, 1894",
        "verses": [
            "We gather together to ask the Lord's blessing;\nhe chastens and hastens his will to make known;\nthe wicked oppressing now cease from distressing,\nsing praises to his name; he forgets not his own.",
            "Beside us to guide us, our God with us joining,\nordaining, maintaining his kingdom divine;\nso from the beginning the fight we were winning;\nthe Lord was at our side, all glory be thine!",
            "We all do extol thee, thou leader triumphant,\nand pray that thou still our defender wilt be.\nLet thy congregation escape tribulation;\nthy name be ever praised! O Lord, make us free!"
        ]
    },
    {
        "sequence": 97,
        "title": "Now Thank We All Our God",
        "author": "Martin Rinkart, 1636; tr. Catherine Winkworth, 1858",
        "verses": [
            "Now thank we all our God,\nwith heart and hands and voices,\nwho wondrous things has done,\nin whom this world rejoices;\nwho from our mothers' arms\nhas blessed us on our way\nwith countless gifts of love,\nand still is ours today.",
            "O may this bounteous God\nthrough all our life be near us,\nwith ever joyful hearts\nand blessed peace to cheer us;\nand keep us in his grace,\nand guide us when perplexed;\nand free us from all ills,\nin this world and the next.",
            "All praise and thanks to God\nthe Father now be given;\nthe Son, and him who reigns\nwith them in highest heaven;\nthe one eternal God,\nwhom earth and heaven adore;\nfor thus it was, is now,\nand shall be evermore."
        ],
        "chorus": ""
    },
    {
        "sequence": 98,
        "title": "Lead On, O King Eternal",
        "author": "Ernest W. Shurtleff, 1887",
        "verses": [
            "Lead on, O King eternal,\nthe day of march has come;\nhenceforth in fields of conquest\nthy tents shall be our home.\nThrough days of preparation\nthy grace has made us strong;\nand now, O King eternal,\nwe lift our battle song.",
            "Lead on, O King eternal,\ntill sin's fierce war shall cease,\nand holiness shall whisper\nthe sweet amen of peace.\nFor not with swords loud clashing,\nnor roll of stirring drums,\nbut deeds of love and mercy\nthe heavenly kingdom comes.",
            "Lead on, O King eternal,\nwe follow, not with fears;\nfor gladness breaks like morning\nwhere'er thy face appears.\nThy cross is lifted o'er us;\nwe journey in its light;\nthe crown awaits the conquest;\nlead on, O God of might."
        ]
    },
    {
        "sequence": 99,
        "title": "Glorious Things of Thee Are Spoken",
        "author": "John Newton, 1779",
        "verses": [
            "Glorious things of thee are spoken,\nZion, city of our God;\nhe whose word cannot be broken\nformed thee for his own abode:\non the Rock of Ages founded,\nwhat can shake thy sure repose?\nWith salvation's walls surrounded,\nthou mayest smile at all thy foes.",
            "See, the streams of living waters,\nspringing from eternal love,\nwell supply thy sons and daughters,\nand all fear of want remove;\nwho can faint, while such a river\never flows their thirst to assuage?\nGrace which, like the Lord, the giver,\nnever fails from age to age.",
            "Round each habitation hovering,\nsee the cloud and fire appear\nfor a glory and a covering,\nshowing that the Lord is near!\nThus deriving from their banner\nlight by night and shade by day,\nsafe they feed upon the manna\nwhich he gives them when they pray."
        ]
    },
    {
        "sequence": 100,
        "title": "Near to the Heart of God",
        "author": "Cleland B. McAfee, 1901",
        "verses": [
            "There is a place of quiet rest,\nnear to the heart of God;\na place where sin cannot molest,\nnear to the heart of God.",
            "There is a place of comfort sweet,\nnear to the heart of God;\na place where we our Savior meet,\nnear to the heart of God.",
            "There is a place of full release,\nnear to the heart of God;\na place where all is joy and peace,\nnear to the heart of God."
        ],
        "chorus": "O Jesus, blest Redeemer,\nsent from the heart of God,\nhold us who wait before thee\nnear to the heart of God."
    }
]


HYMN_DATA = HYMN_DATA_1 + HYMN_DATA_2

def generate_snake_case(title):
    return title.lower().replace(" ", "_").replace("'", "").replace("!", "").replace(",", "").replace("?", "").replace(".", "")

def format_hymn_markdown(hymn):
    # Format verses
    verse_html = ""
    for i, verse in enumerate(hymn["verses"]):
        lines = verse.split('\n')
        html_lines = []
        for j, line in enumerate(lines):
            # Check if it's the last line of the verse
            if j == len(lines) - 1:
                html_lines.append(line)
            else:
                html_lines.append(line + "<br>")

        verse_content = "\n".join(html_lines)
        verse_html += f"""<div class="hymn-verse">
{i + 1}. {verse_content}
</div>
"""
        # Add spacing between verses if needed, but existing format just lists them
        verse_html += "\n"

    # Format chorus if exists
    chorus_html = ""
    if "chorus" in hymn and hymn["chorus"].strip():
        lines = hymn["chorus"].split('\n')
        html_lines = []
        for j, line in enumerate(lines):
            if j == len(lines) - 1:
                html_lines.append(line)
            else:
                html_lines.append(line + "<br>")
        chorus_content = "\n".join(html_lines)

        chorus_html = f"""<div class="hymn-chorus">
Chorus:<br>
{chorus_content}
</div>
"""
        # Insert chorus after first verse usually?

        # Split verse_html into first verse and the rest
        parts = verse_html.split('</div>\n\n', 1)
        if len(parts) == 2:
            verse_html = parts[0] + '</div>\n\n' + chorus_html + '\n' + parts[1]
        else:
            # If only one verse?
            verse_html = verse_html + '\n' + chorus_html

    # Author
    author_html = f'<div class="hymn-author">{hymn["author"]}</div>'

    return f"""## {hymn["sequence"]}. {hymn["title"]}

<div class="hymn">

{verse_html.strip()}

{author_html}
</div>"""

def main():
    print("Checking for hymn_audio_map.json...")
    audio_map = {}
    if os.path.exists("hymn_audio_map.json"):
        try:
            with open("hymn_audio_map.json", "r") as f:
                content = f.read()
                if content:
                    audio_map = json.loads(content)
                    print("Loaded audio map.")
        except Exception as e:
            print(f"Error loading map: {e}")
    else:
        print("hymn_audio_map.json not found. Proceeding with empty audio URLs.")

    # 1. Generate Markdown Files
    # We group by 10s: 06_hymns.md (51-60), etc.

    groups = {}
    for i in range(5, 10):
        groups[i + 1] = []

    for hymn in HYMN_DATA:
        seq = hymn["sequence"]
        group_num = ((seq - 1) // 10) + 1
        groups[group_num].append(hymn)

    for group_num, hymns in groups.items():
        filename = f"public/books/reformed-hymns/{group_num:02d}_hymns.md"
        start_seq = (group_num - 1) * 10 + 1
        end_seq = group_num * 10

        content = f"# Hymns {start_seq}-{end_seq}\n\n"

        for hymn in hymns:
            content += format_hymn_markdown(hymn) + "\n\n"

        with open(filename, "w") as f:
            f.write(content.strip() + "\n")
        print(f"Generated {filename}")

    # 2. Update metadata.json
    try:
        with open("public/books/reformed-hymns/metadata.json", "r") as f:
            metadata = json.load(f)

        existing_nums = [c["chapterNumber"] for c in metadata["chapters"]]

        for group_num in range(6, 11):
            if group_num not in existing_nums:
                start = (group_num - 1) * 10 + 1
                end = group_num * 10
                metadata["chapters"].append({
                    "filepath": f"{group_num:02d}_hymns.md",
                    "chapterNumber": group_num,
                    "title": f"Hymns {start}-{end}"
                })

        with open("public/books/reformed-hymns/metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        print("Updated metadata.json")

    except Exception as e:
        print(f"Warning: Could not update metadata.json: {e}")

    # 3. Generate SQL Migration
    print("Generating migration...")

    values_list = []

    for hymn in HYMN_DATA:
        title = hymn["title"]
        snake_title = generate_snake_case(title)
        audio_url = audio_map.get(title, "")

        db_content_lines = []
        for verse in hymn["verses"]:
             db_content_lines.append(verse)

        if "chorus" in hymn and hymn["chorus"].strip():
            db_content_lines.append("Chorus:\n" + hymn["chorus"])

        full_text = "\n\n".join(db_content_lines)

        # Escape single quotes for SQL
        full_text_escaped = full_text.replace("'", "''")
        title_escaped = title.replace("'", "''")
        author_escaped = hymn["author"].replace("'", "''")

        values_list.append(f"('{snake_title}', 'hymn', 'classic_hymns', {hymn['sequence']}, '{title_escaped}', '{full_text_escaped}', '{author_escaped}', '{audio_url}')")

    sql_content = f"""-- Migration: Add Hymns 51-100
INSERT INTO liturgy_items (id, type, source, sequence_number, title, content, reference, audio_url) VALUES
{",\n".join(values_list)};
"""

    with open("cloudflare/migrations/0031_more_hymns.sql", "w") as f:
        f.write(sql_content)

    print("Generated cloudflare/migrations/0031_more_hymns.sql")

if __name__ == "__main__":
    main()
