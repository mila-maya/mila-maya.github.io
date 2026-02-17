Thesis Template (LaTeX + BibTeX)
===============================

Build
-----

- With latexmk (recommended):
  - One-off: `make` (or `latexmk -pdf -interaction=nonstopmode thesis.tex`)
  - Watch: `make watch`
  - Clean: `make clean` / `make cleanall`

- Manual (pdflatex + bibtex):
  1. `pdflatex thesis.tex`
  2. `bibtex thesis`
  3. `pdflatex thesis.tex`
  4. `pdflatex thesis.tex`

Structure
---------

- `thesis.tex`: main file, includes front matter, chapters, and references
- `frontmatter/`: title page, abstract, affidavit, acknowledgments, lists
- `chapters/`: main chapter content
- `appendix/`: optional appendices
- `bib/references.bib`: BibTeX database
- `figures/`, `tables/`: assets and table snippets
