# MyMigo — Simple MVP Website

> **Someone is there. Shop from anywhere.**  
> Discover trusted stores and get help shopping from anywhere with MyMigo.

---

## MVP Scope

This is the clean first version of **MyMigo** focused strictly on four core actions:
1. **Explore Stores** — Browse active trusted stores filtered by City and Category.
2. **Book a Shopping Session** — Submit a shopping assistance request stored securely in Google Sheets.
3. **Watch Instagram Shopping Videos** — View embedded Instagram Reels/videos and jump straight to Instagram.
4. **Contact & Learn About MyMigo** — Simple overview and direct contact channels.

---

## Project Structure

```text
├── index.html                  # Clean HTML shell & Tailwind CSS
├── server.py                   # Python 3 server (static assets + /api/stores + /api/bookings)
├── .env.example                # Environment variable template (Google Sheets & Supabase)
├── data/
│   └── stores.json             # Local MVP store catalog (Active & Inactive stores)
├── supabase/
│   └── schema.sql              # Optional Supabase `stores` table schema + RLS
├── google-apps-script/
│   └── Code.gs                 # Ready-to-deploy Google Apps Script webhook for Google Sheets
├── src/
│   ├── main.js                 # App entry & 4-route hash router
│   ├── config.js               # Public frontend configuration (cities, categories, contact)
│   ├── styles.css              # Editorial minimalist styles
│   ├── data/
│   │   └── instagramVideos.js  # Curated Instagram Reel URLs & metadata
│   ├── services/
│   │   ├── storeService.js     # Loads active stores
│   │   ├── bookingService.js   # Submits booking requests to /api/bookings
│   │   └── instagramHelper.js  # Instagram embed parser & mobile deep-linking
│   ├── components/
│   │   ├── Navbar.js           # Strictly 4 menus + Book a Session CTA + mobile hamburger
│   │   ├── Footer.js           # Minimal footer with contact details
│   │   ├── StoreCard.js        # Store card with Book a Session button
│   │   └── InstagramCard.js    # Instagram Reel embed + See on Instagram button
│   └── pages/
│       ├── HomePage.js         # Hero, How It Works, Featured Stores, Market Instagram, Contact
│       ├── ExploreStoresPage.js# Active stores directory with City & Category filters
│       ├── BookSessionPage.js  # Booking form connected to Google Sheets backend
│       └── InstagramPage.js    # Dedicated Instagram shopping videos page
└── tests/
    └── test_server.py          # Automated backend & booking storage tests
```

---

## Quick Start

1. **(Optional)** Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Run the server** (requires Python 3.9+):
   ```bash
   python3 server.py
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run automated tests**:
   ```bash
   python3 -m unittest discover -s tests -v
   ```

---

## Connecting Google Sheets Booking Storage

Bookings are sent to `POST /api/bookings` on `server.py` so **no Google Sheets credentials or spreadsheet IDs are ever exposed in frontend JavaScript**.

Every booking generates a unique ID (e.g. `MYMIGO-20261112-001`), sets `Booking Status` to `New`, and records the exact 13 columns:
`Booking ID`, `Date Submitted`, `Customer Name`, `Mobile Number`, `WhatsApp Number`, `Email`, `City`, `Store`, `Requirement`, `Preferred Date`, `Preferred Time`, `Additional Notes`, `Booking Status`.

### Option A: Google Apps Script (Fastest)
1. Create a Google Sheet for MyMigo bookings.
2. Open **Extensions → Apps Script** and paste [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Click **Deploy → New deployment → Web app** (*Execute as: Me*, *Who has access: Anyone*).
4. Copy the Web App URL into `.env`:
   ```env
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   GOOGLE_APPS_SCRIPT_SECRET=optional-shared-secret
   ```
   *(If you set `GOOGLE_APPS_SCRIPT_SECRET`, add the matching `APPS_SCRIPT_SECRET` under Apps Script Project Settings → Script Properties.)*

### Option B: Google Sheets API v4 (Service Account)
1. Create a Google Cloud Service Account with Google Sheets API enabled and share your spreadsheet with the service account email as **Editor**.
2. Set in `.env`:
   ```env
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
   GOOGLE_SHEETS_RANGE=Bookings!A:M
   GOOGLE_SERVICE_ACCOUNT_FILE=/absolute/path/to/service-account.json
   ```

If neither option is configured yet, `/api/bookings` returns an honest `503` status and does **not** fake a successful submission.

---

## Updating Stores & Instagram Videos

- **Stores:** Edit [`data/stores.json`](data/stores.json) or configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` after running [`supabase/schema.sql`](supabase/schema.sql). Only stores with `active: true` appear on **Explore Stores** and in the booking dropdown.
- **Instagram Videos:** Replace the `instagramUrl` entries in [`src/data/instagramVideos.js`](src/data/instagramVideos.js) with your published MyMigo Instagram Reel links. Videos are embedded directly from Instagram and never hosted on MyMigo.
