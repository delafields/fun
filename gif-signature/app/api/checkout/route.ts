import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_AMOUNT, PRICE_CURRENCY } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    const config = JSON.parse(session.metadata?.signature_config || "null");
    if (!config) {
      return NextResponse.json(
        { error: "Signature configuration not found" },
        { status: 404 }
      );
    }

    // Merge extras back into config
    const extras = JSON.parse(session.metadata?.signature_extras || "null");
    if (extras) {
      config.extras = extras;
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { config } = await req.json();
    const mode = config?.mode || "type";

    // Validate based on mode
    if (mode === "type" && !config?.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (mode === "upload" && !config?.imageData) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    if (mode === "ai" && !config?.videoUrl) {
      return NextResponse.json({ error: "Generate a preview first" }, { status: 400 });
    }

    const description =
      mode === "type"
        ? `Custom signature for "${config.name}"`
        : mode === "upload"
          ? "Animated signature from uploaded image"
          : `AI-generated signature: "${config.prompt?.slice(0, 50)}"`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    // Stripe metadata values must be under 500 chars.
    // For upload mode, the base64 image is too large for metadata,
    // so we store a flag and pass image via URL param on success page.
    // Extras (headshot base64 excluded) are stored in a separate metadata key.
    let metadata: Record<string, string>;
    const extras = config.extras;
    const configWithoutExtras = { ...config };
    delete configWithoutExtras.extras;

    if (mode === "upload") {
      const { imageData, ...rest } = configWithoutExtras;
      metadata = { signature_config: JSON.stringify(rest) };
    } else {
      metadata = { signature_config: JSON.stringify(configWithoutExtras) };
    }

    if (extras && Object.keys(extras).length > 0) {
      metadata.signature_extras = JSON.stringify(extras);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: PRICE_CURRENCY,
            product_data: {
              name: "Animated GIF Signature",
              description,
            },
            unit_amount: PRICE_AMOUNT,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/create`,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
