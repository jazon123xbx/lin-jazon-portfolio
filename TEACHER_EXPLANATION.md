# Phase 2A — Teacher Explanation

This file explains the Phase 2A change in simple English. It is written so a
third-year BSCS student can read the code and explain it honestly.

---

## 1. What existed before Phase 2A

Before this phase, the portfolio stored its content as plain JavaScript/TypeScript
objects and arrays:

- `src/data/portfolio.ts` exported a `projects` array of plain objects and a
  `featuredProjects` array made by filtering that array.
- The same file exported `skillGroups`, a plain array of objects with
  `category`, `moduleIndex`, and `skills`.
- `src/app/page.tsx` mapped over those arrays and rendered `ProjectCard` and the
  capability cards.
- Capability anchor ids were chosen inside `page.tsx` with nested ternaries.
  Only three of the six modules had an id: `frontend-development`,
  `mobile-development`, and `game-development`.
- `src/components/Navigation.tsx` hard-coded the three capability dropdown links.

The site worked, but the data had no behaviour and no single place enforcing its
own rules. For example, nothing stopped a duplicate project id, an empty title,
or a capability module with no anchor.

---

## 2. What changed

New domain folder:

| File | Purpose |
| --- | --- |
| `src/domain/validation.ts` | Small shared checks for text and URL-safe slugs. |
| `src/domain/project.ts` | `Project` class and its related types. |
| `src/domain/project-repository.ts` | `ProjectRepository` class. |
| `src/domain/capability-module.ts` | `CapabilityModule` class and skill types. |
| `src/domain/capability-registry.ts` | `CapabilityRegistry` class. |

Updated files:

- `src/data/portfolio.ts` now creates `Project` and `CapabilityModule` objects
  and puts them inside the two collection classes. It still exports
  `projects`, `featuredProjects`, and `skillGroups`, so existing imports keep
  working.
- `src/app/page.tsx` now uses `group.id` for every capability card instead of
  guessing the anchor with ternaries.
- `src/components/Navigation.tsx` now builds its three capability dropdown links
  from the same registry the page uses.

Protected files such as the laptop animation, boot sequence, `public/dropdown.js`,
CSS, layout script loading, and assets were not changed.

---

## 3. Why classes were added

A class is useful when data and rules belong together. These classes are small on
purpose:

- A `Project` knows what makes a valid project.
- A `ProjectRepository` knows how to store and find projects.
- A `CapabilityModule` knows its stable anchor id and its skills.
- A `CapabilityRegistry` knows how to find modules by id or module index.

This is not a large framework. It is a thin domain layer that gives the content
one clear owner.

---

## 4. The four main classes

### `Project`

`Project` represents one portfolio project.

```ts
const project = new Project({
  id: "blazingheart",
  title: "BlazingHeart",
  description: "A 2D platformer game built with Unity and C#.",
  category: "Game Development",
  tags: ["Unity", "C#"],
  status: "In Development",
  media: [],
});
```

**Constructor.** The constructor runs when `new Project(...)` is called. It
checks that the id is a lowercase slug, that required text is not empty, that the
status is one of the allowed values, and that tags and media entries are valid.
It also copies the tag and media arrays and freezes them, so code outside the
class cannot change a project after it is created.

**Object.** The value returned by `new Project(...)` is an object with read-only
properties (`id`, `title`, `description`, `category`, `tags`, `status`, `media`,
and optional links) plus methods.

**Methods.**

- `hasMedia` and `hasLinks` are getters that answer simple questions about the
  project.
- `matches(query)` decides whether a project matches a search word. The
  repository uses it so search rules live with the project itself.
- `toSnapshot()` returns a plain-object copy. This exists because React Server
  Components cannot pass class instances across a server/client boundary; a plain
  snapshot is safe to send if that is ever needed. The current UI does not need
  it yet.

### `ProjectRepository`

`ProjectRepository` is the collection of all projects.

**Constructor.** It receives an array of `Project` objects and an optional list of
featured ids. It rejects duplicate project ids and rejects a featured id that does
not exist.

**Encapsulation.** The internal array is stored in a private field (`#projects`).
Outside code cannot replace it. `all()` and `featured()` return the frozen array,
so callers cannot push or remove items.

**Methods.**

- `all()` returns every project.
- `featured()` returns only the projects listed in `featuredIds`, in the original
  authored order.
- `findById(id)` returns one project or `undefined`.
- `search(query)` returns projects that match the query.
- `size` is a getter for the number of projects.

### `CapabilityModule`

`CapabilityModule` represents one LIN.OS capability card.

**Constructor.** It requires a stable slug id, a module index such as `MOD-01`, a
non-empty category, and at least one skill. It rejects duplicate skill names
inside the same module and rejects unknown skill levels.

**Stable ids.** The id is the HTML anchor. This is why all six modules now have
one:

| Module index | Stable id | Category |
| --- | --- | --- |
| `MOD-01` | `frontend-development` | Frontend Development |
| `MOD-02` | `programming-languages` | Programming Languages |
| `MOD-03` | `backend-database-tools` | Backend & Database Tools |
| `MOD-04` | `mobile-development` | Mobile Development |
| `MOD-05` | `game-development` | Game Development |
| `MOD-06` | `creative-development-tools` | Creative & Development Tools |

