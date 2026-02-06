from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_anchor_ui(page: Page):
    # Mock Auth
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"user": {"id": "u1", "email": "test@example.com", "name": "Test Parent", "role": "parent"}, "children": []}'
    ))

    # Mock Anchor Data
    page.route("**/api/anchor/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "date": "2024-01-20",
            "theme": "God's Creation",
            "liturgy": {
                "hymn": "All Creatures of Our God and King",
                "scripture": "In the beginning, God created the heavens and the earth.",
                "catechism_q": 1,
                "catechism_a": "God made me and all things."
            },
            "family_activity": {
                "title": "Nature Walk",
                "description": "Go for a walk and find things God made.",
                "skill_domain": "Observation",
                "formation_lens": "Wonder",
                "levels": []
            },
            "book_nook": {
                "title": "Creation Story",
                "author": "Bible",
                "cover_image": "https://placehold.co/400x600",
                "discussion_prompt": "What did God make?"
            }
        }'''
    ))

    # Mock Complete Action (with delay)
    def handle_complete(route):
        time.sleep(2) # Delay to show spinner
        route.fulfill(status=200, body='{"success": true}')

    page.route("**/api/anchor/complete", handle_complete)

    # Set token in localStorage to bypass initial check
    page.add_init_script("localStorage.setItem('schoolos_token', 'fake-token')")

    # Navigate to Dashboard
    print("Navigating to dashboard...")
    page.goto("http://localhost:8080/dashboard")

    # Wait for AnchorCard to appear
    expect(page.get_by_text("God's Creation")).to_be_visible()

    # Screenshot Initial State
    print("Taking initial screenshot...")
    page.screenshot(path="verification/1_anchor_loaded.png")

    # Find Complete Button
    complete_btn = page.get_by_role("button", name="Complete Today's Anchor")
    expect(complete_btn).to_be_visible()

    # Click Complete
    print("Clicking complete...")
    complete_btn.click()

    # Wait for "Completing..." text or Spinner (Loader2 is implicit, text changes)
    expect(page.get_by_text("Completing...")).to_be_visible()

    # Screenshot Loading State
    print("Taking loading screenshot...")
    page.screenshot(path="verification/2_completing.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_anchor_ui(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
