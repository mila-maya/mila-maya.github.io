import type { BlogPost } from '@/types/contentful.types';

// Add your blog posts here - just edit this file to add/update posts!
export const blogPosts: BlogPost[] = [
  {
    title: "Peak Finding by Area Gain on a Synthetic Chromatogram",
    slug: "peak-finding-area-gain-synthetic-chromatogram",
    excerpt: "A runnable 3-step demo: generate overlapping peaks, select relevant peaks by area gain, then initialize multi-Gaussian fitting.",
    content: `This post shows a minimal, runnable workflow for basic peak analysis:

1. Create a synthetic chromatogram with overlapping peaks.
2. Run area-gain peak finding to keep relevant peaks.
3. Fit a multi-Gaussian model using detected peaks as initial guesses.

Run the three code windows in order in the same Python session.

Prefer a notebook-like UI in the browser? Open the interactive playground: [Peak Finding Playground](/playground/peak-finding).

## 1) Create a synthetic chromatogram (overlapping peaks)

~~~python
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import find_peaks
from scipy.optimize import curve_fit

rng = np.random.default_rng(5)
t = np.linspace(0.0, 120.0, 2400)

def gauss_height(x, A, t0, sigma):
    return A * np.exp(-0.5 * ((x - t0) / sigma) ** 2)

baseline = 0.025 + 0.00025 * t + 0.008 * np.sin(t / 11.0)
true_components = [
    (0.42, 38.0, 5.2),
    (0.55, 49.5, 4.0),
    (0.35, 58.0, 6.6),
]

y_clean = baseline.copy()
for A, t0, sigma in true_components:
    y_clean += gauss_height(t, A, t0, sigma)

noise = rng.normal(0.0, 0.012, size=t.size)
y = y_clean + noise

plt.figure(figsize=(10, 4))
plt.plot(t, y, color="#1f4fba", lw=1.2, label="Synthetic chromatogram")
for i, (A, t0, sigma) in enumerate(true_components, start=1):
    plt.plot(t, gauss_height(t, A, t0, sigma) + baseline, "--", lw=1.0, label=f"True component {i}")
plt.xlabel("Time")
plt.ylabel("Signal (a.u.)")
plt.title("Synthetic chromatogram with overlapping peaks")
plt.legend(ncol=2, fontsize=9)
plt.tight_layout()
plt.show()
~~~

## 2) Peak finding by area gain

Area-gain idea: expand each seed peak window symmetrically and monitor relative area increase.  
Stop expansion when additional area gain drops below a threshold.

~~~python
# Baseline correction (simple edge-line model)
edge = (t <= 10.0) | (t >= 110.0)
pb = np.polyfit(t[edge], y[edge], 1)
baseline_hat = np.polyval(pb, t)
y0 = np.clip(y - baseline_hat, 0.0, None)

def grow_region_by_area_gain(x, signal, center_idx, gain_thresh=0.02, min_half_width=8, max_half_width=260):
    n = len(signal)
    prev_area = None
    best_left = max(0, center_idx - min_half_width)
    best_right = min(n - 1, center_idx + min_half_width)

    for half_width in range(min_half_width, max_half_width + 1):
        left = max(0, center_idx - half_width)
        right = min(n - 1, center_idx + half_width)
        area = np.trapz(signal[left:right + 1], x[left:right + 1])

        if prev_area is not None and prev_area > 0:
            gain = (area - prev_area) / prev_area
            if gain < gain_thresh:
                break

        best_left, best_right = left, right
        prev_area = area

    final_area = np.trapz(signal[best_left:best_right + 1], x[best_left:best_right + 1])
    return best_left, best_right, final_area

# Seed candidates (mild settings)
seed_idx, _ = find_peaks(y0, prominence=0.03, distance=85)

regions = []
for idx in seed_idx:
    left, right, area = grow_region_by_area_gain(t, y0, idx, gain_thresh=0.02)
    regions.append({"idx": int(idx), "left": int(left), "right": int(right), "area": float(area)})

total_area = sum(r["area"] for r in regions) or 1.0
for r in regions:
    r["relative_area"] = r["area"] / total_area

# Keep peaks with meaningful contribution
candidates = [r for r in regions if r["relative_area"] >= 0.08]

# Greedy spacing by area (largest first)
candidates = sorted(candidates, key=lambda r: r["area"], reverse=True)
kept = []
for r in candidates:
    t0 = t[r["idx"]]
    if all(abs(t0 - t[k["idx"]]) >= 6.0 for k in kept):
        kept.append(r)
kept = sorted(kept, key=lambda r: r["idx"])

plt.figure(figsize=(10, 4))
plt.plot(t, y0, color="#2c3e50", lw=1.2, label="Baseline-corrected signal")
plt.plot(t[seed_idx], y0[seed_idx], "o", ms=5, color="#ff8c00", label="Seed maxima")
for i, r in enumerate(kept, start=1):
    plt.axvspan(t[r["left"]], t[r["right"]], color="#8fd19e", alpha=0.25)
    plt.text(t[r["idx"]], y0[r["idx"]] + 0.015, f"P{i}", ha="center", fontsize=9)
plt.xlabel("Time")
plt.ylabel("Signal above baseline")
plt.title("Peak finding by area gain")
plt.legend()
plt.tight_layout()
plt.show()

# Initial guesses for fitting window (next step)
peak_guesses = []
for r in kept:
    sigma_i = max((t[r["right"]] - t[r["left"]]) / 6.0, 0.8)  # ~ +/-3 sigma coverage
    peak_guesses.append(
        {
            "A_i": float(y0[r["idx"]]),
            "t0_i": float(t[r["idx"]]),
            "sigma_i": float(sigma_i),
        }
    )

print("Detected peak guesses:")
for i, g in enumerate(peak_guesses, start=1):
    print(f"{i}: A_i={g['A_i']:.3f}, t0_i={g['t0_i']:.2f}, sigma_i={g['sigma_i']:.2f}")
~~~

## 3) Multi-Gaussian fitting with detected peaks as start guesses

~~~python
if len(peak_guesses) == 0:
    raise RuntimeError("No peaks passed area-gain filtering. Relax thresholds in window 2.")

def multi_gauss_with_baseline(x, *params):
    # params = [A1, t01, sigma1, A2, t02, sigma2, ..., c0, c1]
    n_comp = (len(params) - 2) // 3
    c0, c1 = params[-2], params[-1]
    y_fit = c0 + c1 * (x - np.mean(x))
    for i in range(n_comp):
        A_i, t0_i, sigma_i = params[3 * i : 3 * i + 3]
        y_fit += gauss_height(x, A_i, t0_i, sigma_i)
    return y_fit

# Build initial vector + bounds from detected peaks
p0, lower, upper = [], [], []
for g in peak_guesses:
    p0.extend([g["A_i"], g["t0_i"], g["sigma_i"]])
    lower.extend([0.0, t.min(), 0.4])
    upper.extend([2.0, t.max(), 25.0])

# Linear baseline parameters
p0.extend([float(np.median(y)), 0.0])   # c0, c1
lower.extend([y.min() - 0.2, -0.02])
upper.extend([y.max() + 0.2, 0.02])

popt, _ = curve_fit(
    multi_gauss_with_baseline,
    t,
    y,
    p0=p0,
    bounds=(lower, upper),
    maxfev=120000,
)

y_fit = multi_gauss_with_baseline(t, *popt)
ss_res = float(np.sum((y - y_fit) ** 2))
ss_tot = float(np.sum((y - np.mean(y)) ** 2))
r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else float("nan")

n_comp = (len(popt) - 2) // 3
c0, c1 = popt[-2], popt[-1]
baseline_fit = c0 + c1 * (t - np.mean(t))

plt.figure(figsize=(10, 4))
plt.plot(t, y, color="#1f4fba", lw=1.1, label="Data")
plt.plot(t, y_fit, color="#2ca02c", lw=2.0, label="Multi-Gaussian fit")
for i in range(n_comp):
    A_i, t0_i, sigma_i = popt[3 * i : 3 * i + 3]
    comp_i = gauss_height(t, A_i, t0_i, sigma_i) + baseline_fit
    plt.plot(t, comp_i, "--", lw=1.2, label=f"Component {i+1}")
plt.xlabel("Time")
plt.ylabel("Signal (a.u.)")
plt.title(f"Multi-Gaussian fit initialized from area-gain peaks (R^2 = {r2:.4f})")
plt.legend(ncol=2, fontsize=9)
plt.tight_layout()
plt.show()

print("Fitted parameters:")
for i in range(n_comp):
    A_i, t0_i, sigma_i = popt[3 * i : 3 * i + 3]
    print(f"Component {i+1}: A_i={A_i:.3f}, t0_i={t0_i:.2f}, sigma_i={sigma_i:.2f}")
print(f"Baseline: c0={c0:.4f}, c1={c1:.6f}")
~~~

This gives a compact, practical bridge from detection to fitting:
area-gain regions define relevant peaks, and those peaks become stable initialization for multi-Gaussian fitting.
`,
    featuredImage: {
      url: "/images/blog/tda-theory/gaussian-fitting.svg",
      title: "Peak finding by area gain",
      description: "Synthetic overlapping peaks, area-gain detection, and multi-Gaussian fitting"
    },
    author: "Mila",
    publishedDate: "2026-02-23T18:00:00.000Z",
    tags: ["Peak Finding", "Chromatography", "Gaussian Fitting", "Python", "TDA"],
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
