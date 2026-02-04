from playwright.sync_api import Page, expect, sync_playwright

def test_work_logger_ux(page: Page):
    # Mock the apprenticeships API call
    page.route("**/api/apprenticeships", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": "app1", "title": "Software Engineering", "organizationName": "Tech Corp", "mentorName": "Alice"}]'
    ))

    # Mock the log work API call to fail (to test toast error)
    page.route("**/api/work/log", lambda route: route.fulfill(
        status=500,
        content_type="application/json",
        body='{"error": "Simulated failure"}'
    ))

    # Navigate to the verification page
    page.goto("http://localhost:8080/verification/work-logger")

    # Verify the form renders (meaning apprenticeships were loaded)
    expect(page.get_by_text("Log Work Hours")).to_be_visible()

    # Verify Accessibility: clicking the label should focus the select/input
    # 1. Apprenticeship Select
    # Use get_by_label to verify the label is correctly associated
    page.get_by_label("Apprenticeship").select_option("app1")

    # 2. Date Input
    # Clicking label should focus input
    page.get_by_label("Date").click()
    expect(page.locator("#work-date")).to_be_focused()

    # 3. Hours Input
    page.get_by_label("Hours").fill("2")

    # 4. Description Input
    page.get_by_label("What did you do?").fill("Fixed accessibility issues")

    # 5. Photo URL (Optional)
    page.get_by_label("Photo (Optional)").click()
    expect(page.locator("#work-photo")).to_be_focused()

    # Submit the form to see the error toast
    page.get_by_role("button", name="Log Work").click()

    # Verify Toast appears
    # Sonner toasts usually have a specific structure.
    # We look for the text "Failed to submit work log"
    expect(page.get_by_text("Failed to submit work log")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/work_logger_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_work_logger_ux(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
            raise e
        finally:
            browser.close()
