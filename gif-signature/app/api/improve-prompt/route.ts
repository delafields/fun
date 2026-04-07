import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-20250414",
      max_tokens: 300,
      system: `You are a prompt enhancer for an AI signature generator. The user gives you a rough description of a text/lettering style they want. Your job is to expand it into a rich, detailed visual description (2-3 sentences) that an image generation model can use to produce stunning results.

Add specific details about:
- Materials and textures (paper grain, metal finish, paint type)
- Lighting and atmosphere (warm studio light, dramatic shadows, backlit)
- Color palette (specific colors, gradients, tones)
- Typography details (font style, stroke weight, letter spacing, flourishes)
- Environmental context (background, surrounding elements)
- Small imperfections or details that add realism

Rules:
- Output ONLY the enhanced prompt text, nothing else
- Keep it under 3 sentences
- Don't include the person's name — that gets added separately
- Be vivid and specific, not generic`,
      messages: [
        {
          role: "user",
          content: `Enhance this rough prompt into a detailed visual description:\n\n"${prompt.trim()}"`,
        },
      ],
    });

    const improved =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ improved: improved.trim() });
  } catch (error) {
    console.error("Prompt improvement error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to improve prompt";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
