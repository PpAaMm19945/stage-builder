-- Migration: Add 5 New Hymns (51-55)
-- Source: /public/books/reformed-hymns/06_hymns.md
-- Note: audio_url is set to NULL as reliable direct links were not available at time of migration.
-- Administrators should update these with valid MP3 URLs when available.

INSERT INTO formations (
    id,
    title,
    formation_type,
    primary_virtue,
    biblical_faculty,
    description,
    liturgical_script,
    context_anchor,
    min_age_months,
    max_age_months,
    audio_url
) VALUES (
    'hymn_abide_with_me',
    'Abide With Me',
    'liturgy',
    'Worship',
    'Affection',
    '1. Abide with me: fast falls the eventide;

The darkness deepens; Lord, with me abide.

(Full hymn available)',
    '<div class="hymn">

<div class="hymn-verse">
1. Abide with me: fast falls the eventide;<br>
The darkness deepens; Lord, with me abide.<br>
When other helpers fail and comforts flee,<br>
Help of the helpless, O abide with me.
</div>

<div class="hymn-verse">
2. Swift to its close ebbs out life''s little day;<br>
Earth''s joys grow dim, its glories pass away.<br>
Change and decay in all around I see;<br>
O Thou who changest not, abide with me.
</div>

<div class="hymn-verse">
3. I need Thy presence every passing hour;<br>
What but Thy grace can foil the tempter''s power?<br>
Who like Thyself my guide and stay can be?<br>
Through cloud and sunshine, O abide with me.
</div>

<div class="hymn-verse">
4. Hold Thou Thy cross before my closing eyes;<br>
Shine through the gloom and point me to the skies.<br>
Heaven''s morning breaks, and earth''s vain shadows flee;<br>
In life, in death, O Lord, abide with me.
</div>

<div class="hymn-author">Henry F. Lyte, 1847</div>
</div>',
    'Morning_Circle',
    0,
    216,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    liturgical_script = EXCLUDED.liturgical_script;

INSERT INTO formations (
    id,
    title,
    formation_type,
    primary_virtue,
    biblical_faculty,
    description,
    liturgical_script,
    context_anchor,
    min_age_months,
    max_age_months,
    audio_url
) VALUES (
    'hymn_the_solid_rock',
    'The Solid Rock',
    'liturgy',
    'Worship',
    'Affection',
    '1. My hope is built on nothing less

Than Jesus'' blood and righteousness;

I dare not trust the sweetest frame,

But wholly lean on Jesus'' name.

(Full hymn available)',
    '<div class="hymn">

<div class="hymn-verse">
1. My hope is built on nothing less<br>
Than Jesus'' blood and righteousness;<br>
I dare not trust the sweetest frame,<br>
But wholly lean on Jesus'' name.
</div>

<div class="hymn-chorus">
Chorus:<br>
On Christ, the solid Rock, I stand;<br>
All other ground is sinking sand,<br>
All other ground is sinking sand.
</div>

<div class="hymn-verse">
2. When darkness veils His lovely face,<br>
I rest on His unchanging grace;<br>
In every high and stormy gale,<br>
My anchor holds within the veil.
</div>

<div class="hymn-verse">
3. His oath, His covenant, His blood,<br>
Support me in the whelming flood;<br>
When all around my soul gives way,<br>
He then is all my hope and stay.
</div>

<div class="hymn-verse">
4. When He shall come with trumpet sound,<br>
O may I then in Him be found;<br>
Dressed in His righteousness alone,<br>
Faultless to stand before the throne.
</div>

<div class="hymn-author">Edward Mote, 1834</div>
</div>',
    'Morning_Circle',
    0,
    216,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    liturgical_script = EXCLUDED.liturgical_script;

INSERT INTO formations (
    id,
    title,
    formation_type,
    primary_virtue,
    biblical_faculty,
    description,
    liturgical_script,
    context_anchor,
    min_age_months,
    max_age_months,
    audio_url
) VALUES (
    'hymn_and_can_it_be',
    'And Can It Be',
    'liturgy',
    'Worship',
    'Affection',
    '1. And can it be that I should gain

An interest in the Savior''s blood?

Died He for me, who caused His pain?

For me, who Him to death pursued?

(Full hymn available)',
    '<div class="hymn">

<div class="hymn-verse">
1. And can it be that I should gain<br>
An interest in the Savior''s blood?<br>
Died He for me, who caused His pain?<br>
For me, who Him to death pursued?<br>
Amazing love! how can it be,<br>
That Thou, my God, shouldst die for me?
</div>

<div class="hymn-chorus">
Chorus:<br>
Amazing love! how can it be,<br>
That Thou, my God, shouldst die for me?
</div>

<div class="hymn-verse">
2. He left His Father''s throne above<br>
So free, so infinite His grace!<br>
Emptied Himself of all but love,<br>
And bled for Adam''s helpless race.<br>
''Tis mercy all, immense and free,<br>
For O my God, it found out me!
</div>

<div class="hymn-verse">
3. Long my imprisoned spirit lay,<br>
Fast bound in sin and nature''s night;<br>
Thine eye diffused a quickening ray,<br>
I woke, the dungeon flamed with light;<br>
My chains fell off, my heart was free,<br>
I rose, went forth, and followed Thee.
</div>

<div class="hymn-verse">
4. No condemnation now I dread;<br>
Jesus, and all in Him, is mine;<br>
Alive in Him, my living Head,<br>
And clothed in righteousness divine,<br>
Bold I approach the eternal throne,<br>
And claim the crown, through Christ my own.
</div>

<div class="hymn-author">Charles Wesley, 1738</div>
</div>',
    'Morning_Circle',
    0,
    216,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    liturgical_script = EXCLUDED.liturgical_script;

INSERT INTO formations (
    id,
    title,
    formation_type,
    primary_virtue,
    biblical_faculty,
    description,
    liturgical_script,
    context_anchor,
    min_age_months,
    max_age_months,
    audio_url
) VALUES (
    'hymn_this_is_my_fathers_world',
    'This Is My Father''s World',
    'liturgy',
    'Worship',
    'Affection',
    '1. This is my Father''s world,

And to my listening ears

All nature sings, and round me rings

The music of the spheres.

(Full hymn available)',
    '<div class="hymn">

<div class="hymn-verse">
1. This is my Father''s world,<br>
And to my listening ears<br>
All nature sings, and round me rings<br>
The music of the spheres.<br>
This is my Father''s world:<br>
I rest me in the thought<br>
Of rocks and trees, of skies and seas;<br>
His hand the wonders wrought.
</div>

<div class="hymn-verse">
2. This is my Father''s world,<br>
The birds their carols raise,<br>
The morning light, the lily white,<br>
Declare their Maker''s praise.<br>
This is my Father''s world:<br>
He shines in all that''s fair;<br>
In the rustling grass I hear Him pass;<br>
He speaks to me everywhere.
</div>

<div class="hymn-verse">
3. This is my Father''s world,<br>
O let me ne''er forget<br>
That though the wrong seems oft so strong,<br>
God is the ruler yet.<br>
This is my Father''s world:<br>
The battle is not done:<br>
Jesus who died shall be satisfied,<br>
And earth and heaven be one.
</div>

<div class="hymn-author">Maltbie D. Babcock, 1901</div>
</div>',
    'Morning_Circle',
    0,
    216,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    liturgical_script = EXCLUDED.liturgical_script;

INSERT INTO formations (
    id,
    title,
    formation_type,
    primary_virtue,
    biblical_faculty,
    description,
    liturgical_script,
    context_anchor,
    min_age_months,
    max_age_months,
    audio_url
) VALUES (
    'hymn_what_wondrous_love_is_this',
    'What Wondrous Love Is This',
    'liturgy',
    'Worship',
    'Affection',
    '1. What wondrous love is this, O my soul, O my soul!

What wondrous love is this, O my soul!

(Full hymn available)',
    '<div class="hymn">

<div class="hymn-verse">
1. What wondrous love is this, O my soul, O my soul!<br>
What wondrous love is this, O my soul!<br>
What wondrous love is this<br>
That caused the Lord of bliss<br>
To bear the dreadful curse for my soul, for my soul,<br>
To bear the dreadful curse for my soul.
</div>

<div class="hymn-verse">
2. When I was sinking down, sinking down, sinking down,<br>
When I was sinking down, sinking down,<br>
When I was sinking down<br>
Beneath God''s righteous frown,<br>
Christ laid aside His crown for my soul, for my soul,<br>
Christ laid aside His crown for my soul.
</div>

<div class="hymn-verse">
3. To God and to the Lamb, I will sing, I will sing;<br>
To God and to the Lamb, I will sing;<br>
To God and to the Lamb,<br>
Who is the great I AM,<br>
While millions join the theme, I will sing, I will sing,<br>
While millions join the theme, I will sing.
</div>

<div class="hymn-verse">
4. And when from death I''m free, I''ll sing on, I''ll sing on;<br>
And when from death I''m free, I''ll sing on;<br>
And when from death I''m free,<br>
I''ll sing His love for me,<br>
And through eternity I''ll sing on, I''ll sing on,<br>
And through eternity I''ll sing on.
</div>

<div class="hymn-author">American Folk Hymn, 1811</div>
</div>',
    'Morning_Circle',
    0,
    216,
    NULL
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    liturgical_script = EXCLUDED.liturgical_script;
