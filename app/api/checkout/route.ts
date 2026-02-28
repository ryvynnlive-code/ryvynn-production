import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, mode } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    const origin = req.headers.get("origin") || "https://ryvynn.live"

    const session = await stripe.checkout.sessions.create({
      mode:        mode === "payment" ? "payment" : "subscription",
      line_items:  [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url:  `${origin}/pricing?canceled=true`,
      metadata:    { source: "ryvynn_pricing_page" },
      payment_method_types: ["card"],
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
