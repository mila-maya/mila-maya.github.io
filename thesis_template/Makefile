PDF=thesis.pdf
MAIN=thesis.tex

.PHONY: all watch clean cleanall

all:
	latexmk -pdf -interaction=nonstopmode $(MAIN)

watch:
	latexmk -pdf -pvc -interaction=nonstopmode $(MAIN)

clean:
	latexmk -c

cleanall:
	latexmk -C && rm -rf _minted-*
