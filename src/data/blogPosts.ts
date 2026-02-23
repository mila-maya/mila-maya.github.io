import type { BlogPost } from '@/types/contentful.types';

// Add your blog posts here - just edit this file to add/update posts!
export const blogPosts: BlogPost[] = [
  {
    title: "Taylor Dispersion Analysis: General Theory and Practical Limits",
    slug: "taylor-dispersion-analysis-general-theory",
    excerpt: "A compact theory guide to Taylor Dispersion Analysis (TDA), from Taylor-Aris physics to validity criteria.",
    content: `This post summarizes the core theory of Taylor Dispersion Analysis and the physical assumptions used by the Taylor Board Dash app.

## 1) What TDA measures

Taylor Dispersion Analysis (TDA) estimates the diffusion coefficient <i>D</i> of a solute and converts it into hydrodynamic size [<a href="#ref-4">4</a>,<a href="#ref-5">5</a>].
For nanoparticles, this gives the hydrodynamic diameter <i>D</i><sub>h</sub>, which reflects how the particle moves in a fluid [<a href="#ref-6">6</a>,<a href="#ref-7">7</a>].

<p align="center"><img src="/images/blog/tda-theory/hydrodynamic-diameter.png" alt="Hydrodynamic diameter schematic" width="420" /></p>
<p align="center"><em>Hydrodynamic diameter concept.</em></p>

## 2) Core principle of Taylor-Aris dispersion

A small sample plug is injected into a capillary under pressure-driven laminar flow (Poiseuille flow) [<a href="#ref-1">1</a>,<a href="#ref-2">2</a>,<a href="#ref-3">3</a>].
Velocity is highest in the center and lowest near the wall.
Radial molecular diffusion continuously moves molecules between streamlines, and this coupling produces net longitudinal spreading.

![TDA principle and peak broadening](/images/blog/tda-theory/tda-combined-presentation.png)
*Injected band transport and resulting peak broadening.*

At long enough times, the cross-section-averaged band is well approximated by a Gaussian profile [<a href="#ref-3">3</a>,<a href="#ref-5">5</a>].
Smaller particles diffuse faster and produce narrower peaks; larger particles diffuse more slowly and produce broader peaks.

## 3) How size is computed from the detector peak

![Gaussian fitting in TDA](/images/blog/tda-theory/gaussian-fitting.svg)
*Single and shared-t<sub>0</sub> multi-Gaussian fitting examples (left: single peak, right: Gaussian sum for overlapping components).*

![Compiled TikZ diagram: from taylorgram to hydrodynamic diameter](/images/blog/tda-theory/taylorgram-to-dh.svg)

The detector signal is converted to size in three linked steps.

1. Fit the detector peak with a shared-<i>t</i><sub>0</sub> multi-Gaussian model (single Gaussian is the one-component case) to extract mean elution time <i>t</i><sub>0</sub> and temporal width parameter(s) <i>&sigma;</i><sub>i</sub> [<a href="#ref-3">3</a>,<a href="#ref-5">5</a>].
2. Use Taylor-Aris to convert <i>t</i><sub>0</sub> and <i>&sigma;</i> (or <i>&sigma;</i><sub>i</sub>) into diffusion coefficient <i>D</i> [<a href="#ref-4">4</a>].
3. Use Stokes-Einstein to convert <i>D</i> into hydrodynamic diameter <i>D</i><sub>h</sub> [<a href="#ref-6">6</a>,<a href="#ref-7">7</a>].

In the Taylor-Aris regime, mean elution time <i>t</i><sub>0</sub> is mainly set by flow and capillary geometry between inlet and detector, while particle size is encoded in peak width [<a href="#ref-4">4</a>,<a href="#ref-5">5</a>].
Smaller particles diffuse faster and therefore generate narrower peaks; larger particles diffuse more slowly and generate broader peaks.

Terms used above:
- <i>t</i><sub>0</sub>: mean elution time
- <i>&sigma;</i>, <i>&sigma;</i><sub>i</sub>: temporal peak width parameter(s)
- <i>D</i>: diffusion coefficient
- <i>D</i><sub>h</sub>: hydrodynamic diameter

## 4) Validity criteria: when the model is trustworthy

Accurate TDA requires operation inside the Taylor-Aris validity window [<a href="#ref-4">4</a>,<a href="#ref-5">5</a>].
Use three practical criteria:

- Dimensionless residence time: <i>&tau;</i> = <i>D</i> * <i>t</i><sub>0</sub> / <i>R</i><sub>c</sub><sup>2</sup> with threshold <i>&tau;</i> &ge; 1.25 [<a href="#ref-4">4</a>]
- Peclet number: <i>Pe</i> = <i>L</i><sub>eff</sub> * <i>R</i><sub>c</sub> / (<i>D</i> * <i>t</i><sub>0</sub>) with threshold <i>Pe</i> &ge; 40 [<a href="#ref-4">4</a>]
- Particle-to-capillary ratio: <i>R</i><sub>h</sub> / <i>R</i><sub>c</sub> &le; 0.0051 [<a href="#ref-5">5</a>]

These criteria define an operating pressure corridor for a target size range:

![Pressure-size operating window](/images/blog/tda-theory/pressure-map.png)
*Pressure-size operating window recreated from published regime bounds (representative geometry: <i>R</i><sub>c</sub> = 25 &micro;m, <i>L</i><sub>total</sub> = 50 cm, <i>L</i><sub>eff</sub> = 41.8 cm), following Chamieh et al. [<a href="#ref-5">5</a>] and operating-constraint equations summarized by Cottet et al. [<a href="#ref-4">4</a>].*

## 5) Practical non-ideal effects

Even inside a valid Taylor-Aris pressure window, non-ideal effects can still bias size estimates.

- **Capillary wall interactions (tailing):** transient adsorption at the wall creates asymmetric Taylorgrams and extra broadening. This inflates apparent peak width and can overestimate hydrodynamic size [<a href="#ref-9">9</a>].
- **Hydrodynamic chromatography bias (finite-size exclusion):** if the particle-to-capillary ratio is too high, particles are partially excluded from the slow near-wall region. That shifts elution earlier and perturbs width, biasing diffusion and size [<a href="#ref-5">5</a>].
- **Oversized injection plugs:** if injected volume is too large, the initial plug width adds variance that is not molecular diffusion. A common practical limit is <i>V</i><sub>i</sub> / <i>V</i><sub>c</sub> &le; 1% (often lower in practice) [<a href="#ref-4">4</a>,<a href="#ref-9">9</a>].

![Capillary interaction schematic](/images/blog/tda-theory/capillary-interaction.png)
*Analyte-wall interactions in a bare fused-silica capillary: deprotonated silanol groups (SiO-) can transiently bind cationic or amphiphilic analytes, causing tailing and additional dispersion [<a href="#ref-9">9</a>].*

## Bibliography

1. <span id="ref-1"></span>Taylor, G. I. (1953). *Dispersion of soluble matter in solvent flowing slowly through a tube*. Proceedings of the Royal Society A, 219(1137), 186-203.
2. <span id="ref-2"></span>Taylor, G. I. (1954). *Conditions under which dispersion of a solute in a stream of solvent can be used to measure molecular diffusion*. Proceedings of the Royal Society A, 225(1163), 473-477. https://doi.org/10.1098/rspa.1954.0216
3. <span id="ref-3"></span>Aris, R. (1956). *On the dispersion of a solute in a solvent flowing through a tube*. Proceedings of the Royal Society A, 235(1200), 67-77.
4. <span id="ref-4"></span>Cottet, H., Biron, J.-P., & Martin, M. (2014). *On the optimization of operating conditions for Taylor dispersion analysis of mixtures*. The Analyst, 139(14), 3552-3562. https://doi.org/10.1039/c4an00192c
5. <span id="ref-5"></span>Chamieh, J., Leclercq, L., Martin, M., Slaoui, S., Jensen, H., Ostergaard, J., & Cottet, H. (2017). *Limits in Size of Taylor Dispersion Analysis*. Analytical Chemistry, 89(24), 13487-13493. https://doi.org/10.1021/acs.analchem.7b03806
6. <span id="ref-6"></span>Einstein, A. (1905). *On the motion of small particles suspended in liquids at rest required by the molecular-kinetic theory of heat*. Annalen der Physik, 17, 549-560.
7. <span id="ref-7"></span>Sutherland, W. (1905). *A dynamical theory of diffusion for non-electrolytes and the molecular mass of albumin*. Philosophical Magazine, 9, 781-785.
8. <span id="ref-8"></span>Moser, M. R., & Baker, C. A. (2021). *Taylor dispersion analysis in fused silica capillaries: a tutorial review*. Analytical Methods, 13(21), 2357-2373. https://doi.org/10.1039/D1AY00588J
9. <span id="ref-9"></span>Malburet, C., Martin, M., Leclercq, L., Cotte, J.-F., Thiebaud, J., Biron, J.-P., Chamieh, J., & Cottet, H. (2023). *Optimization of limit of detection in Taylor dispersion analysis: Application to the size determination of vaccine antigens*. Talanta Open, 7, 100209. https://doi.org/10.1016/j.talo.2023.100209
`,
    featuredImage: {
      url: "/images/blog/tda-theory/tda-combined-presentation.png",
      title: "Taylor Dispersion Analysis principle",
      description: "Injected band transport and Taylor dispersion broadening"
    },
    author: "Mila",
    publishedDate: "2026-02-22T10:00:00.000Z",
    tags: ["Taylor Dispersion Analysis", "Nanoparticle Sizing", "CE", "Theory", "Master Thesis"],
    category: "Science"
  },
  {
    title: "The Thesis Setup I Wish I Had on Day One",
    slug: "getting-started-masters-thesis-workflow",
    excerpt: "A practical setup for a code-heavy thesis: LaTeX, VS Code, and AI tools that actually help.",
    content: `When I started my computational master's thesis, I spent the first week just figuring out tooling. LaTeX errors, broken builds, files everywhere. I wished someone had handed me a working template and said "start here."

This is that guide. One command builds the PDF, everything is version-controlled, and the setup is simple enough to maintain under deadline stress.

## Direct downloads

- [Download LaTeX starter template (ZIP)](/downloads/thesis-template.zip)
- [Download compiled thesis PDF](/downloads/thesis-template.pdf)
- [Download presentation PDF](/downloads/thesis-template-presentation.pdf)

## 1) What you need

- **LaTeX distribution** - Windows: [MiKTeX](https://miktex.org/download) / Linux & macOS: [TeX Live](https://www.tug.org/texlive/)
- **Editor** - [Visual Studio Code](https://code.visualstudio.com/download) or [Windsurf](https://codeium.com/windsurf)
- **Version control** - [Git](https://git-scm.com/downloads)
- **VS Code extension** - James-Yu.latex-workshop

Make sure these all return a version number:

~~~powershell
pdflatex --version
latexmk -v
bibtex --version
~~~

## 2) Folder structure

- [thesis.tex](/template-files/thesis.tex)
- frontmatter/ — [cover.tex](/template-files/frontmatter/cover.tex), [abstracts.tex](/template-files/frontmatter/abstracts.tex)
- chapters/ — [01-intro.tex](/template-files/chapters/01-intro.tex), [02-methods.tex](/template-files/chapters/02-methods.tex), [03-results.tex](/template-files/chapters/03-results.tex)
- [bib/references.bib](/template-files/bib/references.bib)
- figures/
- appendix/
- presentation/ — [presentation.tex](/template-files/presentation/presentation.tex)
- [Makefile](/template-files/Makefile)

## 3) Build

Build your thesis:

~~~powershell
latexmk -pdf -interaction=nonstopmode thesis.tex
~~~

Build the presentation:

~~~powershell
cd presentation && latexmk -pdf -interaction=nonstopmode presentation.tex && cd ..
~~~

Clean up build artifacts: \`latexmk -c\`

## 4) Using AI

- **ChatGPT Projects** — uploaded literature papers to summarize key points, find gaps, and consult with the literature while writing
- **Codex in VS Code** — fixing LaTeX errors, organizing files, and building the presentation from figures, tables, and key content
- **Claude in VS Code** — rewriting and summarizing text in a fluent, friendly tone
- **Claude in Windsurf** — improving structure, removing repetition, and making content leaner

The editor-based tools — Codex and Claude — see your entire project, not just a single file or snippet. For rewriting, I preferred Claude over ChatGPT. ChatGPT tends to produce stiff, bullet-heavy text, while Claude reads more naturally.

For the presentation, I let Codex generate slides directly from my project content — figures, tables, and key points. No need to start from scratch.

One thing to watch out for: AI will confidently make up references and citations. Always verify.

Good luck with your thesis.
`,
    featuredImage: {
      url: "/images/blog/graduation_cap.png",
      title: "Graduation cap",
      description: "Graduation cap icon for thesis workflow post"
    },
    author: "Mila",
    publishedDate: "2025-02-07T10:00:00.000Z",
    tags: ["LaTeX", "VS Code", "AI", "Thesis", "Workflow"],
    category: "Guide"
  },
  {
    title: "Building a Personal Portfolio with GitHub Pages",
    slug: "building-portfolio-github-pages",
    excerpt: "A step-by-step guide to creating and deploying your personal portfolio website using GitHub Pages and GitHub Actions.",
    content: `# Building a Personal Portfolio with GitHub Pages

GitHub Pages is a free hosting service that's perfect for personal portfolios and project documentation.

## What You'll Need

- A GitHub account
- Basic knowledge of HTML/CSS or a static site generator
- Git installed on your computer

## Steps to Deploy

1. **Create a Repository**: Name it \`username.github.io\`
2. **Add Your Code**: Push your website code to the main branch
3. **Enable GitHub Pages**: Go to Settings → Pages
4. **Visit Your Site**: https://username.github.io

## Using GitHub Actions

For automated deployments, set up a GitHub Actions workflow:

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
\`\`\`

That's it! Your site will automatically deploy on every push.`,
    author: "Mila",
    publishedDate: "2025-02-06T14:30:00.000Z",
    tags: ["GitHub", "Deployment", "Tutorial"],
    category: "Tutorial"
  },
  {
    title: "My Journey into Open Source",
    slug: "journey-into-open-source",
    excerpt: "How I started contributing to open source projects and what I learned along the way.",
    content: `# My Journey into Open Source

Contributing to open source can be intimidating at first, but it's incredibly rewarding.

## Getting Started

I started by:
1. Finding projects I used regularly
2. Reading through the CONTRIBUTING.md files
3. Starting with small issues labeled "good first issue"

## What I Learned

- **Communication**: Clear communication is key in distributed teams
- **Code Review**: How to give and receive constructive feedback
- **Testing**: The importance of thorough testing

## Tips for Beginners

- Start small - even fixing typos helps!
- Ask questions - maintainers are usually helpful
- Be patient - it takes time to get familiar with a codebase

Happy coding! 🚀`,
    author: "Mila",
    publishedDate: "2025-02-05T09:00:00.000Z",
    tags: ["Open Source", "Career", "Learning"],
    category: "Opinion"
  }
];
