import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    console.error("STRIPE_SECRET_KEY is not set in environment variables")
    return NextResponse.json(
      { error: "Payment not configured. Contact support." },
      { status: 503 }
    )
  }

  // Let Stripe SDK use its own default API version — no hardcoded version
  const stripe = new Stripe(key)

  try {
    const { priceId, mode } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/pricing")[0] ||
      "https://ryvynn.live"

    const session = await stripe.checkout.sessions.create({
      mode:        mode === "payment" ? "payment" : "subscription",
      line_items:  [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url:  `${origin}/pricing?canceled=true`,
      metadata:    { source: "ryvynn_pricing_page" },
      payment_method_types: ["card"],
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error?.message || error)
    return NextResponse.json(
      { error: error?.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
