"""
PDF to PNG Conversion Script for SchoolOS Books (Python version)

Prerequisites:
1. Install Poppler:
   - Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases
     Extract to C:\poppler and add C:\poppler\Library\bin to PATH
   - Mac: brew install poppler
   - Linux: sudo apt-get install poppler-utils

2. Install Python dependencies:
   pip install pdf2image Pillow

Usage:
   python scripts/convert-pdfs.py
"""

import os
import json
import shutil
import platform
from pathlib import Path

try:
    from pdf2image import convert_from_path, pdfinfo_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    print("⚠️  pdf2image not installed. Run: pip install pdf2image Pillow")

# Configuration
SCRIPT_DIR = Path(__file__).parent
BOOKS_DIR = SCRIPT_DIR.parent / "public" / "books"
SERIES_TO_CONVERT = ["African Men of Faith"]

def get_poppler_path():
    """Attempt to find Poppler binary path."""
    # Check if in PATH already
    if shutil.which("pdftoppm"):
        return None  # It's in PATH
        
    # Check common locations on Windows
    if platform.system() == "Windows":
        common_paths = [
            r"C:\poppler\Library\bin",
            r"C:\Program Files\poppler\Library\bin",
            r"C:\Program Files (x86)\poppler\Library\bin",
        ]
        
        # Add version-specific scan
        try:
            c_drive = Path("C:/")
            for p in c_drive.glob("poppler-*/Library/bin"):
                common_paths.append(str(p))
        except Exception:
            pass
            
        for path in common_paths:
            if os.path.exists(path) and os.path.exists(os.path.join(path, "pdftoppm.exe")):
                print(f"   ℹ️  Found Poppler at: {path}")
                return path
                
    return None

def find_pdfs(series_dir):
    """Find all PDFs in a series directory."""
    pdfs = []
    for book_dir in series_dir.iterdir():
        if book_dir.is_dir():
            pdf_files = list(book_dir.glob("*.pdf"))
            if pdf_files:
                pdfs.append({
                    "book_name": book_dir.name,
                    "book_path": book_dir,
                    "pdf_path": pdf_files[0],
                    "images_dir": book_dir / "images"
                })
    return pdfs

def convert_pdf(pdf_info, poppler_path=None, dpi=150):
    """Convert a PDF to PNG images."""
    book_name = pdf_info["book_name"]
    pdf_path = pdf_info["pdf_path"]
    images_dir = pdf_info["images_dir"]
    book_path = pdf_info["book_path"]
    
    print(f"\n📖 Converting: {book_name}")
    print(f"   PDF: {pdf_path}")
    
    # Create images directory
    images_dir.mkdir(exist_ok=True)
    
    # Check if already converted
    existing = list(images_dir.glob("page-*.png"))
    if existing:
        print(f"   ⏭️  Already has {len(existing)} pages, skipping...")
        return {"book_name": book_name, "pages": len(existing), "skipped": True}
    
    try:
        # Convert PDF to images
        images = convert_from_path(str(pdf_path), dpi=dpi, poppler_path=poppler_path)
        
        page_count = 0
        for i, image in enumerate(images, start=1):
            page_count += 1
            page_name = f"page-{str(i).zfill(2)}.png"
            page_path = images_dir / page_name
            image.save(str(page_path), "PNG")
        
        # Create cover (copy of first page)
        first_page = images_dir / "page-01.png"
        cover_path = book_path / "cover.png"
        if first_page.exists():
            shutil.copy(first_page, cover_path)
        
        print(f"   ✅ Converted {page_count} pages + cover")
        return {"book_name": book_name, "pages": page_count, "skipped": False}
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return {"book_name": book_name, "pages": 0, "error": str(e)}

def update_metadata(pdf_info, page_count):
    """Update metadata.json with page count and standardized fields."""
    metadata_path = pdf_info["book_path"] / "metadata.json"
    
    if metadata_path.exists():
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            
            # Update fields
            metadata["pageCount"] = page_count
            metadata["learningStage"] = metadata.get("learningStage", "early-years")
            metadata["domain"] = metadata.get("domain", "language")
            
            # Convert ageRange to months
            if "ageRange" in metadata and "minAgeMonths" not in metadata:
                import re
                match = re.search(r"(\d+)\s*-\s*(\d+)", metadata["ageRange"])
                if match:
                    min_val = int(match.group(1))
                    max_val = int(match.group(2))
                    if max_val <= 12:  # Likely years
                        min_val *= 12
                        max_val *= 12
                    metadata["minAgeMonths"] = min_val
                    metadata["maxAgeMonths"] = max_val
            
            with open(metadata_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            print(f"   📝 Updated metadata.json")
            
        except Exception as e:
            print(f"   ⚠️  Could not update metadata: {e}")

def main():
    print("🚀 SchoolOS Book PDF Converter (Python)\n")
    print("=" * 50)
    
    if not PDF2IMAGE_AVAILABLE:
        print("\n❌ Cannot proceed without pdf2image library.")
        print("Run: pip install pdf2image Pillow")
        return

    # Find Poppler
    poppler_path = get_poppler_path()
    if not poppler_path and not shutil.which("pdftoppm"):
        print("\n⚠️  Poppler not found in PATH or common locations.")
        print("    If conversion fails, please ensure Poppler is in your PATH")
        print(r"    or installed at C:\poppler\Library\bin")
    
    results = []
    
    for series in SERIES_TO_CONVERT:
        series_dir = BOOKS_DIR / series
        
        if not series_dir.exists():
            print(f"\n⚠️  Series directory not found: {series}")
            continue
        
        print(f"\n📚 Series: {series}")
        
        pdfs = find_pdfs(series_dir)
        print(f"   Found {len(pdfs)} books with PDFs")
        
        for pdf_info in pdfs:
            result = convert_pdf(pdf_info, poppler_path=poppler_path)
            results.append(result)
            
            if result["pages"] > 0 and not result.get("skipped"):
                update_metadata(pdf_info, result["pages"])
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Conversion Summary:\n")
    
    for r in results:
        if r.get("error"):
            print(f"   ❌ {r['book_name']}: Failed - {r['error']}")
        elif r.get("skipped"):
            print(f"   ⏭️  {r['book_name']}: Skipped ({r['pages']} pages exist)")
        else:
            print(f"   ✅ {r['book_name']}: {r['pages']} pages converted")
    
    print("\n✨ Done!\n")

if __name__ == "__main__":
    main()
