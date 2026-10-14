# DXN 3D Store — live 3D product website

A complete, dependency-free storefront for selling DXN products in Malaysia.
Every product is a **real-time 3D model built in the browser** — customers drag to
spin the actual packaging, read the label and check the pack size before buying.

**No build step. No npm install. No database. No monthly platform fee.**
Upload the folder to any web host and it works.

---

## Run it locally

Any static file server will do. From inside the `dxn-store` folder:

```bash
# Python (installed on Mac, Linux and most Windows setups)
python3 -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

> Don't just double-click `index.html` — browsers block ES modules over `file://`.
> You need any HTTP server, even a one-line one.

---

## Go live (pick one)

| Host | How | Cost |
|---|---|---|
| **Netlify Drop** | drag the `dxn-store` folder onto <https://app.netlify.com/drop> | Free |
| **GitHub Pages** | push the folder to a repo → Settings → Pages | Free |
| **Cloudflare Pages** | connect the repo, build command *none*, output dir `dxn-store` | Free |
| **Your existing cPanel host** | upload the folder into `public_html` via FTP | Included |

There is nothing to compile, so "build command" is always **none** and
"output directory" is just this folder.

---

## Make it yours — 6 edits

### 1. Your business details → `js/config.js`
This is the only file you *have* to touch. Change:

- `storeName`, `legalName`, `tagline`, `memberCode` (your DXN member number)
- `whatsapp` — international format, digits only. Malaysia `012-345 6789` → `"60123456789"`
- `phone`, `email`, `addressLines`, `mapQuery`, `operatingHours`
- `social` links
- `freeShippingThreshold` and the two shipping rates
- `payments.bank` — your real bank account
- `payments.onlineLink` — see step 4
- `payments.qr.image` — your DuitNow QR

### 2. Your prices → `js/products.js`
⚠️ **Every price in there is a sample figure.** Replace each `price` (and
`compareAt` if you show a discount) with your real DXN Malaysia retail price
before you take orders.

Same file also holds `stock`, `packSize`, `sku`, descriptions and the
`model` block that controls the 3D look:

```js
model: {
  type: "bottle",                     // bottle | foilbag | sachetbox | tube | pumpbottle
  palette: { body:"#D6161C", accent:"#8C0E13", cap:"#1B1B1E", trim:"#C8A24A", deep:"#5E0A0E" },
  label:   { brand:"DXN", name:"RG", sub:"REISHI GANO", net:"90 capsules", motif:"mushroom" }
}
```

Change those colours and words and the 3D packaging updates instantly —
there are no image files to replace, because the labels are painted at runtime.

**Add a product:** copy any object in the array, give it a new `id`, done.
It appears in the catalogue, search, filters and cart automatically.

### 3. Your logo
The current mark is a drawn placeholder (so you're not shipping someone else's
trademark artwork by accident). Replace it with your official asset:

- put your file at `assets/logo.svg` (or `.png`)
- in `js/ui.js`, change `LOGO_SVG()` to `<img src="assets/logo.svg" width="40" height="40" alt="DXN">`

### 4. Taking card payments
A static site can't process cards by itself, so the built-in approach is a
**hosted payment link** — paste one into `payments.onlineLink` in `js/config.js`
and the "Card / FPX online" option switches itself on:

- **ToyyibPay** or **Billplz** — Malaysian, FPX + cards, no monthly fee
- **Stripe Payment Links** — cards, works internationally
- **Razorpay Payment Links** — cards + UPI

Your order ID is appended to the link automatically as
`?client_reference_id=DXN-…` so you can match a payment to an order.

Until you add a link, the other methods are fully working:
**DuitNow QR**, **bank transfer**, **cash on delivery** and **WhatsApp**.

### 5. Your DuitNow QR
Save your QR image as `assets/qr-duitnow.png`. Until you do, the checkout shows
a note telling you where to put it.

### 6. Your story → `js/about.js`
The timeline, store details and membership wording are plain text at the top
of that file.

---

## How orders reach you

There is no server, so orders are handled two ways — both are live right now:

1. **WhatsApp (recommended).** "Send order on WhatsApp" writes the complete
   order — items, quantities, totals, customer name, address, payment choice —
   into a WhatsApp message addressed to your number. The customer presses send
   and you have everything. This is how most DXN distributors work.
2. **On-device record.** Every order is also saved in the customer's browser
   and shown on a printable confirmation page with a copyable order ID, so they
   can come back to it or print a PDF receipt.

If you later want orders landing in a database, Google Sheet or your email
inbox, add a free form backend (Formspree, Getform, or a Cloudflare Worker) and
POST the order object from `submit()` in `js/cart.js` — the hook is already in
one place.

---

## What's in the box

```
index.html        home — 3D hero showcase, categories, bestsellers, reviews
catalogue.html    live 3D product grid, filters, search, sorting
product.html      full 3D viewer, specs, directions, reviews, add to cart
cart.html         cart + checkout: delivery zones, 5 payment methods
order.html        confirmation, printable receipt, WhatsApp hand-off
about.html        story, ganoderma education, RG vs GL vs Ganocelium
contact.html      contact form, map, delivery table, 12-question FAQ

css/style.css     the whole design system (no CSS framework)
js/config.js      ← your business details start here
js/products.js    ← your catalogue and prices
js/labels.js      paints product labels onto canvases at runtime
js/models.js      builds each product's 3D geometry
js/stage.js       the 3D engine (gallery + interactive viewer)
js/store.js       cart, pricing, shipping, orders, WhatsApp messages
js/ui.js          header, mini-cart drawer, toasts, footer
js/app.js         page bootstrap + shared card markup
js/thumb.js       2D fallback tiles (mini-cart, search, no-WebGL browsers)
vendor/           Three.js r186 — vendored, so nothing loads from a CDN
```

### How the 3D stays fast
A page with 15 spinning products would normally open 15 WebGL contexts and
grind a phone to a halt. Instead **one** hidden canvas serves the whole page:
each product gets its own scene and camera, and the renderer draws them into
the exact screen rectangle of each card using scissor clipping. Products
off-screen cost nothing, rendering pauses when the tab is hidden, and the
pixel ratio is capped at 2.

The big product viewer is a separate scene with real shadow maps, studio
lighting and orbit controls.

### Accessibility & legal
- Keyboard-focusable controls, ARIA labels, skip link, `prefers-reduced-motion`
  respected (models stop spinning)
- Graceful 2D fallback if WebGL is unavailable
- Health disclaimer on every product page and in the footer — supplements must
  not be marketed as treating or preventing disease
- The footer notes this is an independent distributor storefront and that DXN
  and the product names are DXN Holdings Bhd trademarks

> **Before you launch:** confirm you're an authorised DXN distributor for your
> market, use your real prices, use your own logo, and don't make medical
> claims. Those three things are on you, not on the code.

---

## Testing

Two test scripts live outside the shipped folder and need Node:

```bash
npm i -D jsdom && cp -r <three package> node_modules/
node test-models.mjs   # builds all 15 models, checks geometry & textures
node test-pages.mjs index.html   # boots a page in jsdom, asserts the DOM
```

They check that every product model has finite geometry, is normalised to the
right height and sits on the floor; that label textures honour the aspect ratio
of the surface they wrap; and that each page mounts its header, footer, cards
and interactive controls without console errors.
