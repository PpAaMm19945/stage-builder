from playwright.sync_api import sync_playwright, expect
import os

def verify_library():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to Library...")
        page.goto("http://localhost:8080/library")

        # Verify page title or header
        expect(page.get_by_role("heading", name="Library")).to_be_visible()
        print("Library loaded.")

        # Verify Tabs exist
        print("Verifying tabs...")
        expect(page.get_by_text("Formations")).to_be_visible()
        expect(page.get_by_text("Books")).to_be_visible()
        expect(page.get_by_text("Hymns")).to_be_visible()

        # Click Books tab
        print("Clicking Books tab...")
        page.get_by_text("Books").click()

        page.wait_for_timeout(2000)

        # Take screenshot relative to current dir
        page.screenshot(path="verification/library_tabs.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_library()
