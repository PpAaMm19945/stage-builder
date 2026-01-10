from playwright.sync_api import sync_playwright, expect

def test_book_card_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use existing storage state if available to bypass auth, or mock it
        # Since I can't easily login, I'll mock the necessary API calls and localStorage

        context = browser.new_context()
        page = context.new_page()

        # Mock API responses
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"id": "test-user", "name": "Test User", "email": "test@example.com"}, "children": [{"id": "child-1", "name": "Child 1", "ageInMonths": 48}]}'
        ))

        # Mock Books API
        page.route("**/api/books?**", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id": "test-book", "title": "Test Book", "author": "Test Author", "series": "test_series", "minAgeMonths": 36, "maxAgeMonths": 72, "coverUrl": "https://placehold.co/400x300", "seriesTitle": "Test Series"}]'
        ))

        # Set localStorage token to simulate logged in state
        page.goto("http://localhost:8080/login")
        page.evaluate("localStorage.setItem('schoolos_token', 'mock-token')")

        # Navigate to Book Library (assuming it's at /early-years/activities?tab=books)
        page.goto("http://localhost:8080/early-years/activities?tab=books")

        # Wait for book card to appear
        # The book card should now have role="button"
        book_card = page.get_by_role("button", name="Open Test Book")
        expect(book_card).to_be_visible()

        # Check accessibility attributes
        # We can't strictly check 'tabindex' with get_by_role easily without evaluating JS,
        # but role="button" confirms the role change.

        # Check focus style (visual verification via screenshot)
        book_card.focus()
        page.wait_for_timeout(500) # Wait for focus styles

        page.screenshot(path="verification/book_card_focus.png")

        print("Book card found with correct role and accessible name.")

        browser.close()

if __name__ == "__main__":
    test_book_card_accessibility()
