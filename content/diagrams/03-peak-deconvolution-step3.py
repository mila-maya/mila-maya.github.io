"""
Generate a publication-quality Step 3 deconvolution figure.

Outputs:
- public/images/blog/peak-deconvolution/deconvolution-step3.svg
"""

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy.optimize import curve_fit


def _gauss(x: np.ndarray, area: float, center: float, sigma: float) -> np.ndarray:
    sigma_safe = max(float(sigma), 1e-9)
    return float(area) * np.exp(-0.5 * ((x - float(center)) / sigma_safe) ** 2)


def _fit_model(x: np.ndarray, *params: float) -> np.ndarray:
    n_comp = (len(params) - 2) // 3
    c0, c1 = params[-2], params[-1]
    y = c0 + c1 * (x - np.mean(x))
    for i in range(n_comp):
        area_i, t0_i, sigma_i = params[3 * i : 3 * i + 3]
        y = y + _gauss(x, area_i, t0_i, sigma_i)
    return y


def main() -> None:
    rng = np.random.default_rng(5)
    t = np.linspace(0.0, 120.0, 1500)

    baseline = 0.025 + 0.00025 * t + 0.008 * np.sin(t / 11.0)
    true_components = [(0.50, 34.0, 4.4), (0.62, 51.0, 4.2), (0.38, 62.0, 5.4)]

    clean = baseline.copy()
    for area_i, t0_i, sigma_i in true_components:
        clean += _gauss(t, area_i, t0_i, sigma_i)

    y = clean + rng.normal(0.0, 0.012, size=t.size)

    p0 = []
    lb = []
    ub = []
    y_span = max(float(np.max(y) - np.min(y)), 0.1)
    t_min = float(np.min(t))
    t_max = float(np.max(t))
    for area_i, t0_i, _ in true_components:
        p0.extend([max(float(area_i), 1e-5), float(t0_i), 1.0])
        lb.extend([0.0, t_min, 0.4])
        ub.extend([y_span * 5.0, t_max, 25.0])
    p0.extend([float(np.median(y)), 0.0])
    lb.extend([float(np.min(y)) - 0.5, -0.05])
    ub.extend([float(np.max(y)) + 0.5, 0.05])

    popt, _ = curve_fit(
        _fit_model,
        t,
        y,
        p0=p0,
        bounds=(lb, ub),
        maxfev=120000,
    )
    y_fit = _fit_model(t, *popt)

    c0_fit, c1_fit = popt[-2], popt[-1]
    baseline_fit = c0_fit + c1_fit * (t - np.mean(t))

    components = []
    n_comp = (len(popt) - 2) // 3
    for i in range(n_comp):
        area_i, t0_i, sigma_i = popt[3 * i : 3 * i + 3]
        comp = _gauss(t, area_i, t0_i, sigma_i)
        components.append(comp)

    fig, ax = plt.subplots(figsize=(13.0, 4.9))

    ax.plot(t, y, color="#1f4fba", lw=1.2)
    ax.plot(t, y_fit, color="#2ca02c", lw=2.0)
    ax.plot(t, baseline_fit, color="#6b7280", lw=1.6, linestyle=(0, (4, 3)))

    component_styles = [
        ("#ff7f0e", (0, (2, 2))),
        ("#9467bd", (0, (1, 2))),
        ("#17a2b8", (0, (2, 2))),
        ("#d62728", (0, (2, 2))),
    ]

    for idx, comp in enumerate(components):
        color, dash = component_styles[idx % len(component_styles)]
        comp_plus_base = baseline_fit + comp
        ax.fill_between(t, baseline_fit, comp_plus_base, color=color, alpha=0.18, linewidth=0.0)
        ax.plot(t, comp_plus_base, color=color, lw=1.6, linestyle=dash)

    ax.set_title("")
    ax.set_xlabel("")
    ax.set_ylabel("")
    ax.tick_params(labelbottom=False, labelleft=False, length=0)

    for spine in ax.spines.values():
        spine.set_linewidth(1.0)
        spine.set_color("#8a95a5")

    fig.tight_layout()

    script_path = Path(__file__).resolve()
    repo_root = script_path.parents[2]
    out_dir = repo_root / "public" / "images" / "blog" / "peak-deconvolution"
    out_dir.mkdir(parents=True, exist_ok=True)

    out_svg = out_dir / "deconvolution-step3.svg"
    fig.savefig(out_svg, format="svg", bbox_inches="tight")
    plt.close(fig)

    print(f"Saved: {out_svg}")


if __name__ == "__main__":
    main()
