export interface AiPreset {
  id: string;
  name: string;
  /** Rich, detailed prompt describing the visual style */
  prompt: string;
  /** Short description for the card UI */
  description: string;
  /** Path to example output image in /public/ai-examples/ */
  referenceImage?: string;
}

export const AI_PRESETS: AiPreset[] = [
  {
    id: "gold-foil",
    name: "Gold Foil",
    description: "Luxurious metallic gold pressed into matte black",
    prompt:
      'Luxurious gold foil calligraphy pressed into matte black cardstock, each letter catching warm studio light with brilliant metallic reflections. Thin gold leaf flakes scattered around the text, serif font with elegant swash capitals and fine hairline strokes. Rich warm palette of deep black and 24-karat gold with subtle champagne highlights.',
    referenceImage: "/ai-examples/gold-foil.png",
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    description: "Electric neon tubing on a dark moody brick wall",
    prompt:
      'Vivid electric neon tubing spelling out the name against a dark moody brick wall at night, with realistic glass tube bending and warm cathode glow. Bright magenta and cyan neon with soft light bloom bleeding onto the surrounding bricks, gentle fog diffusing the light. Visible wire mounts and a subtle power cable trailing off-frame.',
    referenceImage: "/ai-examples/neon.png",
  },
  {
    id: "watercolor-bloom",
    name: "Watercolor Bloom",
    description: "Delicate paint bleeds in blush pink and lavender",
    prompt:
      'Delicate watercolor calligraphy where each brushstroke bleeds and blooms into soft washes of blush pink, lavender, and sage green on cold-pressed watercolor paper. Visible paper grain texture, tiny pigment granules settling in the valleys. Loose botanical watercolor flowers and leaves growing naturally from the letter terminals.',
    referenceImage: "/ai-examples/watercolor.png",
  },
  {
    id: "chalk-blackboard",
    name: "Chalk on Blackboard",
    description: "Hand-drawn chalk with dusty texture and flourishes",
    prompt:
      'Hand-drawn chalk lettering on a worn green chalkboard with authentic dusty chalk texture and eraser smudges in the background. Decorative chalk flourishes, arrows, and small doodles surrounding the name. Warm classroom lighting casting a soft sheen across the board surface, slight chalk dust floating in the air.',
    referenceImage: "/ai-examples/chalk.png",
  },
  {
    id: "ink-quill",
    name: "Ink & Quill",
    description: "Copperplate calligraphy in iron gall ink on parchment",
    prompt:
      'Freshly written copperplate calligraphy in rich iron gall ink on weathered cream parchment with visible vellum texture and age spots. Dramatic ink splatters and pen-test strokes in the margins, a brass-nibbed quill pen resting beside a ceramic inkwell. Warm candlelight casting soft shadows, wax seal stamp nearby.',
    referenceImage: "/ai-examples/ink-quill.png",
  },
  {
    id: "minimal-line",
    name: "Minimal Line Art",
    description: "Single continuous line on pure white, Picasso-style",
    prompt:
      "Ultra-minimal continuous single-line drawing of the name in thin black ink on pure white paper, as if drawn without lifting the pen. Clean geometric letterforms with subtle curves, the line maintaining perfectly even weight throughout. Vast negative space, museum-quality composition, reminiscent of Picasso's one-line drawings.",
    referenceImage: "/ai-examples/minimal-line.png",
  },
  {
    id: "typewriter-vintage",
    name: "Typewriter Vintage",
    description: "Typebar-struck characters on yellowed onion-skin paper",
    prompt:
      'Individual typebar-struck characters on yellowed onion-skin paper, with slightly uneven impressions, faded ink density variations, and characteristic typewriter font. Visible paper feed holes along one edge, a coffee ring stain in the corner. Warm afternoon light through a window casting blind shadows across the page.',
    referenceImage: "/ai-examples/typewriter.jpeg",
  },
  {
    id: "pressed-leather",
    name: "Pressed Leather",
    description: "Elegant cursive debossed into dark full-grain leather",
    prompt:
      'Elegant cursive script deeply pressed into rich dark brown full-grain leather, each letter formed by a smooth debossed channel catching soft overhead light along its edges. Fine leather grain texture visible across the entire surface with natural hide variations and subtle pore detail. The letters have a refined, luxury brand feel with flowing connected strokes and graceful ascenders.',
    referenceImage: "/ai-examples/pressed-leather.png",
  },
  {
    id: "embossed-paper",
    name: "Embossed Paper",
    description: "Raised letterpress on thick kraft cardstock with spiral rings",
    prompt:
      'Bold uppercase serif letters embossed and raised from thick kraft cardstock with visible paper fiber texture, surrounded by decorative concentric oval rings pressed into the surface. The embossing creates subtle shadows and highlights that reveal the dimensional quality of the impression. Muted warm taupe paper tone, tactile letterpress aesthetic with precise geometric ornamentation.',
    referenceImage: "/ai-examples/embossed-paper.png",
  },
  {
    id: "embossed-leather",
    name: "Embossed Leather",
    description: "Ornate raised calligraphy on warm aged leather",
    prompt:
      'Ornate calligraphic lettering embossed and raised from warm cognac-toned aged leather, with dramatic swash capitals, decorative flourishes, and mixed serif and script styles layered together. The leather surface shows natural wear, patina, and grain variation. Warm directional lighting creates strong shadows beneath the raised letters, giving a tactile, old-world luxury craft feel.',
    referenceImage: "/ai-examples/embossed-leather.png",
  },
  {
    id: "blueprint",
    name: "Blueprint Technical",
    description: "Architectural drafting on indigo blueprint paper",
    prompt:
      'Precise white technical lettering on indigo blueprint paper with architectural drafting details — dimension lines with arrows, section markers, grid coordinates, and engineering notations surrounding the name. Slight paper crease lines, compass arcs, and revision cloud markups. The text labeled with a title block reference number.',
    referenceImage: "/ai-examples/blueprint.png",
  },
];
