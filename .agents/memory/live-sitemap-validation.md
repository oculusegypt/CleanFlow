---
name: Live sitemap validation
description: A durable SEO deployment lesson about validating the actual published XML, not only the local generator.
---

Always validate the published sitemap body after deployment, including representative `<loc>` values and their HTTP responses. A local generator and build gate can pass while an older or separately regenerated production file contains malformed URLs.

**Why:** The deployed site can serve a stale static XML file or regenerate it through a different PHP path than the local build, so status `200` and `Content-Type: application/xml` are insufficient evidence.

**How to apply:** For every SEO release, check that `<loc>` values are absolute HTTPS URLs, contain no local or malformed host, have no duplicates, and point to canonical public pages.