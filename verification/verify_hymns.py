from playwright.sync_api import Page, expect, sync_playwright

def test_hymns_browser(page: Page):
    # Mock Auth Me
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "user": {
                "id": "u1",
                "email": "test@example.com",
                "name": "Test User",
                "avatar_url": null,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            },
            "children": [
                {
                    "id": "c1",
                    "parent_id": "u1",
                    "name": "Child 1",
                    "date_of_birth": "2020-01-01",
                    "age_in_months": 48,
                    "current_stage": "early-years",
                    "avatar_url": null,
                    "created_at": "2023-01-01T00:00:00Z",
                    "updated_at": "2023-01-01T00:00:00Z"
                }
            ]
        }'''
    ))

    # Mock Hymns List
    page.route("**/api/hymns", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''[
            {
                "id": "h1",
                "title": "Holy, Holy, Holy",
                "content": "Holy, holy, holy! Lord God Almighty!...",
                "reference": "Reginald Heber, 1826",
                "sequence_number": 1,
                "audio_url": "https://example.com/hymn1.mp3"
            },
            {
                "id": "h2",
                "title": "Amazing Grace",
                "content": "Amazing grace! How sweet the sound...",
                "reference": "John Newton, 1779",
                "sequence_number": 2
            }
        ]'''
    ))

    # Set local storage token before navigation
    page.add_init_script("localStorage.setItem('schoolos_token', 'fake-token')")

    # Navigate to Hymns tab
    page.goto("http://localhost:8080/early-years/activities?tab=hymns")

    # Expect to see Hymns
    expect(page.get_by_text("Holy, Holy, Holy")).to_be_visible()
    expect(page.get_by_text("Reginald Heber, 1826")).to_be_visible()

    # Screenshot
    page.screenshot(path="verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_hymns_browser(page)
        finally:
            browser.close()
