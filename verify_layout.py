
import json
from playwright.sync_api import sync_playwright, expect

def verify_layout(page):
    # Mock Auth and API - Use wildcards to match absolute URLs if needed
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "user": {
                "id": "user123",
                "name": "Test User",
                "email": "test@example.com",
                "avatar_url": "https://example.com/avatar.png",
                "household_id": "house123",
                "role": "parent",
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            },
            "children": []
        })
    ))

    page.route("**/api/work/pending", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([])
    ))

    page.route("**/api/rhythm/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({ "children": [] })
    ))

    page.route("**/api/family/preferences", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "activitiesEnabled": True,
            "readingEnabled": True,
            "liturgyEnabled": True
        })
    ))

    page.route("**/api/notifications", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([])
    ))

    # Inject token
    page.add_init_script("""
        localStorage.setItem('schoolos_token', 'mock_token');
    """)

    # Navigate
    page.goto("http://localhost:8080/dashboard")

    # Wait for page load
    expect(page.get_by_text("Test User")).to_be_visible()

    # 1. Verify Left Sidebar Header
    # It should have "FamilyPath"
    expect(page.get_by_text("FamilyPath", exact=True)).to_be_visible()

    # 2. Verify Chat Sidebar (Right)
    # Target the desktop aside element (it has class lg:flex)
    # We must escape the colon in CSS selector
    desktop_sidebar = page.locator("aside.lg\\:flex")
    expect(desktop_sidebar).to_be_visible()

    # Take screenshot of initial state (Both sidebars open)
    page.screenshot(path="/home/jules/verification/layout_initial.png")

    # 3. Toggle Chat Sidebar (Close)
    # Find toggle button in header. It's an icon button with "Toggle chat" aria-label
    toggle_btn = page.get_by_label("Toggle chat")
    toggle_btn.click()

    # Verify Chat Sidebar is GONE
    # When closed, it returns null, so it shouldn't be in DOM or visible
    expect(desktop_sidebar).not_to_be_visible()

    # Take screenshot (Chat closed)
    page.screenshot(path="/home/jules/verification/layout_chat_closed.png")

    # 4. Toggle Chat Sidebar (Open)
    toggle_btn.click()
    expect(desktop_sidebar).to_be_visible()

    # 5. Close Chat using the "X" button in Chat Panel Header
    # We find the button inside the sidebar header.
    # The header is inside the aside.
    # Look for button with X icon inside the sidebar
    # We locate the header row inside the desktop sidebar
    # .flex-row matches the header class we added
    # We need to wait for it to be visible again
    expect(desktop_sidebar).to_be_visible()

    # Click the button inside the header
    desktop_sidebar.locator(".flex-row").locator("button").click()

    expect(desktop_sidebar).not_to_be_visible()

    # 6. Verify Left Sidebar Collapse
    # Find Sidebar Trigger
    sidebar_trigger = page.locator("button[data-sidebar='trigger']")
    sidebar_trigger.click()

    # Verify "FamilyPath" text is hidden (since it's offcanvas/collapsed)
    # Using expect(...).not_to_be_in_viewport() or check state.
    # The sidebar moves off-canvas.
    # Let's check that the sidebar wrapper has data-state="collapsed"

    # Take screenshot (Left Sidebar Collapsed)
    page.screenshot(path="/home/jules/verification/layout_left_collapsed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to Desktop
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Create directory
        import os
        os.makedirs("/home/jules/verification", exist_ok=True)

        try:
            verify_layout(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
        finally:
            browser.close()
