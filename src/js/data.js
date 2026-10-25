/* ================================================================
   The archive data: 28 projects with per-project media counts
   matching the reference flow, all copy original for this persona.
   media arrays are sliced from the generated variant pool.
================================================================ */

const V = Array.from({ length: 40 }, (_, i) => `media/img-${i}.jpg`);
const pick = (seed, n) => Array.from({ length: n }, (_, i) => V[(seed * 7 + i * 11) % 40]);

export const IDENTITY = {
  first: "Danyal",
  last: "Bashir",
  role: "Art director\n& creative",
  city: "Lahore",
  meta: "Art direction and image-making across advertising, product, fine art and photography",
  email: "outsidershell42@gmail.com",
};

export const FILTERS = ["All", "Advertising", "Product", "Fine Art", "Photography"];

const P = (slug, title, year, category, premise, client, discipline, mediaCount, layoutSeed) => ({
  slug, title, year, category, premise, client, discipline,
  media: pick(layoutSeed, mediaCount),
});

/* 28 projects — quantities mirror the reference archive */
export const PROJECTS = [
  P("after-the-alley", "After the Alley", "2025", "Photography",
    "A night report on the streets that appear only when the shutters come down.", "Personal", "Photography + sequencing", 6, 1),
  P("the-big-sign", "The Big Sign", "2026", "Advertising",
    "Three films and three boards for a pilot fish that sells fruit drinks at 40 degrees.", "Bahr Beverages", "Art direction + design", 6, 2),
  P("quiet-smoke", "Quiet Smoke", "2024", "Fine Art",
    "Five still lives on what a room keeps after someone leaves it.", "Personal", "Still life + print", 5, 3),
  P("weight-of-light", "The Weight of Light", "2025", "Fine Art",
    "Eleven plates on glass, dust and the hour the sun starts giving up.", "Personal", "Camera work + book", 11, 4),
  P("april-eggs", "April Eggs", "2026", "Product",
    "Fourteen product plates for a bakery that takes breakfast far too seriously.", "Baker Qureshi", "Art direction + photography", 14, 5),
  P("small-forests", "Small Forests", "2023", "Photography",
    "Two frames from the ridge where the city stops and the pines take over.", "Personal", "Landscape studies", 2, 6),
  P("fading-blooms", "Fading Blooms", "2024", "Photography",
    "Six portraits of a flower stall between Sunday delivery and Monday disposal.", "Personal", "Photography", 6, 7),
  P("green-case", "The Green Case", "2026", "Product",
    "Eight studio plates for a headphone brand that wants silence on the shelf.", "Concho Audio", "Product design + photo", 8, 8),
  P("paper-bells", "Paper Bells", "2025", "Fine Art",
    "Ten works on fold, crease and what a page remembers.", "Personal", "Editioned works", 10, 9),
  P("kept-hours", "Kept Hours", "2024", "Photography",
    "Five images about objects that outlive the people who chose them.", "Personal", "Photography + prose", 5, 10),
  P("gaze-corrections", "Gaze, Corrected", "2025", "Fine Art",
    "Six street portraits retouched only by weather and reflection.", "Personal", "Photography", 6, 11),
  P("no-interviews", "No Interviews", "2026", "Advertising",
    "Three teasers for a documentary premiere with nothing published early.", "Dastaan Screens", "Art direction + copy", 3, 12),
  P("ordinary-pioneers", "Ordinary Pioneers", "2024", "Advertising",
    "Five campaign frames on the women who run the morning economy.", "Chai Nali", "Campaign + photography", 5, 13),
  P("poem-of-lanes", "Poem of Lanes", "2023", "Photography",
    "Thirteen frames and short lines from a walled-city walking route.", "Personal", "Photo essay", 13, 14),
  P("kite-season", "Kite Season", "2026", "Advertising",
    "Eleven plates for a carbonated launch timed to the spring festival.", "Aasha Sodas", "Art direction + motion stills", 11, 15),
  P("private-snoring", "Private Snoring", "2025", "Product",
    "Seven quiet product skits about a mattress that nobody demonstrates.", "Neend Mattresses", "Product + set design", 7, 16),
  P("puffed-season", "Puffed Season", "2025", "Product",
    "Six food plates on the snack that announces itself too loudly.", "Bulbul Snacks", "Photography", 6, 17),
  P("the-quiet-queen", "The Quiet Queen", "2024", "Fine Art",
    "Five portraits of a chair that spent sixty years being sat on.", "Personal", "Portraiture", 5, 18),
  P("one-ring", "One Ring", "2026", "Product",
    "A single hero plate for a packaging refresh that shipped overnight.", "Gul Watches", "Art direction", 1, 19),
  P("kept-shrine", "The Kept Shrine", "2023", "Photography",
    "Eleven frames from forty mornings of a small shrine's caretakers.", "Personal", "Documentary", 11, 20),
  P("study-chairs", "Study Chairs", "2024", "Photography",
    "Six compositions on where revision happens after midnight.", "Personal", "Interiors", 6, 21),
  P("lake-nights", "Lake Nights", "2025", "Fine Art",
    "Eleven long exposures across one season at a shrinking lake.", "Personal", "Photography + print", 11, 22),
  P("north-stopover", "North Stopover", "2026", "Advertising",
    "Four frames for a travel brand's single long weekend.", "Safar Journeys", "Campaign + photography", 4, 23),
  P("side-door", "The Side Door", "2025", "Photography",
    "Two images kept from a script that never reached the screen.", "Personal", "Stills", 2, 24),
  P("new-mark", "The New Mark", "2026", "Advertising",
    "Six boards carrying a textile house into its new identity.", "Dhanak Textiles", "Rebrand + art direction", 6, 25),
  P("a-letter-home", "A Letter Home", "2023", "Fine Art",
    "Eighteen plates on the objects emigrants take and leave behind.", "Personal", "Photography + diary", 18, 26),
  P("not-burned", "Not Burned", "2024", "Fine Art",
    "Ten images between scorched paper and what survived it.", "Personal", "Mixed media", 10, 27),
  P("three-balls", "Three Balls", "2025", "Photography",
    "Three frames of a cricket that happens entirely on rooftops.", "Personal", "Sports studies", 3, 28),
];

