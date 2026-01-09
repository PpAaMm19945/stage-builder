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

    # Missing mocks added here - use Python types (False, True, None)
    page.route("**/api/liturgy/today", lambda route: route.fulfill(json={"items": []}))
    page.route("**/api/family/today", lambda route: route.fulfill(json={
        "children": [{"id": "1", "ageInMonths": 60}],
        "familySessions": [],
        "dailyPractices": [],
        "materials": [{"id": "1", "status": "owned"}],
        "needsPlan": False,
        "restDay": False
    }))
    page.route("**/api/books?*", lambda route: route.fulfill(json=[]))
    page.route("**/api/reading/history*", lambda route: route.fulfill(json=[]))

    page.route("**/api/family/daily-rhythm", lambda route: route.fulfill(json={"date": "2024-05-22", "items": [], "completions": {}, "preferences": {}}))
    page.route("**/api/family/weekly-plan", lambda route: route.fulfill(json={"id": "plan-1", "days": []}))

    page.goto("http://localhost:8080/")

    # Wait for the element
    link = page.get_by_label("View family progress")
    link.wait_for(state="visible", timeout=10000)

    # Check attributes
    href = link.get_attribute('href')
    aria_label = link.get_attribute('aria-label')
    print(f"Href: {href}")
    print(f"Aria Label: {aria_label}")

    # Verify it is an anchor tag (Link renders as 'a')
    tag_name = link.evaluate("el => el.tagName")
    print(f"Tag Name: {tag_name}")

    if tag_name != "A":
        raise Exception(f"Expected tag 'A', but got '{tag_name}'")

    # Take screenshot
    page.screenshot(path="verification/progress_link.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_link(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
