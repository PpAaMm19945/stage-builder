from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_book_reader():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        )
        page = context.new_page()

        # Debug console
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        # Mock API calls

        # 1. Mock Auth - Include name to prevent crash
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"id": "user1", "email": "test@example.com", "name": "Test User"}, "children": [{"id": "child1", "name": "Child 1", "ageInMonths": 36}]}'
        ))

        # 2. Mock Books List
        page.route("**/api/books*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id": "book1", "title": "Test Book", "series": "Series A", "pageCount": 3, "renderFormat": "image", "contentPath": "books/Series A/book1", "styleProfile": "default"}]'
        ))

        # 3. Mock Reading History
        page.route("**/api/reading/history*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # 4. Mock Book Content/Images
        EMPTY_PNG = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'

        page.route("**/*.png", lambda route: route.fulfill(
            status=200,
            content_type="image/png",
            body=EMPTY_PNG
        ))
        page.route("**/*.webp", lambda route: route.fulfill(
            status=200,
            content_type="image/webp",
            body=EMPTY_PNG
        ))

        print("Navigating...")
        # Navigate to /early-years/reading
        page.goto("http://localhost:8080/early-years/reading")
        page.evaluate("localStorage.setItem('schoolos_token', 'test_token')")

        # Reload to apply auth
        page.goto("http://localhost:8080/early-years/reading")

        print("Waiting for book card...")
        # Wait for book card
        try:
             # Wait for a book card to appear.
             page.wait_for_selector("text=Test Book", timeout=10000)
             print("Found book card. Clicking...")
             page.click("text=Test Book")

             # Wait for Dialog
             page.wait_for_selector("div[role='dialog']", timeout=5000)
             print("Dialog opened.")

             # 1. Screenshot Cover
             time.sleep(1)
             page.screenshot(path="verification/1_cover.png")
             print("Captured Cover")

             # 2. Navigate Next (Tap Right Zone)
             # Center X: 390/2 = 195.
             # Right 20%: x > 312.
             # Let's click at 350.
             page.mouse.click(350, 400)
             time.sleep(1) # Wait for slide
             page.screenshot(path="verification/2_page1.png")
             print("Captured Page 1")

             # 3. Navigate to End
             # Page count is 3. Cover -> Page 1 -> Page 2 -> Page 3 -> End

             # Click again for Page 2
             page.mouse.click(350, 400)
             time.sleep(0.5)

             # Click again for Page 3
             page.mouse.click(350, 400)
             time.sleep(0.5)

             # Click again for End
             page.mouse.click(350, 400)
             time.sleep(1)

             page.screenshot(path="verification/3_end.png")
             print("Captured End Slide")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        browser.close()

if __name__ == "__main__":
    verify_book_reader()
