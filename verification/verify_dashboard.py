
from playwright.sync_api import sync_playwright, Page, expect

def verify_dashboard_optimization(page: Page):
    # Mock Auth
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"user": {"id": "1", "name": "Test User", "email": "test@example.com"}, "children": []}'
    ))

    # Mock Today
    # We return empty children to trigger the "Welcome" state which is simpler to verify
    page.route("**/api/family/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"children": [], "materials": [], "familySessions": [], "dailyPractices": [], "needsPlan": false, "date": "2024-05-24"}'
    ))

    # Mock Liturgy
    page.route("**/api/liturgy/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"items": []}'
    ))

    # Mock Weekly Plan
    page.route("**/api/family/weekly-plan", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"completions": {}}'
    ))

    # Mock Notifications
    page.route("**/api/notifications", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    # Inject Token
    page.add_init_script("""
        localStorage.setItem('schoolos_token', 'mock_token');
    """)

    # Go to Dashboard
    page.goto("http://localhost:8080/")

    # Assert
    # Expect "Welcome to SchoolOS!" because we mocked no children
    expect(page.get_by_text("Welcome to SchoolOS!")).to_be_visible()

    # Take screenshot
    page.screenshot(path="/home/jules/verification/dashboard_optimized.png")
    print("Screenshot taken at /home/jules/verification/dashboard_optimized.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard_optimization(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
