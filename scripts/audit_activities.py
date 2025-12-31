import re
import csv
import json
import os

# Configuration
MIGRATION_FILES = [
    'cloudflare/migrations/0002_seed_activities.sql',
    'cloudflare/migrations/0004_expanded_activities.sql',
    'cloudflare/migrations/0008_more_family_sessions.sql'
]
OUTPUT_CSV = 'activities_migration_plan.csv'
VALIDATION_REPORT = 'validation_report.json'

# Rules Configuration
BLACKLIST_TERMS = ['yoga', 'meditation', 'chakra', 'namaste', 'third eye', 'magic', 'spell']
RESTRICT_MATERIALS = ['shaving cream', 'foam', 'beads', 'buttons', 'marbles'] # for < 36m
REFRAME_TERMS = {
    'child-led': 'parent-led',
    'facilitator': 'guide',
    'facilitate': 'guide',
    'self-expression': 'creative imitation'
}

def parse_sql_values(sql_content):
    """
    Rudimentary SQL INSERT parser to extract activity data.
    Assumes standard INSERT INTO activities ... VALUES (...) format.
    """
    activities = []
    # Regex to capture content inside VALUES (...);
    # This is brittle but sufficient for the known strict format of our seed files
    # We assume values are: id, title, description, domain, min_age, max_age, duration, materials, instructions, ...
    
    # Clean up newlines for easier regex
    content = sql_content.replace('\n', ' ')
    
    # Find INSERT statements
    inserts = re.findall(r"INSERT INTO activities\s*\((.*?)\)\s*VALUES\s*\((.*?)\);", content, re.IGNORECASE)
    
    for cols, vals in inserts:
        col_list = [c.strip() for c in cols.split(',')]
        
        # Split values by comma, respecting quotes/brackets (simple parser)
        # Note: This simple split fails on commas inside JSON strings. 
        # A robust custom splitter is needed or reliance on the specific formatting of the seed files.
        # Given the complexity, we will allow the script to be 'best effort' and might need refinement if SQL is messy.
        
        # quick & dirty CSV reader on the values string?
        reader = csv.reader([vals], quotechar="'", skipinitialspace=True)
        try:
            val_list = next(reader)
        except StopIteration:
            continue
            
        activity = dict(zip(col_list, val_list))
        activities.append(activity)
        
    return activities

def check_rules(activity):
    """
    Apply theological and safety rules to an activity.
    Returns: action, modifications (dict), notes (list)
    """
    modifications = {}
    notes = []
    action = 'KEEP'
    
    # 1. Blacklist Check
    text_content = (activity.get('title', '') + ' ' + activity.get('description', '')).lower()
    for term in BLACKLIST_TERMS:
        if term in text_content:
            action = 'REMOVE'
            notes.append(f"Blacklisted term found: '{term}'")
            return action, modifications, notes # Immediate fail
            
    # 2. Safety Restriction Check
    min_age = int(activity.get('min_age_months', 0))
    materials_json = activity.get('materials', '[]')
    try:
        # naive cleanup of SQL string escaping if present
        materials = json.loads(materials_json.replace("'", '"')) if materials_json and materials_json != 'NULL' else []
    except:
        materials = []
        
    if min_age < 36:
        for mat in materials:
            for bad_mat in RESTRICT_MATERIALS:
                if bad_mat in mat.lower():
                    action = 'RESTRICT'
                    modifications['safety_note'] = f"Warning: Contains {bad_mat}. Strict adult supervision required. Choking hazard."
                    notes.append(f"Restricted material for age < 36m: {bad_mat}")
                    break
    
    # 3. Reframe Check (Language)
    instructions = activity.get('instructions', '')
    desc = activity.get('description', '')
    combined_text = (instructions + desc).lower()
    
    for term, replacement in REFRAME_TERMS.items():
        if term in combined_text:
            if action == 'KEEP': action = 'REFRAME' # Don't downgrade RESTRICT to REFRAME
            notes.append(f"Language flag: '{term}' -> suggest '{replacement}'")
            # We don't auto-modify text here, just flag it
            
    # 4. Success Cue & Script Generation (Auto-fill)
    if 'success_cue' not in modifications:
        modifications['success_cue'] = "[TODO: Reviewer add specific success cue]"
    if 'parent_script' not in modifications:
        modifications['parent_script'] = "[TODO: Reviewer add script]"
        
    # Biblical Domain Mapping (Heuristic)
    domain = activity.get('domain', 'unknown')
    if domain == 'cognitive': modifications['biblical_domain'] = 'wisdom'
    elif domain == 'motor': modifications['biblical_domain'] = 'stature'
    elif domain == 'social-emotional': modifications['biblical_domain'] = 'favor_with_man'
    elif domain == 'language': modifications['biblical_domain'] = 'wisdom' # debatable
    elif domain == 'pre-academic': modifications['biblical_domain'] = 'wisdom'
        
    return action, modifications, notes

def main():
    all_activities = []
    
    # 1. Load Data
    print("Loading activities from SQL migrations...")
    for file_path in MIGRATION_FILES:
        full_path = os.path.join(os.getcwd(), '..', file_path) # Adjust for script running in /scripts/ or root
        # Try root relative first
        if not os.path.exists(full_path):
            full_path = file_path # Try relative to execution dir
            
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                activities = parse_sql_values(f.read())
                all_activities.extend(activities)
                print(f"Loaded {len(activities)} activities from {file_path}")
        else:
            print(f"Warning: Could not find {file_path}")

    # 2. Apply Rules
    print("Applying rules...")
    audit_results = []
    
    for activity in all_activities:
        action, mods, notes = check_rules(activity)
        
        row = {
            'id': activity.get('id', 'unknown').strip("'"),
            'title': activity.get('title', '').strip("'"),
            'current_domain': activity.get('domain', '').strip("'"),
            'min_age': activity.get('min_age_months', 0),
            'action': action,
            'suggested_content_status': 'blacklisted' if action == 'REMOVE' else ('restricted' if action == 'RESTRICT' else 'reviewed'),
            'suggested_biblical_domain': mods.get('biblical_domain', ''),
            'suggested_safety_note': mods.get('safety_note', ''),
            'notes': "; ".join(notes)
        }
        audit_results.append(row)

    # 3. Output CSV
    print(f"Writing results to {OUTPUT_CSV}...")
    headers = ['id', 'title', 'current_domain', 'min_age', 'action', 'suggested_content_status', 'suggested_biblical_domain', 'suggested_safety_note', 'notes']
    
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(audit_results)
        
    print("Done.")

if __name__ == "__main__":
    main()
