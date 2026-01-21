-- Migration v2_0011: Restore Hymn Audio URLs
-- Adds audio_url column to formations (missed during v2 overhaul) and populates it with sermon audio links.

-- 1. Add column if it doesn't exist. 
-- Note: SQLite does not support IF NOT EXISTS in ADD COLUMN. 
-- We assume it's missing based on previous schema state.
ALTER TABLE formations ADD COLUMN audio_url TEXT;

-- 2. Update Formations with Audio URLs
-- Source: Legacy Migration 0030

UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/92314738204/92314738204.mp3' WHERE title = 'A Mighty Fortress Is Our God';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/312181423516/312181423516.mp3' WHERE title = 'All People That on Earth Do Dwell';
-- No audio found for: Amazing Grace
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/122221164622721/122221164622721.mp3' WHERE title = 'Holy, Holy, Holy!';
-- No audio found for: How Firm a Foundation
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/11619236414233/11619236414233.mp3' WHERE title = 'It Is Well with My Soul';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/21224164577684/21224164577684.mp3' WHERE title = 'Love Divine, All Loves Excelling';
-- No audio found for: Praise to the Lord, the Almighty
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/1223211826221039/1223211826221039.mp3' WHERE title = 'Be Thou My Vision';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/4132381695143/4132381695143.mp3' WHERE title = 'Great Is Thy Faithfulness';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/7131518503910/7131518503910.mp3' WHERE title = 'Rock of Ages';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/83181211360/83181211360.mp3' WHERE title = 'Come, Thou Fount of Every Blessing';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/1019231521252297/1019231521252297.mp3' WHERE title = 'Crown Him with Many Crowns';
-- No audio found for: Christ the Lord Is Risen Today
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/12292384606600/12292384606600.mp3' WHERE title = 'Man of Sorrows! What a Name';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/312181420372/312181420372.mp3' WHERE title = 'The Church''s One Foundation';
-- No audio found for: Guide Me, O Thou Great Jehovah
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/3281975454126/3281975454126.mp3' WHERE title = 'What a Friend We Have in Jesus';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/11524225966883/11524225966883.mp3' WHERE title = 'Blessed Assurance';
-- No audio found for: To God Be the Glory
-- No audio found for: All Hail the Power of Jesus'' Name
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/112023042572057/112023042572057.mp3' WHERE title = 'Fairest Lord Jesus';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/112422635243344/112422635243344.mp3' WHERE title = 'He Leadeth Me';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/51022937102757/51022937102757.mp3' WHERE title = 'I Need Thee Every Hour';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/1018181735367/1018181735367.mp3' WHERE title = 'Jesus Paid It All';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/10820916503099/10820916503099.mp3' WHERE title = 'Just as I Am';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/4232322043680/4232322043680.mp3' WHERE title = 'Nearer, My God, to Thee';
-- No audio found for: O For a Thousand Tongues to Sing
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/48232357536493/48232357536493.mp3' WHERE title = 'Stand Up, Stand Up for Jesus';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/53021224312117/53021224312117.mp3' WHERE title = 'Sweet Hour of Prayer';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/728242126225321/728242126225321.mp3' WHERE title = 'Take My Life and Let It Be';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/32524154263606/32524154263606.mp3' WHERE title = 'There Is a Fountain Filled with Blood';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/41221157156111/41221157156111.mp3' WHERE title = '''Tis So Sweet to Trust in Jesus';
-- No audio found for: Trust and Obey
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/52123938365444/52123938365444.mp3' WHERE title = 'Turn Your Eyes upon Jesus';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/432355387519/432355387519.mp3' WHERE title = 'When I Survey the Wondrous Cross';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/36131311420/36131311420.mp3' WHERE title = 'At the Cross';
-- No audio found for: Count Your Blessings
-- No audio found for: Doxology
-- No audio found for: Glory Be to the Father
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/62022176336628/62022176336628.mp3' WHERE title = 'God of Our Fathers';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/8222944477/8222944477.mp3' WHERE title = 'Have Thine Own Way, Lord';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/10122830437322/10122830437322.mp3' WHERE title = 'Higher Ground';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/101019172442776/101019172442776.mp3' WHERE title = 'I Surrender All';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/1311110010625/1311110010625.mp3' WHERE title = 'In the Garden';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/9522122148836/9522122148836.mp3' WHERE title = 'Leaning on the Everlasting Arms';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/61121830443458/61121830443458.mp3' WHERE title = 'My Jesus, I Love Thee';
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/4292423361149/4292423361149.mp3' WHERE title = 'Revive Us Again';
-- No audio found for: Softly and Tenderly
UPDATE formations SET audio_url = 'https://mp3.sermonaudio.com/filearea/311232112132644/311232112132644.mp3' WHERE title = 'Faith of Our Fathers';
