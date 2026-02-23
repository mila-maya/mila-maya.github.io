import type { BlogPost } from '@/types/contentful.types';

// Add your blog posts here - just edit this file to add/update posts!
export const blogPosts: BlogPost[] = [
  {
    title: "Automatic Peak Detection and Fitting for Overlapping Peaks in Chromatograms",
    slug: "peak-finding-area-gain-synthetic-chromatogram",
    excerpt: "A runnable 3-step workflow for automatic peak detection and multi-Gaussian fitting of overlapping chromatographic peaks.",
    content: `This post is structured as three linked steps.  
For each step you get: theory with formulas -> short algorithm -> embedded runnable playground.
The workflow follows chromatography automation ideas used in MOCCA (original + later expanded version) and iterative multivariate deconvolution for overlapping peaks [<a href="#pf-ref-1">1</a>,<a href="#pf-ref-2">2</a>,<a href="#pf-ref-3">3</a>].

## Step 1 - Build a synthetic chromatogram (overlapping peaks)

**Theory**

Model the signal as baseline plus Gaussian components:

<i>S</i>(<i>t</i>) = <i>B</i>(<i>t</i>) + &Sigma;<sub>i</sub> <i>A</i><sub>i</sub> exp(-(<i>t</i> - <i>t</i><sub>0,i</sub>)<sup>2</sup> / (2 <i>&sigma;</i><sub>i</sub><sup>2</sup>))

- <i>B</i>(<i>t</i>): baseline drift
- <i>A</i><sub>i</sub>: amplitude of component <i>i</i>
- <i>t</i><sub>0,i</sub>: center time of component <i>i</i>
- <i>&sigma;</i><sub>i</sub>: width of component <i>i</i>

<details>
<summary><strong>Algorithm (toggle)</strong></summary>

- Create time axis <i>t</i>.
- Define baseline <i>B</i>(<i>t</i>).
- Add multiple overlapping Gaussian components.
- Add random noise to emulate measured data.
</details>

<details>
<summary><strong>Code (toggle)</strong></summary>

~~~python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(5)
t = np.linspace(0.0, 120.0, 1500)

def gauss(x, A, t0, sigma):
    return A * np.exp(-0.5 * ((x - t0) / sigma) ** 2)

baseline = 0.025 + 0.00025 * t + 0.008 * np.sin(t / 11.0)
components = [(0.42, 38.0, 5.2), (0.55, 49.5, 4.0), (0.35, 58.0, 6.6)]

clean = baseline.copy()
for A, t0, sigma in components:
    clean += gauss(t, A, t0, sigma)
y = clean + rng.normal(0.0, 0.012, size=t.size)

plt.plot(t, y, lw=1.2, label="Synthetic chromatogram")
plt.plot(t, clean, "--", lw=1.0, label="Clean signal")
plt.legend()
plt.show()
~~~

</details>

<peak-finding-playground-step-1></peak-finding-playground-step-1>

## Step 2 - Detect peaks by area gain

**Theory**

For each seed peak, expand a symmetric window step-by-step directly on the measured signal <i>S</i>(<i>t</i>).
Let <i>Q</i><sub>k</sub> be area at expansion step <i>k</i>:

<i>Q</i><sub>k</sub> = &int; <i>S</i>(<i>t</i>) d<i>t</i>

Relative area gain:

<i>g</i><sub>k</sub> = (<i>Q</i><sub>k</sub> - <i>Q</i><sub>k-1</sub>) / <i>Q</i><sub>k-1</sub>

Stop when <i>g</i><sub>k</sub> drops below threshold.  
Then keep only peaks with meaningful relative area and spacing, consistent with practical chromatographic integration logic [<a href="#pf-ref-4">4</a>].

Parameter initialization from accepted windows:

- <i>t</i><sub>0,i</sub>: center time of detected peak <i>i</i>
- <i>A</i><sub>i</sub>: signal at <i>t</i><sub>0,i</sub>
- <i>&sigma;</i><sub>i</sub> &asymp; (<i>t</i><sub>right,i</sub> - <i>t</i><sub>left,i</sub>) / 6

<details>
<summary><strong>Algorithm (toggle)</strong></summary>

- Find seed maxima (prominence, distance) on the measured signal.
- Grow each seed window symmetrically and monitor area gain.
- Stop growth when gain threshold is crossed.
- Filter candidates by relative area and spacing.
- Build initial guesses (<i>A</i><sub>i</sub>, <i>t</i><sub>0,i</sub>, <i>&sigma;</i><sub>i</sub>) from detected center and window bounds.
</details>

<details>
<summary><strong>Code (toggle)</strong></summary>

~~~python
from scipy.signal import find_peaks
import numpy as np

def grow_region_by_area_gain(x, signal, center_idx, gain_threshold=0.02, min_half=8, max_half=260):
    prev_area = None
    best_left = max(0, center_idx - min_half)
    best_right = min(len(signal) - 1, center_idx + min_half)
    for half in range(min_half, max_half + 1):
        left = max(0, center_idx - half)
        right = min(len(signal) - 1, center_idx + half)
        area = np.trapz(signal[left:right + 1], x[left:right + 1])
        if prev_area is not None and prev_area > 0:
            gain = (area - prev_area) / prev_area
            if gain < gain_threshold:
                break
        best_left, best_right, prev_area = left, right, area
    best_area = np.trapz(signal[best_left:best_right + 1], x[best_left:best_right + 1])
    return best_left, best_right, best_area

seed_idx, _ = find_peaks(y, prominence=0.03, distance=85)
regions = []
for idx in seed_idx:
    left, right, area = grow_region_by_area_gain(t, y, int(idx), gain_threshold=0.02)
    regions.append({"idx": int(idx), "t0": float(t[idx]), "tLeft": float(t[left]), "tRight": float(t[right]), "area": float(area)})

total_area = sum(r["area"] for r in regions) or 1.0
for r in regions:
    r["relativeArea"] = r["area"] / total_area

kept = []
for r in sorted(regions, key=lambda r: r["area"], reverse=True):
    if r["relativeArea"] < 0.08:
        continue
    if all(abs(r["t0"] - k["t0"]) >= 6.0 for k in kept):
        kept.append(r)
kept = sorted(kept, key=lambda r: r["t0"])

peak_guesses = []
for r in kept:
    li = np.searchsorted(t, r["tLeft"], side="left")
    ri = np.searchsorted(t, r["tRight"], side="right") - 1
    ci = np.searchsorted(t, r["t0"], side="left")
    sigma_i = max((float(t[ri]) - float(t[li])) / 6.0, 0.2)
    peak_guesses.append({"A_i": float(y[ci]), "t0_i": float(r["t0"]), "sigma_i": float(sigma_i)})
~~~

</details>

<peak-finding-playground-step-2></peak-finding-playground-step-2>

## Step 3 - Fit multi-Gaussian model from detected guesses

**Theory**

Fit the measured signal with Gaussian sum plus linear baseline:

<i>S</i>(<i>t</i>) = &Sigma;<sub>i</sub> <i>A</i><sub>i</sub> exp(-(<i>t</i> - <i>t</i><sub>0,i</sub>)<sup>2</sup> / (2 <i>&sigma;</i><sub>i</sub><sup>2</sup>)) + <i>c</i><sub>0</sub> + <i>c</i><sub>1</sub>(<i>t</i> - mean(<i>t</i>))

Use step-2 guesses as initial values.  
Evaluate fit quality with:

<i>R</i><sup>2</sup> = 1 - SS<sub>res</sub> / SS<sub>tot</sub>

For overlapping signals, the fit is refined as a multi-component deconvolution problem [<a href="#pf-ref-3">3</a>].

<details>
<summary><strong>Algorithm (toggle)</strong></summary>

- Build initial parameter vector from peak guesses.
- Set lower and upper bounds.
- Add baseline parameters.
- Run nonlinear least-squares (curve_fit).
- Report component parameters and <i>R</i><sup>2</sup>.
</details>

<details>
<summary><strong>Code (toggle)</strong></summary>

~~~python
from scipy.optimize import curve_fit
import numpy as np

def multi_gauss_with_linear_baseline(x, *params):
    n_comp = (len(params) - 2) // 3
    c0, c1 = params[-2], params[-1]
    y_fit = c0 + c1 * (x - np.mean(x))
    for i in range(n_comp):
        A_i, t0_i, sigma_i = params[3 * i: 3 * i + 3]
        y_fit += gauss(x, A_i, t0_i, sigma_i)
    return y_fit

def fit_with_guesses(t, y, guesses, min_sigma=0.4, max_sigma=25.0, maxfev=120000):
    p0, lb, ub = [], [], []
    span = max(float(np.max(y) - np.min(y)), 0.1)
    for g in guesses:
        p0.extend([max(float(g["A_i"]), 1e-5), float(g["t0_i"]), min(max(float(g["sigma_i"]), min_sigma), max_sigma)])
        lb.extend([0.0, float(np.min(t)), min_sigma])
        ub.extend([span * 5.0, float(np.max(t)), max_sigma])
    p0.extend([float(np.median(y)), 0.0])
    lb.extend([float(np.min(y)) - 0.5, -0.05])
    ub.extend([float(np.max(y)) + 0.5, 0.05])
    popt, _ = curve_fit(multi_gauss_with_linear_baseline, t, y, p0=p0, bounds=(lb, ub), maxfev=maxfev)
    y_fit = multi_gauss_with_linear_baseline(t, *popt)
    ss_res = np.sum((y - y_fit) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else float("nan")
    return popt, y_fit, r2

target_r2 = 0.996
best = None
for n in range(1, len(peak_guesses) + 1):
    trial = sorted(sorted(peak_guesses, key=lambda g: g["A_i"], reverse=True)[:n], key=lambda g: g["t0_i"])
    popt, y_fit, r2 = fit_with_guesses(t, y, trial)
    best = (popt, y_fit, r2)
    if r2 >= target_r2:
        break
~~~

</details>

<peak-finding-playground-step-3></peak-finding-playground-step-3>

## Literature

1. <span id="pf-ref-1"></span>Haas, C. P., Luebbesmeyer, M., Jin, E. H., McDonald, M. A., Koscher, B. A., Guimond, N., Di Rocco, L., Kayser, H., Leweke, S., Niedenfuehr, S., Nicholls, R., Greeves, E., Barber, D. M., Hillenbrand, J., Volpin, G., & Jensen, K. F. (2023). *Open-source chromatographic data analysis for reaction optimization and screening*. ACS Central Science, 9(2), 307-317. https://doi.org/10.1021/acscentsci.2c01042
2. <span id="pf-ref-2"></span>Oboril, J., Haas, C. P., Luebbesmeyer, M., Nicholls, R., Gressling, T., Jensen, K. F., Volpin, G., & Hillenbrand, J. (2024). *Automated processing of chromatograms: a comprehensive Python package with a GUI for intelligent peak identification and deconvolution in chemical reaction analysis*. Digital Discovery, 3(10), 2041-2051. https://doi.org/10.1039/D4DD00214H
3. <span id="pf-ref-3"></span>Erny, G. L., Moeenfard, M., & Alves, A. (2021). *Iterative multivariate peaks fitting-A robust approach for the analysis of non-baseline resolved chromatographic peaks*. Separations, 8(10), 178. https://doi.org/10.3390/separations8100178
4. <span id="pf-ref-4"></span>Snow, N. H. (2019). *From detector to decision, part IV: demystifying peak integration*. LCGC North America. https://www.chromatographyonline.com/view/detector-decision-part-iv-demystifying-peak-integration
`,
    featuredImage: {
      url: "/images/blog/tda-theory/gaussian-fitting.svg",
      title: "Automatic peak detection and fitting",
      description: "Synthetic overlapping peaks, area-gain detection, and multi-Gaussian fitting"
    },
    author: "Mila",
    publishedDate: "2026-02-23T18:00:00.000Z",
    tags: ["Peak Detection", "Gaussian Fitting", "Chromatography", "Python"],
    category: "Science"
  },
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

## 3) How size is computed from the detector peak

![Gaussian fitting in TDA](/images/blog/tda-theory/gaussian-fitting.svg)
*Single and shared-t<sub>0</sub> multi-Gaussian fitting examples (left: single peak, right: Gaussian sum for overlapping components).*

![Compiled TikZ diagram: from taylorgram to hydrodynamic diameter](/images/blog/tda-theory/taylorgram-to-dh.svg)

The detector signal is converted to size in three linked steps.

1. Fit the detector peak with a shared-<i>t</i><sub>0</sub> multi-Gaussian model (single Gaussian is the one-component case, <i>i</i> = 1) to extract mean elution time <i>t</i><sub>0</sub> and component width parameter(s) <i>&sigma;</i><sub>i</sub> [<a href="#ref-3">3</a>,<a href="#ref-5">5</a>].
2. Use Taylor-Aris to convert <i>t</i><sub>0</sub> and <i>&sigma;</i><sub>i</sub> into diffusion coefficient <i>D</i> [<a href="#ref-4">4</a>].
3. Use Stokes-Einstein to convert <i>D</i> into hydrodynamic diameter <i>D</i><sub>h</sub> [<a href="#ref-6">6</a>,<a href="#ref-7">7</a>].

In the Taylor-Aris regime, mean elution time <i>t</i><sub>0</sub> is mainly set by flow and capillary geometry between inlet and detector, while particle size is encoded in peak width [<a href="#ref-4">4</a>,<a href="#ref-5">5</a>].
Smaller particles diffuse faster and therefore generate narrower peaks; larger particles diffuse more slowly and generate broader peaks.

<details>
<summary><strong>Terms used above (click to expand)</strong></summary>

- <i>S</i>(<i>t</i>): detector signal as a function of time
- <i>A</i><sub>i</sub>: fitted Gaussian area/amplitude of component <i>i</i> in a multi-Gaussian model (single Gaussian: <i>i</i> = 1)
- <i>t</i><sub>0</sub>: mean elution time
- <i>&sigma;</i><sub>i</sub>: temporal peak-width parameter of component <i>i</i> (single Gaussian: <i>i</i> = 1)
- <i>D</i>: diffusion coefficient
- <i>D</i><sub>h</sub>: hydrodynamic diameter
- <i>R</i><sub>c</sub>: capillary radius
- <i>k</i><sub>B</sub>: Boltzmann constant
- <i>T</i>: absolute temperature
- <i>&eta;</i>: dynamic viscosity (solvent viscosity)
</details>

## 4) Validity criteria: when the model is trustworthy

Accurate TDA requires operation inside the Taylor-Aris validity window [<a href="#ref-4">4</a>,<a href="#ref-5">5</a>].
Use three practical criteria:

- Dimensionless residence time: <i>&tau;</i> = <i>D</i> * <i>t</i><sub>0</sub> / <i>R</i><sub>c</sub><sup>2</sup> with threshold <i>&tau;</i> &ge; 1.25
- Peclet number: <i>Pe</i> = <i>L</i><sub>eff</sub> * <i>R</i><sub>c</sub> / (<i>D</i> * <i>t</i><sub>0</sub>) with threshold <i>Pe</i> &ge; 40
- Particle-to-capillary ratio: <i>R</i><sub>h</sub> / <i>R</i><sub>c</sub> &le; 0.0051

These criteria define an operating pressure corridor for a target size range:

![Pressure-size operating window](/images/blog/tda-theory/pressure-map.png)
*Pressure-size operating window recreated from published regime bounds (representative geometry: <i>R</i><sub>c</sub> = 25 &micro;m, <i>L</i><sub>total</sub> = 50 cm, <i>L</i><sub>eff</sub> = 41.8 cm).*

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
  }
];
