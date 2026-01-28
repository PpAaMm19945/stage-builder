from playwright.sync_api import sync_playwright, Page
import os
import json

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Debug logging
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("requestfailed", lambda req: print(f"Request failed: {req.url} {req.failure}"))

        # Inject auth token
        page.add_init_script("""
            localStorage.setItem('schoolos_token', 'mock_token');
        """)

        # Fallback for other APIs to prevent errors (Register FIRST so it's overridden)
        page.route("**/api/**", lambda route: route.fulfill(status=200, body="{}"))

        # Mock API routes (Register LATER to override)
        def handle_me(route):
            print(f"Handling {route.request.url}")
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "user": {
                        "id": "user1",
                        "name": "Test User",
                        "email": "test@example.com",
                        "household_id": "house1",
                        "avatar_url": None,
                        "role": "parent",
                        "created_at": "2023-01-01T00:00:00Z",
                        "updated_at": "2023-01-01T00:00:00Z"
                    },
                    "children": [{
                        "id": "child1",
                        "name": "Child 1",
                        "age_in_months": 60,
                        "is_graduated": False,
                        "gender": "male",
                        "household_id": "house1"
                    }]
                })
            )

        page.route("**/api/auth/me", handle_me)

        # ARRAYS
        page.route("**/api/work/pending", lambda route: route.fulfill(status=200, body="[]"))
        page.route("**/api/students", lambda route: route.fulfill(status=200, body=json.dumps([{
                "id": "child1",
                "name": "Child 1",
                "age_in_months": 60,
                "avatarUrl": None
            }])))
        page.route("**/api/ai/interactions*", lambda route: route.fulfill(status=200, body="[]"))
        page.route("**/api/books?*", lambda route: route.fulfill(status=200, body="[]"))
        page.route("**/api/reading/history*", lambda route: route.fulfill(status=200, body="[]"))
        page.route("**/api/notifications", lambda route: route.fulfill(status=200, body="[]"))

        # OBJECTS
        page.route("**/api/rhythm/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "children": [{"id": "child1", "name": "Child 1", "age_in_months": 60, "is_graduated": False}],
                "familySessions": [],
                "morning": [],
                "evening": [],
                "materials": []
            })
        ))

        page.route("**/api/paths/today", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"items": [], "active_paths": []})
        ))

        page.route("**/api/family/week-summary?*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "days": {
                    "2024-01-01": {"completed": 1, "total": 5, "domains": ["Wisdom"]},
                }
            })
        ))

        page.route("**/api/family/preferences", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body=json.dumps({})
        ))


        try:
            print("Navigating to Dashboard...")
            page.goto("http://localhost:8080/")

            # Check local storage
            token = page.evaluate("localStorage.getItem('schoolos_token')")
            print(f"Token in localStorage: {token}")

            print("Waiting for dashboard content...")
            # Wait for "Hello, Test!" or similar to verify we are logged in and dashboard loaded
            page.wait_for_selector("text=Hello, Test", timeout=15000)

            # Wait for WeekStrip to appear (it has text "Week of")
            page.wait_for_selector("text=Week of", timeout=5000)

            print("Taking screenshot...")
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/dashboard_weekstrip.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()
