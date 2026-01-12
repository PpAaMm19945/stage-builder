import time
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            base_url="http://localhost:8080"
        )
        page = context.new_page()

        # Mock authentication with children
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"id": "test-user", "name": "Test User", "email": "test@example.com", "role": "parent"}, "children": [{"id": "child-1", "name": "Child 1", "birthDate": "2020-01-01"}]}'
        ))

        # Mock book list
        mock_books = []
        for i in range(50):
            mock_books.append({
                "id": f"book-{i}",
                "title": f"Book {i}",
                "author": "Author Name",
                "series": "Series A" if i < 25 else "Series B",
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

            # Wait for books to load
            print("Waiting for 'Series A'...")
            page.wait_for_selector("text=Series A", timeout=10000)

            # Open console message listener
            console_messages = []
            page.on("console", lambda msg: console_messages.append(msg.text) if "Rendering BookCard" in msg.text else None)

            print("Initial load complete. Clearing console logs...")
            console_messages.clear()

            # Trigger a re-render by clicking a book to open the modal
            print("Clicking a book to open modal...")
            # We need to target the book card specifically
            page.click("text=Book 0")

            # Wait a bit for React to process
            page.wait_for_timeout(2000)

            render_count = len(console_messages)
            print(f"Number of 'Rendering BookCard' logs after click: {render_count}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            print("Screenshot saved to verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
