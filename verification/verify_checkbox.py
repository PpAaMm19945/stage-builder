from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to test page
        page.goto("http://localhost:8080/test-modal")

        # Wait for modal content
        page.wait_for_selector("text=How did it go?")

        # Locate the checkbox for the first child (Alice)
        # We look for the label "Loved it!"
        # Since there are multiple children, we'll pick the first one

        # In our TestModal, Alice is first.
        # We can find the checkbox by its ID if we knew it (passion-child-1), or by label.

        # Check that it exists and is unchecked
        # Note: Radix checkbox is a button with role='checkbox'
        checkbox = page.get_by_role("checkbox", name="Loved it!").first
        expect(checkbox).to_be_visible()
        expect(checkbox).not_to_be_checked()

        # Click the label to toggle it (verifying label association)
        label = page.locator("label", has_text="Loved it!").first
        label.click()

        # Verify it is now checked
        expect(checkbox).to_be_checked()

        # Take screenshot
        page.screenshot(path="verification/modal_checkbox.png")

        browser.close()
        print("Verification successful!")

if __name__ == "__main__":
    run()
