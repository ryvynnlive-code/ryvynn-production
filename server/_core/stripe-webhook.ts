import type { Request, Response } from "express";
import Stripe from "stripe";
import { updateUserSubscription } from "../db";
import { ENV } from "./env";

/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events
 */

const stripe = ENV.stripeSecretKey
  ? new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
    })
  : null;

const WEBHOOK_SECRET = ENV.stripeWebhookSecret;

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe || !WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] Stripe not configured");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("[Stripe Webhook] No signature header");
    return res.status(400).json({ error: "No signature" });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log("[Stripe Webhook] Event received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as "three" | "six" | "nine" | undefined;

  if (!userId || !tier) {
    console.error("[Stripe Webhook] Missing userId or tier in metadata");
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for user ${userId}, tier: ${tier}`);

  await updateUserSubscription(parseInt(userId), {
    subscriptionTier: tier,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    subscriptionStatus: "active",
  });
}

/**
 * Handle subscription updates (e.g., plan changes, renewals)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Stripe Webhook] Missing userId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Subscription updated for user ${userId}, status: ${subscription.status}`);

  const status = subscription.status as "active" | "canceled" | "past_due" | "trialing";
  const endsAt = (subscription as any).current_period_end
    ? new Date((subscription as any).current_period_end * 1000)
    : null;

  await updateUserSubscription(parseInt(userId), {
    subscriptionStatus: status,
    subscriptionEndsAt: endsAt,
  });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Stripe Webhook] Missing userId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Subscription canceled for user ${userId}`);

  const endsAt = (subscription as any).current_period_end
    ? new Date((subscription as any).current_period_end * 1000)
    : null;

  await updateUserSubscription(parseInt(userId), {
    subscriptionStatus: "canceled",
    subscriptionEndsAt: endsAt,
  });
}

/**
 * Handle failed payments
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription to access metadata
  const invoiceAny = invoice as any;
  if (!invoiceAny.subscription || !stripe) {
    console.error("[Stripe Webhook] No subscription in invoice");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    invoiceAny.subscription as string
  );
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Stripe Webhook] Missing userId in invoice metadata");
    return;
  }

  console.log(`[Stripe Webhook] Payment failed for user ${userId}`);

  await updateUserSubscription(parseInt(userId), {
    subscriptionStatus: "past_due",
  });
}
