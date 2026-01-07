## 2024-05-22 - Admin Dashboard Stored XSS
**Vulnerability:** The Admin Dashboard (`/`) renders user-submitted questions (`log.question`) directly into the HTML without sanitization. An attacker could submit a question containing `<script>` tags, which would execute in the admin's browser when they view the dashboard. This could allow stealing the `ADMIN_SECRET` (present in the URL).
**Learning:** Even internal/admin tools need strict input sanitization. "Internal" users are high-value targets. Always sanitize data before rendering HTML, especially when constructing HTML strings manually instead of using a framework like React that escapes by default.
**Prevention:** Use an HTML escaping helper function for all dynamic content in HTML templates.
