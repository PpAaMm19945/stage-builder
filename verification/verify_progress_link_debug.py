from playwright.sync_api import sync_playwright

def verify_link(page):
    # Mock the API responses
    page.route("**/api/auth/me", lambda route: route.fulfill(json={"user": {"id": "1", "name": "Test User"}, "children": []}))
    page.route("**/api/students", lambda route: route.fulfill(json=[
        {"id": "1", "name": "Alice", "avatarUrl": "https://example.com/alice.png"},
        {"id": "2", "name": "Bob", "avatarUrl": "https://example.com/bob.png"}
    ]))
    page.route("**/api/notifications", lambda route: route.fulfill(json=[]))
    page.route("**/api/family/daily-rhythm", lambda route: route.fulfill(json={"date": "2024-05-22", "items": [], "completions": {}, "preferences": {}}))

    page.goto("http://localhost:8080/")

    # Take screenshot of the whole page to see what's happening
    page.screenshot(path="verification/debug_page.png", full_page=True)

    # Try to find the element by text first if aria-label fails
    try:
        page.get_by_text("active this week").wait_for(state="visible", timeout=5000)
        print("Found text 'active this week'")
    except:
        print("Could not find text 'active this week'")

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
