
from playwright.sync_api import Page, expect, sync_playwright
import time
import os

def verify_book_reader_a11y(page: Page):
    """
    Verifies that the accessibility attributes (aria-labels) are present in the BookReader component.
    """

    # Enable console logging
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # Mock Auth - Match exact structure expected by AuthContext
    page.route("**/api/auth/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"user": {"id": "test-user", "name": "Test User", "email": "test@example.com", "role": "parent"}, "children": [{"id": "child1", "name": "Child 1", "age": 5, "gender": "male"}]}'
    ))

    # Mock Books list - The app likely appends query params like ?limit=100
    page.route("**/api/books?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"id": "book1", "title": "Test Book", "series": "test-series", "coverUrl": "https://placehold.co/200x300", "renderFormat": "image", "pageCount": 5, "readingPrompts": [{"page": 1, "prompt": "Test Prompt"}]}]'
    ))

    # Mock Notifications (often fetched on dashboard load) to prevent errors
    page.route("**/api/notifications", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    # Mock Family Today (often fetched)
    page.route("**/api/family/today", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"date": "2026-01-11", "message": "Welcome", "schedule": []}'
    ))

    # Mock Formation Preferences (this was causing the error!)
    page.route("**/api/family/preferences", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"activitiesEnabled": true, "readingEnabled": true, "liturgyEnabled": true, "learningFocus": "balanced"}'
    ))

    # Mock Formations (referenced in error logs)
    page.route("**/api/formations?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    # Set schoolos_token in localStorage to bypass login check in AuthContext
    page.add_init_script("localStorage.setItem('schoolos_token', 'test-token');")

    print("Navigating to Library...")
    page.goto("http://localhost:8080/early-years/activities?tab=books")

    # Wait for the book to appear
    print("Waiting for book card...")
    try:
        # Relaxed check for book title - just waiting for the button is safer
        book_card = page.get_by_role("button", name="Open Test Book")
        book_card.wait_for(timeout=10000)

    except Exception as e:
        print(f"Book card not found. Taking screenshot.")
        page.screenshot(path="verification/error_no_book.png")
        raise e

    # 3. Open the Book Reader
    print("Clicking book card...")
    book_card.click()

    # 4. Verify the Book Reader is open
    print("Waiting for reader...")
    # Wait for the dialog content to appear - verify the heading inside the dialog
    expect(page.get_by_role("dialog")).to_be_visible()

    # Find the title specifically inside the dialog to avoid strict mode violation (ambiguous with card title)
    expect(page.get_by_role("heading", name="Test Book")).to_be_visible()

    # 5. Verify Accessibility Attributes
    print("Verifying attributes...")

    # "Close reader" button
    close_button = page.get_by_label("Close reader")
    expect(close_button).to_be_visible()
    print("✅ Close button found")

    # "Toggle reading prompts" button
    prompt_button = page.get_by_label("Show reading prompts") # Initial state
    expect(prompt_button).to_be_visible()
    print("✅ Prompt button found")

    # Toggle it to check the other state
    prompt_button.click()

    # Wait for state change
    prompt_button_hide = page.get_by_label("Hide reading prompts")
    expect(prompt_button_hide).to_be_visible()
    print("✅ Prompt toggle state verified")

    # "Toggle fullscreen" button
    # Set mobile viewport
    page.set_viewport_size({"width": 375, "height": 667})

    fullscreen_button = page.get_by_label("Enter Fullscreen")
    expect(fullscreen_button).to_be_visible()
    print("✅ Fullscreen button found (mobile)")

    # Take a screenshot of the mobile view with the buttons
    page.screenshot(path="verification/book_reader_mobile_a11y.png")

    # Reset viewport to desktop
    page.set_viewport_size({"width": 1280, "height": 720})

    # Verify Close button again on desktop
    expect(close_button).to_be_visible()

    # Take a screenshot of desktop view
    page.screenshot(path="verification/book_reader_desktop_a11y.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_book_reader_a11y(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            try:
                page.screenshot(path="verification/failure.png")
            except:
                pass
        finally:
            browser.close()
