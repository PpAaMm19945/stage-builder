from playwright.sync_api import sync_playwright

def verify_link(page):
    # Set token in local storage
    page.context.add_init_script("""
        localStorage.setItem('schoolos_token', 'fake-token');
    """)

    # Mock the API responses
    page.route("**/api/auth/me", lambda route: route.fulfill(json={"user": {"id": "1", "name": "Test User"}, "children": []}))
    page.route("**/api/students", lambda route: route.fulfill(json=[
        {"id": "1", "name": "Alice", "avatarUrl": "https://example.com/alice.png"},
        {"id": "2", "name": "Bob", "avatarUrl": "https://example.com/bob.png"}
    ]))
    page.route("**/api/notifications", lambda route: route.fulfill(json=[]))
    page.route("**/api/family/daily-rhythm", lambda route: route.fulfill(json={"date": "2024-05-22", "items": [], "completions": {}, "preferences": {}}))
    page.route("**/api/family/weekly-plan", lambda route: route.fulfill(json={"id": "plan-1", "days": []}))

    page.goto("http://localhost:8080/")

    # Wait a bit for rendering
    page.wait_for_timeout(3000)

    # Take screenshot of the whole page to see if we are in dashboard
    page.screenshot(path="verification/debug_page_2.png", full_page=True)

    # Try to find 'Alice' text which should be in the component
    try:
        page.get_by_text("Alice").wait_for(state="visible", timeout=5000)
        print("Found text 'Alice'")
    except:
        print("Could not find text 'Alice'")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_link(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