The first, fourth, and fifth ids are exactly the three anchors that
`public/dropdown.js` and `Navigation` already expected, so existing links keep
working. The other three modules now have working anchors too.

**Methods.**

- `skillNames` returns only the names.
- `hasSkill(name)` checks whether the module lists a skill.

### `CapabilityRegistry`

`CapabilityRegistry` is the collection of capability modules.

**Constructor.** It builds lookup maps by id and by module index. It rejects
duplicate ids and duplicate module indexes, because duplicates would make an
anchor or a spotlight lookup ambiguous.

**Methods.**

- `all()` returns every module in display order.
- `findById(id)` and `findByModuleIndex(index)` return one module or `undefined`.
- `select(indexes)` returns modules in a requested order and fails loudly if an
  index is wrong. `Navigation` uses it to pick `MOD-01`, `MOD-04`, and `MOD-05`
  for the dropdown.
- `size` is a getter for the number of modules.

---

## 5. Constructors, methods, and objects in one sentence each

- **Constructor:** the special method that runs once when an object is created
  and puts the object into a valid state.
- **Method:** a function that belongs to an object and works with that object's
  data.
- **Object:** a value created from a class; it has its own data and can use the
  class's methods.

In this phase, objects are created in `src/data/portfolio.ts` at module load, for
example `new Project({...})` and `new CapabilityModule({...})`.

---

## 6. Encapsulation and abstraction in this phase

### Encapsulation

Encapsulation means keeping data and the rules for that data together, and not
letting outside code break the rules.

What this phase actually does:

- Constructors validate their input.
- `Project` exposes read-only properties and freezes its arrays.
- `ProjectRepository` and `CapabilityRegistry` keep their internal collections
  in private fields.
- Duplicate ids and indexes are rejected at construction time.

What this phase does **not** claim:

- It does not hide every field behind private fields and getters. `Project` and
  `CapabilityModule` use public `readonly` properties for a simple, stable data
  contract with the UI.
- It is not a full layered architecture with services, database access, or
  dependency injection.

### Abstraction

Abstraction means the UI asks for what it needs without knowing every detail.

What this phase actually does:

- The page asks for `featuredProjects` instead of repeating the featured-id
  filter.
- The page reads `group.id` instead of deciding anchors with ternaries.
- `Navigation` asks the registry for three modules instead of hard-coding labels
  and hrefs.

What this phase does **not** claim:

- There is no repository interface with multiple implementations.
- There is no database or network repository. The data is still local and
  static.

---

## 7. Data-to-UI flow

1. `src/data/portfolio.ts` creates `Project` objects and puts them into a
   `ProjectRepository`.
2. It creates `CapabilityModule` objects and puts them into a
   `CapabilityRegistry`.
3. The same file exports plain accessors: `featuredProjects`, `projects`,
   `skillGroups`, `projectRepository`, and `capabilityRegistry`.
4. `src/app/page.tsx` is a React Server Component. It maps over
   `featuredProjects` and `skillGroups` and renders JSX.
5. Each project object is passed to `ProjectCard` as a prop. `ProjectCard` reads
   `project.category`, `project.status`, `project.title`,
   `project.description`, `project.tags`, `project.detailsUrl`, and
   `project.sourceUrl`. It does not create or change projects.
6. Each capability object supplies `group.id` for the HTML `id`,
   `group.moduleIndex` for `data-spotlight-mod`, and `group.skills` for the skill
   names.
7. The server sends the finished HTML to the browser. `public/dropdown.js` then
   reads the existing DOM ids (`#dropdownBtn`, `#capabilitiesDropdownMenu`,
   `.skill-module[data-spotlight-mod]`, and so on) for the dropdowns and
   spotlight.

So the class layer feeds the UI, but the UI still renders exactly the same
content as before.

---

## 8. React components, props, state, and events

These are React ideas, not class ideas. They work together with the domain
classes, but they are separate.

- **Component:** a function that returns JSX. `Home`, `ProjectCard`,
  `Navigation`, and `ProjectArtwork` are components.
- **Props:** data passed into a component. `ProjectCard` receives
  `project` as a prop. `ProjectArtwork` receives `projectId` and `className`.
  `Reveal` receives `children`, `variant`, and `delay`.
- **State:** data a component remembers and can change. `Navigation` uses
  `useState` for `mobileOpen` and `activeSection`. `ProjectMediaGallery` uses
  `useState` for the active media index.
- **Event handling:** functions that respond to user actions. `Navigation` has
  `onClick` handlers for navigation and the mobile menu. `ProjectMediaGallery`
  has `onClick` handlers for previous/next media. `public/dropdown.js` handles
  dropdown clicks and the spotlight outside React, exactly as before.

Important boundary: `src/app/page.tsx` and `ProjectCard` are Server Components,
so class instances can be used while rendering on the server. `Navigation` is a
Client Component, but it only reads plain values (labels, hrefs, indexes) from
the registry. No class instance is passed as a prop to a Client Component. If
that were ever needed, `Project.toSnapshot()` provides a plain object.

Phase 2A does not move React state into the domain classes, and it does not make
the domain classes into React components.

---

## 9. Why inheritance and polymorphism are intentionally deferred

Inheritance and polymorphism are real OOP ideas, but they are **not** used in
Phase 2A.

