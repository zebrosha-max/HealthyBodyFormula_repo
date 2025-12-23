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
├── guides/             # HTML Guides & Protocols
└── Recipes/            # Recipe images and metadata
```

## 🛠 Tech Stack

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Architecture:** Separation of Concerns (View/Style/Logic).
*   **Backend:** Supabase (BaaS) for Auth, Favorites & User Data.
*   **Styles:** CSS Variables for theming (Sage Green/Peach palette).
*   **Libraries (CDN):** Telegram Web App SDK, Supabase JS, PDF.js, FontAwesome 6.

## 📜 Guides Standard (PREMIUM PROTOCOLS)
All new guides must adhere to this quality and technical standard.

### 1. Content Strategy (Evidence-Based)
Structure: Scientific Basis -> Practical Implementation -> Troubleshooting -> Safety.
### 2. Technical Architecture
*   **Navigation:** Back button MUST use `?screen=guides`.
*   **UI:** Glassmorphism headers, Accordions for long text, Lora font for readability.
*   **Categorization:**
    *   **Guideline (Руководство):** Premium/High-value protocols.
    *   **Free Guide (Бесплатный гайд):** Quick checklists and lead magnets.

---

## 🕒 Session History

### 2025-12-22 (Major Update: Personalization & Content Scale)
**Task:** Implementation of Profile Personalization, Advanced Filtering, and Premium Content Lineup.

*   **User Profile & Personalization:**
    *   **Telegram Avatar Integration:** Real-time fetching of `photo_url` from TG API with stylish fallback.
    *   **Dynamic Favorites:** Implementation of a live "Favorites" list in the Profile screen with compact recipe cards.
    *   **Haptic Feedback:** Tactile response for navigation, liking, and filtering actions.
*   **Recipe System Upgrade:**
    *   **Scale:** Expanded DB to 21 recipes, including the new "Ptitim with Pesto".
    *   **Smart Filtering:** Added "Only Favorites" filter in the header. Implemented logic for combined filtering (Type + Category + Kcal + Time).
    *   **Asset Pipeline:** Optimized `optimize_recipes.py` to check for format/size standards before processing (avoiding generation loss).
*   **Educational Content (Gайды):**
    *   **Premium Lineup:** Created 5 high-value guidelines: *Clean Gut, Hormonal Glow, Metabolic Flexibility, Cortisol Control, Sleep Fix*.
    *   **Lead Magnets:** Created 3 free guides: *Plate Constructor, Deficiencies Checklist, Smart Shopping*.
    *   **Visual Identity:** Standardized `.guide-card` UI with pricing, struck-through old prices for marketing, and premium star badges. Customized icon colors matching each guide's theme.
*   **Architecture & Navigation:**
    *   **Deep Linking:** Implemented URL parameter handling (`?screen=guides`) allowing guides to return users to the correct SPA section.
    *   **URL Cleanup:** Integrated `history.replaceState` to clean up address bar after screen transition.
    *   **UI Fixes:** Centered headers in all sub-screens and added back buttons to Services and Profile sections.

### 2025-12-21
*   Transitioned from static PDFs to a dynamic HTML-based "Magazine Style" guide system.
*   Implemented `anti-sugar.html` using a scientific approach.

### 2025-12-20
*   Fix PDF loading in the certificate viewer and deployed to GitHub Pages.