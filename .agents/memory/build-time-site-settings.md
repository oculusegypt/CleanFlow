---
name: Build-time site settings
description: Preserve administrator-configured site identity through local and Hostinger builds.
---

Build scripts should read `company_name` and related SEO settings from the active SQLite settings table. Maintenance or initialization scripts must not overwrite those fields when they already exist.

**Why:** A hardcoded settings updater can silently revert the public brand during a build, causing generated HTML, metadata, schema, and packaged database values to disagree with the admin settings.

**How to apply:** Treat site identity as source data, use neutral fallbacks only when a setting is genuinely missing, and verify the packaged database and generated HTML together.