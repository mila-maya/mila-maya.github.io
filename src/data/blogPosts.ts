import type { BlogPost } from '@/types/contentful.types';

// Add your blog posts here - just edit this file to add/update posts!
export const blogPosts: BlogPost[] = [
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
- **Codex in VS Code** — fixing LaTeX errors, organizing files, and building the presentation from thesis figures, tables, and content
- **Claude in VS Code** — rewriting and summarizing text in a fluent, friendly tone
- **Claude in Windsurf** — improving structure, removing repetition, and making content leaner

The editor-based tools — Codex and Claude — see your entire project, not just a single file or snippet. For rewriting, I preferred Claude over ChatGPT. ChatGPT tends to produce stiff, bullet-heavy text, while Claude reads more naturally.

For the presentation, I let Codex generate slides directly from thesis content — figures, tables, and key points. No need to start from scratch.

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
