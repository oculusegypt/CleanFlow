---
name: Sitemap source parity
description: The Node build sitemap and PHP Hostinger regeneration must emit the same public URL set.
---

The deployable sitemap has two generators: the Node build-time generator and the PHP Hostinger runtime generator. They must use the same public tables, indexability policy, legacy route aliases, URL encoding, and canonical static-page list.

**Why:** A valid sitemap can still be inconsistent across the archive and runtime. That inconsistency makes deployments appear correct locally while Hostinger or later admin regeneration advertises a different URL set.

**How to apply:** After changing sitemap routes or SEO policy, generate both outputs from the same database snapshot, compare decoded `<loc>` sets, validate both files, and confirm every dynamic URL has a prerendered HTML file.