
import os
import re
import json

# Paths
BASE_DIR = r"c:\Users\Anthony Mwesigwa\Documents\Home Line Shop\stage-builder\cloudflare\migrations"
OUTPUT_FILE = os.path.join(BASE_DIR, "v2_0002_seed_formations.sql")

# Source Files
SOURCES = {
    "wsc_expanded": "0040_seed_wsc_expanded.sql",
    "wsc_q39_q70": "0042_seed_wsc_q39_q70.sql",
    "wsc_q71_q107": "0043_seed_wsc_q71_q107.sql",
    "hymns": "0048_seed_hymns_from_markdown.sql",
    "verses": "0050_seed_memory_verses_52weeks.sql",
    "history_stories": "0049_seed_history_formations.sql",
    "history_skills": "0054_seed_sapling_history.sql",
    "skills_basic": "0002_seed_activities.sql",
    "skills_expanded": "0004_expanded_activities.sql",
    "daily_practices": "0014_seed_daily_practices.sql",
    "spiritual": "0026_new_spiritual_activities.sql",
}

# Virtue Mapping
DOMAIN_MAP = {
    "cognitive": "Wisdom",
    "motor": "Stewardship",
    "language": "Wisdom",
    "social-emotional": "Love",
    "pre-academic": "Wonder", # Defaulting to Wonder for sensory, adjusting if needed
    "spiritual": "Wonder",
}

# WSC Q1-10 Data (Manual Generation)
WSC_Q1_10 = [
    ("wsc_q1", "Q1: Chief End of Man", "liturgy", "Wisdom", "Purpose", "Q: What is the chief end of man?\nA: Man's chief end is to glorify God, and to enjoy him forever.", '["Recite together", "Discuss: Why were we made?", "Pray"]', "We exist for God's glory.", "Morning_Circle", 48, 216),
    ("wsc_q2", "Q2: Rule of Direction", "liturgy", "Wisdom", "Memory", "Q: What rule hath God given to direct us how we may glorify and enjoy him?\nA: The Word of God, which is contained in the Scriptures of the Old and New Testaments, is the only rule to direct us how we may glorify and enjoy him.", '["Recite together", "Discuss: The Bible is our rule.", "Pray"]', "Scripture guides us.", "Morning_Circle", 48, 216),
    ("wsc_q3", "Q3: Principal Teaching", "liturgy", "Wisdom", "Memory", "Q: What do the scriptures principally teach?\nA: The scriptures principally teach what man is to believe concerning God, and what duty God requires of man.", '["Recite together", "Discuss: Faith and Duty.", "Pray"]', "Believe and Obey.", "Morning_Circle", 48, 216),
    ("wsc_q4", "Q4: What is God?", "liturgy", "Wisdom", "Memory", "Q: What is God?\nA: God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.", '["Recite together", "Discuss: God is a Spirit.", "Pray"]', "God is not like us.", "Morning_Circle", 48, 216),
    ("wsc_q5", "Q5: One God", "liturgy", "Wisdom", "Memory", "Q: Are there more Gods than one?\nA: There is but one only, the living and true God.", '["Recite together", "Discuss: One God.", "Pray"]', "No other gods.", "Morning_Circle", 48, 216),
    ("wsc_q6", "Q6: The Trinity", "liturgy", "Wisdom", "Memory", "Q: How many persons are there in the Godhead?\nA: There are three persons in the Godhead; the Father, the Son, and the Holy Ghost; and these three are one God, the same in substance, equal in power and glory.", '["Recite together", "Discuss: Three in One.", "Pray"]', "Mystery of the Trinity.", "Morning_Circle", 48, 216),
    ("wsc_q7", "Q7: God's Decrees", "liturgy", "Wisdom", "Memory", "Q: What are the decrees of God?\nA: The decrees of God are, his eternal purpose, according to the counsel of his will, whereby, for his own glory, he hath foreordained whatsoever comes to pass.", '["Recite together", "Discuss: God\'s Plan.", "Pray"]', "God plans everything.", "Morning_Circle", 48, 216),
    ("wsc_q8", "Q8: Execution of Decrees", "liturgy", "Wisdom", "Memory", "Q: How doth God execute his decrees?\nA: God executeth his decrees in the works of creation and providence.", '["Recite together", "Discuss: Making and Keeping.", "Pray"]', "Creation and Providence.", "Morning_Circle", 48, 216),
    ("wsc_q9", "Q9: Work of Creation", "liturgy", "Wisdom", "Memory", "Q: What is the work of creation?\nA: The work of creation is, God's making all things of nothing, by the word of his power, in the space of six days, and all very good.", '["Recite together", "Discuss: Made from nothing.", "Pray"]', "God speaks, it happens.", "Morning_Circle", 48, 216),
    ("wsc_q10", "Q10: Creation of Man", "liturgy", "Wisdom", "Memory", "Q: How did God create man?\nA: God created man male and female, after his own image, in knowledge, righteousness, and holiness, with dominion over the creatures.", '["Recite together", "Discuss: Image of God.", "Pray"]', "We are like mirrors of God.", "Morning_Circle", 48, 216),
]


