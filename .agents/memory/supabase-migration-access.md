---
name: Supabase migration access
description: Durable access constraints for applying schema changes to the Ana Muslim Supabase project
---

The Replit Supabase connector is attached but currently returns a proxy-level `Invalid URL` error before reaching Supabase. The existing server-side Supabase URL and service-role configuration can reach PostgREST successfully, but PostgREST does not provide a general SQL execution endpoint for applying schema migrations.

**Why:** The new authenticated memory schema must be applied without using the database password found in an uploaded document, and confusing the connector failure with a Supabase outage would lead to unsafe credential workarounds.

**How to apply:** Treat `supabase-migration.sql` as pending until it is run through the Supabase SQL editor or the connector is repaired. Afterward verify the user-scoped tables and `user_id` columns before testing durable memory.