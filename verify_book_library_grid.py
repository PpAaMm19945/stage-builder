
import os
import json
import time
from playwright.sync_api import sync_playwright, expect

def verify_book_library_grid():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=["clipboard-read", "clipboard-write"],
            storage_state=None
        )

        page = context.new_page()

        # Mock /api/auth/me to return a valid user
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "user": {
                    "id": "user-1",
                    "email": "test@example.com",
                    "name": "Test User",
                    "role": "parent"
                },
                "children": [
                    {"id": "child-1", "name": "Child 1", "birthDate": "2020-01-01"}
                ]
            })
        ))

        # Mock /api/family/today
        page.route("**/api/family/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "date": "2023-10-27",
                "dayInfo": {"season": "ordinary"},
                "schedule": []
            })
        ))

        # Mock /api/family/preferences (memory mentioned this)
        page.route("**/api/family/preferences", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({})
        ))

        # Mock /api/books to return many test books
        books = []
        for i in range(1, 15):
             books.append({
                "id": f"book-{i}",
                "title": f"Test Book {i}",
                "series": "Test Series",
                "learningStage": "early-years",
                "renderFormat": "image",
                "coverUrl": "https://placehold.co/400x600",
                "minAgeMonths": 24,
                "maxAgeMonths": 60,
                "domain": "discovery",
                "pageCount": 20,
                "topics": ["animals"],
                "readingPrompts": []
            })

        page.route("**/api/books?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(books)
        ))

        # Set the token in localStorage before navigation
        page.goto("http://localhost:8080/")
        page.evaluate("localStorage.setItem('schoolos_token', 'test-token')")

        # Wait a bit
        time.sleep(1)

        # Navigate to the Book Library
        # The route in App.tsx is /early-years/activities which likely loads Library page
        print("Navigating to Library via URL /early-years/activities?tab=books ...")
        page.goto("http://localhost:8080/early-years/activities?tab=books")

        # Wait for books to load
        try:
            page.wait_for_selector("text=Test Series", timeout=10000)
        except:
             print("Books did not load.")
             page.screenshot(path="verification/books_fail_retry.png")
             return

        print("Books loaded.")

        # Check for Grid vs Flex
        book_card = page.get_by_text("Test Book 1").first
        if not book_card.is_visible():
             print("Book card not visible!")
             return

        parent = book_card.locator("xpath=..")
        # In Grid version, parent is the Grid container because we removed the wrapping div.
        # In Flex version, parent was a div (snap-start wrapper), grandparent was flex container.

        # If we successfully removed the wrapper div, parent should have grid classes.

        parent_class = parent.get_attribute("class")

        print(f"Parent classes: {parent_class}")

        is_grid = False
        if "grid" in (parent_class or ""):
            is_grid = True

        if is_grid:
            print("Verified: Grid layout detected.")
        else:
            print("Detected: Non-grid layout.")

        page.screenshot(path="verification/book_library_layout_success.png")
        print("Screenshot saved to verification/book_library_layout_success.png")

        browser.close()

if __name__ == "__main__":
    verify_book_library_grid()
