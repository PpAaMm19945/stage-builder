import time
from playwright.sync_api import sync_playwright

def test_hymn_player():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Debug console
        page.on("console", lambda msg: print(f"LOG: {msg.text}"))

        # Mocks
        def handle_auth(route):
            print("Auth request intercepted")
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{"user": {"id": "1", "email": "test@example.com", "name": "Test User"}, "token": "mock-token", "children": [{"id": "child1", "name": "Child", "age_in_months": 48}]}'
            )
        page.route("**/api/auth/me", handle_auth)

        page.route("**/api/family/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"children": [{"id": "child1", "name": "Child", "ageInMonths": 48}], "materials": [{"id": "m1", "name": "Crayons", "status": "owned"}], "familySessions": [], "dailyPractices": [], "restDay": false, "needsPlan": false}'
        ))

        page.route("**/api/liturgy/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"date": "2023-10-27", "items": [{"id": "hymn-1", "type": "hymn", "title": "Amazing Grace", "content": "...", "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "completedToday": false}]}'
        ))

        page.route("**/api/books**", lambda r: r.fulfill(status=200, body="[]"))
        page.route("**/api/reading/history**", lambda r: r.fulfill(status=200, body="[]"))
        page.route("**/api/weekly-plan**", lambda r: r.fulfill(status=200, body='{"completions": {}}'))
        page.route("**/api/notifications", lambda r: r.fulfill(status=200, body="[]"))
        page.route("**/api/activity-completions**", lambda r: r.fulfill(status=200, body="{}"))

        # Manual Auth Injection
        print("Injecting auth...")
        page.goto("http://localhost:8080/login")
        page.evaluate("window.localStorage.setItem('token', 'mock-token')")

        print("Navigating to dashboard...")
        page.goto("http://localhost:8080/")

        try:
            page.wait_for_selector("text=Full Schedule", timeout=10000)
            print("Dashboard loaded.")
        except:
            print("Dashboard load failed. Check screenshot.")
            page.screenshot(path="verification/failed_load.png")
            browser.close()
            return

        # Steps...
        print("Expanding...")
        page.click("div.flex.items-center.justify-between.px-2 button")
        page.wait_for_selector("text=Amazing Grace")
        page.click("text=Amazing Grace")
        page.wait_for_selector("button:has-text('Play')")
        page.click("button:has-text('Play')")

        page.wait_for_selector("text=Amazing Grace", timeout=5000)
        page.screenshot(path="verification/1_player_expanded.png")
        print("Taken screenshot 1")

        page.click("text=Amazing Grace") # Collapse
        time.sleep(1)
        page.screenshot(path="verification/2_player_persists.png")
        print("Taken screenshot 2")

        page.click("div.fixed.bottom-4.right-4 div.border-b button:nth-of-type(1)") # Minimize
        time.sleep(1)
        page.screenshot(path="verification/3_player_minimized.png")
        print("Taken screenshot 3")

        browser.close()

if __name__ == "__main__":
    test_hymn_player()