- There is no base class and no subclass.
- There is no abstract class or interface with several interchangeable
  implementations.
- There is no method overriding or runtime dispatch between different project or
  module types.

Why not:

- All projects currently have the same shape and are rendered by the same
  `ProjectCard`. Creating `WebProject`, `GameProject`, and `MobileProject`
  subclasses would add classes without adding different behaviour.
- All capability modules currently behave the same way: they show a category,
  a module index, and skill names. A subclass per module would be indirection
  with no benefit.

A better time to introduce polymorphism would be when different kinds of
projects genuinely need different data or different rendering behaviour. That is
not this slice. Saying otherwise would overstate what Phase 2A demonstrates.

---

## 10. How a third-year BSCS student can explain this

A short, honest explanation:

> Before Phase 2A, the portfolio data was plain objects and arrays. There was no
> single place enforcing valid ids or preventing duplicates. I added small domain
> classes: `Project` and `CapabilityModule` represent one item and validate
> themselves in their constructors. `ProjectRepository` and `CapabilityRegistry`
> are collection classes that store those objects, reject duplicates, and provide
> lookup methods such as `featured()` and `select()`. The React page still renders
> the same content; it now gets featured projects from the repository and stable
> anchor ids from the capability modules. The three old dropdown anchors are
> unchanged, and the other three modules now have anchors too. I did not use
> inheritance or polymorphism because every project and every module currently
> has the same shape and behaviour, so subclasses would be unnecessary
> complexity.

That explanation matches the code and does not claim more than the phase does.

---

# Phase 2B — Teacher Explanation

Phase 2A above is unchanged. This section explains only the Phase 2B UI refactor.

## 1. Before and after files

**Before:** `src/app/page.tsx` was one 343-line file. It held the
`PortfolioHub` call, all four section trees (About, Projects, Capabilities,
Contact), the capability spotlight overlay, and three `SystemThread`
separators.

**After:**

| File | Status | Responsibility |
| --- | --- | --- |
| `src/app/page.tsx` | updated, 343 → 44 lines | imports data once, composes the sections, keeps `SystemThread` order |
| `src/components/sections/AboutSection.tsx` | added, 172 lines | portrait, identity record, narrative, journey, interests, values, career direction |
| `src/components/sections/ProjectsSection.tsx` | added, 56 lines | project rows, alternating artwork side, per-row reveal delay |
| `src/components/sections/CapabilitiesSection.tsx` | added, 97 lines | six LIN.OS module cards and the single spotlight overlay |
| `src/components/sections/ContactSection.tsx` | added, 37 lines | contact heading and contact method cards |
| `TEACHER_EXPLANATION.md` | updated | this explanation |

No laptop/Three.js file, boot sequence, `public/dropdown.js`, CSS, overlay
behavior, deployment/config file, or asset was edited in Phase 2B. The data and
domain files (`src/data/portfolio.ts`, `src/domain/*`) also were not edited in
Phase 2B; they still carry their uncommitted Phase 2A changes, which this
refactor preserved as-is.

## 2. Component responsibilities and props

| Component | Props | Why the prop exists |
| --- | --- | --- |
| `AboutSection` | `about`, `identity`, `author` | The section only renders the copy it needs: journey, interests, values, career goals, identity fields, and the author name in the heading. |
| `ProjectsSection` | `projects` | The page decides which projects to show. The section owns layout and reveal timing, not the project list. |
| `CapabilitiesSection` | `modules` | Each module object supplies its anchor `id`, `moduleIndex`, category, and skills. The section does not hard-code the six modules. |
| `ContactSection` | `methods` | The contact cards are data. The prop type is taken from `ContactIcons` so the shape is defined in one place. |

The section components do not fetch or create data. They receive it and render
it. That is what makes them reusable.

## 3. Data flow

1. `src/data/portfolio.ts` creates the domain objects and exports
   `about`, `aboutIdentity`, `featuredProjects`, `skillGroups`,
   `contactMethods`, and `siteConfig`.
2. `src/app/page.tsx` imports those values once. It is still a React Server
   Component, so this work happens during the static build.
3. The page passes the values down as props:
   `AboutSection`, `ProjectsSection`, `CapabilitiesSection`, and
   `ContactSection`.
4. Each section passes smaller values to existing leaf components.
   For example, `ProjectsSection` gives one `project` to `ProjectCard`, and
   `ContactSection` gives the whole `methods` array to `ContactIcons`.
5. The server renders the finished HTML. `public/dropdown.js` then reads the
   same DOM ids and `data-spotlight-mod` attributes it read before.

Data moves in one direction: data module → page → section → leaf component.
No child component changes the data it receives.

## 4. Composition and reusable UI

Composition means building a page from smaller components instead of writing
one large file. `src/app/page.tsx` is now the composition root: it only chooses
the order of `PortfolioHub`, the four sections, and the three `SystemThread`
connectors.

The sections are reusable because their content is a prop. `ProjectsSection`
cleanly receives the three featured `Project` objects from the page and does
not need to know where they came from. It cannot render the other two projects
yet: `ProjectArtwork` only has image entries for the three featured ids, so
additional projects would first need artwork and layout support.

There is no barrel file (`index.ts`) for `src/components/sections`. With only
four files, direct imports are clearer and avoid one more layer of indirection.

