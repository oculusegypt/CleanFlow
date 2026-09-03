---
name: Package route compatibility
description: Constraint for keeping package sitemap URLs, prerendered files, and API-loaded detail pages aligned.
---

The package sitemap can contain legacy Latin slugs while the current package API exposes Arabic SEO slugs. Package detail pages must recognize the legacy aliases, internal package links should use the canonical sitemap route, and prerendering must emit a file for every sitemap route.

**Why:** The two package data sources are not guaranteed to share the same slug values; a route can pass sitemap validation but render “package not found” after the API hydrates, or lack a static HTML file on Hostinger.

**How to apply:** When package data or sitemap generation changes, verify both the client route lookup and the filesystem mapping for every `/cleaning-packages/` sitemap URL.