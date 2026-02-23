"""
Generate a side-by-side figure with:
- left: single-Gaussian fit
- right: shared-t0 multi-Gaussian fit (two components)

Outputs:
- content/diagrams/02-gaussian-fitting-taylor.pdf
- public/images/blog/tda-theory/gaussian-fitting.svg
- public/images/blog/tda-theory/gaussian-fitting.png
"""

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


def plot_single_gauss(ax):
    rng = np.random.default_rng(3)
    t = np.linspace(0.0, 120.0, 600)

    t0_true = 35.0
    sigma_true = 8.0
    peak_height = 3.5
    A_true = peak_height * (np.sqrt(2.0 * np.pi) * sigma_true)

    peak = (A_true / (np.sqrt(2.0 * np.pi) * sigma_true)) * np.exp(
        -((t - t0_true) ** 2) / (2.0 * sigma_true**2)
    )
    baseline = 0.05 + 0.03 * (t / t.max()) + 0.02 * np.sin(2.0 * np.pi * t / (t.max() * 1.3))
    noise = rng.normal(scale=0.05, size=t.size)
    signal = np.clip(peak + baseline + noise, 0.0, None)

    spike_indices = rng.choice(np.arange(30, t.size - 30), size=10, replace=False)
    signal[spike_indices] += rng.uniform(0.15, 0.4, size=spike_indices.size)
    signal = np.clip(signal, 0.0, None)

    edge_mask = (t <= 10.0) | (t >= 70.0)
    pb = np.polyfit(t[edge_mask], signal[edge_mask], 1)
    baseline_hat = np.polyval(pb, t)

    s0 = np.clip(signal - baseline_hat, 0.0, None)
    threshold = 0.10 * s0.max()
    weights = np.where(s0 >= threshold, s0, 0.0)

    area = np.trapezoid(weights, t)
    if not np.isfinite(area) or area <= 0.0:
        weights = s0
        area = np.trapezoid(weights, t)

    t0_est = np.trapezoid(t * weights, t) / max(area, 1e-12)
    var_est = np.trapezoid((t - t0_est) ** 2 * weights, t) / max(area, 1e-12)
    sigma_est = float(np.sqrt(max(var_est, 1e-12)))

    fit = (area / (np.sqrt(2.0 * np.pi) * sigma_est)) * np.exp(
        -((t - t0_est) ** 2) / (2.0 * sigma_est**2)
    ) + baseline_hat

    mask = (t >= 10.0) & (t <= 60.0)
    t_plot = t[mask] - 10.0
    signal_plot = signal[mask]
    baseline_plot = baseline_hat[mask]
    fit_plot = fit[mask]

    ax.plot(t_plot, signal_plot, "-", color="#1f21b4", lw=1.1, label="Taylorgram (data)")
    ax.fill_between(
        t_plot,
        baseline_plot,
        fit_plot,
        color="#2ca02c",
        alpha=0.16,
        linewidth=0.0,
        label="Gaussian area",
    )
    ax.plot(t_plot, fit_plot, "--", lw=2.0, color="#2ca02c", label="Single Gaussian fit")
    ax.axvline(t0_est - 10.0, color="k", linestyle=":", linewidth=1.2)
    ax.text(
        t0_est - 10.0,
        0.0,
        r"$t_0$",
        ha="center",
        va="center",
        fontsize=10,
        color="k",
        bbox=dict(facecolor="white", edgecolor="none", alpha=0.7, pad=1.0),
    )
    ax.set_xlabel("Time")
    ax.set_ylabel("Absorbance/Signal (mAU)")
    ax.set_xlim(0.0, 50.0)
    ax.set_ylim(0.0, 6.0)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.legend()


