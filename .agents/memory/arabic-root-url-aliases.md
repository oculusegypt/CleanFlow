---
name: Arabic root URL aliases
description: Keep readable Arabic title URLs compatible with the existing prefixed routes and Hostinger static output.
---

Public content can be addressed by a root-level Arabic title slug. The client resolver must classify it against services, packages, posts, and SEO pages, while the Hostinger build creates a static alias from the canonical generated page.

**Why:** Apache/Hostinger falls back to the SPA for an unknown root slug, and the old router then renders Not Found even when the underlying content exists under a prefixed route.

**How to apply:** Preserve `/services`, `/cleaning-packages`, `/blog`, and `/page` routes as compatibility paths; add the root alias to generated output and ensure its canonical URL matches the Arabic alias.