`CapabilitiesSection` also renders the single spotlight overlay. That overlay
belongs to the capability feature, and its ids must sit next to the module
cards that `public/dropdown.js` clones. Keeping it in that component preserves
the original DOM order: section, overlay, then the `SystemThread` rendered by
the page.

## 5. Why React components are still functions

A React component is a function that returns JSX. These section components
have no state, no effects, no refs, and no event handlers, so a plain function
is the correct tool. There is no reason to introduce a class.

- React Server Components are functions by design. Class components are legacy
  and cannot be Server Components.
- Interactive behavior still lives in the existing client components:
  `Reveal` handles reveal timing, `ProfilePortrait` handles the lightbox, and
  `ContactIcons` handles copy buttons.
- `public/dropdown.js` still handles the dropdowns and the capability
  spotlight outside React.
- No artificial OOP was added. The domain classes from Phase 2A still own data
  rules; the UI remains functional components.

## 6. What stayed exactly the same

- Section anchors: `about`, `projects`, `capabilities`, `contact`.
- All six capability anchors: `frontend-development`, `programming-languages`,
  `backend-database-tools`, `mobile-development`, `game-development`,
  `creative-development-tools`.
- The three dropdown-linked capability anchors and the three project anchors
  used by `Navigation` and `public/dropdown.js`.
- Spotlight ids: `spotlightOverlay`, `spotlightPanel`, `spotlightClose`,
  `spotlightContent`.
- Every CSS class, `aria-*` attribute, `data-spotlight-mod`, and project id.
- `Reveal` wrappers, variants, delays, and row order.
- Three `SystemThread` separators in the same positions.
- The same featured project rows and the same six capability modules. The data
  module still defines all five projects; the home page still shows the same
  three featured rows as before, because that was the existing behavior.

## 7. Checks run

- `npm run lint` — 0 errors, 5 pre-existing `<img>` warnings in protected
  components (`ProfilePortrait`, `ProjectMediaGallery`).
- `npx tsc --noEmit` — passed with no output.
- `npm run build` — passed; exported static routes `/`, `/about`, `/contact`,
  `/projects`, and `/skills`.
- `git diff --check` — clean.
- Built `out/index.html` — each section and module anchor appears once; the
  six `data-spotlight-mod` cards are present; three `system-thread-wrap`
  elements are present; the three project reveal delays are `0`, `100ms`, and
  `200ms`.
- A normalized text comparison of each extracted block against the
  pre-refactor `page.tsx` showed matching markup, classes, and attributes.

## 8. Short teacher-defense answer

> Before Phase 2B, `page.tsx` was one large file that rendered every section.
> I moved each section into its own function component under
> `src/components/sections`. The page now imports the data once and passes it
> down as props, so each section only renders what it receives. The data flow is
> one-way: data module → page → section → leaf component. Composition keeps the
> page short, and props make the sections reusable. I kept them as functions
> because they have no state or lifecycle, and because Next.js Server
> Components are functions. The ids, classes, reveal animations, spotlight
> overlay, and `SystemThread` placement are unchanged, so the visual and
> dropdown behavior stays the same.

---

# Phase 2C — One explicit entrance

The Phase 2A and 2B records above describe those earlier phases. Phase 2C changes
the entrance, not the domain classes, project content, or deployment settings.

## React and Next.js in this phase

React builds the UI from function components. Props carry values down; state
remembers the current entrance step; events request changes. A reducer is a
function that returns the next state from the previous state and an event.
Effects start timers or hand focus to the browser, and return cleanup functions.

Next.js renders the page and sections on the server during the static build.
`HomeEntryShell` is a Client Component: React hydrates its server-rendered HTML
to attach Explore and run effects. The sections are passed through its `children`
slot, so they remain server-rendered rather than moving their data into the client.
Hidden content is still mounted and has its original ids, but `hidden` plus
`inert` prevents interaction until entry completes. This is an entrance, not an
authentication or security boundary.

## Component flow and exact changed files

1. `src/app/layout.tsx` supplies the document and fonts, not global navigation
   or a global dropdown script.
2. `src/app/page.tsx` passes the same section composition to the new
   `src/components/HomeEntryShell.tsx`.
3. The shell composes Navigation, one main with PortfolioHub and the section
   slot, and Footer. It alone owns phase, counters, renderer state, deadlines,
   opening request, cleanup, unlock, and focus/hash handoff.
4. `src/components/PortfolioHub.tsx` passes presentation props to
   `src/components/HubExperience.tsx`. HubExperience displays the original
   boot text and navigation, probes WebGL, and reports renderer events; it
   no longer owns another boot sequence.
5. `src/components/LaptopCanvas.tsx` keeps demand rendering, the DPR cap, and
   context-loss reporting. `src/components/LaptopScene.tsx` supplies neutral
   highlights and a blue rim. `src/components/LaptopPrototype.tsx` keeps the
   original geometry and lid timings, improves the graphite exterior, raises
   the initial camera modestly, and safely settles reduced motion.
6. `src/components/StaticLaptopFallback.tsx` shows a closed exterior without
   exposed keys until Explore requests opening.
7. `src/components/Navigation.tsx` stops clearing hashes on mount and uses
   native section/project links. Capability shortcuts retain the existing
   spotlight handler contract with unchanged `public/dropdown.js`.
