
import os
import json
import time
from playwright.sync_api import sync_playwright, expect

def verify_bible_books(page):
    # Set localStorage for auth
    page.goto('http://localhost:8080')

    page.evaluate("""() => {
        localStorage.setItem('schoolos_token', 'mock-token');
    }""")

    # Mock API routes
    page.route('**/api/auth/me', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body=json.dumps({
            'user': {'id': 'user1', 'name': 'Parent'},
            'children': [{'id': 'child1', 'name': 'Child', 'age_months': 60}]
        })
    ))

    page.route('**/api/family/today', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body=json.dumps({'date': '2026-01-10', 'activities': []})
    ))

    # Force 200 OK and no-cache
    page.route('**/api/books*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        headers={'Cache-Control': 'no-store'},
        body=json.dumps([])
    ))

    # Go to library page
    print("Navigating to library...")
    page.goto('http://localhost:8080/early-years/activities?tab=books')

    print("Waiting 2 seconds...")
    time.sleep(2)
    page.screenshot(path="verification/debug_library_state.png")

    # Check for skeletons
    if page.locator(".animate-pulse").count() > 0:
        print("Skeletons detected. Still loading.")

    # Check for error message
    if page.get_by_text("Unable to load books").count() > 0:
        print("Error message detected.")

    # Wait for Bible books to load (they are static, so should be fast)
    # 1 Samuel is book 9
    print("Waiting for 1 Samuel book card...")
    book_locator = page.get_by_text("1 Samuel", exact=True).first
    expect(book_locator).to_be_visible(timeout=10000)

    # Click on 1 Samuel
    print("Clicking 1 Samuel...")
    # Need to find the parent clickable card.
    # The text "1 Samuel" is inside a card which is a button (role=button)
    # We can find the text, then go up to the card
    book_locator.click()

    # Wait for dialog
    print("Waiting for dialog...")
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()

    # Take screenshot of the PDF reader with fallback
    print("Taking screenshot of PDF reader...")
    page.screenshot(path="verification/bible_book_reader.png")

    # Hide iframe to reveal fallback
    print("Hiding iframe to reveal fallback...")
    page.evaluate("if(document.querySelector('iframe')) document.querySelector('iframe').style.display = 'none'")
    page.screenshot(path="verification/bible_book_fallback.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see the dialog clearly
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            verify_bible_books(page)
            print("Verification complete!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
