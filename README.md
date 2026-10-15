# DXN 3D Store — live 3D product website

A complete, dependency-free storefront for selling DXN products in Malaysia.
Every product is a **real-time 3D model built in the browser** — customers drag to
spin the actual packaging, read the label and check the pack size before buying.

**No build step. No npm install. No database. No monthly platform fee.**
This folder *is* the website. Upload it anywhere and it runs.

---

## Publish it free on GitHub Pages (recommended)

The files are already in this repository, so publishing is three clicks:

1. Open **Settings → Pages** for this repository
2. Under *Build and deployment*, Source = **Deploy from a branch**
3. Branch = `arena/e811ef9f-https-github-com-meituan-longc`, folder = **/ (root)** → **Save**

Wait about a minute. Your permanent link will be:

```
https://<your-github-username>.github.io/https-github.com-meituan-longcat-LongCat-Video/
```

It works on any phone, has HTTPS, and costs nothing.
`.nojekyll` is already in place so GitHub serves the files untouched.

> If you merge this branch into `main` later, just switch the Pages branch to `main`.

### Other hosts (equally easy)

| Host | How | Cost |
|---|---|---|
| **Netlify Drop** | drag this folder onto <https://app.netlify.com/drop> | Free |
| **Cloudflare Pages** | connect the repo, build command *none*, output dir `/` | Free |
| **Your cPanel host** | FTP the folder into `public_html` | Included |

Nothing to compile, so "build command" is always **none**.

---

## Run it on your own computer

Any static file server works. From this folder:

```bash
python3 -m http.server 8080     # then open http://localhost:8080
npx serve .                     # or this, if you have Node
```

> Don't double-click `index.html` — browsers block ES modules over `file://`.

---

## Make it yours — 6 edits

### 1. Your business details → `js/config.js`
The only file you *have* to touch:

- `storeName`, `legalName`, `tagline`, `memberCode` (your DXN member number)
- `whatsapp` — international format, digits only. Malaysia `012-345 6789` → `"60123456789"`
- `phone`, `email`, `addressLines`, `mapQuery`, `operatingHours`, `social`
- `freeShippingThreshold` and the two shipping rates
- `payments.bank` — your real bank account
- `payments.onlineLink` — see step 4
- `payments.qr.image` — your DuitNow QR

### 2. Your prices → `js/products.js`
⚠️ **Every price in there is a sample figure.** Replace each `price` (and
`compareAt` if you show a discount) with your real DXN Malaysia price before
you take orders.

Same file holds `stock`, `packSize`, `sku`, the descriptions, and the `model`
block that controls the 3D look:

```js
model: {
  type: "bottle",      // bottle | foilbag | sachetbox | tube | pumpbottle
  palette: { body:"#D6161C", accent:"#8C0E13", cap:"#1B1B1E", trim:"#C8A24A", deep:"#5E0A0E" },
  label:   { brand:"DXN", name:"RG", sub:"REISHI GANO", net:"90 capsules", motif:"mushroom" }
}
```

Change those colours and words and the 3D packaging updates instantly — there are
no image files to replace, because every label is painted at runtime.

**Add a product:** copy any object in the array, give it a new `id`, done.
It appears in the catalogue, search, filters and cart automatically.

### Your product photos → `assets/photos/`

The shop is photo-led: cards, the home hero and the product page all show
your **real DXN product photography** first, with the 3D model available
on a "360°" tap.

1. Save one JPG per product as `assets/photos/<product-id>.jpg`
   (the full list of 15 file names is in [`assets/photos/README.md`](assets/photos/README.md)).
2. Commit and push — the photos appear everywhere automatically.

If a photo is missing, that product falls back to its rendered 2D tile /
3D model, so the site never looks broken while you collect images.
Use square or 4:5 shots, ~1200–2000 px wide, on a plain light background.

### 3. Your logo
The mark in use is a drawn placeholder, so you aren't shipping someone else's
trademark artwork by accident. To swap in your official asset:

- put it at `assets/logo.svg` (or `.png`)
- in `js/ui.js`, change `LOGO_SVG()` to `<img src="assets/logo.svg" width="40" height="40" alt="DXN">`

### 4. Taking card payments
A static site can't process cards by itself, so the built-in approach is a
**hosted payment link**. Paste one into `payments.onlineLink` in `js/config.js`
and the "Card / FPX online" option switches itself on:

- **ToyyibPay** or **Billplz** — Malaysian, FPX + cards, no monthly fee
- **Stripe Payment Links** — cards, international
- **Razorpay Payment Links** — cards + UPI

Your order ID is appended automatically as `?client_reference_id=DXN-…` so you
can match a payment to an order.

Until you add a link, these are fully working: **DuitNow QR**, **bank transfer**,
**cash on delivery** and **WhatsApp**.

### 5. Your DuitNow QR
Save it as `assets/qr-duitnow.png`. Until you do, checkout shows a note telling
you where to put it.

### 6. Your story → `js/about.js`
Timeline, store details and membership wording are plain text at the top.

---

## How orders reach you

There is no server, so orders are handled two ways — both live right now:

1. **WhatsApp (recommended).** "Send order on WhatsApp" writes the complete
   order — items, quantities, totals, name, address, payment choice — into a
   WhatsApp message addressed to your number. The customer presses send and you
   have everything. This is how most DXN distributors work.
2. **On-device record.** Every order is also saved in the customer's browser and
   shown on a printable confirmation page with a copyable order ID.

Want orders landing in a database, a Google Sheet or your inbox? Add a free form
backend (Formspree, Getform, or a Cloudflare Worker) and POST the order object
from `submit()` in `js/cart.js` — the hook is already in one place.

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

### How the 3D stays fast on a phone
A page with 15 spinning products would normally open 15 WebGL contexts and
grind a mid-range phone to a halt. Instead **one** hidden canvas serves the
whole page: each product gets its own scene and camera, and the renderer draws
them into the exact screen rectangle of each card using scissor clipping.
Products off-screen cost nothing, rendering pauses when the tab is hidden, and
the pixel ratio is capped at 2.

The big product viewer is a separate scene with real shadow maps, studio
lighting and orbit controls.

### Accessibility & legal
- Keyboard-focusable controls, ARIA labels, skip link, and
  `prefers-reduced-motion` respected (models stop spinning)
- Graceful 2D fallback if WebGL is unavailable
- Health disclaimer on every product page and in the footer — supplements must
  not be marketed as treating or preventing disease
- The footer states this is an independent distributor storefront and that DXN
  and the product names are DXN Holdings Bhd trademarks

> **Before you launch:** confirm you're an authorised DXN distributor for your
> market, use your real prices, use your own logo, and make no medical claims.
> Those three things are on you, not on the code.
