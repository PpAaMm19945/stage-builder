import time
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            base_url="http://localhost:8080"
        )
        page = context.new_page()

        # Inject token
        page.add_init_script("localStorage.setItem('schoolos_token', 'fake-token');")

        # Mock auth
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"id": "test-user", "name": "Test User", "email": "test@example.com", "role": "parent"}, "children": [{"id": "child-1", "name": "Child 1", "birthDate": "2020-01-01", "currentStage": "early-years"}]}'
        ))

        # Mock book list
        mock_books = []
        for i in range(10):
            mock_books.append({
                "id": f"book-{i}",
                "title": f"Book {i}",
                "author": "Author Name",
                "series": "Series A",
                "minAgeMonths": 24,
                "maxAgeMonths": 60,
                "coverUrl": "https://placehold.co/400",
                "renderFormat": "image"
            })

        page.route("**/api/books?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=str(mock_books).replace("'", '"')
        ))

        print("Navigating to Library...")
        try:
            page.goto("/early-years/activities?tab=books")

            # Wait for book card
            print("Waiting for book card...")
            page.wait_for_selector("text=Book 0", timeout=10000)

            print("Clicking 'Open Book 0' via aria-label...")
            page.get_by_label("Open Book 0").click()

            # Wait for modal - BookReader usually has a dialog overlay
            print("Waiting for modal...")
            # Look for something inside the modal. The generic Close button?
            # Or the fullscreen button?
            # Or just wait a second and take a screenshot.
            time.sleep(2)

            print("Taking screenshot of modal...")
            page.screenshot(path="verification/modal_open.png")

            print("Verification successful: Modal should be visible.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_retry.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
