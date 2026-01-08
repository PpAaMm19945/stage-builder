## 2024-05-22 - Admin Dashboard Stored XSS
**Vulnerability:** The Admin Dashboard (`/`) renders user-submitted questions (`log.question`) directly into the HTML without sanitization. An attacker could submit a question containing `<script>` tags, which would execute in the admin's browser when they view the dashboard. This could allow stealing the `ADMIN_SECRET` (present in the URL).
**Learning:** Even internal/admin tools need strict input sanitization. "Internal" users are high-value targets. Always sanitize data before rendering HTML, especially when constructing HTML strings manually instead of using a framework like React that escapes by default.
**Prevention:** Use an HTML escaping helper function for all dynamic content in HTML templates.

## 2024-05-22 - Admin Dashboard DOM XSS (Inline Event Handlers)
**Vulnerability:** The Admin Dashboard used inline event handlers like `onclick="toggleRow('${log.id}')"`. If `log.id` contained single quotes or other malicious characters, it could break out of the string context and execute arbitrary JavaScript (DOM XSS). Even if `escapeHtml` was used, the browser decodes HTML entities in attributes *before* executing the JS, potentially re-introducing the vulnerability.
**Learning:** Avoid injecting dynamic data directly into inline JavaScript event handlers. HTML entity encoding is not sufficient protection for data inside inline event handlers because of the decoding order.
**Prevention:** Use `data-*` attributes to store dynamic data and access it via `this.dataset.*` or `event.target.dataset.*` inside the event handler, or attach event listeners programmatically instead of using inline HTML attributes.
