# Project Overview
**Healthy Body Formula (HBF_web)** is a lightweight, single-page web application designed as a **Telegram Web App (TWA)** for a clinical nutritionist portfolio ("Yulia"). 

It features a mobile-first design, smooth transitions, and an integrated document viewer for diplomas and certificates.

## 📂 Project Structure

```text
D:\GpT_docs\HealthyBodyFormula\HBF_web\
├── index.html          # Main application file (HTML + CSS + JS)
└── Certificates/       # Asset directory for diplomas (PDFs and Images)
    ├── *.pdf           # Original certificate documents
    └── *.jpg           # Preview images/thumbnails
```

## 🛠 Tech Stack

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Styles:** Inline CSS using CSS Variables for theming (Sage Green/Peach palette).
*   **Libraries (CDN):**
    *   `Telegram Web App SDK` - Integration with Telegram client (theme, haptic feedback).
    *   `PDF.js` - Rendering PDF certificates directly in the browser.
    *   `FontAwesome 6` - UI Icons.
    *   `Google Fonts` - Typography (Nunito).

## ✨ Key Features

1.  **SPA Architecture:** 
    *   Uses a "Screens System" to switch views (`#screen-main`, `#screen-about`) without page reloads.
    *   CSS animations (`fadeIn`, `fadeInReverse`) for smooth page transitions.

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

