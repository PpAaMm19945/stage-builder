import time
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(base_url="http://localhost:8080")
        page = context.new_page()

        # Listen for errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Inject fake token to pass isAuthenticated() check
        page.add_init_script("""
            localStorage.setItem('schoolos_token', 'fake-token');
        """)

        # Mock /api/auth/me
        page.route("**/api/auth/me", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"user": {"id": "test-user", "name": "Test Family", "email": "test@example.com"}, "children": [{"id": "child-1", "name": "Alice", "age_in_months": 48}]}'
        ))

        day_body = '''{
                "children": [{"id": "child-1", "name": "Alice", "ageInMonths": 48}],
                "familySessions": [
                    {
                        "timeSlot": "morning",
                        "isCompleted": false,
                        "formation": {
                            "id": "act-1",
                            "title": "Build a Tower",
                            "description": "Use blocks to build a tall tower.",
                            "formation_type": "activity",
                            "context_anchor": "Table Fellowship",
                            "materials": ["Blocks"],
                            "duration_minutes": 15
                        }
                    },
                    {
                        "timeSlot": "afternoon",
                        "isCompleted": false,
                        "formation": {
                            "id": "act-2",
                            "title": "Nature Walk",
                            "description": "Collect leaves.",
                            "formation_type": "activity",
                            "context_anchor": "Walk By The Way",
                            "materials": ["Bag"],
                            "duration_minutes": 20
                        }
                    }
                ],
                "dailyPractices": [],
                "materials": [],
                "needsPlan": false,
                "restDay": false
            }'''

        # Mock /api/family/today
        page.route("**/api/family/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=day_body
        ))

        # Mock /api/family/day/*
        page.route("**/api/family/day/*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=day_body
        ))

        # Mock /api/family/week-summary?*
        page.route("**/api/family/week-summary*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"days": {}}'
        ))

        # Mock /api/liturgy/today
        page.route("**/api/liturgy/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"items": []}'
        ))

        # Mock /api/family/weekly-plan
        page.route("**/api/family/weekly-plan", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"completions": {}}'
        ))

         # Mock /api/books (recommended books)
        page.route("**/api/books?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # Mock /api/reading/history?*
        page.route("**/api/reading/history*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # Mock /api/notifications
        page.route("**/api/notifications", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[]'
        ))

        # Mock CORS
        page.route("**/api/family/preferences", lambda route: route.fulfill(status=200, body="{}"))
        page.route("**/api/students", lambda route: route.fulfill(status=200, body="[]"))


        print("Navigating to Dashboard...")
        page.goto("/")

        try:
            # Wait for "Hello, Test!"
            print("Waiting for greeting...")
            expect(page.get_by_role("heading", name="Hello, Test")).to_be_visible(timeout=10000)

            # Wait for Up Next to show the Header "Morning Circle" (based on screenshot)
            print("Waiting for Up Next...")
            expect(page.get_by_text("Morning Circle")).to_be_visible()

            # Taking a screenshot of initial state
            page.screenshot(path="verification/dashboard_initial.png")
            print("Screenshot saved to verification/dashboard_initial.png")

            # Click "View Full Schedule" arrow button on UpNext card
            print("Expanding full schedule...")
            page.get_by_title("View Full Schedule").click()

            time.sleep(1)
            page.screenshot(path="verification/dashboard_expanded.png")
            print("Screenshot saved to verification/dashboard_expanded.png")

            # Verify "Build a Tower" is now visible
            expect(page.get_by_text("Build a Tower")).to_be_visible()

            print("Dashboard verification successful.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/dashboard_failure.png")
            print("Saved failure screenshot to verification/dashboard_failure.png")
            raise e

        browser.close()

if __name__ == "__main__":
    run_verification()