def plot_shared_t0_multi_gauss(ax):
    rng = np.random.default_rng(7)
    t = np.linspace(3.0, 8.0, 700)
    baseline = np.full_like(t, 1.0)

    t0_true = 6.0
    sigma1_true = 0.10
    sigma2_true = 0.55
    A1_true = 0.22
    A2_true = 0.75

    def gauss(x, area, sigma, center):
        return (area / (np.sqrt(2.0 * np.pi) * sigma)) * np.exp(-0.5 * ((x - center) / sigma) ** 2)

    clean = gauss(t, A1_true, sigma1_true, t0_true) + gauss(t, A2_true, sigma2_true, t0_true)
    signal = baseline + clean + rng.normal(scale=0.006, size=t.size)

    tmin = t0_true - 1.5
    tmax = t0_true + 1.5
    window = (t >= tmin) & (t <= tmax)
    t = t[window]
    signal = signal[window]

    t_mean = t.mean()

    def basis_cols(x, t0, s1, s2):
        g1 = (1.0 / (np.sqrt(2.0 * np.pi) * s1)) * np.exp(-0.5 * ((x - t0) / s1) ** 2)
        g2 = (1.0 / (np.sqrt(2.0 * np.pi) * s2)) * np.exp(-0.5 * ((x - t0) / s2) ** 2)
        return g1, g2, np.ones_like(x), x - t_mean

    def solve_linear(x, y, t0, s1, s2):
        g1, g2, ones, tcentered = basis_cols(x, t0, s1, s2)
        X = np.column_stack([g1, g2, ones, tcentered])
        coef, *_ = np.linalg.lstsq(X, y, rcond=None)
        yhat = X @ coef
        sse = np.sum((y - yhat) ** 2)
        return coef, yhat, sse

    edge = (t <= (t.min() + 0.7)) | (t >= (t.max() - 0.7))
    pb = np.polyfit(t[edge], signal[edge], 1)
    baseline_hat = np.polyval(pb, t)
    s0 = np.clip(signal - baseline_hat, 0.0, None)
    threshold = 0.10 * s0.max()
    weights = np.where(s0 >= threshold, s0, 0.0)
    area_est = np.trapezoid(weights, t)
    if not np.isfinite(area_est) or area_est <= 0.0:
        weights = s0
        area_est = np.trapezoid(weights, t)
    t0_est = np.trapezoid(t * weights, t) / max(area_est, 1e-12)
    var_est = np.trapezoid((t - t0_est) ** 2 * weights, t) / max(area_est, 1e-12)
    sigma_est = float(np.sqrt(max(var_est, 1e-6)))

    t0_grid = np.linspace(t0_est - 0.3, t0_est + 0.3, 21)
    s1_grid = np.linspace(max(0.04, 0.15 * sigma_est), max(0.20, 0.7 * sigma_est), 12)
    s2_grid = np.linspace(max(0.30, 0.8 * sigma_est), max(1.0, 2.2 * sigma_est), 14)

    best_sse = None
    best_coef = None
    best_yhat = None
    best_t0 = None
    best_s1 = None
    best_s2 = None

    for t0_guess in t0_grid:
        for s1_guess in s1_grid:
            for s2_guess in s2_grid:
                if s1_guess >= s2_guess:
                    continue
                coef, yhat, sse = solve_linear(t, signal, t0_guess, s1_guess, s2_guess)
                if best_sse is None or sse < best_sse:
                    best_sse = sse
                    best_coef = coef
                    best_yhat = yhat
                    best_t0 = t0_guess
                    best_s1 = s1_guess
                    best_s2 = s2_guess

    A1_fit, A2_fit, c0_fit, c1_fit = best_coef
    g1_fit, g2_fit, _, _ = basis_cols(t, best_t0, best_s1, best_s2)
    baseline_fit = c0_fit + c1_fit * (t - t_mean)
    comp1 = baseline_fit + A1_fit * g1_fit
    comp2 = baseline_fit + A2_fit * g2_fit

    ax.plot(t, signal, "-", color="#1f21b4", lw=1.1, label="Taylorgram (data)")
    ax.fill_between(
        t,
        baseline_fit,
        baseline_fit + A2_fit * g2_fit,
        color="#9467bd",
        alpha=0.14,
        linewidth=0.0,
    )
    ax.fill_between(
        t,
        baseline_fit,
        baseline_fit + A1_fit * g1_fit,
        color="#ff7f0e",
        alpha=0.18,
        linewidth=0.0,
    )
    ax.plot(t, best_yhat, "-", color="#2ca02c", lw=2.2, label="TDA Fit (Gaussian sum)")
    ax.plot(t, comp1, "--", lw=1.4, color="#ff7f0e", label="Component 1")
    ax.plot(t, comp2, ":", lw=1.6, color="#9467bd", label="Component 2")
    ax.axvline(best_t0, color="k", linestyle=":", linewidth=1.2)
    ax.set_xlim(tmin, t.max())
    ax.set_ylim(0.95 * signal.min(), 1.05 * signal.max())
    ax.set_xlabel("Time")
    ax.set_ylabel("Absorbance (mAU)")
    ax.set_xticks([])
    ax.set_yticks([])
    ax.legend(loc="upper left")


def main():
    fig, (ax_left, ax_right) = plt.subplots(1, 2, figsize=(12.0, 4.2))
    plot_single_gauss(ax_left)
    plot_shared_t0_multi_gauss(ax_right)
    plt.tight_layout()

    script_path = Path(__file__).resolve()
    pdf_path = script_path.with_suffix(".pdf")
    plt.savefig(pdf_path, bbox_inches="tight")

    repo_root = script_path.parents[2]
    out_dir = repo_root / "public" / "images" / "blog" / "tda-theory"
    out_dir.mkdir(parents=True, exist_ok=True)
    svg_path = out_dir / "gaussian-fitting.svg"
    png_path = out_dir / "gaussian-fitting.png"

    plt.savefig(svg_path, bbox_inches="tight")
    plt.savefig(png_path, dpi=220, bbox_inches="tight")
    plt.close(fig)

    print(f"Saved: {pdf_path}")
    print(f"Saved: {svg_path}")
    print(f"Saved: {png_path}")


if __name__ == "__main__":
    main()
