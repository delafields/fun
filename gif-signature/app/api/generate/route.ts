import { NextRequest, NextResponse } from "next/server";
import { fal } from "@/lib/fal";

export const maxDuration = 120;

async function uploadBase64ToFal(dataUrl: string): Promise<string> {
  const base64Data = dataUrl.split(",")[1];
  const mimeType = dataUrl.split(";")[0].split(":")[1] || "image/png";
  const buffer = Buffer.from(base64Data, "base64");
  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], "reference.png", { type: mimeType });
  return await fal.storage.upload(file);
}

/**
 * Step 1: Generate a static image of the signature.
 * - With reference image: Kontext edits the reference, swapping text for user's name
 * - Without reference: Flux generates from scratch
 */
export async function POST(req: NextRequest) {
  try {
    const { name, prompt, imageUrl } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const styleDescription = prompt?.trim()
      ? prompt
      : "elegant handwritten script style";

    let generatedImageUrl: string;

    if (imageUrl) {
      console.log("Generating with Kontext (reference image)...");

      let uploadedUrl: string;
      if (imageUrl.startsWith("data:")) {
        uploadedUrl = await uploadBase64ToFal(imageUrl);
      } else {
        uploadedUrl = imageUrl;
      }

      const kontextPrompt = [
        `Replace ALL text and words in this image with just the name "${name}".`,
        `Keep the exact same visual style, font style, colors, textures, and design.`,
        `The name "${name}" should be the only text visible, styled to match the original aesthetic.`,
        styleDescription !== "elegant handwritten script style"
          ? `Additional style notes: ${styleDescription}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      const imageResult = await fal.subscribe("fal-ai/flux-pro/kontext", {
        input: {
          prompt: kontextPrompt,
          image_url: uploadedUrl,
          guidance_scale: 3.5,
          num_images: 1,
          output_format: "png",
        },
        logs: true,
      });

      const imageData = imageResult.data as {
        images?: { url: string }[];
      };

      generatedImageUrl = imageData?.images?.[0]?.url || "";
    } else {
      console.log("Generating with Flux (no reference)...");

      const imagePrompt = [
        `A stylized text graphic showing only the name "${name}".`,
        `Style: ${styleDescription}.`,
        `The name "${name}" must be large, centered, and clearly readable.`,
        `Clean white background, high quality typography, no other text.`,
      ].join(" ");

      const imageResult = await fal.subscribe("fal-ai/flux/dev", {
        input: {
          prompt: imagePrompt,
          image_size: "landscape_16_9",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          output_format: "png",
        },
        logs: true,
      });

      const imageData = imageResult.data as {
        images?: { url: string }[];
      };

      generatedImageUrl = imageData?.images?.[0]?.url || "";
    }

    if (!generatedImageUrl) {
      return NextResponse.json(
        { error: "Failed to generate signature image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl: generatedImageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
