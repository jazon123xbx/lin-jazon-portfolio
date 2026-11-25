# LIN.OS Native Display — QA evidence

This file records reproducible checks for the completed Native Display. It does
not claim Safari, Firefox, real-device, screen-reader, touch, GPU, or deploy
readiness. See `TEACHER_EXPLANATION.md` for the design explanation.

## Environment and commands

- Repository: `lin-jazon-portfolio-activity2`, Node v24.14.1, npm 11.12.1.
- Static checks from the repository root:
  - `npm run lint`
  - `npx tsc --noEmit --incremental false`
  - `node --test tests/display-projection.test.ts`
  - `npm run build`
  - `git diff --check`
- Browser: Chromium `156.0.8078.4`, executable
  `C:\Users\linzy\AppData\Local\ms-playwright\chromium-1248\chrome-win64\chrome.exe`,
  launched through the already installed global `@playwright/cli`
  `playwright-core` (`C:\Users\linzy\AppData\Roaming\npm\node_modules\@playwright\cli\node_modules`).
  No browser or package install was performed. A pre-existing Next dev server
  on `http://localhost:3000` was used read-only.
- Temporary browser-only measurement hooks were enabled with `?cp6Measure=1`
  and removed before the final source checks. They exposed the latest quad,
  phase, mode, source size, surface element, and write/flip counters only.
- Screenshots were written outside the repo to
  `C:\Users\linzy\AppData\Local\Temp\opencode\cp6-shots\`.

## Projection test results

- `npx tsc --noEmit --incremental false` — exit 0.
- `npm run lint` — exit 0, 0 errors, 5 pre-existing `<img>` warnings in
  protected `ProfilePortrait` / `ProjectMediaGallery`.
- `node --test tests/display-projection.test.ts` — 9 tests, 9 pass, 0 fail.
  Coverage: identity, trapezoid, offset, all four corners, reversed winding,
  crossed quad, degenerate/near-invalid quads, singular correspondences, and
  geometric fit rejection for off-canvas corners or shrunken targets.
  `display-projection/evaluateProjection` owns geometric validity, corner
  accuracy, scale and target fit; `useDisplayRegistration` separately owns
  visible-text readability, phase-aware policy, source coherence and focus
  checks against real rendered layout.
- `npm run build` — exit 0; static routes `/`, `/_not-found`, `/about`,
  `/contact`, `/projects`, `/skills`.
- `git diff --check` — exit 0 (only pre-existing LF→CRLF working-copy warnings).

## 1440×900 native sequence

Measured mode, physical glass edges, source, corner error, rows, targets, focus
and overflow with the temporary browser hooks:

| Moment | Mode | Glass top / bottom / height (px) | Source / DOM (px) | Max corner error | Notes |
|---|---|---|---|---|---|
| Before Explore | flat | — | 527.266×248 | n/a | sections/nav hidden, CTA present |
| Boot row 7 | projected | 513.7 / 612.7 / 268.5 | 448×269 / 448×269 | 0.00637 px | 7 rows visible |
| Check row 5 | projected | 513.7 / 612.7 / 268.5 | 448×269 / 448×269 | 0.00637 px | 5 rows visible |
| Welcome | projected | 513.7 / 612.7 / 268.5 | 448×269 / 448×269 | 0.00637 px | wording unchanged |
| Mid camera-push | projected | intermediate | 448×269 / 448×269 | 0.00231 px | no jump |
| Interactive | projected | 578.3 / 705.1 / 307.4 | 448×269 / 448×269 | 0.00179 px | 4 links, focus `hub-welcome` |

- All projected samples were ≤2 px four-corner error.
- Effective diagnostic text was about 14.43 px in boot/check/welcome and
  about 14.88 px in the final dashboard (measured from the projected transform).
- Final dashboard links were about 304–317 × 51–55 px; all four were visible.
- No detached border, ring, drop shadow, clipping, bezel overlap, or jump was
  observed in the screenshots: `01-gate.png`, `02-boot-7.png`,
  `03-check-5.png`, `04-welcome.png`, `06-interactive.png`,
  `07-final-settled.png`.

## Viewport and reflow matrix

After entry, the same display stayed mounted; mode and document overflow were
measured:

| Viewport | Mode | Min link size (px) | overflow-x |
|---|---|---:|---:|
| 1440×900 | projected | 304×51 | 0 |
| 1366×768 | flat | 194×44 | 0 |
| 1024×768 | flat | 194×44 | 0 |
| 768×1024 | flat | 212×44 | 0 |
| 844×390 | flat | 69×44 | 0 |
| 667×375 | flat | 61×44 | 0 |
| 390×844 | flat | 138×44 | 0 |
| 320×568 | flat | 106×44 | 0 |

Simulated CSS `zoom: 2` at 1440×900 remained flat/reflowable with overflow-x 0
and larger targets (313×88). Simulated `zoom: 4` still showed four links and
flat mode but produced `overflow-x = 634 px`; this is a Chromium CSS-zoom
simulation, not native browser zoom, and is recorded as a limitation rather
than a pass.

## Accessibility, fallback and interaction evidence

- Explore gate: before entry, `#home-sections` and `.entry-chrome` were hidden,
  the CTA was present, and Space on the focused CTA changed the status to
  "Opening portfolio. Please wait.".
