import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to test page
        page.goto("http://localhost:8080/test-book-reader")

        # Wait for book reader to open (it's open by default in TestBookReader)
        # But BookReader uses a Dialog, which might animate in.
        # Wait for dialog content.
        page.wait_for_selector('[role="dialog"]')

        # Find the right navigation zone.
        # It has title="Next page"
        next_zone = page.get_by_title("Next page")

        # Expect it to be visible (it's an empty div but it has dimensions)
        # Actually it's just a div.

        # Hover over it
        next_zone.hover()

        # Take screenshot
        os.makedirs("/home/jules/verification", exist_ok=True)
        page.screenshot(path="/home/jules/verification/book_reader_hover.png")

        browser.close()

if __name__ == "__main__":
    run()
