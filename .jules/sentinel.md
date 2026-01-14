## 2024-05-22 - Admin Dashboard Stored XSS
**Vulnerability:** The Admin Dashboard (`/`) renders user-submitted questions (`log.question`) directly into the HTML without sanitization. An attacker could submit a question containing `<script>` tags, which would execute in the admin's browser when they view the dashboard. This could allow stealing the `ADMIN_SECRET` (present in the URL).
**Learning:** Even internal/admin tools need strict input sanitization. "Internal" users are high-value targets. Always sanitize data before rendering HTML, especially when constructing HTML strings manually instead of using a framework like React that escapes by default.
**Prevention:** Use an HTML escaping helper function for all dynamic content in HTML templates.

## 2024-05-22 - Admin Dashboard DOM XSS (Inline Event Handlers)
**Vulnerability:** The Admin Dashboard used inline event handlers like `onclick="toggleRow('${log.id}')"`. If `log.id` contained single quotes or other malicious characters, it could break out of the string context and execute arbitrary JavaScript (DOM XSS). Even if `escapeHtml` was used, the browser decodes HTML entities in attributes *before* executing the JS, potentially re-introducing the vulnerability.
**Learning:** Avoid injecting dynamic data directly into inline JavaScript event handlers. HTML entity encoding is not sufficient protection for data inside inline event handlers because of the decoding order.
**Prevention:** Use `data-*` attributes to store dynamic data and access it via `this.dataset.*` or `event.target.dataset.*` inside the event handler, or attach event listeners programmatically instead of using inline HTML attributes.

## 2026-01-10 - Timing Attack on Admin Secrets
**Vulnerability:** Admin endpoints (`/api/books/upload`, etc.) were comparing the `ADMIN_SECRET` using strict equality (`!==`). This allows attackers to perform timing attacks to deduce the secret character-by-character by measuring the response time differences.
**Learning:** Never use standard string comparison for security secrets. The V8 engine (and most runtimes) optimizes string comparison to return `false` as soon as the first character mismatch is found, leaking information about how much of the secret was correct.
**Prevention:** Always use a constant-time comparison function (like `crypto.subtle` or a manual XOR loop) for validating secrets and tokens.

## 2026-01-10 - IDOR in Portfolio File Access (Prefix Collision)
**Vulnerability:** The portfolio file access endpoint (`/api/portfolio/file/:key`) used a weak authorization check: `!key.includes(user.id)`. This allowed two types of attacks:
1. **Prefix Collision:** If User A has ID "user-1" and User B has ID "user-12", User A could access User B's files because "user-1" is a substring of "user-12".
2. **Filename Masquerading:** If a file owned by User B contained User A's ID in the filename (e.g., `portfolio/userB/user-1-report.pdf`), User A could access it.
**Learning:** Never use `.includes()` or weak substring matching for authorization checks involving IDs. IDs often have common prefixes or can be embedded in other strings.
**Prevention:** Use strict path structure validation. Ensure the ID is bounded by delimiters (e.g., `/${userId}/`) or check for an exact prefix match with a trailing slash (`startsWith(`portfolio/${userId}/`)`).
