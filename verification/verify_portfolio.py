from playwright.sync_api import Page, expect, sync_playwright
import json
import time

def test_portfolio_overlay(page: Page):
    # Mock the portfolio items API response
    page.route("**/api/portfolio/test-student*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([
            {
                "id": "item-1",
                "studentId": "test-student",
                "title": "My Drawing",
                "itemType": "image",
                "publicUrl": "https://placehold.co/600x400/png",
                "createdAt": "2023-10-01T10:00:00Z",
                "description": "A nice drawing"
            },
            {
                "id": "item-2",
                "studentId": "test-student",
                "title": "Report Card",
                "itemType": "document",
                "publicUrl": "https://example.com/report.pdf",
                "createdAt": "2023-10-02T10:00:00Z",
                "description": "Final report",
                "domain": "wisdom"
            }
        ])
    ))

    # Go to the verification page
    page.goto("http://localhost:8080/verification/portfolio")

    # Wait for the card to appear
    expect(page.get_by_text("Report Card")).to_be_visible()

    # Find the link overlay on the "Report Card" item
    # It should have the new aria-label
    link = page.get_by_label("Open Report Card in new tab")
    expect(link).to_be_visible()

    # Check attributes
    expect(link).to_have_attribute("target", "_blank")
    expect(link).to_have_attribute("rel", "noopener noreferrer")

    # Hover to show state
    link.hover()
    time.sleep(0.5)

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/portfolio_overlay_hover.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_portfolio_overlay(page)
            print("Verification script passed!")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()
