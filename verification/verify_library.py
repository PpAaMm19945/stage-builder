
from playwright.sync_api import sync_playwright

def verify_book_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Inject auth token to bypass login
        page.add_init_script("""
            localStorage.setItem('schoolos_token', 'mock_token');
            localStorage.setItem('user_settings', JSON.stringify({
                theme: 'light',
                fontSize: 'medium'
            }));
        """)

        # Mock API responses
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"id": "user123", "email": "test@example.com", "name": "Test User", "role": "parent"}'
        ))

        page.route("**/api/books?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'  # Empty array for API books
        ))

        # Navigate to the library page - based on App.tsx it is /early-years/activities
        try:
            print("Navigating to /early-years/activities...")
            page.goto("http://localhost:8080/early-years/activities", timeout=15000)
            page.wait_for_load_state('networkidle')
        except Exception as e:
            print(f"Navigation failed: {e}")
            # Try capturing screenshot anyway
            page.screenshot(path="verification/failed_nav.png")
            return

        # Wait for the content to load
        page.wait_for_timeout(3000)

        # Look for "Bible - Pentateuch" header
        try:
            header = page.wait_for_selector("text=Bible - Pentateuch", timeout=5000)
            if header:
                print("Found Bible - Pentateuch header")
        except:
            print("Could not find Bible - Pentateuch header")

        # Take screenshot
        page.screenshot(path="verification/book_library.png", full_page=True)
        print("Screenshot saved to verification/book_library.png")

        browser.close()

if __name__ == "__main__":
    verify_book_library()
