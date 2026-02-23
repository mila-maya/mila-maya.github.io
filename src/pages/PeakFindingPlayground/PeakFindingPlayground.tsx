import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@components/common/SEO/SEO';
import styles from './PeakFindingPlayground.module.css';

type RuntimeStatus = 'loading' | 'ready' | 'error';
type RunningStep = 'generate' | 'detect' | 'fit' | null;

interface SyntheticComponent {
  A: number;
  t0: number;
  sigma: number;
}

interface SyntheticParams {
  seed: number;
  points: number;
  tMin: number;
  tMax: number;
  noiseStd: number;
  baselineOffset: number;
  baselineSlope: number;
  baselineWaveAmp: number;
  baselineWavePeriod: number;
  components: SyntheticComponent[];
}

interface PeakParams {
  minHeight: number;
  minRelHeight: number;
  minRelArea: number;
  minSpacing: number;
}

interface FitParams {
  minSigma: number;
  maxSigma: number;
  maxIterations: number;
  targetR2: number;
  minR2Gain: number;
}

interface SyntheticResult {
  t: number[];
  y: number[];
  baseline: number[];
  clean: number[];
  components: number[][];
}

interface PeakGuess {
  A_i: number;
  t0_i: number;
}

interface KeptPeak {
  idx: number;
  t0: number;
  prominence: number;
  relativeArea: number;
}

interface PeakResult {
  signal: number[];
  seedIdx: number[];
  kept: KeptPeak[];
  peakGuesses: PeakGuess[];
}

interface FitComponent {
  A_i: number;
  t0_i: number;
  sigma_i: number;
  y: number[];
}

interface FitResult {
  yFit: number[];
  baselineFit: number[];
  components: FitComponent[];
  r2: number;
  targetR2: number;
  minR2Gain: number;
}

interface PyodideGlobals {
  set(name: string, value: unknown): void;
  delete(name: string): void;
}

