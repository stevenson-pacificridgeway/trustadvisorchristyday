# trustadvisorchristyday.com

Kristi Day — Living Trust Advisor. Static site on GitHub Pages; payments via Stripe; data in Supabase.

- Pages are plain HTML files in the repo root (shared header/footer are repeated in each page).
- Payment form (`pay.html`) posts to Supabase edge function `lta-checkout` (project bshklbmraykqdmbrgtxc), which saves the client to table `lta_orders` and redirects to the Stripe $3,000 Payment Link.
- Stripe webhook -> edge function `lta-stripe-webhook` marks the order `paid` / `refunded`.
- Images and PDFs live in Supabase Storage bucket `lta-assets`.
- $1 test mode: `pay.html?test=<code>` (code is in the lta-checkout function).
