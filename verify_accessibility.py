from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the test page
            print("Navigating to http://localhost:8080/test-accessibility")
            page.goto("http://localhost:8080/test-accessibility")

            # Wait for content to load
            page.wait_for_selector("h2", timeout=10000)

            # --- Verify TomorrowPreview ---
            print("Verifying TomorrowPreview...")

            # TomorrowPreview starts CLOSED.
            # "If !isOpen, return <Button ...>Peek at Tomorrow</Button>"

            # So first we see the "Peek at Tomorrow" button.
            peek_button = page.get_by_text("Peek at Tomorrow")
            expect(peek_button).to_be_visible()
            print("  Clicked 'Peek at Tomorrow' button")
            peek_button.click()

            # Now it should be open, showing the Card and the Close button.
            # Wait for the card to appear
            card = page.locator("div[role='region'][aria-label=\"Tomorrow's plan\"]")
            expect(card).to_be_visible()
            print("  ✅ Card has role='region' and aria-label='Tomorrow\'s plan'")

            close_button = page.locator("button[aria-label='Close preview']")
            expect(close_button).to_be_visible()
            print("  ✅ Close button has aria-label='Close preview'")


            # --- Verify PathCard ---
            print("Verifying PathCard...")

            # Active Card (mockSubscription.is_paused = false) -> Pause button
            # Note: PathCard renders multiple instances. We need to be careful with locators.
            # But aria-label should be unique enough per button type, though we have multiple PathCards.
            # We can scope by section if needed, but strict mode might complain if multiple elements match.
            # Playwright's locator().first matches the first one.

            pause_button = page.locator("button[aria-label='Pause path']").first
            expect(pause_button).to_be_visible()
            print("  ✅ Pause button has aria-label='Pause path'")

            # Paused Card (mockPausedSubscription.is_paused = true) -> Resume button
            resume_button = page.locator("button[aria-label='Resume path']").first
            expect(resume_button).to_be_visible()
            print("  ✅ Resume button has aria-label='Resume path'")

            # Screenshot
            os.makedirs("/home/jules/verification", exist_ok=True)
            page.screenshot(path="/home/jules/verification/accessibility_check.png", full_page=True)
            print("Screenshot saved to /home/jules/verification/accessibility_check.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
