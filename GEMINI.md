# Startup Protocol
> **CRITICAL INSTRUCTION FOR AI AGENTS:**
> Before answering any user request, you MUST read the current project documentation located in the `docs/` folder.
> 1. Check `docs/ROADMAP.md` (or `speckit.tasks.md`) for current progress.
> 2. Check `docs/DOCUMENTATION.md` (or `speckit.constitution.md`) for architectural rules.
> 3. Adhere to the Spec-Driven Development (SDD) workflow defined in `docs/`.

# Project Overview
**Healthy Body Formula (HBF_web)** is a lightweight, single-page web application designed as a **Telegram Web App (TWA)** for a clinical nutritionist portfolio ("Yulia"). 

It features a mobile-first design, smooth transitions, and an integrated document viewer for diplomas and certificates.

## 📂 Project Structure

```text
D:\GpT_docs\HealthyBodyFormula\HBF_web\
├── index.html          # View structure
├── css/
│   └── style.css       # Styles
├── js/
│   └── app.js          # Logic
├── docs/               # Project Documentation (SDD)
├── guides/             # Premium HTML Guides
└── Certificates/       # Asset directory
```

## 🛠 Tech Stack

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Architecture:** Separation of Concerns (View/Style/Logic).
*   **Backend:** Supabase (BaaS) for Auth & Database.
*   **Styles:** CSS Variables for theming (Sage Green/Peach palette).
*   **Libraries (CDN):**
    *   `Telegram Web App SDK` - Integration with Telegram client (theme, haptic feedback).
    *   `Supabase JS` - Backend connection.
    *   `PDF.js` - Rendering PDF certificates directly in the browser.
    *   `FontAwesome 6` - UI Icons.
    *   `Google Fonts` - Typography (Nunito, Lora).

## 📜 Guides Standard (PREMIUM PROTOCOLS)
All new guides must adhere to this quality and technical standard. Do not create "lightweight" or PDF guides.

### 1. Content Strategy (Evidence-Based)
Act as a Clinical Nutritionist. Structure every guide as follows:
1.  **Scientific Basis:** Explain mechanism of action (biochemistry, hormones) using accessible analogies. Avoid simple "eat this/don't eat that".
2.  **Implementation:** Step-by-step timeline (e.g., 3 Phases).
3.  **Troubleshooting:** Identify 5-7 specific obstacles (social pressure, stress, cravings) and provide scripted solutions.
4.  **Safety:** Clear contraindications and stop-signals.
5.  **Tone:** Professional, empathetic, scientific but clear. Use "Medical Framing" for advice.

### 2. Technical Architecture
*   **Format:** Standalone HTML file in `/guides/` (e.g., `guides/protocol-name.html`).
*   **Navigation:**
    *   **Back Button:** MUST link to `../index.html?screen=guides` to preserve SPA state.
    *   **Header:** Sticky, Glassmorphism (`backdrop-filter: blur`), Label "ПРОТОКОЛ".
*   **Typography:**
    *   **Headings:** `Nunito` (Modern, sans-serif).
    *   **Body:** `Lora` (Serif, high readability for long-reads).
*   **Components:**
    *   **Accordions:** Use for Phases and Troubleshooting to save space on mobile.
    *   **Colors:** High contrast text (`#1A202C` on `#FFFFFF`), Accents: Sage (`#5A7D6C`) + Gold (`#D4AF37`).

## 🥗 Recipe Generation Standard (ROLE: HBF.RecipeCreator)
When asked to generate new recipes, adopt the persona of **Yulia (Clinical Nutritionist)** and strictly follow this JSON structure.

### 1. Data Integrity Rules
*   **Format:** Valid JSON object keyed by a unique ID (integer).
*   **BJU:** Must be a string in format "Protein/Fat/Carbs" (e.g., "15/10/45").
*   **Steps:** Must be detailed, explaining *how* and *why* (e.g., "Soak chia to activate...").
*   **Categories:** Only use: `breakfast`, `lunch`, `dinner`, `dessert`.
*   **Types:** `fish`, `meat`, `vegan`, `poultry`.

### 2. Output Template
```json
{
  "ID": {
    "title": "Recipe Name (Russian)",
    "category": "breakfast|lunch|dinner|dessert",
    "type": "vegan|meat|fish|poultry",
    "kcal": 350,
    "time": 20,
    "bju": "P/F/C",
    "image": "path/to/placeholder.png",
    "ingredients": [
      "Item 1 - Qty",
      "Item 2 - Qty"
    ],
    "steps": [
      "Detailed step 1...",
      "Detailed step 2..."
    ]
  }
}
```

### 3. Image Generation Strategy
When requested to provide an image prompt for a recipe, strictly adhere to this style to maintain visual consistency.

**Formula:** `[Specific Dish Visuals] + [Composition details] + [Global Style Suffix]`

**Global Style Suffix (ALWAYS APPEND):**
> Professional food photography, high resolution, photorealistic, 8k, soft natural morning lighting, aesthetic plating, shallow depth of field, sage green and pastel tones, clean background, **perfectly centered composition, subject in the middle, sufficient negative space around the edges, wide shot to prevent cropping, --ar 1:1**

**Example:**
> White chia seed pudding with coconut milk in a clear glass jar. Topped with bright yellow mango puree and a mint leaf. Minimalist composition, bright background, glass texture. Professional food photography, high resolution, photorealistic, 8k, soft natural morning lighting, aesthetic plating, shallow depth of field, sage green and pastel tones, clean background, perfectly centered composition, subject in the middle, sufficient negative space around the edges, wide shot to prevent cropping, --ar 1:1

