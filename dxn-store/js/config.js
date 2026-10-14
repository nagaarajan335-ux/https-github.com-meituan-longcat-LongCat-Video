/* ============================================================
   DXN 3D STORE — BUSINESS CONFIG
   ------------------------------------------------------------
   Edit ONLY this file to personalise the shop.
   Everything below is safe to change without touching the site.
   ============================================================ */

export const STORE_CONFIG = {

  /* ---------- Your business ---------- */
  storeName: "DXN Wellness Store",
  legalName: "Your Trading Name Sdn Bhd",
  tagline: "Ganoderma wellness, delivered across Malaysia",
  /* Your DXN membership / stockist code — shown on the site for trust */
  memberCode: "MEM-000000",

  /* ---------- Contact ---------- */
  /* WhatsApp number in INTERNATIONAL format, digits only.
     Malaysia = 60 followed by the number without the leading 0.
     e.g. 012-345 6789  ->  "60123456789"                              */
  whatsapp: "60123456789",
  phone: "+60 12-345 6789",
  email: "orders@yourstore.my",
  addressLines: [
    "12, JalanExample 1,",
    "Taman Perindustrian,",
    "31400 Ipoh, Perak, Malaysia"
  ],
  mapQuery: "Ipoh, Perak, Malaysia",
  operatingHours: "Mon – Sat · 9:00am – 7:00pm",

  /* ---------- Currency ---------- */
  currency: "MYR",
  currencySymbol: "RM",
  locale: "ms-MY",

  /* ---------- Pricing & delivery (all values in MYR) ---------- */
  /* Free shipping kicks in at or above this cart subtotal */
  freeShippingThreshold: 200,
  shipping: {
    westMalaysia: { label: "West Malaysia (Semenanjung)", rate: 8, eta: "2 – 4 working days" },
    eastMalaysia: { label: "East Malaysia (Sabah / Sarawak / Labuan)", rate: 14, eta: "4 – 7 working days" }
  },
  /* Sales tax note — set to 0 if you sell as a small distributor without SST */
  taxRate: 0,
  taxLabel: "SST",

  /* ---------- Payment ----------
     Leave a key empty ("") and that method shows a "coming soon" notice.
     Keys are TEST/PLACEHOLDER values until you replace them — no money moves. */
  payments: {
    /* ---- Online card / FPX payment ----
       The simplest way to take card payments from a STATIC site is a
       hosted payment link. Paste one here and the "Card / FPX online"
       option switches on automatically:
         · Stripe Payment Link   https://dashboard.stripe.com/payment-links
         · ToyyibPay             https://toyyibpay.com   (Malaysian, FPX + card)
         · Billplz               https://www.billplz.com (Malaysian, FPX)
         · Razorpay Payment Link https://dashboard.razorpay.com
       The order ID is appended as ?client_reference_id=DXN-… so you can
       match payments to orders. */
    onlineLink: "",

    /* Only needed later if you add a small server/serverless function. */
    stripeKey: "",
    /* Razorpay key id (starts with rzp_test_ / rzp_live_) */
    razorpayKey: "",
    /* Bank transfer / online banking instructions shown at checkout */
    bank: {
      enabled: true,
      accountName: "Your Trading Name Sdn Bhd",
      bankName: "Maybank",
      accountNumber: "5123 4567 8910",
      reference: "Use your Order ID as the payment reference"
    },
    cashOnDelivery: {
      enabled: true,
      /* Optional extra handling fee for COD, in MYR */
      fee: 3
    },
    /* TnG eWallet / DuitNow QR — upload your QR image to assets/qr-duitnow.png */
    qr: { enabled: true, image: "assets/qr-duitnow.png", label: "DuitNow QR / TnG eWallet" }
  },

  /* ---------- Social ---------- */
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/@",
    youtube: "https://youtube.com/"
  },

  /* ---------- 3D quality ----------
     "auto" picks a sensible pixel ratio for the device.
     Lower this to 1 if you host on a cheap shared plan and want
     the lightest possible page weight. */
  render: { pixelRatio: "auto", shadows: true, antialias: true }
};

/* Also exposed globally so you can experiment from the browser console
   or override values from another script without editing this file.   */
if (typeof window !== "undefined") window.STORE_CONFIG = STORE_CONFIG;
