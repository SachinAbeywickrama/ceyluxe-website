# CEYLUXE botanical drinks

A complete, responsive, single-page academic product website. Built with HTML, CSS and vanilla JavaScript, with no framework, package installation or build step required.

## Run locally

From this `ceylux-site` folder:

```sh
node serve.cjs
```

Open http://localhost:4173. Stop the server with Ctrl+C. This dependency-free Node server supports MP4 byte ranges for video playback and seeking. You can also open `dist/index.html` directly for an offline demonstration.

## Edit the project

- `dist/index.html`: all section wording, navigation, product cards, FAQ answers and form labels.
- `dist/styles.css`: responsive layout and design. Colour, typography and spacing variables are at the beginning. Products use four desktop columns, two tablet columns and one phone column.
- `dist/payment.html` and `dist/payment.css`: standalone, responsive payment design. Open `/payment.html` or follow the payment-options link above the inquiry form. Card, bank transfer and cash-on-delivery choices change the visible preview using CSS only. Card fields start empty and are editable; they are not submitted or stored. The payment button remains disabled with an online-payment availability note. Sample prices are illustrative; there is no gateway, payment processing, or order creation.
- `dist/theme.js` and `dist/theme.css`: shared light/dark switch on both pages. Uses the supplied five-colour palette, follows the device theme initially, and saves an explicit choice in local storage. No personal details are stored.
- `dist/patterns.css` and `dist/assets/pattern-*.jpg`: the four user-supplied botanical backgrounds. Image 1 is used in both footers, image 2 in Wholesale & Gifting, image 3 around the packaging image, and image 4 in the science section. Green overlays keep text readable in both themes.
- `dist/app.js`: pack selection, inquiry prefilling and local demonstration forms.
- `dist/assets/ceyluxe-hero-ritual.mp4`: silent, approximately 10-second H.264 montage of all four user-provided videos. Botanical ball close-ups lead into the actual drop and tea infusion. Portrait crops, matched colour/exposure, gentle noise reduction, crossfades and a blended loop suit the hero frame. `ceyluxe-hero-ritual-poster.jpg` is its matching poster and fallback. Pause/play and reduced-motion support are retained.
- `video/edit-hero-montage.py`: reproducible FFmpeg edit; accepts the folder containing all four source clips. Unedited uploads are not published. The previous single-clip edit and 3D animation remain archived and are no longer displayed.
- `video/render/`: editable development sources for the earlier 3D animation. Three.js and the rendering tools are only needed when regenerating the MP4, never by site visitors.
- `dist/assets/*-tea.jpg`: the four user-supplied tea photographs, edited with AI-assisted square reframing, exposure/white-balance adjustment and gentle retouching. Natural backgrounds are retained. Butterfly-pea, cinnamon/apple, citrus and rose photographs are assigned to Botanical Blue, Spice Road, Monsoon Mint and Ruby Flora respectively.
- `dist/assets/`: local brand visuals and product photographs, compressed as JPEGs, plus a hand-written SVG favicon. Earlier jewel renders are retained as unused originals. No screenshot region was extracted, traced or reused. Fonts use local system serif and sans-serif stacks, so no third-party requests are required. Exact fonts vary by operating system.
- `qa/`: browser check script, report and screenshots. These are development artifacts and do not need to be hosted.

## Demonstration behavior

Navigation scrolls to each section. Select either pack option on any product, then choose “Inquire for this blend” to prefill the inquiry. Starter-kit and discovery-set buttons open `payment.html`. Wholesale buttons prefill an appropriate inquiry message. The payment page links back to `index.html` and its sections. FAQs use accessible native details/summary controls.

Both forms validate required fields and email formats, then explicitly state that no inquiry or subscription was sent. They do not send requests or store personal data. There is no payment processing or backend. The products and product claims are an academic concept, not verified commercial specifications.

## GitHub Pages hosting

1. Create a GitHub repository and upload **the contents of `dist`** (`index.html`, `styles.css`, `app.js`, and `assets/`) to its root. You can do this with GitHub’s “Add file → Upload files”.
2. Open Settings → Pages, choose “Deploy from a branch”, and select `main` and `/ (root)`.
3. Save and wait for GitHub to provide the published address. Relative asset paths support repository subpaths.
4. Open that URL on your presentation device before the demonstration. Disable Pages afterwards if temporary hosting is desired.

## Vercel hosting

1. Push this project to a GitHub repository and import it into Vercel.
2. Choose the “Other” framework preset. Set the root directory to this `ceylux-site` folder if it is inside a larger repository.
3. Leave the build command empty and set the output directory to `dist`.
4. Deploy and use the generated URL. Delete the deployment/project after the demonstration if desired.

Only `dist` needs to be published. This export excludes the original hosting service configuration and Git history. The full project can be stored in GitHub and imported into Vercel with `dist` as the output directory. For branch-based GitHub Pages hosting, publish the contents of `dist` at the root of the selected publishing branch as described above.

## Verification

The optional `qa/check.cjs` uses `playwright-core` and an installed Chrome browser. It checks 1440px, 820px, 390px and 320px widths, product column counts, horizontal overflow, images, navigation, all product/pack inquiry combinations, starter and wholesale prefills, FAQ keyboard controls, required/email/whitespace validation, truthful demo notices, browser errors and unexpected network requests. Screenshot artifacts are saved in `qa/`.

To rerun, install `playwright-core` outside the site, start the local server, update Chrome’s executable path in `qa/check.cjs` if needed, and run:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright-core node qa/check.cjs
```

The packaging section and payment summary use `dist/assets/ceyluxe-discovery-box.jpg`, an AI-generated four-ball white-tray packaging concept based on the supplied video. Full-resolution concepts and their prompts are in `design/`.

## Photography and homepage art direction

`dist/editorial.css` contains the homepage's layered photography, soft image masks, card hover details, illustrated ritual, discovery-box frame and responsive inquiry layout. It uses the shared colour tokens and supports both themes and reduced motion. The stylesheet is loaded only by `index.html`.

`dist/assets/botanical-jewel-blue.jpg`, `botanical-jewel-rose.jpg` and `botanical-infusion.jpg` are lightly adjusted still frames from the user's supplied videos. Existing tea photographs are reused throughout the editorial layouts. The separately attached original amber-ball photographs were not available as local files at the time of this update; these video stills can be replaced with higher-resolution originals using the same filenames. All site assets are local.

The homepage form and discovery-set inquiry buttons remain local demonstrations. No requests, subscriptions, or payments are sent.
