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
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    description: "Electric neon tubing on a dark moody brick wall",
    prompt:
      'Vivid electric neon tubing spelling out the name against a dark moody brick wall at night, with realistic glass tube bending and warm cathode glow. Bright magenta and cyan neon with soft light bloom bleeding onto the surrounding bricks, gentle fog diffusing the light. Visible wire mounts and a subtle power cable trailing off-frame.',
  },
  {
    id: "watercolor-bloom",
    name: "Watercolor Bloom",
    description: "Delicate paint bleeds in blush pink and lavender",
    prompt:
      'Delicate watercolor calligraphy where each brushstroke bleeds and blooms into soft washes of blush pink, lavender, and sage green on cold-pressed watercolor paper. Visible paper grain texture, tiny pigment granules settling in the valleys. Loose botanical watercolor flowers and leaves growing naturally from the letter terminals.',
  },
  {
    id: "chalk-blackboard",
    name: "Chalk on Blackboard",
    description: "Hand-drawn chalk with dusty texture and flourishes",
    prompt:
      'Hand-drawn chalk lettering on a worn green chalkboard with authentic dusty chalk texture and eraser smudges in the background. Decorative chalk flourishes, arrows, and small doodles surrounding the name. Warm classroom lighting casting a soft sheen across the board surface, slight chalk dust floating in the air.',
  },
  {
    id: "retro-chrome",
    name: "Retro Chrome",
    description: "1980s chrome 3D lettering over a synthwave grid",
    prompt:
      'Gleaming 1980s chrome 3D extruded lettering hovering above a neon synthwave grid stretching to a horizon of pink and purple sunset gradients. Each letter reflects the surrounding grid lines in its polished chrome surface. Subtle lens flare crossing the composition, scan lines and VHS tracking artifacts at the edges.',
  },
  {
    id: "ink-quill",
    name: "Ink & Quill",
    description: "Copperplate calligraphy in iron gall ink on parchment",
    prompt:
      'Freshly written copperplate calligraphy in rich iron gall ink on weathered cream parchment with visible vellum texture and age spots. Dramatic ink splatters and pen-test strokes in the margins, a brass-nibbed quill pen resting beside a ceramic inkwell. Warm candlelight casting soft shadows, wax seal stamp nearby.',
  },
  {
    id: "graffiti-tag",
    name: "Graffiti Tag",
    description: "Bold wildstyle spray paint on a gritty brick wall",
    prompt:
      'Bold wildstyle graffiti tag sprayed onto a gritty urban brick wall with thick outlines, vibrant fills of electric green and hot pink, and sharp drips running down the wall. Overspray haze and ghost traces of previous tags visible underneath. Concrete sidewalk visible at the bottom, harsh afternoon sunlight with strong shadows.',
  },
  {
    id: "minimal-line",
    name: "Minimal Line Art",
    description: "Single continuous line on pure white, Picasso-style",
    prompt:
      "Ultra-minimal continuous single-line drawing of the name in thin black ink on pure white paper, as if drawn without lifting the pen. Clean geometric letterforms with subtle curves, the line maintaining perfectly even weight throughout. Vast negative space, museum-quality composition, reminiscent of Picasso's one-line drawings.",
  },
  {
    id: "embossed-leather",
    name: "Embossed Leather",
    description: "Blind deboss pressed into butter-soft cognac leather",
    prompt:
      'Deep blind deboss lettering pressed into butter-soft full-grain cognac leather, each letter casting subtle shadows that reveal the depth of the impression. Fine leather grain texture visible across the surface, hand-stitched border with waxed linen thread. Warm overhead lighting highlighting the dimensional quality of the pressed letters.',
  },
  {
    id: "starry-script",
    name: "Starry Night Script",
    description: "Constellation letters against a deep indigo sky",
    prompt:
      'Celestial lettering formed by connected stars and constellation lines against a deep indigo night sky filled with thousands of tiny stars, distant nebulae, and the faint band of the Milky Way. Each letter joint marked by a bright twinkling star with subtle four-pointed diffraction spikes. Stardust particles trailing from the letter strokes like comet tails.',
  },
  {
    id: "typewriter-vintage",
    name: "Typewriter Vintage",
    description: "Typebar-struck characters on yellowed onion-skin paper",
    prompt:
      'Individual typebar-struck characters on yellowed onion-skin paper, with slightly uneven impressions, faded ink density variations, and characteristic typewriter font. Visible paper feed holes along one edge, a coffee ring stain in the corner. Warm afternoon light through a window casting blind shadows across the page.',
  },
  {
    id: "glass-ice",
    name: "Glass & Ice",
    description: "Frosted translucent glass with ice crystal formations",
    prompt:
      'Translucent frosted glass letterforms with realistic ice crystal formations growing across their surfaces, catching and refracting cool blue light from behind. Tiny frozen water droplets clinging to the letter edges, breath-like mist swirling around the base. Deep navy background fading to black, sharp specular highlights on the ice ridges.',
  },
  {
    id: "botanical-vines",
    name: "Botanical Vines",
    description: "Living ivy and flowering vines growing through letters",
    prompt:
      'Elegant serif lettering with living green ivy and flowering vines naturally growing through, around, and over each letter, some leaves partially obscuring the text. Tiny white flowers and curling tendrils reaching between letters. Soft natural daylight, shot on creamy parchment background, botanical illustration style.',
  },
  {
    id: "blueprint",
    name: "Blueprint Technical",
    description: "Architectural drafting on indigo blueprint paper",
    prompt:
      'Precise white technical lettering on indigo blueprint paper with architectural drafting details — dimension lines with arrows, section markers, grid coordinates, and engineering notations surrounding the name. Slight paper crease lines, compass arcs, and revision cloud markups. The text labeled with a title block reference number.',
  },
  {
    id: "fire-ember",
    name: "Fire & Ember",
    description: "Roaring flames with glowing embers spiraling upward",
    prompt:
      'Letters engulfed in roaring flames with intense orange and white-hot cores fading to deep red at the edges, glowing embers and sparks spiraling upward from each stroke. Visible heat distortion warping the air above the text, charred and cracking letter edges revealing molten interior. Pure black background with subtle smoke wisps.',
  },
  {
    id: "ocean-wave",
    name: "Ocean Wave",
    description: "Cresting waves with seafoam spray, golden hour light",
    prompt:
      'Fluid cursive lettering formed from cresting ocean waves, each stroke a rolling barrel wave with white seafoam spray at the peaks and deep translucent teal water in the troughs. Tiny air bubbles visible in the transparent wave sections, spray droplets frozen in mid-air. Golden hour sunlight backlighting the waves, warm sandy beach below.',
  },
];