interface PyodideRuntime {
  loadPackage(pkg: string | string[]): Promise<void>;
  runPythonAsync(code: string): Promise<unknown>;
  globals: PyodideGlobals;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

interface PlotLine {
  label: string;
  color: string;
  y: number[];
  dash?: string;
  points?: Array<{ x: number; y: number }>;
  strokeWidth?: number;
}

const DEFAULT_SYNTHETIC: SyntheticParams = {
  seed: 5,
  points: 1500,
  tMin: 0,
  tMax: 120,
  noiseStd: 0.012,
  baselineOffset: 0.025,
  baselineSlope: 0.00025,
  baselineWaveAmp: 0.008,
  baselineWavePeriod: 11,
  components: [
    { A: 0.5, t0: 34, sigma: 4.4 },
    { A: 0.62, t0: 51, sigma: 4.2 },
    { A: 0.38, t0: 62, sigma: 5.4 },
  ],
};

const DEFAULT_PEAK: PeakParams = {
  minHeight: 0.03,
  minRelHeight: 0.01,
  minRelArea: 0.02,
  minSpacing: 4.0,
};

const DEFAULT_FIT: FitParams = {
  minSigma: 0.4,
  maxSigma: 25,
  maxIterations: 120000,
  targetR2: 0.996,
  minR2Gain: 0.01,
};

const COLORS = ['#1f4fba', '#2ca02c', '#ff7f0e', '#9467bd', '#17a2b8', '#d62728'];

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const PYTHON_CODE = `
import numpy as np
from scipy.signal import find_peaks
from scipy.optimize import curve_fit

_state = {}

def _gauss(x, A, t0, sigma):
    sigma_safe = max(float(sigma), 1e-6)
    return float(A) * np.exp(-0.5 * ((x - float(t0)) / sigma_safe) ** 2)

def _integrate_area(y_segment, t_segment):
    if hasattr(np, "trapezoid"):
        return float(np.trapezoid(y_segment, t_segment))
    return float(np.trapz(y_segment, t_segment))

def generate_synthetic(payload):
    seed = int(payload.get("seed", 5))
    points = max(int(payload.get("points", 1500)), 200)
    t_min = float(payload.get("tMin", 0.0))
    t_max = float(payload.get("tMax", 120.0))

    baseline_offset = float(payload.get("baselineOffset", 0.025))
    baseline_slope = float(payload.get("baselineSlope", 0.00025))
    wave_amp = float(payload.get("baselineWaveAmp", 0.008))
    wave_period = max(float(payload.get("baselineWavePeriod", 11.0)), 1e-6)
    noise_std = max(float(payload.get("noiseStd", 0.012)), 0.0)

    components = payload.get("components", [])
    if len(components) == 0:
        components = [{"A": 0.6, "t0": (t_min + t_max) / 2.0, "sigma": 6.0}]

    rng = np.random.default_rng(seed)
    t = np.linspace(t_min, t_max, points)
    baseline = baseline_offset + baseline_slope * t + wave_amp * np.sin(t / wave_period)

    clean = baseline.copy()
    component_curves = []
    for component in components:
        A = float(component.get("A", 0.3))
        t0 = float(component.get("t0", (t_min + t_max) / 2.0))
        sigma = max(float(component.get("sigma", 4.5)), 0.15)
        curve = _gauss(t, A, t0, sigma)
        clean = clean + curve
        component_curves.append(curve)

    y = clean + rng.normal(0.0, noise_std, size=t.size)

    _state["t"] = t
    _state["y"] = y
    _state["peak_guesses"] = []

    return {
        "t": t.tolist(),
        "y": y.tolist(),
        "baseline": baseline.tolist(),
        "clean": clean.tolist(),
        "components": [curve.tolist() for curve in component_curves],
    }

def find_peaks_mocca_style(payload):
    if "t" not in _state or "y" not in _state:
        raise RuntimeError("Run step 1 first.")

    t = _state["t"]
    y = _state["y"]
    signal = np.asarray(y, dtype=float)

    min_height = max(float(payload.get("minHeight", 0.03)), 1e-8)
    min_rel_height = max(float(payload.get("minRelHeight", 0.01)), 0.0)
    min_rel_area = max(float(payload.get("minRelArea", 0.02)), 0.0)
    min_spacing = max(float(payload.get("minSpacing", 4.0)), 0.0)

    seed_idx, info = find_peaks(
        signal,
        height=-np.inf,
        prominence=min_height,
    )

    if len(seed_idx) == 0:
        _state["peak_guesses"] = []
        return {
            "signal": signal.tolist(),
            "seedIdx": [],
            "kept": [],
            "peakGuesses": [],
        }

    max_prominence = float(np.max(info["prominences"])) if len(info["prominences"]) > 0 else 0.0
    if max_prominence > 0.0:
        keep_mask = (info["prominences"] / max_prominence) > min_rel_height
    else:
        keep_mask = np.ones(len(seed_idx), dtype=bool)

    maxima = seed_idx[keep_mask]
    left_bases = info["left_bases"][keep_mask]
    right_bases = info["right_bases"][keep_mask]
    prominences = info["prominences"][keep_mask]

    candidates = []
    for idx in range(len(maxima)):
        left = max(0, min(int(left_bases[idx]), len(signal) - 1))
        right = max(0, min(int(right_bases[idx]), len(signal) - 1))
        maximum = max(0, min(int(maxima[idx]), len(signal) - 1))
        if right <= left:
            right = min(left + 1, len(signal) - 1)
        area = _integrate_area(signal[left:right + 1], t[left:right + 1])
        candidates.append({
            "idx": maximum,
            "t0": float(t[maximum]),
            "prominence": float(prominences[idx]),
            "area": max(area, 0.0),
        })

    total_area = sum(region["area"] for region in candidates)
    if total_area <= 0.0:
        total_area = 1.0

    for region in candidates:
        region["relativeArea"] = float(region["area"] / total_area)

    kept = [region for region in candidates if region["relativeArea"] >= min_rel_area]

    if min_spacing > 0.0 and len(kept) > 1:
        kept_desc = sorted(kept, key=lambda region: region["prominence"], reverse=True)
        spaced = []
        for region in kept_desc:
            if all(abs(region["t0"] - selected["t0"]) >= min_spacing for selected in spaced):
                spaced.append(region)
        kept = spaced

    kept = sorted(kept, key=lambda region: region["t0"])

    peak_guesses = []
    for region in kept:
        center_idx = int(region["idx"])
        center_idx = max(0, min(center_idx, len(t) - 1))
        peak_guesses.append({
            "A_i": float(signal[center_idx]),
            "t0_i": float(region["t0"]),
        })

    _state["peak_guesses"] = peak_guesses

    return {
        "signal": signal.tolist(),
        "seedIdx": [int(value) for value in seed_idx.tolist()],
        "kept": kept,
        "peakGuesses": peak_guesses,
    }

def _multi_gauss_with_baseline(x, *params):
    n_comp = (len(params) - 2) // 3
    c0, c1 = params[-2], params[-1]
    y = c0 + c1 * (x - np.mean(x))
    for i in range(n_comp):
        A_i, t0_i, sigma_i = params[3 * i:3 * i + 3]
        y = y + _gauss(x, A_i, t0_i, sigma_i)
    return y

def _fit_with_guesses(t, y, guesses, min_sigma, max_sigma, max_iterations):
    p0 = []
    lower = []
    upper = []
    data_span = max(float(np.max(y) - np.min(y)), 0.1)
    t_min = float(np.min(t))
    t_max = float(np.max(t))

    for guess in guesses:
        A_i = max(float(guess["A_i"]), 1e-5)
        t0_i = float(guess["t0_i"])
        sigma_i = min(max(1.0, min_sigma), max_sigma)
        p0.extend([A_i, t0_i, sigma_i])
        lower.extend([0.0, t_min, min_sigma])
        upper.extend([data_span * 5.0, t_max, max_sigma])

    p0.extend([float(np.median(y)), 0.0])
    lower.extend([float(np.min(y)) - 0.5, -0.05])
    upper.extend([float(np.max(y)) + 0.5, 0.05])

    popt, _ = curve_fit(
        _multi_gauss_with_baseline,
        t,
        y,
        p0=p0,
        bounds=(lower, upper),
        maxfev=max_iterations,
    )
    y_fit = _multi_gauss_with_baseline(t, *popt)
    ss_res = float(np.sum((y - y_fit) ** 2))
    ss_tot = float(np.sum((y - np.mean(y)) ** 2))
    r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else float("nan")
    return popt, y_fit, float(r2)

def fit_multi_gaussian(payload):
    if "t" not in _state or "y" not in _state:
        raise RuntimeError("Run step 1 first.")

    t = _state["t"]
    y = _state["y"]
    guesses = _state.get("peak_guesses", [])
    if len(guesses) == 0:
        raise RuntimeError("Run step 2 first. No peak guesses available.")

    min_sigma = max(float(payload.get("minSigma", 0.4)), 0.05)
    max_sigma = max(float(payload.get("maxSigma", 25.0)), min_sigma + 0.05)
    max_iterations = max(int(payload.get("maxIterations", 120000)), 10000)
    target_r2 = float(payload.get("targetR2", 0.996))
    target_r2 = min(max(target_r2, 0.0), 0.999999)
    min_r2_gain = max(float(payload.get("minR2Gain", 0.01)), 0.0)

    sorted_by_amplitude = sorted(guesses, key=lambda value: float(value["A_i"]), reverse=True)
    best_model = None
    previous_model = None
    selected_model = None

    for n_components in range(1, len(sorted_by_amplitude) + 1):
        trial_guesses = sorted(sorted_by_amplitude[:n_components], key=lambda value: float(value["t0_i"]))
        try:
            popt, y_fit, r2 = _fit_with_guesses(
                t,
                y,
                trial_guesses,
                min_sigma,
                max_sigma,
                max_iterations,
            )
        except Exception:
            continue

        trial = {"popt": popt, "yFit": y_fit, "r2": float(r2)}
        if best_model is None or trial["r2"] > best_model["r2"]:
            best_model = trial

        if trial["r2"] >= target_r2:
            if previous_model is not None:
                gain = float(trial["r2"] - previous_model["r2"])
                if gain < min_r2_gain:
                    selected_model = previous_model
                    break
            selected_model = trial
            break
        previous_model = trial

    if selected_model is None:
        selected_model = best_model
    if selected_model is None:
        raise RuntimeError("curve_fit failed for all tested component counts.")

    popt = selected_model["popt"]
    y_fit = selected_model["yFit"]
    r2 = selected_model["r2"]

    c0, c1 = popt[-2], popt[-1]
    baseline_fit = c0 + c1 * (t - np.mean(t))

    n_comp = (len(popt) - 2) // 3
    components = []
    for i in range(n_comp):
        A_i, t0_i, sigma_i = popt[3 * i:3 * i + 3]
        components.append({
            "A_i": float(A_i),
            "t0_i": float(t0_i),
            "sigma_i": float(sigma_i),
            "y": _gauss(t, A_i, t0_i, sigma_i).tolist(),
        })

    return {
        "yFit": y_fit.tolist(),
        "baselineFit": baseline_fit.tolist(),
        "components": components,
        "r2": float(r2),
        "targetR2": float(target_r2),
        "minR2Gain": float(min_r2_gain),
    }
`;

const toNumber = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nearestIndex = (x: number[], value: number): number => {
  if (x.length === 0) {
    return 0;
  }
  let bestIdx = 0;
  let bestDist = Math.abs(x[0] - value);
  for (let i = 1; i < x.length; i += 1) {
    const distance = Math.abs(x[i] - value);
    if (distance < bestDist) {
      bestDist = distance;
      bestIdx = i;
    }
  }
  return bestIdx;
};

const addBaseline = (curve: number[], baseline: number[]): number[] =>
  curve.map((value, index) => value + (baseline[index] ?? 0));

const LinePlot = ({ x, lines, title, xLabel, yLabel }: { x: number[]; lines: PlotLine[]; title: string; xLabel: string; yLabel: string }) => {
  const width = 980;
  const height = 320;
  const left = 58;
  const right = 16;
  const top = 18;
  const bottom = 40;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;

  if (x.length < 2 || lines.length === 0) {
    return null;
  }

  const xMin = x[0];
  const xMax = x[x.length - 1];
  const xRange = xMax - xMin || 1;

  const yValues = lines.flatMap((line) => [
    ...line.y,
    ...(line.points?.map((point) => point.y) ?? []),
  ]);
  const yMinRaw = Math.min(...yValues);
  const yMaxRaw = Math.max(...yValues);
  const yPad = (yMaxRaw - yMinRaw || 1) * 0.08;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;
  const yRange = yMax - yMin || 1;

  const mapX = (value: number) => left + ((value - xMin) / xRange) * innerWidth;
  const mapY = (value: number) => top + (1 - (value - yMin) / yRange) * innerHeight;

  return (
    <div className={styles.plotCard}>
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.plotSvg}>
        <rect x={left} y={top} width={innerWidth} height={innerHeight} fill="#fff" stroke="#d8deea" />
        {lines.map((line) => (
          line.y.length > 1 ? (
            <polyline
              key={line.label}
              fill="none"
              stroke={line.color}
              strokeWidth={line.strokeWidth ?? 2}
              strokeDasharray={line.dash}
              points={x.map((time, idx) => `${mapX(time).toFixed(2)},${mapY(line.y[idx] ?? line.y[line.y.length - 1]).toFixed(2)}`).join(' ')}
            />
          ) : null
        ))}
        {lines.flatMap((line) =>
          (line.points ?? []).map((point, idx) => (
            <circle
              key={`${line.label}-pt-${idx}`}
              cx={mapX(point.x)}
              cy={mapY(point.y)}
              r={3.4}
              fill={line.color}
              stroke="#ffffff"
              strokeWidth={1}
            />
          ))
        )}
        <line x1={left} x2={left} y1={top} y2={top + innerHeight} stroke="#5f6b7a" />
        <line x1={left} x2={left + innerWidth} y1={top + innerHeight} y2={top + innerHeight} stroke="#5f6b7a" />
        <text x={left + innerWidth / 2} y={height - 10} className={styles.axisText}>{xLabel}</text>
        <text x={15} y={top + innerHeight / 2} className={styles.axisText} transform={`rotate(-90 15 ${top + innerHeight / 2})`}>{yLabel}</text>
      </svg>
      <div className={styles.legendRow}>
        {lines.map((line) => (
          <span key={`${title}-${line.label}`} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
};

let pyodideScriptPromise: Promise<void> | null = null;
let pyodideRuntimePromise: Promise<PyodideRuntime> | null = null;

const ensurePyodideScript = (): Promise<void> => {
  if (window.loadPyodide) {
    return Promise.resolve();
  }

  if (pyodideScriptPromise) {
    return pyodideScriptPromise;
  }

  pyodideScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load pyodide.js from CDN.'));
    document.head.appendChild(script);
  });

  return pyodideScriptPromise;
};

const getPyodideRuntime = async (): Promise<PyodideRuntime> => {
  if (pyodideRuntimePromise) {
    return pyodideRuntimePromise;
  }

  pyodideRuntimePromise = (async () => {
    await ensurePyodideScript();
    if (!window.loadPyodide) {
      throw new Error('window.loadPyodide is not available.');
    }
    const runtime = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    await runtime.loadPackage(['numpy', 'scipy']);
    await runtime.runPythonAsync(PYTHON_CODE);
    return runtime;
  })();

  return pyodideRuntimePromise;
};

interface PeakFindingPlaygroundProps {
  embedded?: boolean;
  focusStep?: 1 | 2 | 3 | 'all';
}

const PeakFindingPlayground = ({ embedded = false, focusStep = 'all' }: PeakFindingPlaygroundProps) => {
  const pyodideRef = useRef<PyodideRuntime | null>(null);

  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>('loading');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [runningStep, setRunningStep] = useState<RunningStep>(null);

  const [syntheticParams, setSyntheticParams] = useState<SyntheticParams>(DEFAULT_SYNTHETIC);
  const [peakParams, setPeakParams] = useState<PeakParams>(DEFAULT_PEAK);
  const [fitParams, setFitParams] = useState<FitParams>(DEFAULT_FIT);

  const [syntheticResult, setSyntheticResult] = useState<SyntheticResult | null>(null);
  const [peakResult, setPeakResult] = useState<PeakResult | null>(null);
  const [fitResult, setFitResult] = useState<FitResult | null>(null);

  const showStep1 = focusStep === 'all' || focusStep === 1;
  const showStep2 = focusStep === 'all' || focusStep === 2;
  const showStep3 = focusStep === 'all' || focusStep === 3;
  const isBusy = runningStep !== null;
  const compactEmbedded = embedded && focusStep !== 'all';

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setRuntimeStatus('loading');
        setRuntimeError(null);
        const runtime = await getPyodideRuntime();
        if (cancelled) {
          return;
        }
        pyodideRef.current = runtime;
        setRuntimeStatus('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }
        setRuntimeStatus('error');
        setRuntimeError(error instanceof Error ? error.message : String(error));
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const runPython = async <T,>(functionName: string, payload: Record<string, unknown>): Promise<T> => {
    const runtime = pyodideRef.current;
    if (!runtime) {
      throw new Error('Pyodide runtime is not ready.');
    }
    runtime.globals.set('js_payload', JSON.stringify(payload));
    try {
      const raw = await runtime.runPythonAsync(`
import json
payload = json.loads(str(js_payload))
result = ${functionName}(payload)
json.dumps(result)
`);
      return JSON.parse(String(raw)) as T;
    } finally {
      runtime.globals.delete('js_payload');
    }
  };

  const runStep1 = async () => {
    setActionError(null);
    setRunningStep('generate');
    try {
      const result = await runPython<SyntheticResult>('generate_synthetic', syntheticParams as unknown as Record<string, unknown>);
      setSyntheticResult(result);
      setPeakResult(null);
      setFitResult(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setRunningStep(null);
    }
  };

  const ensureSyntheticForDownstream = async (): Promise<void> => {
    if (syntheticResult) {
      return;
    }
    const generated = await runPython<SyntheticResult>('generate_synthetic', syntheticParams as unknown as Record<string, unknown>);
    setSyntheticResult(generated);
  };

  const runStep2 = async () => {
    setActionError(null);
    setRunningStep('detect');
    try {
      if (focusStep === 2) {
        await ensureSyntheticForDownstream();
      }
      const result = await runPython<PeakResult>('find_peaks_mocca_style', peakParams as unknown as Record<string, unknown>);
      setPeakResult(result);
      setFitResult(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setRunningStep(null);
    }
  };

  const runStep3 = async () => {
    setActionError(null);
    setRunningStep('fit');
    try {
      if (focusStep === 3) {
        await ensureSyntheticForDownstream();
        if (!peakResult || peakResult.peakGuesses.length === 0) {
          const detected = await runPython<PeakResult>('find_peaks_mocca_style', peakParams as unknown as Record<string, unknown>);
          setPeakResult(detected);
        }
      }
      const result = await runPython<FitResult>('fit_multi_gaussian', fitParams as unknown as Record<string, unknown>);
      setFitResult(result);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setRunningStep(null);
    }
  };

  const syntheticLines = useMemo<PlotLine[]>(() => {
    if (!syntheticResult) {
      return [];
    }
    const lines: PlotLine[] = [
      { label: 'Data', color: COLORS[0], y: syntheticResult.y },
      { label: 'Clean signal', color: COLORS[1], y: syntheticResult.clean, dash: '6 4' },
      { label: 'Baseline', color: '#6b7280', y: syntheticResult.baseline, dash: '4 4' },
    ];
    syntheticResult.components.forEach((component, index) => {
      lines.push({
        label: `Component ${index + 1}`,
        color: COLORS[(index + 2) % COLORS.length],
        y: addBaseline(component, syntheticResult.baseline),
        dash: '3 3',
      });
    });
    return lines;
  }, [syntheticResult]);

  const detectionLines = useMemo<PlotLine[]>(() => {
    if (!peakResult || !syntheticResult) {
      return [];
    }

    const centerPoints = peakResult.peakGuesses.map((guess) => {
      const idx = nearestIndex(syntheticResult.t, guess.t0_i);
      return {
        x: syntheticResult.t[idx],
        y: peakResult.signal[idx] ?? peakResult.signal[peakResult.signal.length - 1] ?? 0,
      };
    });

    return [
      { label: 'Signal', color: '#243447', y: peakResult.signal },
      { label: 't0_i centers', color: '#dc2626', y: [], points: centerPoints },
    ];
  }, [peakResult, syntheticResult]);

  const fitLines = useMemo<PlotLine[]>(() => {
    if (!fitResult || !syntheticResult) {
      return [];
    }
    const lines: PlotLine[] = [
      { label: 'Data', color: COLORS[0], y: syntheticResult.y },
      { label: 'Gaussian sum fit', color: COLORS[1], y: fitResult.yFit },
      { label: 'Baseline fit', color: '#6b7280', y: fitResult.baselineFit, dash: '4 4' },
    ];
    fitResult.components.forEach((component, index) => {
      lines.push({
        label: `Fit component ${index + 1}`,
        color: COLORS[(index + 2) % COLORS.length],
        y: addBaseline(component.y, fitResult.baselineFit),
        dash: '3 3',
      });
    });
    return lines;
  }, [fitResult, syntheticResult]);

  const statusText =
    runtimeStatus === 'loading'
      ? 'Loading Pyodide runtime (numpy + scipy)...'
      : runtimeStatus === 'ready'
        ? 'Runtime ready.'
        : 'Runtime failed.';

  return (
    <section className={`${styles.page} ${embedded ? styles.embedded : ''}`}>
      {!embedded && (
        <SEO
          title="Peak Finding Playground (Pyodide)"
          description="Interactive in-browser peak finding and multi-Gaussian fitting."
          url="https://mila-maya.github.io/blog/peak-finding-area-gain-synthetic-chromatogram"
          type="article"
        />
      )}

      {embedded && !compactEmbedded ? (
        <header className={styles.header}>
          <p className={styles.kicker}>Interactive Playground</p>
          <h2>
            {focusStep === 1 && 'Embedded Step 1 Playground'}
            {focusStep === 2 && 'Embedded Step 2 Playground'}
            {focusStep === 3 && 'Embedded Step 3 Playground'}
            {focusStep === 'all' && 'Run Peak Detection and Multi-Gaussian Fitting Here'}
          </h2>
          <p>
            {focusStep === 'all'
              ? 'Use run buttons in order: Step 1, then Step 2, then Step 3.'
              : 'Adjust parameters, run this step, and inspect the output below.'}
          </p>
        </header>
      ) : !embedded ? (
        <header className={styles.header}>
          <p className={styles.kicker}>Interactive Playground</p>
          <h1>Automatic Peak Detection and Gaussian Fitting (Pyodide)</h1>
          <p>Run the three notebook-like steps directly in browser and tweak parameters live.</p>
          <Link to="/blog/peak-finding-area-gain-synthetic-chromatogram">Back to blog post</Link>
        </header>
      ) : null}

      <div className={`${styles.status} ${runtimeStatus === 'ready' ? styles.ready : runtimeStatus === 'error' ? styles.error : styles.loading}`}>
        <strong>Runtime:</strong> {statusText} {runtimeError}
      </div>

      {actionError && <div className={styles.errorBox}>Error: {actionError}</div>}

      <div className={styles.controlGrid}>
        {showStep1 && (
        <article className={styles.card}>
          <h2>{compactEmbedded ? 'Synthetic chromatogram' : 'Step 1: Synthetic chromatogram'}</h2>
          <div className={styles.fieldGrid}>
            <label>Seed<input type="number" value={syntheticParams.seed} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, seed: toNumber(event.target.value, prev.seed) }))} /></label>
            <label>Points<input type="number" min={200} value={syntheticParams.points} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, points: toNumber(event.target.value, prev.points) }))} /></label>
            <label>Noise std<input type="number" step="0.001" value={syntheticParams.noiseStd} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, noiseStd: toNumber(event.target.value, prev.noiseStd) }))} /></label>
            <label>Time min<input type="number" value={syntheticParams.tMin} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, tMin: toNumber(event.target.value, prev.tMin) }))} /></label>
            <label>Time max<input type="number" value={syntheticParams.tMax} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, tMax: toNumber(event.target.value, prev.tMax) }))} /></label>
          </div>

          <h3>Components</h3>
          <table className={styles.table}>
            <thead><tr><th>#</th><th>A</th><th>t0</th><th>sigma</th></tr></thead>
            <tbody>
              {syntheticParams.components.map((component, index) => (
                <tr key={`cmp-${index}`}>
                  <td>{index + 1}</td>
                  <td><input type="number" step="0.01" value={component.A} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, components: prev.components.map((item, itemIndex) => (itemIndex === index ? { ...item, A: toNumber(event.target.value, item.A) } : item)) }))} /></td>
                  <td><input type="number" step="0.1" value={component.t0} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, components: prev.components.map((item, itemIndex) => (itemIndex === index ? { ...item, t0: toNumber(event.target.value, item.t0) } : item)) }))} /></td>
                  <td><input type="number" step="0.1" value={component.sigma} onChange={(event) => setSyntheticParams((prev) => ({ ...prev, components: prev.components.map((item, itemIndex) => (itemIndex === index ? { ...item, sigma: toNumber(event.target.value, item.sigma) } : item)) }))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.primaryButton} onClick={runStep1} disabled={isBusy || runtimeStatus !== 'ready'}>
            {runningStep === 'generate' ? 'Running step 1...' : 'Run step 1'}
          </button>
        </article>
        )}

        {showStep2 && (
        <article className={styles.card}>
          <h2>{compactEmbedded ? 'MOCCA-style peak detection' : 'Step 2: MOCCA-style peak detection'}</h2>
          {focusStep === 2 && <p className={styles.smallNote}>Uses a generated synthetic chromatogram if step 1 data is missing.</p>}
          <div className={styles.fieldGrid}>
            <label>Min height<input type="number" step="0.001" value={peakParams.minHeight} onChange={(event) => setPeakParams((prev) => ({ ...prev, minHeight: toNumber(event.target.value, prev.minHeight) }))} /></label>
            <label>Min rel height<input type="number" step="0.001" value={peakParams.minRelHeight} onChange={(event) => setPeakParams((prev) => ({ ...prev, minRelHeight: toNumber(event.target.value, prev.minRelHeight) }))} /></label>
            <label>Min rel area<input type="number" step="0.001" value={peakParams.minRelArea} onChange={(event) => setPeakParams((prev) => ({ ...prev, minRelArea: toNumber(event.target.value, prev.minRelArea) }))} /></label>
            <label>Min spacing<input type="number" step="0.1" min={0} value={peakParams.minSpacing} onChange={(event) => setPeakParams((prev) => ({ ...prev, minSpacing: toNumber(event.target.value, prev.minSpacing) }))} /></label>
          </div>
          <button
            className={styles.primaryButton}
            onClick={runStep2}
            disabled={isBusy || runtimeStatus !== 'ready' || (focusStep === 'all' && !syntheticResult)}
          >
            {runningStep === 'detect' ? 'Running step 2...' : 'Run step 2'}
          </button>
          {peakResult && (
            <p className={styles.smallNote}>
              {peakResult.seedIdx.length} seed peaks, {peakResult.kept.length} kept. Red points mark <i>t</i><sub>0,i</sub> centers used as fit seeds.
            </p>
          )}
        </article>
        )}

        {showStep3 && (
        <article className={styles.card}>
          <h2>{compactEmbedded ? 'Multi-Gaussian fit' : 'Step 3: Multi-Gaussian fit'}</h2>
          {focusStep === 3 && <p className={styles.smallNote}>Auto-runs missing prerequisites (step 1 and step 2) with current parameters.</p>}
          <div className={styles.fieldGrid}>
            <label>Min sigma<input type="number" step="0.1" value={fitParams.minSigma} onChange={(event) => setFitParams((prev) => ({ ...prev, minSigma: toNumber(event.target.value, prev.minSigma) }))} /></label>
            <label>Max sigma<input type="number" step="0.1" value={fitParams.maxSigma} onChange={(event) => setFitParams((prev) => ({ ...prev, maxSigma: toNumber(event.target.value, prev.maxSigma) }))} /></label>
            <label>Target R2<input type="number" step="0.0001" min={0} max={0.999999} value={fitParams.targetR2} onChange={(event) => setFitParams((prev) => ({ ...prev, targetR2: toNumber(event.target.value, prev.targetR2) }))} /></label>
            <label>Min R2 gain<input type="number" step="0.0001" min={0} max={0.1} value={fitParams.minR2Gain} onChange={(event) => setFitParams((prev) => ({ ...prev, minR2Gain: toNumber(event.target.value, prev.minR2Gain) }))} /></label>
            <label>Max iterations<input type="number" step="1000" value={fitParams.maxIterations} onChange={(event) => setFitParams((prev) => ({ ...prev, maxIterations: toNumber(event.target.value, prev.maxIterations) }))} /></label>
          </div>
          <p className={styles.smallNote}>
            Initialization uses fixed <i>&sigma;</i><sub>0</sub> = 1.0 for each component (clipped to the min/max sigma bounds).
          </p>
          <button
            className={styles.primaryButton}
            onClick={runStep3}
            disabled={isBusy || runtimeStatus !== 'ready' || (focusStep === 'all' && (!peakResult || peakResult.peakGuesses.length === 0))}
          >
            {runningStep === 'fit' ? 'Running step 3...' : 'Run step 3'}
          </button>
          {fitResult && (
            <p className={styles.smallNote}>
              R2 = {fitResult.r2.toFixed(4)} (target {fitResult.targetR2.toFixed(4)}), min gain {fitResult.minR2Gain.toFixed(4)}, selected {fitResult.components.length} component(s).
            </p>
          )}
        </article>
        )}
      </div>

      {showStep1 && syntheticResult && <LinePlot title="Step 1 output" x={syntheticResult.t} lines={syntheticLines} xLabel="Time" yLabel="Signal" />}
      {showStep2 && syntheticResult && peakResult && <LinePlot title="Step 2 output" x={syntheticResult.t} lines={detectionLines} xLabel="Time" yLabel="Signal" />}
      {showStep3 && syntheticResult && fitResult && <LinePlot title="Step 3 output" x={syntheticResult.t} lines={fitLines} xLabel="Time" yLabel="Signal" />}

      {showStep2 && peakResult && (
        <div className={styles.card}>
          <h3>Detected peak guesses</h3>
          <table className={styles.table}>
            <thead><tr><th>#</th><th>A_i</th><th>t0_i</th></tr></thead>
            <tbody>
              {peakResult.peakGuesses.map((guess, index) => (
                <tr key={`guess-${index}`}>
                  <td>{index + 1}</td>
                  <td>{guess.A_i.toFixed(4)}</td>
                  <td>{guess.t0_i.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showStep3 && fitResult && (
        <div className={styles.card}>
          <h3>Fitted components</h3>
          <table className={styles.table}>
            <thead><tr><th>#</th><th>A_i</th><th>t0_i</th><th>sigma_i</th></tr></thead>
            <tbody>
              {fitResult.components.map((component, index) => (
                <tr key={`fit-${index}`}>
                  <td>{index + 1}</td>
                  <td>{component.A_i.toFixed(4)}</td>
                  <td>{component.t0_i.toFixed(3)}</td>
                  <td>{component.sigma_i.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PeakFindingPlayground;
