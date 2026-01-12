import os
import json
import glob
import re

def escape_sql(text):
    if not text:
        return ""
    return text.replace("'", "''")

def generate_hymns():
    print("Generating 0048_seed_hymns_from_markdown.sql...")
    output_file = "cloudflare/migrations/0048_seed_hymns_from_markdown.sql"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- Migration 0048: Seed Hymns from Markdown\n")
        f.write("INSERT INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, liturgical_script, context_anchor, min_age_months, max_age_months) VALUES\n")
        
        files = glob.glob("public/books/reformed-hymns/*.md")
        values_list = []
        
        for filepath in files:
            filename = os.path.basename(filepath)
            slug = filename.replace(".md", "").lower().replace(" ", "_")
            
            with open(filepath, "r", encoding="utf-8") as content_file:
                content = content_file.read()
                
            # Extract title (first line # Title)
            lines = content.split('\n')
            title = lines[0].replace("#", "").strip()
            if not title:
                title = filename.replace(".md", "").replace("-", " ").title()
            
            # Script is the whole content
            script = escape_sql(content)
            description = escape_sql(content[:200] + "...")
            
            values = f"('hymn_{slug}', '{escape_sql(title)}', 'liturgy', 'Worship', 'Affection', '{description}', '{script}', 'Morning_Circle', 0, 216)"
            values_list.append(values)
            
        f.write(",\n".join(values_list) + ";\n")
    print(f"Generated {len(values_list)} hymns.")

def generate_history():
    print("Generating 0049_seed_history_formations.sql...")
    output_file = "cloudflare/migrations/0049_seed_history_formations.sql"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- Migration 0049: Seed History Short Stories\n")
        f.write("INSERT INTO formations (id, title, formation_type, primary_virtue, biblical_faculty, description, liturgical_script, context_anchor, min_age_months, max_age_months) VALUES\n")
        
        dirs = glob.glob("public/books/young_historians_africa/*")
        values_list = []
        
        for dirpath in dirs:
            if not os.path.isdir(dirpath):
                continue
                
            slug = os.path.basename(dirpath)
            meta_path = os.path.join(dirpath, "metadata.json")
            content_path = os.path.join(dirpath, "content.md")
            
            if not os.path.exists(meta_path) or not os.path.exists(content_path):
                continue
                
            with open(meta_path, "r", encoding="utf-8") as meta_file:
                meta = json.load(meta_file)
                
            with open(content_path, "r", encoding="utf-8") as content_file:
                content = content_file.read()
                
            title = meta.get("title", slug.replace("_", " ").title())
            # Use content as description for the formation
            description = escape_sql(content)
            
            # Context anchor: Bedside (story time)
            values = f"('hist_story_{slug}', '{escape_sql(title)}', 'narrative', 'Wonder', 'Imagination', '{description}', '', 'Bedside', 48, 120)"
            values_list.append(values)
            
        if values_list:
            f.write(",\n".join(values_list) + ";\n")
    print(f"Generated {len(values_list)} history stories.")

if __name__ == "__main__":
    generate_hymns()
    generate_history()
