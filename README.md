# Krishin Lal · System Lab

An interactive portfolio of six production AI systems and three projects. Built with native HTML, CSS, JavaScript modules, and locally vendored Three.js r180.

## Run locally

From this folder:

```sh
python3 -m http.server 8123
```

Open http://localhost:8123/. An HTTP server is required for JavaScript modules; opening `index.html` directly as a file will not work.

## Explore

- Drag the lab to rotate the carousel. Hover or select a machine for spring feedback.
- Use **Step inside** or click a machine to travel into its chamber and read the details.
- Drag inside a chamber to inspect the model. Scroll or pinch to zoom.
- Use **Back to the lab** or Escape to return. The overview and its selected item are preserved.
- Arrow keys navigate; keys 1–6 select systems. P sends a pulse, G toggles floating, and R resets the lab.
- The index provides a keyboard-accessible list of all systems, projects, background, and contact information.

Reduced-motion preferences disable automatic animation and camera travel while preserving navigation and inspection. If WebGL is unavailable, the complete portfolio remains available through the index.

## GitHub Pages

This is a static site. No build command or package installation is needed.

In the repository's **Settings → Pages**, choose **Deploy from a branch**, select **main**, choose **/ (root)**, and save.

The expected address after GitHub finishes deployment is:

https://krishintharani1.github.io/krishin-lal-portfolio/

All asset URLs are relative, so the site works at the repository subpath.

## Edit the portfolio

- `assets/data.js`: system and project descriptions, outcomes, technology stacks, and contact details.
- `assets/scene.js`: machines, camera travel, chamber geometry, spring motion, and WebGL fallback.
- `assets/main.js`: navigation, content rendering, accessibility, and clipboard feedback.
- `assets/styles.css`: midnight-black, electric-blue, saturated-orange, and lime-accent design.
- `Krishin-Lal-Resume.pdf`: downloadable résumé.

Three.js is distributed under the MIT license. Its license is included in `assets/vendor/LICENSE`.
