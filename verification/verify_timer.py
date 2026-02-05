from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_timer_accessibility(page: Page):
    print("Navigating to verify-palette...")
    page.goto("http://localhost:8080/verify-palette")

    # Wait for page to load
    page.wait_for_selector("text=Palette Verification")
    print("Page loaded.")

    # 1. Expand the card to auto-start the timer
    # Label is "Expand details for Test Formation"
    expand_button = page.get_by_label("Expand details for Test Formation")
    expect(expand_button).to_be_visible()
    expand_button.click()
    print("Clicked expand.")

    # 2. Wait for timer to appear in the header.
    # It auto-starts, so isRunning=True.
    # The label should be "Pause timer"
    # Note: There are TWO pause buttons now. One in header (FormationTimer), one in body (Button).
    # FormationTimer uses the Tooltip.

    # Let's look for the one in the header.
    # We can rely on the tooltip existence which I added. The body button does NOT have a tooltip (it has text).

    # Wait for the header timer to appear
    # The header timer has class "rounded-full" and "ml-2" (from FormationCard usage)
    # But simpler: look for the button with aria-label "Pause timer" inside the header?
    # Or just look for any "Pause timer" button that is NOT the body one.
    # The body button has text "Pause Timer" (visible text).
    # The header button has aria-label "Pause timer" (icon only).

    # So get_by_label("Pause timer") should match the header button.
    # get_by_role("button", name="Pause timer") might match both if text matches aria-label?
    # The body button text is "Pause Timer" (capital T).
    # My FormationTimer label is "Pause timer" (lowercase t).

    pause_button = page.get_by_label("Pause timer", exact=True)
    expect(pause_button).to_be_visible()
    print("Header Pause button found.")

    # Hover to show tooltip
    pause_button.hover()

    # Wait a bit for tooltip animation
    time.sleep(1)

    # 3. Assert: Tooltip is visible
    tooltip = page.get_by_role("tooltip")
    if tooltip.count() > 0:
        expect(tooltip).to_contain_text("Pause timer")
        print("Tooltip verified via role.")
    else:
        expect(page.get_by_text("Pause timer", exact=True)).to_be_visible()
        print("Tooltip verified via text.")

    # 4. Screenshot
    page.screenshot(path="/app/verification/timer_verification.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_timer_accessibility(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/app/verification/timer_failure.png")
            raise
        finally:
            browser.close()
