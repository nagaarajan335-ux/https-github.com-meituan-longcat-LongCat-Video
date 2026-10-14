/* ============================================================
   DXN 3D STORE — PRODUCT CATALOGUE
   ------------------------------------------------------------
   ⚠ PRICES BELOW ARE SAMPLE FIGURES.
     Replace every `price` with your own current DXN Malaysia
     distributor / retail price before going live.

   Add a product: copy any object, change `id`, and it appears
   automatically in the catalogue, search, filters and cart.

   `model` drives the live 3D render — see js/models.js for the
   available types:  sachetbox | foilbag | bottle | tube | pumpbottle
   ============================================================ */

const PRODUCTS = [

  /* ═══════════════ COFFEE & BEVERAGES ═══════════════ */
  {
    id: "lingzhi-coffee-3in1",
    name: "Lingzhi Coffee 3 in 1",
    short: "Lingzhi Coffee 3 in 1",
    category: "beverages",
    sku: "DXN-LC31-20",
    price: 33.50,
    compareAt: 39.90,
    packSize: "20 sachets × 21g",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 412,
    stock: 48,
    shortDesc: "Premium Brazilian coffee blended with Lingzhi (Ganoderma) extract, non-dairy creamer and sugar. The everyday cup that started it all.",
    description:
      "DXN Lingzhi Coffee 3 in 1 is the original ganoderma coffee blend — smooth, aromatic and convenient. Finely ground coffee beans are combined with 100% pure Ganoderma lucidum extract, then balanced with a non-dairy creamer and sugar so every sachet tastes exactly the same. No artificial colouring, flavouring or preservatives. Lactose-free and gluten-free.",
    highlights: [
      "100% pure Ganoderma lucidum extract",
      "No artificial colouring, flavouring or preservatives",
      "Lactose-free & gluten-free",
      "Individually sealed 21g sachets stay fresh"
    ],
    howToUse: "Pour one sachet into a cup, add 150ml of hot water, stir well and enjoy. Best taken in the morning or after meals.",
    ingredients: "Sugar, non-dairy creamer, instant coffee, Ganoderma lucidum extract.",
    tags: ["coffee", "ganoderma", "3 in 1", "hot drink", "bestseller"],
    model: {
      type: "foilbag",
      palette: { body: "#6B3A1B", accent: "#D6161C", cap: "#F4EFE6", trim: "#C8A24A", deep: "#3A1E0D" },
      label: { brand: "DXN", name: "Lingzhi Coffee", sub: "3 IN 1", net: "20 × 21g", motif: "cup" }
    }
  },

  {
    id: "lingzhi-coffee-black",
    name: "Lingzhi Black Coffee",
    short: "Lingzhi Black Coffee",
    category: "beverages",
    sku: "DXN-LCB-20",
    price: 29.90,
    compareAt: null,
    packSize: "20 sachets × 4.5g",
    badge: "Low Sugar",
    rating: 4.8,
    reviews: 268,
    stock: 35,
    shortDesc: "For those who like it strong and clean — pure coffee and Ganoderma extract, no creamer, no added sugar.",
    description:
      "Lingzhi Black Coffee keeps it honest: robust coffee beans and Ganoderma lucidum extract, nothing else. Each 4.5g sachet delivers a full-bodied cup with no creamer and no added sugar — a favourite for anyone watching their intake or simply preferring the taste of real black coffee.",
    highlights: [
      "No creamer, no added sugar",
      "Only 4.5g per sachet — light and strong",
      "Blended with Ganoderma lucidum extract",
      "Great as an after-meal cup"
    ],
    howToUse: "Empty one sachet into a cup, add 150ml hot water and stir. Add your own sweetener if you wish.",
    ingredients: "Instant coffee, Ganoderma lucidum extract.",
    tags: ["coffee", "black", "no sugar", "ganoderma"],
    model: {
      type: "foilbag",
      palette: { body: "#241710", accent: "#B3121A", cap: "#EDE6DA", trim: "#8C6A3F", deep: "#120B07" },
      label: { brand: "DXN", name: "Lingzhi Coffee", sub: "BLACK", net: "20 × 4.5g", motif: "cup" }
    }
  },

  {
    id: "zhi-tea",
    name: "DXN Zhi Tea",
    short: "Zhi Tea",
    category: "beverages",
    sku: "DXN-ZT-20",
    price: 31.50,
    compareAt: 36.00,
    packSize: "20 sachets × 3g",
    badge: "Popular",
    rating: 4.7,
    reviews: 191,
    stock: 40,
    shortDesc: "Instant tea with Ganoderma extract — light, fragrant and refreshing, hot or over ice.",
    description:
      "Zhi Tea pairs quality tea extract with Ganoderma lucidum for a clean, aromatic cup that works just as well iced as it does hot. A gentle alternative for tea lovers who want their daily ganoderma without the roasted coffee notes.",
    highlights: [
      "Real tea extract with Ganoderma lucidum",
      "Enjoy hot or as iced tea",
      "Light, fragrant, not bitter",
      "Convenient single-serve sachets"
    ],
    howToUse: "Add one sachet to 200ml hot water. For iced tea, dissolve in 100ml hot water, top with cold water and ice.",
    ingredients: "Instant tea extract, Ganoderma lucidum extract.",
    tags: ["tea", "zhi tea", "iced tea", "ganoderma"],
    model: {
      type: "sachetbox",
      palette: { body: "#0E7A5F", accent: "#D6161C", cap: "#F4EFE6", trim: "#C8A24A", deep: "#07543F" },
      label: { brand: "DXN", name: "Zhi Tea", sub: "GANODERMA TEA", net: "20 sachets", motif: "leaf" }
    }
  },

  {
    id: "cocozhi",
    name: "DXN Cocozhi",
    short: "Cocozhi",
    category: "beverages",
    sku: "DXN-CZ-12",
    price: 34.00,
    compareAt: null,
    packSize: "12 sachets × 25g",
    badge: "Kids Love It",
    rating: 4.8,
    reviews: 156,
    stock: 27,
    shortDesc: "Rich chocolate malt drink with Ganoderma extract — the family-friendly way to enjoy lingzhi.",
    description:
      "Cocozhi turns ganoderma into something the whole family looks forward to. A smooth chocolate malt beverage enriched with Ganoderma lucidum extract, made with no artificial colouring, flavouring or preservatives. Perfect for children and anyone who prefers chocolate over coffee.",
    highlights: [
      "Chocolate malt drink with Ganoderma extract",
      "No artificial colouring or preservatives",
      "A gentle introduction to lingzhi for kids",
      "Hot or cold, either way it's creamy"
    ],
    howToUse: "Mix one sachet with 150ml hot or cold water. Blend with ice for a chilled chocolate drink.",
    ingredients: "Sugar, cocoa powder, malt extract, non-dairy creamer, Ganoderma lucidum extract.",
    tags: ["chocolate", "cocozhi", "kids", "ganoderma", "malt"],
    model: {
      type: "sachetbox",
      palette: { body: "#4A2C18", accent: "#D6161C", cap: "#F7E7C6", trim: "#C8A24A", deep: "#2A170C" },
      label: { brand: "DXN", name: "Cocozhi", sub: "CHOCOLATE MALT", net: "12 × 25g", motif: "cup" }
    }
  },

  {
    id: "spirulina-cereal",
    name: "DXN Spirulina Cereal",
    short: "Spirulina Cereal",
    category: "beverages",
    sku: "DXN-SC-15",
    price: 42.00,
    compareAt: 48.00,
    packSize: "15 sachets × 25g",
    badge: "High Fibre",
    rating: 4.6,
    reviews: 98,
    stock: 22,
    shortDesc: "Multigrain cereal with spirulina — a filling, wholesome breakfast in under a minute.",
    description:
      "A multigrain cereal blend fortified with spirulina, built for busy mornings. Oats, grains and plant protein come together in a single sachet; add hot water and you have a warm, filling breakfast that keeps you going until lunch.",
    highlights: [
      "Multigrain blend with spirulina",
      "Good source of dietary fibre",
      "Ready in under a minute",
      "Naturally sweetened, no artificial additives"
    ],
    howToUse: "Pour one sachet into a bowl, add 150–180ml hot water, stir and let it stand for 1 minute.",
    ingredients: "Oats, multigrain cereal, spirulina powder, non-dairy creamer, sugar.",
    tags: ["cereal", "spirulina", "breakfast", "fibre"],
    model: {
      type: "foilbag",
      palette: { body: "#1F6B4A", accent: "#E8A317", cap: "#F4EFE6", trim: "#C8A24A", deep: "#12422D" },
      label: { brand: "DXN", name: "Spirulina Cereal", sub: "MULTIGRAIN", net: "15 × 25g", motif: "leaf" }
    }
  },

  /* ═══════════════ HEALTH SUPPLEMENTS ═══════════════ */
  {
    id: "rg-capsules",
    name: "DXN RG (Reishi Gano)",
    short: "RG Capsules",
    category: "supplements",
    sku: "DXN-RG-90",
    price: 118.00,
    compareAt: 135.00,
    packSize: "90 capsules",
    badge: "Core Range",
    rating: 4.9,
    reviews: 533,
    stock: 18,
    shortDesc: "The flagship formula — 100% pure Ganoderma lucidum, harvested at 90 days of maturity.",
    description:
      "RG (Reishi Gano) is DXN's most recognised supplement: 100% pure Ganoderma lucidum cultivated organically and harvested at 90 days of maturity, when the fruiting body is at its peak. Each capsule contains the whole mushroom in fine powder form — traditionally taken alongside GL as part of a daily wellness routine.",
    highlights: [
      "100% pure Ganoderma lucidum",
      "Harvested at 90 days of maturity",
      "Organically cultivated, no pesticides",
      "Halal-certified manufacturing"
    ],
    howToUse: "Adults: 1–3 capsules daily with warm water, preferably before a meal. Start low and increase gradually. Consult your healthcare professional if you are pregnant, nursing or on medication.",
    ingredients: "100% Ganoderma lucidum powder (fruiting body). Capsule shell: gelatin.",
    tags: ["rg", "reishi gano", "ganoderma", "capsule", "core"],
    model: {
      type: "bottle",
      palette: { body: "#D6161C", accent: "#8C0E13", cap: "#1B1B1E", trim: "#C8A24A", deep: "#5E0A0E" },
      label: { brand: "DXN", name: "RG", sub: "REISHI GANO", net: "90 capsules", motif: "mushroom" }
    }
  },

  {
    id: "gl-capsules",
    name: "DXN GL (Ganolium)",
    short: "GL Capsules",
    category: "supplements",
    sku: "DXN-GL-90",
    price: 98.00,
    compareAt: 112.00,
    packSize: "90 capsules",
    badge: "Core Range",
    rating: 4.8,
    reviews: 471,
    stock: 21,
    shortDesc: "Ganoderma spore and mycelium formula — the traditional partner to RG.",
    description:
      "GL (Ganolium) is the yin to RG's yang. Where RG uses the mature fruiting body, GL is built around ganoderma spores and mycelium — the fine, nutrient-dense parts of the mushroom's life cycle. Taken together with plenty of warm water, RG and GL form the classic DXN daily routine.",
    highlights: [
      "Ganoderma spore & mycelium formula",
      "Traditionally paired with RG",
      "Organically cultivated source material",
      "Halal-certified manufacturing"
    ],
    howToUse: "Adults: 1–3 capsules daily with warm water. Most people take RG in the morning and GL in the evening. Drink plenty of water throughout the day.",
    ingredients: "Ganoderma lucidum spore and mycelium powder. Capsule shell: gelatin.",
    tags: ["gl", "ganolium", "spore", "mycelium", "capsule", "core"],
    model: {
      type: "bottle",
      palette: { body: "#0E7A5F", accent: "#0A5C47", cap: "#1B1B1E", trim: "#C8A24A", deep: "#074234" },
      label: { brand: "DXN", name: "GL", sub: "GANOLIUM", net: "90 capsules", motif: "mushroom" }
    }
  },

  {
    id: "ganocelium",
    name: "DXN Ganocelium",
    short: "Ganocelium",
    category: "supplements",
    sku: "DXN-GCL-60",
    price: 105.00,
    compareAt: null,
    packSize: "60 capsules",
    badge: "Advanced",
    rating: 4.8,
    reviews: 214,
    stock: 15,
    shortDesc: "Concentrated ganoderma mycelium for those ready to go deeper than RG and GL.",
    description:
      "Ganocelium concentrates the mycelium stage of Ganoderma lucidum — the thread-like network that precedes the fruiting body. It's DXN's most concentrated lingzhi formula and is usually chosen by people already comfortable with RG and GL who want a stronger daily routine.",
    highlights: [
      "Concentrated ganoderma mycelium",
      "DXN's most potent lingzhi formula",
      "Vegetarian-friendly capsule option available",
      "Take with plenty of warm water"
    ],
    howToUse: "Adults: 1–2 capsules daily with warm water. Not recommended during pregnancy or while nursing without professional advice.",
    ingredients: "Ganoderma lucidum mycelium powder. Capsule shell: gelatin.",
    tags: ["ganocelium", "mycelium", "advanced", "capsule"],
    model: {
      type: "bottle",
      palette: { body: "#7B2E8C", accent: "#4E1A5C", cap: "#1B1B1E", trim: "#C8A24A", deep: "#3A1247" },
      label: { brand: "DXN", name: "Ganocelium", sub: "MYCELIUM", net: "60 capsules", motif: "mushroom" }
    }
  },

  {
    id: "spirulina-plus",
    name: "DXN Spirulina Plus",
    short: "Spirulina Plus",
    category: "supplements",
    sku: "DXN-SP-120",
    price: 63.00,
    compareAt: 72.00,
    packSize: "120 tablets",
    badge: "Daily Green",
    rating: 4.7,
    reviews: 302,
    stock: 33,
    shortDesc: "Pure blue-green spirulina tablets — one of nature's most nutrient-dense foods.",
    description:
      "Spirulina Plus is a tablet of concentrated Arthrospira platensis, cultivated in clean freshwater and dried at low temperature to protect its nutrients. It's one of the densest natural sources of plant protein, chlorophyll, beta-carotene and B vitamins available.",
    highlights: [
      "Rich in plant protein & chlorophyll",
      "Natural source of beta-carotene and B vitamins",
      "Low-temperature dried to protect nutrients",
      "Easy daily tablet format"
    ],
    howToUse: "Adults: 2–4 tablets daily with water, ideally before meals. Children above 6: 1–2 tablets daily.",
    ingredients: "100% spirulina (Arthrospira platensis).",
    tags: ["spirulina", "tablet", "green", "protein"],
    model: {
      type: "bottle",
      palette: { body: "#1F6B4A", accent: "#123F2C", cap: "#F4EFE6", trim: "#C8A24A", deep: "#0C2A1D" },
      label: { brand: "DXN", name: "Spirulina Plus", sub: "100% PURE", net: "120 tablets", motif: "leaf" }
    }
  },

  {
    id: "lions-mane",
    name: "DXN Lion's Mane",
    short: "Lion's Mane",
    category: "supplements",
    sku: "DXN-LM-90",
    price: 88.00,
    compareAt: null,
    packSize: "90 capsules",
    badge: "Focus",
    rating: 4.6,
    reviews: 87,
    stock: 19,
    shortDesc: "Hericium erinaceus — the traditional 'smart mushroom' for a clear, focused mind.",
    description:
      "Lion's Mane (Hericium erinaceus) has been valued in traditional Chinese medicine for centuries. This formula uses the whole fruiting body, carefully dried and milled, and is a popular daytime companion to a ganoderma routine.",
    highlights: [
      "Whole fruiting body Hericium erinaceus",
      "Traditional 'smart mushroom' of TCM",
      "Great daytime pairing with RG",
      "No fillers, no artificial additives"
    ],
    howToUse: "Adults: 1–3 capsules daily with water, preferably in the morning.",
    ingredients: "Hericium erinaceus (Lion's Mane) fruiting body powder. Capsule shell: gelatin.",
    tags: ["lions mane", "hericium", "focus", "capsule"],
    model: {
      type: "bottle",
      palette: { body: "#D9D2C3", accent: "#B08A4A", cap: "#1B1B1E", trim: "#8C6A3F", deep: "#A79C86" },
      label: { brand: "DXN", name: "Lion's Mane", sub: "HERICIUM", net: "90 capsules", motif: "mushroom" }
    }
  },

  /* ═══════════════ PERSONAL CARE ═══════════════ */
  {
    id: "ganozhi-toothpaste",
    name: "Ganozhi Toothpaste",
    short: "Ganozhi Toothpaste",
    category: "personal-care",
    sku: "DXN-GZ-150",
    price: 22.50,
    compareAt: 26.90,
    packSize: "150g",
    badge: "Household Favourite",
    rating: 4.8,
    reviews: 389,
    stock: 60,
    shortDesc: "Ganoderma toothpaste with no strong flavour and no artificial sweetener — gentle enough for the whole family.",
    description:
      "Ganozhi Toothpaste combines Ganoderma lucidum extract with a mild, non-foaming base. It has no strong mint flavour and no artificial sweetener, which makes it a favourite for children and for anyone who finds conventional toothpaste overpowering. A little goes a long way — use about half your usual amount.",
    highlights: [
      "Contains Ganoderma lucidum extract",
      "No strong flavour, no artificial sweetener",
      "Concentrated — use half your usual amount",
      "Suitable for adults and children"
    ],
    howToUse: "Apply a pea-sized amount to a damp brush. Brush twice daily. Because it is concentrated, you need far less than regular toothpaste.",
    ingredients: "Water, sorbitol, hydrated silica, glycerin, Ganoderma lucidum extract, cellulose gum, natural flavour.",
    tags: ["toothpaste", "ganozhi", "oral care", "family"],
    model: {
      type: "tube",
      palette: { body: "#F4EFE6", accent: "#0E7A5F", cap: "#D6161C", trim: "#C8A24A", deep: "#DCD5C7" },
      label: { brand: "DXN", name: "Ganozhi", sub: "TOOTHPASTE", net: "150g", motif: "mushroom" }
    }
  },

  {
    id: "ganozhi-shampoo",
    name: "Ganozhi Daily Care Shampoo",
    short: "Ganozhi Shampoo",
    category: "personal-care",
    sku: "DXN-GS-250",
    price: 32.00,
    compareAt: 38.00,
    packSize: "250ml",
    badge: null,
    rating: 4.6,
    reviews: 143,
    stock: 26,
    shortDesc: "Gentle daily shampoo with ganoderma extract and a soft, clean finish.",
    description:
      "A mild daily shampoo formulated with Ganoderma lucidum extract and gentle cleansing agents. It leaves hair feeling clean and light without the heavy silicone coating, and the soft scent means it suits both men and women.",
    highlights: [
      "Ganoderma lucidum extract",
      "Gentle enough for daily use",
      "Light, non-greasy finish",
      "Soft unisex fragrance"
    ],
    howToUse: "Massage into wet hair and scalp, rinse thoroughly. Repeat if desired. Follow with conditioner for dry hair.",
    ingredients: "Water, sodium laureth sulfate, cocamidopropyl betaine, glycerin, Ganoderma lucidum extract, fragrance.",
    tags: ["shampoo", "hair", "ganozhi", "daily care"],
    model: {
      type: "pumpbottle",
      palette: { body: "#0E7A5F", accent: "#D6161C", cap: "#1B1B1E", trim: "#C8A24A", deep: "#07422F" },
      label: { brand: "DXN", name: "Ganozhi", sub: "SHAMPOO", net: "250ml", motif: "leaf" }
    }
  },

  {
    id: "ganozhi-bodywash",
    name: "Ganozhi Daily Care Body Wash",
    short: "Ganozhi Body Wash",
    category: "personal-care",
    sku: "DXN-GB-500",
    price: 38.00,
    compareAt: null,
    packSize: "500ml",
    badge: "Family Size",
    rating: 4.7,
    reviews: 76,
    stock: 24,
    shortDesc: "Moisturising body wash with ganoderma extract — a 500ml pump bottle that lasts the whole family.",
    description:
      "A generous 500ml pump bottle of body wash enriched with Ganoderma lucidum extract and moisturising glycerin. It cleanses without stripping, leaving skin feeling soft rather than squeaky, and the pump makes it easy for kids to use on their own.",
    highlights: [
      "500ml family-size pump bottle",
      "Ganoderma extract + moisturising glycerin",
      "Cleanses without stripping natural oils",
      "Easy pump for children"
    ],
    howToUse: "Dispense 1–2 pumps onto a sponge or hands, lather over wet skin and rinse clean.",
    ingredients: "Water, sodium laureth sulfate, glycerin, cocamidopropyl betaine, Ganoderma lucidum extract, fragrance.",
    tags: ["body wash", "bath", "ganozhi", "family size"],
    model: {
      type: "pumpbottle",
      palette: { body: "#D6161C", accent: "#8C0E13", cap: "#1B1B1E", trim: "#C8A24A", deep: "#6B0A10" },
      label: { brand: "DXN", name: "Ganozhi", sub: "BODY WASH", net: "500ml", motif: "leaf" }
    }
  },

  /* ═══════════════ BUNDLES ═══════════════ */
  {
    id: "starter-pack",
    name: "DXN Starter Wellness Pack",
    short: "Starter Pack",
    category: "bundles",
    sku: "DXN-BUNDLE-01",
    price: 168.00,
    compareAt: 194.40,
    packSize: "RG 90 + GL 90 + Lingzhi Coffee 3 in 1",
    badge: "Save RM26",
    rating: 5.0,
    reviews: 64,
    stock: 12,
    shortDesc: "The classic RG + GL pairing plus a bag of Lingzhi Coffee — everything a first-timer needs.",
    description:
      "Our most gifted bundle. It pairs the two core ganoderma formulas, RG and GL, with a bag of Lingzhi Coffee 3 in 1 so you can build the habit in the cup you already enjoy. Buying the pack saves RM26.40 against buying the three separately.",
    highlights: [
      "RG 90 capsules + GL 90 capsules",
      "Lingzhi Coffee 3 in 1 (20 sachets)",
      "Save RM26.40 vs buying separately",
      "Free shipping included in West Malaysia"
    ],
    howToUse: "Morning: RG with warm water and a cup of Lingzhi Coffee. Evening: GL with warm water. Keep hydrated throughout the day.",
    ingredients: "See individual product listings.",
    tags: ["bundle", "starter", "rg", "gl", "coffee", "gift"],
    model: {
      type: "sachetbox",
      palette: { body: "#D6161C", accent: "#0E7A5F", cap: "#F4EFE6", trim: "#C8A24A", deep: "#8C0E13" },
      label: { brand: "DXN", name: "Starter Pack", sub: "RG + GL + COFFEE", net: "3 items", motif: "star" }
    }
  },

  {
    id: "coffee-value-carton",
    name: "Lingzhi Coffee 3 in 1 — Value Carton",
    short: "Coffee Value Carton",
    category: "bundles",
    sku: "DXN-BUNDLE-02",
    price: 158.00,
    compareAt: 167.50,
    packSize: "5 bags × 20 sachets (100 sachets)",
    badge: "Best Value",
    rating: 4.9,
    reviews: 118,
    stock: 9,
    shortDesc: "Five full bags of Lingzhi Coffee 3 in 1 — 100 sachets, enough for three months of daily cups.",
    description:
      "The heavy-drinker's carton. Five bags of Lingzhi Coffee 3 in 1 give you 100 sachets — roughly three months of one cup a day, or a month for a household. Ideal for offices, small kopitiam resale and families who go through coffee fast.",
    highlights: [
      "5 bags = 100 sachets total",
      "About 3 months at one cup a day",
      "Great for offices and resellers",
      "Free shipping across West Malaysia"
    ],
    howToUse: "One sachet per 150ml hot water. Store the carton in a cool, dry place away from sunlight.",
    ingredients: "Sugar, non-dairy creamer, instant coffee, Ganoderma lucidum extract.",
    tags: ["bundle", "coffee", "value", "bulk", "office"],
    model: {
      type: "sachetbox",
      palette: { body: "#6B3A1B", accent: "#D6161C", cap: "#F4EFE6", trim: "#C8A24A", deep: "#3A1E0D" },
      label: { brand: "DXN", name: "Lingzhi Coffee", sub: "VALUE CARTON · 100", net: "5 × 20 sachets", motif: "cup" }
    }
  }
];

/* ---------- Category definitions (order = display order) ---------- */
const CATEGORIES = [
  { id: "beverages",    name: "Coffee & Drinks",  blurb: "Lingzhi coffee, tea, chocolate and cereal", icon: "cup" },
  { id: "supplements",  name: "Health Supplements", blurb: "RG, GL, Ganocelium, spirulina and more", icon: "mushroom" },
  { id: "personal-care",name: "Personal Care",    blurb: "Toothpaste, shampoo and body wash",        icon: "leaf" },
  { id: "bundles",      name: "Value Bundles",    blurb: "Curated packs that save you money",        icon: "star" }
];

export { PRODUCTS, CATEGORIES };
export const getProduct = (id) => PRODUCTS.find(p => p.id === id) || null;