8. `src/components/HashRedirect.tsx` preserves the requested fragment across
   a full home load; that fragment does not skip entry.
9. `src/app/globals.css` scopes the SSR scroll lock to the locked shell, not
   `body.style.overflow`. `src/components/sections/CapabilitiesSection.tsx`
   clips only the decorative MODULES layer to fix its horizontal overflow.
10. `TEACHER_EXPLANATION.md` adds this Phase 2C explanation.

## State, Explore, boot, and Three.js

Only the native Explore button is a portfolio action before entry. Activation
moves focus to a persistent, concise polite status. Decorative boot lines are
not live announcements. No section/header/footer is reachable while locked.
No fragment automatically enters. JavaScript-disabled visitors get an
explanation, not a hidden-content bypass.

The normal sequence remains:
`idle → activation → booting → system-check → access-granted → welcome-hold → camera-push → ui-reveal → interactive`.
The lid uses 200/1500/1800ms milestones. Seven lines appear every 180ms,
followed by 200ms; five checks appear every 140ms. After the checks, the final
steps start at offsets 200/900/1800/2500/2900ms. Unlock happens only at
`interactive`, not when the welcome first becomes visible.

Renderer state is separate: pending, ready, or fallback. Readiness has a 5000ms
deadline. Opening has a 4000ms watchdog; fallback advances after 1800ms.
Fallback is terminal for that page mount, so late readiness cannot replace it.
Explore is available even while the renderer is pending. Reduced motion still
requires Explore, then settles directly without the long visual sequence.
Reloading creates fresh state, so the entrance replays.

Three.js draws the laptop meshes, materials, lights, and camera. React Three
Fiber (R3F) connects those Three.js objects to React. `useFrame` updates the
lid/camera while moving; `invalidate()` requests another frame only when needed.
No new model, HDRI, asset, dependency, or continuous render loop was added.

## Actual code examples

These snippets are **actual code** from `HomeEntryShell.tsx`:

```tsx
const unlocked = state.phase === "interactive";
```

```tsx
<div id="home-sections" hidden={!unlocked} inert={!unlocked}>{children}</div>
```

```tsx
case "ready": return state.renderer === "pending" ? { ...state, renderer: "ready" } : state;
```

The last example ignores late readiness after fallback. Phase/count guards
similarly ignore repeated or stale events. Every timeout effect clears its
timer on dependency change or unmount.

**Simplified explanation, not copied implementation:**

```text
Explore → request opening → lid completes → boot text → checks → welcome
        → camera push → reveal → unlock → focus requested destination
```

After unlock, the shell reads the current fragment once. A valid section,
project, or module receives focus and immediate alignment. Otherwise the stable
hub welcome receives focus. It does not rewrite the URL. The home-only,
basePath-aware Next.js Script component loads dropdown.js after unlock; there
is no second manual binding or script in the root layout.

## Live defense steps (manual checks to perform)

1. Reload home: show the title, closed laptop, and Explore. Try Tab, wheel,
   touch scrolling, and a section fragment before Explore; no content bypass.
2. Activate Explore with Enter. Explain status focus, lid opening, boot lines,
   checks, welcome, camera, and the final unlock.
3. Open `/#projects` (or a project/module hash) and reload. The entrance still
   plays; after Explore, focus and alignment go to that destination.
4. Try an unknown/malformed hash. After entry, welcome receives focus and the
   URL is preserved. Change the hash during boot and check the latest value.
5. Test reduced motion and disabled WebGL separately: both require Explore and
   finish. Delay the canvas import and simulate context loss to check fallback.
6. Disable JavaScript and reload: read the explanation; sections stay locked.
7. After entry, test desktop/mobile dropdowns, capability spotlight, portrait
   open/close, native anchor history, and narrow/landscape layouts. Confirm no
   horizontal overflow and no scroll-lock conflict with either overlay.

These defense steps are a manual checklist, not a claim of browser execution.

## Phase 2C validation evidence

- `npm run lint`: exit 0; zero errors, the same five pre-existing image warnings
  in ProfilePortrait and ProjectMediaGallery.
- `npx tsc --noEmit --incremental false`: exit 0, no diagnostics.
- `npm run build`: exit 0 with Next.js 16.3.0; static `/`, `/_not-found`,
  `/about`, `/contact`, `/projects`, and `/skills` routes generated.
- `git diff --check`: exit 0.
- An in-memory test of the actual reducer passed explicit Explore, phase order,
  seven/five counters, repeated/stale events, terminal fallback, and reduced
  motion cases. This does not test React timer execution in a browser.
- A standard-library HTML parser checked `out/index.html`: one main, locked SSR
  marker, hidden/inert sections, 21 required unique anchors, six module cards,
  resolving local fragment links, the noscript explanation, and no initial
  dropdown script. The four redirect exports exist without that script.
- Browser animation, visual lighting, keyboard/focus, touch/scroll, context loss,
  delayed imports, overlay interactions, and responsive behavior were not
   exercised. Modern `inert`, `:has()`, and small-viewport CSS support is assumed.

---

# Phase 2D — Cinematic framing and one screen panel

This phase changes presentation only. The Phase 2A/2B/2C records above describe
their own earlier work; they are not claims that the laptop is still unchanged.

## Actual component and data flow

