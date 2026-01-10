
import os
import json
import time
from playwright.sync_api import sync_playwright, expect

def verify_book_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard if needed
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

        # Mock /api/family/today to avoid errors
        page.route("**/api/family/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "date": "2023-10-27",
                "dayInfo": {"season": "ordinary"},
                "schedule": []
            })
        ))

        # Mock /api/liturgy/today
        page.route("**/api/liturgy/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"items": []})
        ))

        # Mock /api/books to return some test books
        page.route("**/api/books?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {
                    "id": "book-1",
                    "title": "The Big Red Barn",
                    "series": "Farm Stories",
                    "learningStage": "early-years",
                    "renderFormat": "image",
                    "coverUrl": "https://placehold.co/400x600",
                    "minAgeMonths": 24,
                    "maxAgeMonths": 60,
                    "domain": "discovery",
                    "pageCount": 20,
                    "topics": ["animals"],
                    "readingPrompts": []
                }
            ])
        ))

        # Set the token in localStorage before navigation
        page.goto("http://localhost:8080/")
        page.evaluate("localStorage.setItem('schoolos_token', 'test-token')")

        # Navigate to the Book Library
        print("Navigating to Book Library...")
        page.goto("http://localhost:8080/early-years/activities?tab=books")

        # Wait for the books to load
        page.wait_for_selector("text=Farm Stories", timeout=10000)

        # Verify default state: Picture Books category selected
        print("Verifying default state...")
        expect(page.get_by_text("Picture Books", exact=True)).to_be_visible()

        # Take screenshot of Picture Books view
        page.screenshot(path="verification/1_picture_books.png")
        print("Screenshot 1_picture_books.png saved.")

        # Switch to "The Paperback Bible" category
        print("Switching to Bible category...")
        page.click("text=Picture Books")
        page.click("text=The Paperback Bible")

        # Wait for Bible series to appear
        page.wait_for_selector("text=Bible - Old Testament")

        # Take screenshot of Expanded Bible view
        page.screenshot(path="verification/2_bible_books_collapsed.png")
        print("Screenshot 2_bible_books_collapsed.png saved.")

        # Click to expand Old Testament
        print("Expanding Old Testament...")
        page.click("text=Bible - Old Testament")

        # Wait for animation/expansion
        time.sleep(1)

        # Verify SermonAudio credit is visible
        print("Verifying SermonAudio credit...")
        expect(page.get_by_text("Audio kindly provided by")).to_be_visible()
        expect(page.get_by_role("link", name="SermonAudio")).to_be_visible()

        # Take screenshot of Expanded Bible view with credit
        page.screenshot(path="verification/3_bible_books_expanded_credit.png")
        print("Screenshot 3_bible_books_expanded_credit.png saved.")

        browser.close()

if __name__ == "__main__":
    verify_book_library()
