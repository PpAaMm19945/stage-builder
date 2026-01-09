import urllib.request
import urllib.parse
import re
import time
import json
import sys

HYMNS = [
    "Joy to the World",
    "Hark! The Herald Angels Sing",
    "O Come, All Ye Faithful",
    "Silent Night",
    "Angels We Have Heard on High",
    "The First Noel",
    "O Little Town of Bethlehem",
    "Away in a Manger",
    "What Child Is This?",
    "God Rest Ye Merry, Gentlemen",
    "Immortal, Invisible, God Only Wise",
    "O Worship the King",
    "This Is My Father's World",
    "For the Beauty of the Earth",
    "Come, Thou Almighty King",
    "I Sing the Mighty Power of God",
    "Joyful, Joyful, We Adore Thee",
    "For All the Saints",
    "All Creatures of Our God and King",
    "Praise, My Soul, the King of Heaven",
    "And Can It Be That I Should Gain?",
    "Jesus, Lover of My Soul",
    "O Sacred Head, Now Wounded",
    "The Old Rugged Cross",
    "Thine Be the Glory",
    "I Know That My Redeemer Lives",
    "Jesus Shall Reign Where'er the Sun",
    "My Hope Is Built on Nothing Less",
    "Nothing but the Blood",
    "Alas! and Did My Savior Bleed",
    "Abide with Me",
    "Day by Day",
    "God Will Take Care of You",
    "He Hideth My Soul",
    "Jesus, Keep Me Near the Cross",
    "Pass Me Not, O Gentle Savior",
    "Savior, Like a Shepherd Lead Us",
    "Sun of My Soul",
    "Tell Me the Old, Old Story",
    "Standing on the Promises",
    "Blest Be the Tie That Binds",
    "Onward, Christian Soldiers",
    "Rescue the Perishing",
    "Shall We Gather at the River",
    "When the Roll Is Called Up Yonder",
    "We Gather Together",
    "Now Thank We All Our God",
    "Lead On, O King Eternal",
    "Glorious Things of Thee Are Spoken",
    "Near to the Heart of God"
]

def safe_search(title):
    print(f"Searching for: {title}...")
    time.sleep(5)  # Respect robots.txt

    # Try "Title + congregational" first for singing
    query = f"{title} congregational"
    encoded_query = urllib.parse.quote(query)
    url = f"https://www.sermonaudio.com/search.asp?keyword={encoded_query}&AudioOnly=true"

    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')

            # Look for sermoninfo.asp?SID={SID}
            # Regex to capture SID
            match = re.search(r'sermoninfo\.asp\?SID=(\d+)', html)
            if match:
                sid = match.group(1)
                # Verify duration if possible, but basic search might be enough
                # For now, return the constructed URL
                mp3_url = f"https://mp3.sermonaudio.com/filearea/{sid}/{sid}.mp3"
                print(f"  Found: {mp3_url}")
                return mp3_url
            else:
                # Fallback search without "congregational"
                print("  No congregational result found, trying generic hymn search...")
                time.sleep(5)
                query = f"{title} hymn"
                encoded_query = urllib.parse.quote(query)
                url = f"https://www.sermonaudio.com/search.asp?keyword={encoded_query}&AudioOnly=true"
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as response:
                    html = response.read().decode('utf-8')
                    match = re.search(r'sermoninfo\.asp\?SID=(\d+)', html)
                    if match:
                        sid = match.group(1)
                        mp3_url = f"https://mp3.sermonaudio.com/filearea/{sid}/{sid}.mp3"
                        print(f"  Found (generic): {mp3_url}")
                        return mp3_url
                    else:
                        print("  No audio found.")
                        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None

results = {}

for hymn in HYMNS:
    url = safe_search(hymn)
    if url:
        results[hymn] = url
    else:
        results[hymn] = "" # Empty string if not found

# Save results
with open('hymn_audio_map.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Done. Saved to hymn_audio_map.json")