/* one hero/cover + ledger + stories per project, all generated */
export const FACTS = (p) => [
  ["Client", p.client],
  ["Discipline", p.discipline],
  ["Year", p.year],
];

export const STORY = (p) => ({
  label: "Background",
  title: "How it started",
  text: `${p.title} began as a wall of pinned references at ${p.city === "Lahore" ? "the studio" : "a friend's drawing office"} — ${p.premise.toLowerCase().replace(/\.$/, "")}. The work below is what survived the pinning.`,
  blocks: [
    ["Approach", "One constraint per project: shoot or design it so the idea survives as a thumbnail. If the small version dies, the large one was decoration."],
    ["Method", p.category === "Fine Art" || p.category === "Photography"
      ? "Long exposures, contact sheets, and dates on the back of every print. The archive keeps its own count."
      : "Boards first, set second, retouch last. Colour decisions were made on set and never renegotiated at the desk."],
    ["After", `The pieces travel: ${p.title} has been shown as a folder of mounted prints and as three screens, whichever the room wants.`],
  ],
});

export const GALLERY_LAYOUTS = {
  full: "media-frame--full",
  left: "media-frame--left",
  right: "media-frame--right",
  narrow: "media-frame--narrow",
  wide: "media-frame--wide",
  pair: "media-frame--pair",
};

/* layout pattern per index — repeats like the reference rhythm */
export function layoutFor(i) {
  const ring = ["full", "left", "right", "narrow", "wide", "pair", "left", "right", "narrow", "wide"];
  return ring[i % ring.length];
}

/* ---- about ---- */
export const ABOUT = {
  intro: "I direct images and design the rooms they hang in.",
  paragraphs: [
    "Danyal Bashir is an art director and creative who left agency-side brand work to keep one archive instead of ten decks. The drawings, plates and photographs on this site are the kept part.",
    "Six years spent between commercial shoots and a personal darkroom taught one lesson twice: the frame decides, and the frame is rarely the first idea. Work on this site has run across billboards, packaging rows, gallery walls and one wedding invitation that got out of hand.",
    "Now the practice splits evenly: client campaigns from a small room in Lahore, and an archive of personal photography that behaves exactly like brand work — sequenced, titled, shipped.",
  ],
  lead: "The archive is the studio. The studio is one long roll.",
  facts: [
    ["Based", "Lahore, Pakistan"],
    ["Practice", "Art direction · design · photography"],
    ["Client work", "Campaigns, product systems, packaging"],
    ["Personal work", "Photography, still life, prints"],
    ["Education", "Central School of Design, BFA"],
    ["Availability", "Sep–Dec bookings open"],
  ],
  portrait: "media/img-40.jpg",
};

/* ---- vault ---- */
export const VAULT = {
  code: "studio",
  hint: "Ask for the pass key — it travels with the contact sheet.",
  note: "Unpublished work sits behind one pass key — six folders and counting.",
  items: [
    ["Folder 01", "A season of storefronts, unedited", "2026", 24],
    ["Folder 02", "Weather studies: balconies in August", "2026", 18],
    ["Folder 03", "The hotel stationery project", "2025", 31],
    ["Folder 04", "Colour proofs nobody signed", "2025", 12],
    ["Folder 05", "Portrait negatives, unreleased", "2024", 27],
    ["Folder 06", "Client work — the cut versions", "2024", 40],
  ],
  error: "Not the key. Ask properly.",
};

export const CONTACT = {
  name: "Danyal Bashir",
  email: "outsidershell42@gmail.com",
  phone: "03141571150",
  discord: "https://discordid.netlify.app/?id=926852809993879614",
  instagram: "https://www.instagram.com/just_an_0utsider/",
};
