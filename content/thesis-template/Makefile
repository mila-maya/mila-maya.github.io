PDF=thesis.pdf
MAIN=thesis.tex
SLIDES_MAIN=presentation/presentation.tex

.PHONY: all watch clean cleanall slides slides-watch slides-clean

all:
	latexmk -pdf -interaction=nonstopmode $(MAIN)

watch:
	latexmk -pdf -pvc -interaction=nonstopmode $(MAIN)

clean:
	latexmk -c

cleanall:
	latexmk -C && rm -rf _minted-*

slides:
	cd presentation && latexmk -pdf -interaction=nonstopmode presentation.tex

slides-watch:
	cd presentation && latexmk -pdf -pvc -interaction=nonstopmode presentation.tex

slides-clean:
	cd presentation && latexmk -c presentation.tex