`page.tsx` still passes the server-rendered portfolio sections through
`HomeEntryShell`. That shell still owns the reducer, phase timers, seven boot
and five check counters, renderer selection, Explore gate, reduced-motion
decision, and focus/hash handoff. It was **not edited** in Phase 2D.

`PortfolioHub` passes the same `entry` presentation prop to `HubExperience`.
The latter reads phase and counters to render the shared panel; it does not
start timers or own a second sequence. The boot/check arrays are unchanged.
All rows now occupy fixed grid slots, with unreached rows made invisible, so
the label/status columns and body baseline do not jump as lines appear.
Boot rows remain `aria-hidden`; the shell's existing short polite status is
still the announcement, rather than a stream of decorative diagnostics.

`HubExperience` still dynamically loads `LaptopCanvas` on the client.
`LaptopCanvas` still supplies `frameloop="demand"`, DPR `[1, 1.5]`, a 32-degree
FOV, readiness reporting and context-loss reporting, without changes.
`LaptopScene` supplies lights, and `LaptopPrototype` supplies the same meshes,
lid animation and camera updates through R3F. React Three Fiber connects the
JSX scene to Three.js; `useFrame` changes the camera/lid directly and
`invalidate()` schedules only the frames needed during motion. There is no
per-frame React state or new dependency.

## Camera, materials and light

- The establishing camera remains `[0, 1.15, 7.2]`. During milliseconds
  1100–1800 of the existing opening, a clamped quadratic ease moves it to
  `[0, 1.15, 5.8]` and turns its aim toward the transformed screen glass.
  The aim sits 0.5 world units below the glass center to leave reading headroom.
- Glass-center coordinates account for the lid's final angle, hinge offset,
  whole-model tilt, responsive scale and model translation. The reading pose
  is held through boot, check, access and welcome, rather than aiming at the
  model origin.
- The final dolly travels 12% of the remaining vector from reading position
  toward glass center. It eases over 600ms, within the shell's unchanged 700ms
  camera-push phase. FOV is never animated. Reduced motion sets the appropriate
  reading/final pose directly, without an added animation.
- The 200/1500/1800ms lid milestones, angles, settle, screen-emissive endpoints
  and activation glow are unchanged. No mesh dimensions or assets changed.
- Base graphite is `#3c414a` (roughness 0.52, metalness 0.42); the lid is
  `#484f5a` (0.50/0.40). The lip, opaque perimeter highlight and hinge caps
  separate their edges from the near-black `#11151c` bezel. Glass is darker
  `#101b28`, with roughness 0.34 and the original emissive timing.
- Neutral key/fill intensities are 1.2/0.42; the restrained blue rim is 0.24,
  ambient is 0.40, and the small neutral ground bounce is 0.10. This keeps
  graphite readable without an HDRI, bright cartoon colors or continuous rendering.

## Stable panel, fallback and responsive layout

One `.hub-screen-panel` encloses a fixed 30px LIN.OS / LOCAL SESSION header
and padded body across boot, check, ACCESS GRANTED, welcome and final content.
Rows use a 10px marker column, flexible label column and fixed 5-character
status column; OK/READY have higher contrast. Seven 20px slots reserve the
same diagnostic area in both lists. Access and welcome share a centered
message area. The exact visitor message is now **`WELCOME, USER.`**; Lin's
name remains in the portfolio and final portfolio heading.

Welcome stays visible during camera-push. During ui-reveal, the boot body is
removed instead of leaving an empty black card over the incoming content.
The same outer frame/header remain. Navigation labels, native hrefs,
44px link targets, inert/tab guards and focus outlines are unchanged.

The static open laptop uses the same screen width/top/height CSS variables,
graphite lid/base colors, bezel and edge hierarchy. Its frame surrounds the
same DOM panel; it does not implement its own boot state.

Phase 2D polished the closed fallback's visual presentation. The renderer-
selection behavior was preserved (pending, ready and fallback states, their
deadlines, and the terminal fallback rule are unchanged); only the closed
fallback's visual presentation was refined, and its frame still surrounds the
same DOM panel.

The panel is 248px high, 90% wide on phones, 64% on tablets and 52% on large
screens. The stage has an explicit 100% width and a 390/400px minimum height,
so the aspect ratio cannot force a wider mobile stage. Short landscape uses
a compact heading, a viewport-relative stage and a 228px panel with width
capped at 30rem. Diagnostic text stays 11px, final links 12px and messages
14px; no scale transform shrinks the text. The panel does not clip overflow,
so focus outlines have room. Existing global reduced-motion rules still apply.

The overlay is a stable responsive screen frame, **not** a four-corner
perspective-registered DOM surface. The 3D glass is tilted and changes apparent
size during the final dolly; exact projection would require a separate tracking
system. That larger rebuild was deliberately not added.

## Actual versus simplified examples

Actual code from `LaptopPrototype.tsx`:

```ts
const CAMERA_REFRAME_START_MS = 1100;
const CAMERA_PUSH_DURATION = 600;
const CAMERA_PUSH_FRACTION = 0.12;
```

Actual presentation guard from `HubExperience.tsx`:

```tsx
style={{ visibility: index < bootLineIndex ? "visible" : "hidden" }}
```

Simplified explanation only, **not copied implementation**:

