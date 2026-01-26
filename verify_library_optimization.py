import os
import json
import time
from playwright.sync_api import sync_playwright, expect

def verify_library_optimization():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=["clipboard-read", "clipboard-write"],
            storage_state=None
        )

        page = context.new_page()

        # Mock /api/auth/me
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

        # Mock /api/liturgy/today
        page.route("**/api/liturgy/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"items": []})
        ))

        # Mock /api/books
        page.route("**/api/books?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {
                    "id": "book-1",
                    "title": "Optimized Book 1",
                    "series": "my_first_books",
                    "learningStage": "early-years",
                    "renderFormat": "image",
                    "coverUrl": "https://placehold.co/400x600",
                    "minAgeMonths": 24,
                    "maxAgeMonths": 60,
                    "domain": "discovery",
                    "pageCount": 20,
                    "topics": ["animals"],
                    "readingPrompts": []
                },
                {
                    "id": "book-2",
                    "title": "Optimized Book 2",
                    "series": "the_paperback_bible",
                    "learningStage": "early-years",
                    "renderFormat": "image",
                    "coverUrl": "https://placehold.co/400x600",
                    "minAgeMonths": 24,
                    "maxAgeMonths": 60,
                    "domain": "discovery",
                    "pageCount": 20,
                    "topics": ["bible"],
                    "readingPrompts": []
                }
            ])
        ))

        # Set token and navigate
        page.goto("http://localhost:8080/")
        page.evaluate("localStorage.setItem('schoolos_token', 'test-token')")
        page.goto("http://localhost:8080/library/books")

        # Wait for content
        try:
            page.wait_for_selector("text=Optimized Book 1", timeout=15000)

            # Verify visibility
            expect(page.get_by_role("heading", name="My First Books").first).to_be_visible()
            expect(page.get_by_text("Optimized Book 1")).to_be_visible()

            # Take screenshot
            if not os.path.exists("verification"):
                os.makedirs("verification")
            page.screenshot(path="verification/library_optimized.png")
            print("Screenshot saved to verification/library_optimized.png")

        except Exception as e:
            print(f"Failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_library_optimization()
