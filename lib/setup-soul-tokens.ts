import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
async function createSoulTokens() {
  const entry = await stripe.products.create({ name: 'Soul Token — Entry', description: 'Soul anchored badge + standard blessings' });
  const ep = await stripe.prices.create({ product: entry.id, unit_amount: 1700, currency: 'usd' });
  const pro = await stripe.products.create({ name: 'Soul Token — Pro', description: 'Priority blessings + eternity message' });
  const pp = await stripe.prices.create({ product: pro.id, unit_amount: 2700, currency: 'usd' });
  const eternal = await stripe.products.create({ name: 'Soul Token — Eternal', description: 'Everything + burn vault + founder status' });
  const etp = await stripe.prices.create({ product: eternal.id, unit_amount: 3700, currency: 'usd' });
  console.log('SOUL_TOKEN_ENTRY_PRICE=' + ep.id);
  console.log('SOUL_TOKEN_PRO_PRICE=' + pp.id);
  console.log('SOUL_TOKEN_ETERNAL_PRICE=' + etp.id);
}
createSoulTokens().catch(console.error);
