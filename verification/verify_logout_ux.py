import time
from playwright.sync_api import sync_playwright, expect

def verify_logout_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"BROWSER ERROR: {exc}"))

        # Mock Auth API
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"id": "user1", "name": "Test User", "email": "test@example.com", "avatarUrl": null}, "children": []}'
        ))

        # Mock other potential API calls to prevent 404s/loading
        # MOCK ALL THE THINGS to prevent crashes from undefined data
        page.route("**/api/family/today", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body='{"date": "2024-01-01", "activities": [], "needsPlan": false, "children": [], "materials": [], "familySessions": [], "dailyPractices": []}'
        ))

        page.route("**/api/notifications", lambda route: route.fulfill(
             status=200, content_type="application/json", body='[]'
        ))

        page.route("**/api/liturgy/today", lambda route: route.fulfill(
             status=200, content_type="application/json", body='{"items": []}'
        ))

        page.route("**/api/family/week-summary**", lambda route: route.fulfill(
             status=200, content_type="application/json", body='{"days": {}}'
        ))

        page.route("**/api/family/weekly-plan**", lambda route: route.fulfill(
             status=200, content_type="application/json", body='{"plan": {}, "completions": {}}'
        ))

        page.route("**/api/family/preferences", lambda route: route.fulfill(
             status=200, content_type="application/json", body='{"activitiesEnabled": true, "readingEnabled": true, "liturgyEnabled": true}'
        ))

        # IMPORTANT: Set the local storage token to simulate being logged in
        page.add_init_script("""
            localStorage.setItem('schoolos_token', 'fake-token');
        """)

        # Navigate to Dashboard
        try:
            print("Navigating to http://localhost:8080/ ...")
            page.goto("http://localhost:8080/")

            # Wait a bit to let errors happen if any
            time.sleep(2)

            # Check for error boundary
            if page.locator("text=Something Went Wrong").is_visible():
                print("❌ App crashed with Error Boundary.")
                page.screenshot(path="verification/crash.png")
                return

            # Wait for sidebar
            print("Waiting for logout button...")
            logout_btn = page.wait_for_selector('button[aria-label="Sign out"]', timeout=10000)

            if logout_btn:
                print("✅ Logout button found via aria-label='Sign out'")
                logout_btn.hover()
                time.sleep(1)
                page.screenshot(path="verification/success.png")
                print("📸 Screenshot taken: verification/success.png")
            else:
                print("❌ Logout button NOT found.")

        except Exception as e:
            print(f"❌ Verification failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_logout_ux()
