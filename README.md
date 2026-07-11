# Why Low-Light Cameras Go Color Blind — project page

Academic project page for the ICCP 2026 paper
*"Why Low-Light Cameras Go Color Blind: Removing Color Bias in Raw Denoising."*
Static HTML/CSS, no build step. Design adapted from the
[Vista4D](https://eyeline-labs.github.io/Vista4D/) project page (based on the
[Nerfies](https://nerfies.github.io/) template) — credited in the footer.

## Files
```
index.html               the page
static/css/bulma.min.css  layout framework (vendored)
static/css/index.css      theme + styling (Futura/Inter, light, blue accent)
assets/favicon.svg        tab icon
.nojekyll                 serve files as-is on GitHub Pages
```
Icons (FontAwesome + Academicons) and the Inter font load from CDNs at view time.

## ⚠️ Fill these in before publishing
- **Author affiliations** — the superscript numbers (¹²³⁴) in `index.html` are
  my best guess. **Verify and correct the author→institution mapping.**
- **Button links** — the arXiv / Code / Poster / Twitter buttons use `href="#"`
  placeholders. Replace with real URLs (search `href="#"` in `index.html`).
- Author name links (`<a href="#">`) — add homepage URLs if you want them clickable.

## Deploy to GitHub Pages
1. Create a repo, put the **contents of this `website/` folder at the repo root**
   (so `index.html` is top-level), then push:
   ```bash
   git init && git add . && git commit -m "Project page"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
2. GitHub → **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
3. Live in ~1 min at `https://<username>.github.io/<repo>/`.

## Customize
- Colors/fonts: edit the `:root` variables at the top of `static/css/index.css`
  (`--primary-color`, `--accent-color`). To tie into the talk, set the accent to
  the deck's teal `#4FC3D9`.
- Text/authors/buttons: edit `index.html`.
