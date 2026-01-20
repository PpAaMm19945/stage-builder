from playwright.sync_api import Page, expect, sync_playwright
import json
import os

def test_dashboard(page: Page):
    # Mock Auth Me
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "user": {
                "id": "u1",
                "email": "test@example.com",
                "name": "Test User"
            },
            "children": [
                {
                    "id": "c1",
                    "parent_id": "u1",
                    "name": "Child 1",
                    "date_of_birth": "2020-01-01",
                    "age_in_months": 48,
                    "current_stage": "early-years",
                    "is_graduated": False
                }
            ]
        })
    ))

    # Mock Family Today
    page.route("**/api/family/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "children": [{"id": "c1", "name": "Child 1", "age_in_months": 48}],
            "materials": [{"id": "m1", "status": "owned"}],
            "familySessions": [],
            "dailyPractices": [],
            "message": "Welcome back!",
            "needsPlan": False,
            "restDay": False
        })
    ))

    # Mock Family Week Summary
    page.route("**/api/family/week-summary*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "days": {}
        })
    ))

    # Mock Liturgy Today
    page.route("**/api/liturgy/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "items": []
        })
    ))

    # Mock Weekly Plan
    page.route("**/api/family/weekly-plan", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({})
    ))

    # Mock Preferences
    page.route("**/api/family/preferences", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({})
    ))

    # Mock Time Spent
    page.route("**/api/analytics/time-spent", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({ "students": [], "totalMinutes": 0 })
    ))

    # Mock Notifications
    page.route("**/api/notifications", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([])
    ))

    # Mock Work Approvals
    page.route("**/api/work-approvals/pending", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([])
    ))

    # Set local storage token before navigation
    page.add_init_script("localStorage.setItem('schoolos_token', 'fake-token')")

    # Navigate to Dashboard
    print("Navigating to Dashboard...")
    page.goto("http://localhost:8080/")

    # Expect to see Welcome
    print("Waiting for greeting...")
    expect(page.get_by_text("Hello, Test!")).to_be_visible(timeout=10000)

    # Wait for WeekStrip
    print("Waiting for Regenerate button...")
    expect(page.get_by_text("Regenerate")).to_be_visible()

    # Screenshot
    os.makedirs("verification", exist_ok=True)
    page.screenshot(path="verification/verification.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_dashboard(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
