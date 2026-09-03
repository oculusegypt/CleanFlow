---
name: Hostinger generated-route cleanup
description: Prevents retired prerendered URLs from surviving full archive builds.
---

The Hostinger build overlays frontend output into an existing staging directory, so removing a generated route from the frontend output alone does not remove its older copy from the archive.

**Why:** A retired route can continue returning old indexable HTML even when the prerenderer no longer generates it, creating duplicate or stale search results.

**How to apply:** When removing or retiring a generated route, delete it during prerender cleanup and delete the same route from the Hostinger staging directory before copying the new frontend output.