import os
from playwright.sync_api import sync_playwright, expect

def verify_settings(page):
    print("Setting up network interception...")

    # Mock auth/me
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"user": {"id": "test-user", "email": "test@example.com", "name": "Test Parent", "role": "parent"}, "children": []}'
    ))

    # Mock formation preferences
    page.route("**/api/family/preferences", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"learningFocus": "balanced"}'
    ))

    # Mock profile
    page.route("**/api/profile", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"goals": [], "available_days": ["Mon", "Tue"], "preferences": {"lighterFridays": false}}'
    ))

    print("Navigating to home...")
    page.goto("http://localhost:8080")

    print("Setting mock token...")
    page.evaluate("localStorage.setItem('schoolos_token', 'mock_token')")

    # Reload to trigger AuthProvider with the token and intercepted request
    print("Reloading to trigger auth...")
    page.reload()

    print("Navigating to settings?tab=curriculum...")
    page.goto("http://localhost:8080/settings?tab=curriculum")

    print("Waiting for 'Primary Goals'...")
    # Wait for the settings page to load
    expect(page.get_by_text("Primary Goals")).to_be_visible(timeout=10000)

    print("Verifying elements...")
    expect(page.get_by_label("Westminster Catechism")).to_be_visible()
    expect(page.get_by_text("Lighter Fridays")).to_be_visible()
    expect(page.get_by_text("Sunday Rest")).to_be_visible()

    print("Settings elements found! Taking screenshot...")
    page.screenshot(path="/home/jules/verification/verification.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_settings(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            try:
                page.screenshot(path="/home/jules/verification/settings_failure.png")
                print("Failure screenshot saved to /home/jules/verification/settings_failure.png")
            except:
                pass
            raise e
        finally:
            browser.close()
