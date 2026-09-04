---
name: Blog indexability reset
description: Prevent stale noindex metadata from surviving client-side navigation between public pages.
---

When a public blog article loads successfully in the client, restore both `robots` and `googlebot` to an indexable value. Missing-page handling may intentionally set both to `noindex`, and a later successful SPA navigation must clear both.

**Why:** Browser metadata persists across client-side route changes. Resetting only one crawler tag can leave a valid article marked noindex even though its server-rendered HTML is indexable.

**How to apply:** Keep missing-page and successful-page metadata paths paired, and verify direct loads plus navigation from a missing or noindex route.