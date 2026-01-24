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

## 2026-01-10 - Content Security Policy (CSP) Retrofit
**Vulnerability:** The Admin Dashboard used `script-src 'unsafe-inline'` and inline event handlers (`onclick`), making it vulnerable to XSS if any injection point was missed by `escapeHtml`.
**Learning:** Retrofitting strict CSP (`nonce-based`) into an existing app with inline handlers requires converting `onclick` attributes to event listeners. Event delegation (attaching one listener to `document` or a container) is a clean way to handle this for dynamic content without complex rewrites.
**Prevention:** Start projects with strict CSP (`nonce` or `hash`) and avoid inline event handlers (`onclick`, `onload`, etc.) from day one.

## 2026-01-10 - Path Traversal in R2 Keys
**Vulnerability:** API endpoints constructed R2 object keys using user-supplied parameters (`series`, `bookId`) without validation. Attackers could potentially use `..` sequences to traverse out of the intended `books/` prefix (e.g., `books/../secret.json`) if the underlying storage or intermediate layers normalized paths.
**Learning:** Never assume object storage keys are immune to path traversal. Path normalization might happen in the URL router, the HTTP client, or the storage driver. Explicitly validating that path segments do not contain traversal characters (`..`) is a necessary defense-in-depth measure.
**Prevention:** Implement a strict `isValidPathSegment` check that rejects any input containing `..` for all parameters used to construct file paths or storage keys.

## 2026-05-23 - Credentials in URL Parameters
**Vulnerability:** The `PUT /api/books/upload` endpoint required the `ADMIN_SECRET` to be passed as a query parameter (`?key=SECRET`). URLs are frequently logged by proxies, servers, and browser history, exposing the secret to anyone with access to these logs.
**Learning:** Secrets should never be passed in the URL. Even over HTTPS, the full URL (including query parameters) is visible in server logs and browser history. Headers are the standard, secure place for credentials as they are encrypted in transit and typically not logged by default.
**Prevention:** Always use the `Authorization` header (e.g., Bearer token) for authentication credentials. Support headers as the primary method and deprecated/remove query parameter support.

## 2026-05-24 - Arbitrary File Write in Pages Functions
**Vulnerability:** The `PUT /api/books/upload` endpoint allowed unvalidated paths (via `path` query param) to be passed directly to `R2Bucket.put()`. This allowed authenticated users (admins) to overwrite critical system files like `manifest.json` (at the root) or `index.html` (if serving from same bucket) or traverse paths if storage layers allowed it.
**Learning:** Cloudflare Pages Functions arguments (like `env.ASSETS.put`) do not automatically sandbox writes to a safe subdirectory. When accepting file paths from user input, always enforce a strict allowlist or directory prefix and validate against traversal characters (`..`).
**Prevention:** Implement `isValidPath` checks that enforce `startsWith('safe-dir/')` and reject `includes('..')`.
