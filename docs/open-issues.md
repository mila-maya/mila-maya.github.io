# Open issues

Every item here is in one of four states, after KoriBot/AGENTS.md rule 9a:
**fixed**, **accepted** by Mila, **deferred** by Mila with a reason, or **open**.
Nothing that matters may live only in a chat message.

Only Mila moves an item to accepted or deferred.

---

## Open — needs her decision

### Structure: Explore and Stories, or projects
She thinks in projects, not in a tool room and a writing room. Today the same
body of work appears as two posts plus a tool page, and nothing says they belong
together. No shape agreed yet. Blocks the thesis project below.

### The master thesis is not a project anywhere
Two posts and one playground come out of it. It appears only as four bullets
inside the Dipl.-Ing. entry on About. She wants it as its own CV station and,
in some form, as a project. Dates not confirmed; the thesis repo runs
2025-11 to 2026-02.

### The thesis results are unpublished
`mila-maya/Thesis` holds roughly twenty result figures under `figures/results/`
— synthetic Taylorgrams at 10 nm and 20 nm and several mixtures, each with a
region and a fitting plot — plus clustering and DLS comparison work. The site
shows the method and the algorithm but not whether either works.

### Cross-link the toolbox and the CS50 entry
Agreed in both directions on 2026-09-20, not built.

---

## Open — technical

### `thesis-template.zip` is rewritten by every build
`npm run sync:thesis` regenerates it, so the working tree is dirty after any
build and the file has to be checked out again before every commit.

### The playground is 1096 lines in one file
`src/pages/PeakFindingPlayground/PeakFindingPlayground.tsx`. Worth splitting
when it is next touched for real, not before.

### The RNAnalytics logo is 2047 px for a 75 px tile
90 KB. No image tooling on this machine to downscale it.

### The blog post renders invalid HTML around the playground
The markdown processor wraps the custom tags — `<peak-finding-playground-step-1>`
and its siblings — in a `<p>`, and the playground renders a `<section>` with
further `<p>` inside it. A section inside a paragraph is invalid, so React logs
about twenty hydration warnings on that post. Predates the redesign. The likely
fix is a rehype step that unwraps a paragraph holding only a custom element, or
rendering the playground as a fragment rather than a section.

### No tests
Nothing anywhere. The peak finding core would be the place to start.

---

## Deferred

### Vite 8
Two advisories remain in `vite` and `esbuild` and need the major bump. Deferred
2026-09-19: the site is static with no user input, and Vite 7 already cleared
the other fifteen.

---

## Accepted

### The book shelf has no takeaways
All seventeen entries have an empty `takeaways` array. Accepted 2026-09-20: the
page now describes itself as a record of what was read rather than promising
five takeaways per book. The section reappears by itself once an entry has any.

---

## Fixed

- **Deep links were dead.** Hand-written stubs redirected every direct URL to
  the homepage. Removed 2026-09-18.
- **Per-route metadata never reached the browser.** `react-helmet-async` was
  inert in the production build. Replaced by React 19 hoisting.
- **Link previews showed the homepage for every page.** Build-time pre-render
  per route, 2026-09-19.
- **Seventeen npm advisories, twelve high.** Two remain, see Deferred.
- **The standalone playground page was a duplicate.** It had been consolidated
  into the post before the redesign; the redesign resurrected it. Reverted to a
  redirect, 2026-09-20.
- **"Published from this work" had no previews.** The three cards on the thesis
  project page showed title and summary only, although all three posts carry a
  `featuredImage`. `FacetedItem` now carries the picture too. 2026-09-20.
- **Em dashes read as machine-written.** Five of them were mine: three on the
  homepage, one on About, one in the books description. Rewritten without.
  The nine in `blogPosts.ts` and the five in the thesis abstract are hers and
  stay untouched. 2026-09-20.