### 4. Asset Pipeline
After generating images:
1.  **Save:** Save files to `Recipes/images/` using generic names (e.g., `id5.png`).
2.  **Optimize:** Run `python optimize_new_recipes.py`. This script will:
    *   Convert to JPG.
    *   Resize to 1000x1000.
    *   Rename to `recipe_{ID}.jpg`.
    *   Delete source files.
3.  **Link:** Ensure `js/app.js` references `Recipes/images/recipe_{ID}.jpg`.

## ✨ Key Features

1.  **SPA Architecture:** 
    *   Uses a "Screens System" to switch views (`#screen-main`, `#screen-about`) without page reloads.
    *   CSS animations (`fadeIn`, `fadeInReverse`) for smooth page transitions.
    *   **Deep Linking:** Handles `?screen=xyz` parameter to load specific sections on startup.

2.  **Telegram Integration:**
    *   Automatically adapts to Telegram's color scheme (header/background).
    *   Uses `HapticFeedback` for tactile interaction response.
    *   Prevents iOS double-tap zoom.

3.  **Certificate Viewer (Lightbox):**
    *   **Universal Viewer:** Handles both Images (`.jpg`) and PDFs (`.pdf`).
    *   **PDF Rendering:** Uses `pdf.js` to render PDF pages onto HTML5 Canvases.
    *   **Interactions:** Supports Zoom In/Out and scrolling.

## 🚀 Usage & Development

### Running the Project
Since this is a static site with no build step, you can run it directly:
1.  **Local:** Open `index.html` in any modern web browser.
    *   *Tip:* Use Chrome DevTools "Device Toolbar" to simulate a mobile viewport (e.g., iPhone 12/14 Pro).
2.  **Telegram:** Deploy to a static host (GitHub Pages, Vercel, Netlify) and link via `@BotFather` as a Web App.

### Editing Content
All logic and styles are contained within `index.html`.
*   **Styles:** Located in the `<style>` block. modifying `--bg-primary`, `--sage-green`, etc. changes the theme.
*   **Logic:** Located in the `<script>` block at the bottom. Handles navigation, carousel, and PDF rendering.
*   **Content:** Edit HTML sections (e.g., `<div class="bio-card">`) to update text.

### Adding Certificates
1.  Add the `.pdf` or `.jpg` file to the `Certificates/` folder.
2.  Add a new entry to the `#certificatesCarousel` container in `index.html`:
    ```html
    <div class="certificate-card" 
         data-certificate="ID" 
         data-type="pdf|image" 
         data-src="Certificates/filename.ext" 
         data-rotation="0">
        <img src="Certificates/preview.jpg" alt="Description">
        ...
    </div>
    ```

---

## 🕒 Session History

### 2025-12-22
**Task:** Project Architecture Transformation (SDD, Supabase, Navigation).

*   **Architecture & Documentation:**
    *   Implemented Spec-Driven Development (SDD) workflow. Created `docs/` folder with Constitution, PRD, Technical Spec, and Task Breakdown.
    *   Updated `GEMINI.md` to mandate documentation checks at session start.
*   **Backend & Navigation:**
    *   Integrated **Supabase** (BaaS) for user management and auth.
    *   Implemented **Bottom Navigation Bar** for primary sections (Home, Services, Guides, Profile).
    *   Added dedicated screens for **Services** and **Profile**.
*   **Features:**
    *   **Smart Recipes:** Added filtering chips (Breakfast, Lunch, etc.), metadata badges (kcal, time), and Favorites functionality (localStorage prototype).
    *   **User Sync:** Implemented "Silent Login" via `Telegram.WebApp.initData`.

### 2025-12-21
**Task:** Implement a premium-grade "Anti-Sugar" guide system.

*   **HTML Guide Architecture:**
    *   Transitioned from static PDFs to a dynamic HTML-based "Magazine Style" guide system located in `/guides`.
    *   Implemented `anti-sugar.html` using a scientific "Evidence-Based" approach (biochemistry, 3-phase timeline, troubleshooting).
    *   Designed responsive, accessible UI with expandable Accordions for long-form content.
*   **Seamless Navigation:**
    *   Enhanced `index.html` with a deep-linking mechanism (`URLSearchParams`) to allow "Back" buttons in guides to return users to the specific screen they came from (e.g., `?screen=guides`).
*   **UI/UX Refinements:**
    *   Created a "Glassmorphism" sticky header for guides.
    *   Localized all medical and technical terms for the Russian-speaking audience.
    *   Optimized typography (Lora for body, Nunito for UI) for maximum readability of long nutritional protocols.

### 2025-12-20
**Task:** Fix PDF loading in the certificate viewer and deploy to GitHub.

*   **PDF.js Fixes:**
    *   Explicitly initialized `pdfjsLib` from `window['pdfjs-dist/build/pdf']` to resolve reference errors.
    *   Added `cMapUrl` and `cMapPacked` configuration to `getDocument` to support Cyrillic fonts and standard PDF character maps.
    *   Enhanced error reporting in the lightbox to display specific error messages (e.g., "Missing PDF", "Fetch error").
*   **Local Server & CORS:**
    *   Identified that PDF loading via `file://` protocol is blocked by browser CORS policy.
    *   Set up a local development server using `python -m http.server 8080` for testing.
*   **Deployment:**
    *   Initialized/re-linked local git repository to `https://github.com/zebrosha-max/HealthyBodyFormula_repo.git`.
    *   Resolved merge conflicts in `index.html` by prioritizing local fixes.
    *   Pushed the updated code to the `main` branch for GitHub Pages deployment.