```text
shell phase/counter → same panel, different decorative body
opening's last 700ms → reading pose → hold → small final dolly
WebGL unavailable → static frame around the same panel
```

This is camera interpolation and React composition, not a new OOP hierarchy,
real operating system, authentication check or network service.

## Teacher demo steps

1. Reload and activate Explore. Point out the closed exterior, the final 700ms
   reading reframe, seven boot rows and five checks. Watch the header and frame
   stay still while the diagnostic content changes.
2. Show ACCESS GRANTED, `WELCOME, USER.`, the subtle final push, then the
   portfolio welcome without an empty overlay. Tab through all four links and
   inspect the focus outline.
3. Repeat at 390px and 320px portrait widths and 844×390 landscape. Explain
   minimum readable type and stage size instead of scaling the whole UI down.
4. Disable WebGL and repeat: the same panel hierarchy appears in the static
   graphite shell. Separately enable reduced motion: Explore is still required,
   then entry completes directly.
5. Reload with `/#projects`, complete entry, and show the existing destination
   handoff. Explain that shell timers/gates/focus/hash logic and portfolio data,
   dropdowns, routes, assets, dependencies and deployment were protected.

These are repeatable teacher demo instructions, not an assertion that every
browser, GPU, overlay interaction or assistive technology was tested.

## Phase 2D validation evidence

- `npm run lint`: exit 0, zero errors and the same five pre-existing image
  warnings in protected ProfilePortrait/ProjectMediaGallery components.
- `npx tsc --noEmit --incremental false`: exit 0 after replacing a new direct
  Three.js vector import with local numeric interpolation; this repository
  does not supply declarations for that direct import. No package was added.
- `npm run build`: exit 0; static `/`, `/_not-found`, `/about`, `/contact`,
  `/projects`, `/skills` outputs preserved. `git diff --check`: exit 0.
- A static HTML parser verified 21 required unique section/module/project/
  spotlight ids, six module cards, one main, hidden/inert sections and 17
  resolving local fragment links. Existing source/asset SHA-256 snapshots
  showed changes only in the six approved presentation source files; the
  teacher document was the seventh Phase 2D file. In particular,
  HomeEntryShell, LaptopCanvas, Navigation, sections, data/domain and assets
  matched their pre-pass hashes.
- Existing cached Playwright and Chromium were used against the built static
  export, with software WebGL, without installing anything. Screenshots and
  DOM measurements covered 1440×1000, 390×844, 320×667 and 844×390; separate
  390×844 cases covered disabled WebGL and reduced motion. All six cases
  completed entry with no page errors or horizontal document overflow; final
  links and outline clearance fit inside the panel. A minimum-height/aspect-
  ratio sizing issue found in the first smoke check was constrained with an
  explicit stage width before the successful recheck.
- A sampled normal entrance observed all seven boot and five check rows in
  order. Panel bounds were identical from boot through ui-reveal, and the boot
  body was absent during ui-reveal. Unlock retained the shell's existing page
  layout change. Focus reached `hub-welcome`; Tab reached the About link with
  `:focus-visible`. A separate reduced-motion `/#projects` load stayed locked
  before Explore, then focused `projects` with the hash preserved.
- Screenshots were visually inspected for desktop welcome, narrow boot,
  mobile final content, static fallback and short-landscape links. This is a
  focused smoke check, not real-device/GPU, screen-reader, touch, zoom,
  context-loss, delayed-import or full dropdown/lightbox regression testing.
  Exact DOM-to-glass perspective registration remains intentionally out of
  scope, and the 3D shell can crop behind the readable panel on narrow views.

---

# Native Display — completed implementation

The Phase 2A/2B/2C/2D records above are historical. This section describes the
**Native Display** architecture that is currently in the source. Where an older
paragraph says exact DOM-to-glass registration was out of scope, this section
is the newer, authoritative description.

## Why a normal Next.js + React app is enough

Next.js renders the portfolio sections on the server at build time. React
hydrates the small interactive surface on the client. No game engine UI
framework, canvas-text library, extra renderer, or new dependency is needed:
one React DOM tree is the display, and Three.js/R3F only supplies the physical
laptop and camera. `HomeEntryShell` remains the single owner of the reducer,
Explore gate, phase timers, renderer deadlines, reduced-motion decision,
unlock, and focus/hash handoff. The display never starts a second timeline.

## One persistent semantic display

`src/components/LinOsDisplay.tsx` is the only screen UI. It renders the
LIN.OS / LOCAL SESSION masthead, the seven boot rows, five system-check rows,
ACCESS GRANTED, WELCOME, USER., and the final dashboard with one welcome
heading and the same four About / Projects / Capabilities / Contact links.
The display is mounted once in `HubExperience` inside
`.hub-display-anchor > .hub-display-surface`, outside the canvas error
boundary and outside the hardware `aria-hidden` wrappers. Switching renderer
or mode changes styles on this one node; it never remounts, so link identity,
focus, ids, hrefs and order survive.

## Four physical glass corners and the homography

`LaptopPrototype` defines the glass size once (`GLASS_WIDTH`, `GLASS_HEIGHT`,
`GLASS_DEPTH`, plus the front-face local corners). It holds the actual screen
mesh ref. After each existing lid/camera update in `useFrame`, it refreshes
the real world and inverse-view matrices and projects the four local front
corners through `matrixWorld`, `matrixWorldInverse` and `projectionMatrix` into
canvas CSS pixels. Invalid, non-finite, crossed, reversed or behind-camera
quads become `null`.