def escape_sql_string(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def parse_sql_file(filename):
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Very basic regex to split VALUES ...;
    # specific to the structure we know exists in these files
    # This is fragile but sufficient for this specific task
    
    # We'll rely on finding lines that look like: ('id', ...),
    # Some files use multi-line inserts.
    
    # Strategy: Find all content inside VALUES (...);
    values_matches = re.findall(r"VALUES\s+(.*?;)", content, re.DOTALL | re.IGNORECASE)
    
    records = []
    
    if not values_matches:
       # try finding line by line tuples
       # specifically for 0002 and 0004 which might be formatted differently
       pass

    # Better strategy: iterate line by line, if line starts with "(" and ends with "," or ");"
    
    lines = content.split('\n')
    current_chunk = ""
    inside_values = False
    
    for line in lines:
        stripped = line.strip()
        if "INSERT INTO" in stripped and "VALUES" in stripped:
            inside_values = True
            continue
            
        if inside_values:
            if stripped.startswith("(") or (len(current_chunk) > 0):
                current_chunk += line + "\n"
                if stripped.endswith("),") or stripped.endswith(");"):
                    # We have a full record tuple string
                    process_record_string(current_chunk.strip().rstrip(",;"), records, filename)
                    current_chunk = ""
            
    return records

def process_record_string(record_str, records, filename):
    # This assumes the record string is like ('id', 'title', ...)
    # We need to parse this into a python list/tuple.
    # Since it contains SQL escaped strings, we can try to use a little hack or a proper parser.
    # Hack: use eval? No, unsafe and SQL escaping uses '' not \'.
    
    # Manual parsing considering ' as delimiter
    parts = []
    current_part = ""
    in_quote = False
    
    # Remove outer parens
    inner = record_str.strip()
    if inner.startswith("("): inner = inner[1:]
    if inner.endswith(")"): inner = inner[:-1]
    
    # Scan char by char
    i = 0
    while i < len(inner):
        char = inner[i]
        
        if char == "'":
            if i + 1 < len(inner) and inner[i+1] == "'":
                current_part += "'"
                i += 1 # skip next
            else:
                in_quote = not in_quote
        elif char == "," and not in_quote:
            parts.append(parse_val(current_part))
            current_part = ""
            i += 1
            continue
        else:
            current_part += char
            
        i += 1
        
    parts.append(parse_val(current_part)) # Last part
    
    records.append({'source': filename, 'values': parts})

def parse_val(val):
    val = val.strip()
    if val.upper() == "NULL": return None
    if val.isdigit(): return int(val)
    return val # It's a string, we handled ' escaping during accumulation if we were sophisticated, 
               # but here we just accumulated raw chars between commas.
               # Should actully separate type.
               # For simplest path: the CSV split above is rough.
               
    # Re-eval approach:
    # SQL format: 'string''s', 10, NULL
    # If we accumulated everything, we just need to detect if it's a number or string.
    
    return val


# Since parsing SQL with regex is hell, let's use the fact that we know the columns for each file type
# and just extract what we need using specific logic for each known file structure.


def generate_sql():
    all_values = []
    
    # 1. WSC Q1-10 (Manual)
    all_values.extend(get_wsc_strings())

    # 2. WSC Q11-107
    all_values.extend(extract_values_from_file(SOURCES["wsc_expanded"], "wsc"))
    all_values.extend(extract_values_from_file(SOURCES["wsc_q39_q70"], "wsc"))
    all_values.extend(extract_values_from_file(SOURCES["wsc_q71_q107"], "wsc"))
    
    # 3. Hymns
    all_values.extend(extract_values_from_file(SOURCES["hymns"], "hymn"))
    
    # 4. Verses
    all_values.extend(extract_values_from_file(SOURCES["verses"], "verse"))
    
    # 5. History
    all_values.extend(extract_values_from_file(SOURCES["history_stories"], "history_story"))
    all_values.extend(extract_values_from_file(SOURCES["history_skills"], "history_skill"))
    
    # 6. Skills & Habits
    all_values.extend(extract_values_from_file(SOURCES["skills_basic"], "skill"))
    all_values.extend(extract_values_from_file(SOURCES["skills_expanded"], "skill"))
    all_values.extend(extract_values_from_file(SOURCES["spiritual"], "spiritual"))
    all_values.extend(extract_values_from_file(SOURCES["daily_practices"], "habit"))

    print(f"Generated {len(all_values)} records.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        out.write("-- Migration v2_0002: Seed Formations\n")
        out.write("INSERT OR REPLACE INTO formations (\n")
        out.write("  id, title, formation_type, primary_virtue, biblical_faculty, description, \n")
        out.write("  guide_steps, parent_posture, liturgical_script, materials, duration_minutes, \n")
        out.write("  context_anchor, cluster_tag, min_age_months, max_age_months, \n")
        out.write("  source, content_source\n")
        out.write(") VALUES\n")
        out.write(",\n".join(all_values))
        out.write(";\n")



def get_wsc_strings():
    res = []
    for row in WSC_Q1_10:
        val = f"({escape_sql_string(row[0])}, {escape_sql_string(row[1])}, {escape_sql_string(row[2])}, " \
              f"{escape_sql_string(row[3])}, {escape_sql_string(row[4])}, {escape_sql_string(row[5])}, " \
              f"{escape_sql_string(row[6])}, {escape_sql_string(row[7])}, NULL, NULL, 15, " \
              f"{escape_sql_string(row[8])}, 'catechism', {row[9]}, {row[10]}, " \
              f"'westminster_shorter', 'schoolos_core')"
        res.append(val)
    return res

def extract_values_from_file(filename, file_type):
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex patterns based on file type schemas
    # This assumes standard formatting in source files (which I can see is true from view_file)
    
    results = []
    
    # Generic Tuple Matcher
    # matches: ('val', 'val', ...),?
    # We need to be careful about nested parens in JSON or text.
    # Luckily most source text is simple or standard SQL string escaped.
    
    pattern = re.compile(r"\s*(\([^\)]+\))\s*[,;]") # Too simple, breaks on ) inside string
    
    # We will use a custom state machine parser for specific files if regex fails,
    # but for now let's try to construct specific regexes for known column counts and types.
    
    # Actually, simpler: split by "),\n" which seems consistent in the source files.
    # WSC files: (...),\n
    
    chunks = content.split("),\n")
    
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk.startswith("("):
            # Try to find start of tuple
            idx = chunk.find("(")
            if idx == -1: continue
            chunk = chunk[idx:]
            
        # Clean up end
        if chunk.endswith(";") or chunk.endswith(")"):
            chunk = chunk.rstrip(";")
        else:
            chunk = chunk + ")" # add back the paren we split on
            
        # Now chunk is "(...)"
        # We need to parse fields.
        
        fields = parse_sql_tuple(chunk)
        if not fields: continue
        
        # Map fields based on type
        mapped = map_record(fields, file_type)
        if mapped:
            results.append(mapped)
            
    return results

def parse_sql_tuple(s):
    # Parses (a, b, 'c', ...) into list
    # Handles ' string escaping
    if not s.startswith("(") or not s.endswith(")"): return None
    s = s[1:-1] # strip parens
    
    parts = []
    curr = ""
    in_quote = False
    i = 0
    while i < len(s):
        c = s[i]
        if c == "'":
            if i+1 < len(s) and s[i+1] == "'":
                curr += "''"
                i += 1
            else:
                in_quote = not in_quote
        elif c == "," and not in_quote:
            parts.append(clean_val(curr))
            curr = ""
        else:
            curr += c
        i += 1
    parts.append(clean_val(curr))
    return parts

def clean_val(v):
    v = v.strip()
    if v.upper() == "NULL": return "NULL"
    if v.startswith("'") and v.endswith("'"): return v # Already escaped string
    if v.isdigit(): return v
    # Ensure strings are quoted
    return f"'{v}'" if not v.isdigit() else v

def map_record(fields, file_type):
    # Returns formatted value string for new schema or None
    # Target: id, title, type, virtue, faculty, desc, guide, posture, script, materials, duration, context, cluster, min, max, source, content_source
    
    try:
        if file_type == "wsc":
            # Source (0040): id, title, type, virtue, faculty, desc, guide, posture, context, min, max
            if len(fields) < 11: return None
            return f"{fields[0]}, {fields[1]}, 'liturgy', {fields[3]}, {fields[4]}, {fields[5]}, {fields[6]}, {fields[7]}, NULL, NULL, 15, {fields[8]}, 'catechism', {fields[9]}, {fields[10]}, 'westminster_shorter', 'schoolos_core'"

        elif file_type == "hymn":
             # Source (0048): id, title, type, virtue, faculty, desc, script, context, min, max
             if len(fields) < 10: return None
             return f"{fields[0]}, {fields[1]}, 'liturgy', {fields[3]}, {fields[4]}, {fields[5]}, NULL, NULL, {fields[6]}, NULL, 10, {fields[7]}, 'hymn', {fields[8]}, {fields[9]}, 'trinity_hymnal', 'schoolos_core'"

        elif file_type == "verse":
             # Source (0050): id, title, type, virtue, desc(ref), script(text), context, min, max
             if len(fields) < 9: return None
             return f"{fields[0]}, {fields[1]}, 'liturgy', {fields[3]}, 'Memory', {fields[4]}, NULL, NULL, {fields[5]}, NULL, 5, {fields[6]}, 'scripture', {fields[7]}, {fields[8]}, 'esv', 'schoolos_core'"
        
        elif file_type == "history_story":
             # Source (0049): id, title, type, virtue, faculty, desc, script, context, min, max
             if len(fields) < 10: return None
             return f"{fields[0]}, {fields[1]}, 'liturgy', {fields[3]}, {fields[4]}, {fields[5]}, NULL, NULL, {fields[6]}, NULL, 20, {fields[7]}, 'history', {fields[8]}, {fields[9]}, 'schoolos_history', 'schoolos_core'"

        elif file_type == "history_skill":
             # Source (0054): id, title, type, virtue, faculty, desc, guide, materials, duration, cluster, min, max, context, posture
             if len(fields) < 14: return None
             return f"{fields[0]}, {fields[1]}, 'skill', {fields[3]}, {fields[4]}, {fields[5]}, {fields[6]}, {fields[13]}, NULL, {fields[7]}, {fields[8]}, {fields[12]}, 'history', {fields[10]}, {fields[11]}, 'schoolos_history', 'schoolos_core'"
             
        elif file_type == "skill":
            # Source (0002/0004): id, title, desc, domain, min, max, dur, materials, instr, outcomes, diff
            if len(fields) < 11: return None
            
            # Map domain to virtue
            old_domain = fields[3].replace("'", "")
            virtue = DOMAIN_MAP.get(old_domain, "Wisdom")
            
            # Use 'instruction' as guide_steps, but it needs to be JSON array. 
            # In source it is stringified JSON array already, e.g. '["Step 1"]'
            guide = fields[8]
            
            # Parent posture? Null.
            # Cluster? old_domain or null.
            return f"{fields[0]}, {fields[1]}, 'skill', '{virtue}', NULL, {fields[2]}, {guide}, NULL, NULL, {fields[7]}, {fields[6]}, 'Anytime', '{old_domain}', {fields[4]}, {fields[5]}, 'schoolos_skills', 'schoolos_core'"

        elif file_type == "spiritual":
            # Source (0026): id, title, desc, domain, biblical_domain, min, max, dur, mat, instr, outcomes, diff, type, kit, tier
            if len(fields) < 15: return None
            
            virtue = "Wonder" # Default
            # Could map based on title or logic, but Wonder/Wisdom fits most.
            
            guide = fields[9]
            
            return f"{fields[0]}, {fields[1]}, 'habit', '{virtue}', NULL, {fields[2]}, {guide}, NULL, NULL, {fields[8]}, {fields[7]}, 'Anytime', 'spiritual', {fields[5]}, {fields[6]}, 'schoolos_spiritual', 'schoolos_core'"
            
        elif file_type == "habit":
            # Source (0014): id, title, desc, domain, min, max, dur, diff, type, prohibited, context, instructions
            if len(fields) < 12: return None
            
            old_domain = fields[3].replace("'", "")
            virtue = DOMAIN_MAP.get(old_domain, "Stewardship")
            guide = fields[11]
            context = fields[10] if fields[10] != "NULL" else "'Anytime'"
            
            return f"{fields[0]}, {fields[1]}, 'habit', '{virtue}', NULL, {fields[2]}, {guide}, NULL, NULL, NULL, {fields[6]}, {context}, 'daily_practice', {fields[4]}, {fields[5]}, 'schoolos_daily', 'schoolos_core'"

    except Exception as e:
        print(f"Error mapping record: {e}")
        return None

if __name__ == "__main__":
    generate_sql()
