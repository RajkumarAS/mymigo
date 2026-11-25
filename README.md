# NutriSnap — AI Food Tracker

A working, mobile-first AI food tracker built for Indian and international diets. Users can photograph a meal using their camera, upload an image from their photo gallery, or log foods manually. NutriSnap integrates with Google Gemini Vision AI to detect dishes, portion sizes, and calculate calories, protein, carbs, and fat with real-time editing and multi-tenant data isolation.

---

## 🌟 Key Features

### 1. Sign Up & Authentication
- **Country Code Selector**: Pre-selected to **India (+91)** with international country support (🇺🇸 +1, 🇬🇧 +44, 🇦🇪 +971, 🇸🇬 +65, 🇨🇦 +1, 🇦🇺 +61, etc.).
- **Mobile Number & Password Authentication**: Validates mobile numbers and enforces secure password policies.
- **Cryptographic Security**: Salted PBKDF2-HMAC-SHA256 password hashing (100,000 rounds) and token-based session management (`secrets.token_hex(32)`).
- **Multi-Tenant Data Isolation**: Every meal, photo, and dashboard query strictly filters by `user_id`. User A cannot access or view User B's meals or private photos.

### 2. Log a Meal (3 Input Methods)
- **📸 Take Photo**: Activates mobile camera (`capture="environment"`).
- **🖼️ Upload Photo**: Selects images from phone gallery.
- **✍️ Enter Manually**: Direct meal entry without taking photos or calling external AI.
- **Pre-Scan Image Preview**: Lets users inspect, retake, or replace photos before scanning.
- **Sample Indian Meals Tray**: 1-click test dishes (Masala Dosa, Chicken Biryani, Steamed Idli Platter, Roti & Dal Thali).

### 3. Gemini Vision AI Analysis
- **Secure Server-Side Integration**: `GEMINI_API_KEY` stored strictly on backend (environment variable or `.env`).
- **Vision Model**: Connects to `gemini-2.5-flash` with fallback to `gemini-1.5-flash`.
- **Indian Culinary Intelligence**: Identifies Indian portions and units:
  - `piece` (dosas, idlis, rotis, parathas, samosas, eggs)
  - `katori` (dal, sambar, sabzi, curd, raita, gravies)
  - `cup` (chai, filter coffee, rice, cereals)
  - `plate` (biryani, pulao, thali)
  - `tbsp` (chutneys, ghee, butter)
  - `grams` (meat, paneer, veggies)
- **Unclear / Estimated Flags**: Transparently marks photo-based nutrition as estimates and flags items needing verification (e.g., hidden oil, gravies).
- **Resilient Fallback**: If Gemini fails or hits usage limits, keeps the selected photo and offers "Try Again", "Enter Manually", or "NutriSnap Smart Indian Engine".

### 4. Review & Edit Before Saving
- **Editable Dishes & Ingredients**: Rename dishes, add missing ingredients, or delete incorrect ones.
- **Portion Adjustments**: Change quantities and units with **real-time recalculation** of calories, protein, carbs, and fat.
- **Incomplete Nutrition Indicators**: Highlights manually added items that require nutritional details.
- **Save Confirmed Meal**: Saves only when the user taps "Save Meal".

### 5. Classify and Save Meals
- **Categories**: Breakfast, Lunch, Dinner, and Custom.
- **Custom Labels**: e.g., "Evening Snack", "Post-Workout Shake", "Midnight Munchies".
- **Date & Exact Time**: Defaults to current date and time with picker options.
- **Private Photo Storage**: Uploaded photos are stored in user-segregated directories and served through authenticated endpoints.

### 6. Dashboard & History
- **Today's Nutrition Summary**: Calories logged, daily goal, remaining calories progress meter.
- **Macronutrient Breakdown**: Protein (logged / goal), Carbs, and Fat.
- **Categorized Meals**: Grouped into Breakfast, Lunch, Dinner, and Custom with thumbnails, timestamps, and macros.
- **Date Navigation**: Previous/Next day arrows and date picker to browse history.
- **Persistent Database**: SQLite storage ensures history persists across refreshes and logins across devices.
- **Profile Goals**: Edit daily calorie and protein targets with live dashboard synchronization.

---

## 🚀 Quick Start

### 1. Start the Server
NutriSnap uses standard Python 3.9+ libraries with zero external pip dependencies.

```bash
python3 server.py
```

The server starts at `http://localhost:8080`.

### 2. Configure Gemini API (Optional)
Create a `.env` file or export `GEMINI_API_KEY`:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

*Note: If no API key is provided, NutriSnap automatically enables its built-in Indian food heuristic engine so you can test and demonstrate the full flow without interruption.*

### 3. Seed Demo Data
Pre-seed test accounts and meals:

```bash
python3 seed_demo.py
```

Demo credentials:
- **User A**: `+91 9876543210` / `password123` (Pre-loaded with breakfast, lunch, snack, and daily goals)
- **User B**: `+91 9123456789` / `password123` (Isolated account)

---

## 🧪 Running Automated Tests

Run the complete test suite:

```bash
# 1. Database and isolation unit tests
python3 test_db.py

# 2. REST API integration tests
python3 test_server_api.py

# 3. Complete End-to-End User Journey test
python3 tests/test_nutrisnap_e2e.py
```

All tests run completely offline and verify:
- Signup with India (+91) country code & duplicate prevention
- Password hashing & login authentication
- Food scanning & fallback intelligence
- Ingredient modification & dynamic macro recalculation
- Multi-tenant isolation (User B cannot access User A's meals, photos, or stats)
- Manual entry without Gemini calls
- Saved meal editing & deletion with immediate dashboard updates

---

## 📱 Tech Stack
- **Frontend**: Clean vanilla JavaScript, self-contained CSS, mobile-first responsive viewport, SVG icons.
- **Backend**: Python 3 `http.server`, `socketserver.ThreadingMixIn`.
- **Database**: SQLite3 with foreign keys, indexes, and parameterized queries.
- **AI Service**: Google Gemini Vision API (`gemini-2.5-flash` / `gemini-1.5-flash`).
