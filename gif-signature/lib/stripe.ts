import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PRICE_AMOUNT = 700; // $7.00 in cents
export const PRICE_CURRENCY = "usd";