`src/lib/display-projection.ts` is pure math. `isGlassQuadValid` checks a
finite, convex, clockwise quad. `computeHomography` solves the 4-corner
correspondence; `matrix3dFromHomography` writes the CSS `matrix3d`, including
the perspective division terms. `evaluateProjection` is geometric: it checks
quad validity, corner accuracy, canvas visibility, and projected scale/target
fit. Visible-text readability, phase-aware policy, source coherence and focus
checks are performed later by `useDisplayRegistration`, which reads real
rendered layout only on refresh events. The accepted matrix is applied with
`surface.style.transform`; layout is never read inside the frame callback.
There is no permanent RAF, no React state setter per frame, and no second
WebGL context.

## 448×269 source coherence

Projected mode uses a 5:3 logical source of **448×269 CSS px**. The identical
numbers are exported by `useDisplayRegistration` as CSS variables on the
host. Before applying a matrix, the hook applies the projected CSS in a
hidden, noninteractive candidate state, reads the actual computed size and
`offsetWidth/offsetHeight`, and requires exact agreement with the homography
source. A mismatch stays flat. The DOM's transformed bounding rectangle is
never used as the source. Browser evidence chose 448×269 over 480×288 because
it gave larger effective diagnostic text while remaining an integer-pixel
match.

## Phase-aware adaptive fit

- `idle` / `activation`: flat or hidden, as before.
- `booting`, `system-check`, `access-granted`, `welcome-hold`, `camera-push`:
  projected fit requires a valid glass, visible readable diagnostic text and
  safe content; inert dashboard links are not required to be 44×44 yet.
- `ui-reveal` / `interactive`: projected fit additionally requires visible
  44×44 targets, readable dashboard text, and focus-ring clearance.
- Invalid/unreadable geometry returns to flat immediately. Entry uses 180 ms
  hysteresis. A `focusin` inside the display records the focused element and
  blocks any flat→projected promotion; a `focusout` clears that record and
  re-evaluates the cached quad. Resize, fonts and layout changes also
  re-evaluate the cached quad.

Flat mode keeps the original responsive, readable frame and the same DOM. It
is used for mobile, short/narrow viewports, high zoom, WebGL failure and
context loss. The hook does not hard-code reduced motion to flat: reduced
motion remains in the same adaptive path and projection is safe/static if it
qualifies. In the recorded reduced-motion validation run, the measured state
ended flat through the current focus/fit policy. The static fallback only
swaps hardware; it uses the same display node.

## Native visual polish

In projected mode the panel has no floating border, ring, radius or drop
shadow; the graphite lid's physical bezel is the enclosure. Dashboard tiles
are translucent blue-black with restrained blue borders and no backdrop blur.
A soft phase-driven interior glow and a small settled screen-emissive lift
provide power-on illumination with CSS transitions and the existing material
only — no bloom, new timeline, or camera change. Flat mode keeps its framed
presentation.

## Actual versus simplified examples

Actual source from `useDisplayRegistration.ts`:

```ts
export const PROJECTED_SOURCE: Size = { width: 448, height: 269 };
```

```ts
const coherent =
  Math.abs(cssWidth - PROJECTED_SOURCE.width) <= 0.5 &&
  Math.abs(cssHeight - PROJECTED_SOURCE.height) <= 0.5 &&
  offsetWidth === PROJECTED_SOURCE.width &&
  offsetHeight === PROJECTED_SOURCE.height;
```

Simplified explanation only, **not copied implementation**:

```text
real glass mesh → four CSS-pixel corners → homography → one React DOM surface
if the DOM source and math source disagree → stay flat
```

## Changed files for this architecture

New: `src/components/LinOsDisplay.tsx`,
`src/components/useDisplayRegistration.ts`, `src/lib/display-projection.ts`,
`tests/display-projection.test.ts`, and `docs/qa/lin-os-display.md`.
Modified: `HubExperience.tsx`, `LaptopCanvas.tsx`, `LaptopScene.tsx`,
`LaptopPrototype.tsx`, `StaticLaptopFallback.tsx`, `PortfolioHub.tsx`,
`src/app/globals.css`, and this explanation. HomeEntryShell, Navigation,
dropdown.js, routes, extracted sections, data/domain, deployment config and
package files were not changed by this architecture.

## Teacher demo

1. Reload at 1440×900 and activate Explore with Enter or Space. Show the
   seven boot rows and five checks attached to the glass, ACCESS GRANTED and
   WELCOME, USER., then the small final push and dashboard. Point out that the
   masthead and link ids never disappear or duplicate.
2. Tab through the four dashboard links; explain that focus survives mode and
   renderer changes. Reload with `/#projects`, finish entry, and show the
   shell's existing destination handoff.
3. Resize to a phone or short landscape viewport: the same DOM moves to the
   intentional readable flat frame. Enable reduced motion or disable WebGL:
   the same display remains usable.
4. Explain the four-corner math, the exact 448×269 source check, and why the
   projection is imperative rather than per-frame React state.

Validation commands, measurements and limitations are in
`docs/qa/lin-os-display.md`.
