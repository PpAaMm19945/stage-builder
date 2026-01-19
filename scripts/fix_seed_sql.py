
import re
import os

input_file = r'cloudflare/migrations/v2_0002_seed_formations.sql'
output_file = r'cloudflare/migrations/v2_0002_seed_formations.sql'

def fix_sql():
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the start of the VALUES section
    # Matches "INSERT OR REPLACE INTO formations (...) VALUES"
    # We capture the INSERT clause to reuse it.
    match = re.search(r'(INSERT OR REPLACE INTO formations\s*\(.*?\)\s*VALUES\s*)', content, re.DOTALL | re.IGNORECASE)
    
    if not match:
        print("Could not find INSERT statement.")
        return

    insert_clause = match.group(1).strip()
    # Everything after the insert clause is the values list (and maybe comments)
    values_text = content[match.end():].strip()
    
    # Remove final semicolon if present
    if values_text.endswith(';'):
        values_text = values_text[:-1]

    # Split by "),\n" or ")," allows us to get each row
    # This is a naive split, it assumes ), is safely distinguishing rows. 
    # Valid SQL strings might contain ), so we need to be careful.
    # But looking at the file, the formatting seems consistent with newlines?
    # Let's try to split by `),\n` which appeared in the view_file output.
    
    # Actually, a safer way for a quick fix without full SQL parsing:
    # Walk through the string, counting parentheses to identify tuples.
    
    rows = []
    current_row = []
    paren_depth = 0
    in_string = False
    escape = False
    quote_char = None
    
    current_char_buffer = ""
    
    for char in values_text:
        current_char_buffer += char
        
        if escape:
            escape = False
            continue
            
        if char == "'" and not escape:
            if in_string:
                if quote_char == "'":
                    # unexpected, but SQL escapes ' with '' usually, not backslash
                    # We need to look ahead? No, D1 uses standard SQL.
                    # If we are in string, ' toggles out UNLESS it is ''
                    pass 
                    # Actually valid SQL escaping is confusing to parse simply.
                    # Let's rely on the file structure which uses standard formatting.
            pass

    # improving the split strategy:
    # The file seems to have rows starting with `(` and ending with `)` separated by comma.
    # Let's assume standard formatting: `),\r\n` or `),\n`
    
    # Function to split safely
    raw_rows = []
    buffer = ""
    depth = 0
    in_quote = False
    
    # Use an iterator to handle lookahead check for ''
    i = 0
    length = len(values_text)
    
    while i < length:
        char = values_text[i]
        buffer += char
        
        if char == "'" and (i+1 >= length or values_text[i+1] != "'"):
             # It's a quote toggle if it's not an escaped quote ('')
             # WAIT: in SQL 'a''b' is a single string. 
             # So if we see ', check next. If next is ', skip both (treat as literal).
             # If next is NOT ', then we toggle in_quote.
             in_quote = not in_quote
        elif char == "'" and (i+1 < length and values_text[i+1] == "'"):
             # Escaped quote, consume next char too
             buffer += values_text[i+1]
             i += 1

        if not in_quote:
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
            elif char == ',' and depth == 0:
                # Comma at depth 0 means separator between rows
                # Remove trailing comma from buffer
                row_str = buffer[:-1].strip()
                if row_str:
                    raw_rows.append(row_str)
                buffer = ""
        
        i += 1
    
    if buffer.strip():
        raw_rows.append(buffer.strip())

    # Now verify we caught them clearly.
    # Remove trailing semicolon from the last item if captured
    if raw_rows and raw_rows[-1].endswith(';'):
        raw_rows[-1] = raw_rows[-1][:-1]

    # Header
    new_content = "-- Migration v2_0002: Seed Formations (Batched)\n"
    
    batch_size = 50
    for j in range(0, len(raw_rows), batch_size):
        batch = raw_rows[j:j+batch_size]
        new_content += f"\n{insert_clause}\n" + ",\n".join(batch) + ";\n"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Successfully split {len(raw_rows)} rows into {len(raw_rows)//batch_size + 1} batches.")

if __name__ == "__main__":
    fix_sql()