- Keyboard/focus: Tab reached the four dashboard links in order while
  projected; all were inside the same display surface. Source inspection
  confirms a `focusin` inside the display records the focused element and
  blocks flat→projected promotion, while `focusout` clears the record and
  re-evaluates the cached quad.
- Hash: loading `/?cp6Measure=1#projects`, completing entry, left the hash at
  `#projects` and moved focus to `projects`.
- Dropdowns after unlock: a focused verification run showed
  `#dropdownBtn` `aria-expanded=true`, `#dropdownMenu` display `block` with 3
  links; `#capabilitiesDropdownBtn` `aria-expanded=true`, its menu display
  `block` with 3 links and 9 `[data-spotlight-mod]` cards. The dashboard
  script loaded after unlock.
- Spotlight: `#spotlightOverlay` was present and computed `display:flex` after
  a spotlight card was activated.
- Mobile navigation: an independent Chromium test at 390×844 clicked the
  mobile-navigation button and confirmed `aria-expanded=true`, menu
  `display:flex`, height 193 px, and 9 links. The earlier immediate read in
  the main script was stale (it still reported `display:none`); this focused
  test is the browser evidence.
- Reduced motion: the validation run ended flat after Explore with the same
  display and links present. The hook does not hard-code reduced motion to
  flat; reduced motion follows the same focus/fit policy and projection is
  safe/static if it qualifies.
- WebGL disabled: flat, four links present, no page errors.
- Simulated `webglcontextlost` during boot and after interactive focus: mode
  became flat and the same four links remained available.
- Static routes were fetched from the page and returned 200 for `/`, `/about/`,
  `/contact/`, `/projects/`, `/skills/`.
- No page errors and no console errors were captured in the main browser run.

## Performance evidence

- The registration callback is imperative and writes only a cached matrix to
  one DOM style; layout is read only on ResizeObserver/font/layout events.
- Source inspection confirms no permanent RAF and no per-frame React setter in
  the registration path; mode state changes only on transitions.
- Browser counters after settle: 69 registration writes total, 1 mode flip,
  and 0 additional writes over a 900 ms idle wait — no continuous writes.

## Protected scope and backup

- Checkpoint 4 snapshot:
  `C:\Users\linzy\Documents\LIN.OS Backups\checkpoint4-native-display-20261121-130958.zip`
  SHA256 `459eb8b76c28fb60f65365ad8c12e46bb2755d3ae5c52e7774c9bc9d454f9b38`.
- Original safety baseline:
  `C:\Users\linzy\AppData\Local\Temp\opencode\lin-os-native-display-baseline-20261121-120958.zip`
  SHA256 `29faa0bb4a3ae69e2275d19ee137e8dac31546b9dc6c12239d1533b636439041`.
- HomeEntryShell, Navigation, `public/dropdown.js`, routes, extracted sections,
  data/domain, package/lockfiles, and deployment config were not changed by
  this architecture. No commit, push, deploy, dependency install, or browser
  install was performed. Pre-existing processes were left untouched; only
  browsers started by the validation scripts were closed by those scripts.

## Limitations

- Browser testing was Chromium-only, headless, with software WebGL.
- Real device GPU, Safari, Firefox, screen readers, touch gestures, and native
  browser zoom are unverified.
- The simulated 400% CSS zoom produced `overflow-x = 634 px`; this unresolved
  limitation is not a native 400% zoom pass.
- Static routes and base-path-sensitive code were source-inspected; an optional
  prefixed rebuild was not performed.
