import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    return NextResponse.json(
      { error: "Payment not configured — STRIPE_SECRET_KEY missing" },
      { status: 503 }
    )
  }

  const stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
  })

  try {
    const body = await req.json()
    const { priceId, mode } = body

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    const origin = "https://ryvynn.live"

    const session = await stripe.checkout.sessions.create({
      mode:        mode === "payment" ? "payment" : "subscription",
      line_items:  [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url:  `${origin}/pricing?canceled=true`,
    })

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    const msg = err?.raw?.message || err?.message || "Unknown Stripe error"
    console.error("Stripe checkout error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
