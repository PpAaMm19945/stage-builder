from playwright.sync_api import sync_playwright, expect
import time
import json
import base64

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Set auth token
    page.add_init_script("""
        localStorage.setItem('schoolos_token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Test User', id: '123' }));
    """)

    # Mock API responses
    # Correct structure for auth.getMe()
    user_data = {
        "user": {
            "id": "123",
            "name": "Test User",
            "email": "test@example.com",
            "role": "parent",
            "household_id": "123"
        },
        "children": []
    }

    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps(user_data)
    ))

    page.route("**/api/children", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    image_url = "https://placehold.co/600x800"
    # Mock image
    page.route(image_url, lambda route: route.fulfill(
        status=200,
        content_type="image/png",
        body=base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
    ))

    # Mock books list
    books_data = [{
        "id": "book1",
        "title": "Test Book",
        "series": "test-series",
        "pageCount": 5,
        "coverUrl": image_url,
        "renderFormat": "image",
        "author": "Test Author"
    }]

    page.route("**/api/books?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps(books_data)
    ))

    page.route("**/api/books/test-series/book1/manifest.json", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({"pages": [image_url, image_url]})
    ))

    # Navigate to library/books directly
    print("Navigating to library/books...")
    page.goto("http://localhost:8080/library/books")
    print("Navigated.")

    # Wait for book to appear
    print("Waiting for book...")
    try:
        # Use a broader locator to find the book card or just the text
        page.get_by_text("Test Book").first.click(timeout=10000)
    except Exception as e:
        print(f"Failed to find book: {e}")
        page.screenshot(path="verification/debug_failed.png")
        raise e
    print("Clicked book.")

    # Wait for reader to open (Dialog content)
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()
    print("Dialog visible.")

    # Wait for cover INSIDE dialog
    expect(dialog.get_by_alt_text("Cover", exact=True)).to_be_visible()
    print("Cover visible.")

    # Click next to see Page 1
    # Try keyboard navigation
    print("Pressing ArrowRight...")
    page.keyboard.press("ArrowRight")

    # Wait for page count to update to "Page 2"
    print("Waiting for Page 2...")
    try:
        expect(dialog.get_by_text("Page 2 of")).to_be_visible(timeout=5000)
    except Exception as e:
        print("Page 2 text not found.")
        page.screenshot(path="verification/debug_carousel.png")
        raise e

    # Now Page 1 should be visible (alt="Page 1")
    expect(dialog.get_by_alt_text("Page 1")).to_be_visible()
    print("Page 1 visible.")

    page.screenshot(path="verification/book_reader.png")
    print("Screenshot saved.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
