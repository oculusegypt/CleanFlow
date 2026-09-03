---
name: SSG heading ownership
description: The heading contract for static SEO pages and editor-provided rich text.
---

Each prerendered public page should have one page-owned primary H1. Rich-text content from the database must not introduce a second H1, and any heading conversion must replace both opening and closing tags so the generated HTML remains balanced.

**Why:** A static page can look correct in a browser while still exposing duplicate or malformed heading structure to crawlers when the editor content contains its own H1.

**How to apply:** Keep the heading transformation in the shared prerender sanitization path, then validate generated HTML page-by-page rather than relying only on aggregate tag counts.