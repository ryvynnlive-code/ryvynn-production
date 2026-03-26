// Canonical Stripe webhook handler lives at /api/stripe/webhook/route.ts
// This file ensures any legacy webhook URL registered in Stripe also runs the canonical code.
export { POST } from "@/app/api/stripe/webhook/route";