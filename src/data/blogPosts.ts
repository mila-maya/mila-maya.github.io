import type { BlogPost } from '@/types/contentful.types';

// Add your blog posts here - just edit this file to add/update posts!
export const blogPosts: BlogPost[] = [
  {
    title: "Getting Started with Master Thesis: How I Set Up My Computational Master's Thesis (LaTeX + VS Code + Python + AI)",
    slug: "getting-started-masters-thesis-workflow",
    excerpt: "A friendly, practical setup for a code-heavy thesis: LaTeX, VS Code, Python, reproducible figures, and safe AI usage.",
    content: `If your thesis is code-heavy, you need a setup that feels calm and predictable.

This is the workflow I use:

- one command builds the thesis PDF
- everything is version-controlled
- the setup is simple enough to maintain under deadline stress

## Direct downloads

- [Download LaTeX starter template (ZIP)](/downloads/thesis-template.zip)
- [Download starter template PDF](/downloads/thesis-template.pdf)
- [Download starter presentation PDF](/downloads/thesis-template-presentation.pdf)

## 1) Minimal setup (with links)

- LaTeX distribution
  - Windows: [MiKTeX](https://miktex.org/download)
  - Linux/macOS: [TeX Live](https://www.tug.org/texlive/)
- Editor: [Visual Studio Code](https://code.visualstudio.com/download)
- Version control: [Git](https://git-scm.com/downloads)
- Terminal: PowerShell (built in)
- Python: [Python 3.11+](https://www.python.org/downloads/)

VS Code extensions (LaTeX-focused):

- James-Yu.latex-workshop (required)

## 2) Verify your LaTeX toolchain early

Run this first:

~~~powershell
pdflatex --version
latexmk -v
bibtex --version
~~~

If one command fails, fix that before writing chapters.

## 3) Simple folder structure

~~~text
thesis_template/
  thesis.tex
  frontmatter/
  chapters/
  appendix/
  bib/
  figures/
  .vscode/
  latexmkrc
~~~

This keeps writing, references, and outputs organized without too many moving parts.

## 4) Build commands

Build:

~~~powershell
latexmk -pdf -interaction=nonstopmode thesis.tex
~~~

Clean:

~~~powershell
latexmk -c
~~~

## 5) Build presentation directly from the thesis

You can create your slides directly from the thesis work instead of starting from scratch.

- reuse thesis figures in slides
- reuse key tables as summary slides
- use AI (Claude/Codex) to compress long method/result sections into clear bullet points

Build the presentation in the template:

~~~powershell
cd presentation
latexmk -pdf -interaction=nonstopmode presentation.tex
~~~

## 6) How I use Claude/OpenAI safely

AI helps best with structure and wording, not with facts.

VS Code AI extensions I use:

- Claude
- Codex

Good use:

- improve outline clarity
- rewrite paragraphs without changing meaning
- debug LaTeX errors when you paste exact logs

Never accept blindly:

- references you did not verify
- claims you did not compute or test
`,
    featuredImage: {
      url: "/images/blog/graduation_cap.png",
      title: "Graduation cap",
      description: "Graduation cap icon for thesis workflow post"
    },
    author: "Mila",
    publishedDate: "2025-02-07T10:00:00.000Z",
    tags: ["LaTeX", "VS Code", "Python", "AI", "Thesis", "Workflow"],
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
