import { NextRequest, NextResponse } from "next/server";
import { fal } from "@/lib/fal";

export const maxDuration = 300;

/**
 * Step 2: Animate a static signature image into a video.
 * Called after the user approves the image preview.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const videoPrompt = [
      `Animate this image of the name "${name || "signature"}" with a smooth reveal animation.`,
      `The text and any characters/elements should come to life with subtle, professional motion.`,
      `Keep the background clean and static. Smooth, looping motion suitable for an email signature.`,
    ].join(" ");

    console.log("Animating with Kling...");

    const videoResult = await fal.subscribe(
      "fal-ai/kling-video/v2.1/standard/image-to-video",
      {
        input: {
          prompt: videoPrompt,
          image_url: imageUrl,
          duration: "5",
        },
        logs: true,
      }
    );

    const videoData = videoResult.data as { video?: { url: string } };

    if (!videoData?.video?.url) {
      return NextResponse.json(
        { error: "Failed to animate signature" },
        { status: 500 }
      );
    }

    return NextResponse.json({ videoUrl: videoData.video.url });
  } catch (error) {
    console.error("Animation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to animate signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
