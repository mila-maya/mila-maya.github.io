import { useEffect, useRef, useState } from 'react';
import styles from './ProteinViewer3D.module.css';

declare global {
  interface Window {
    $3Dmol?: {
      createViewer: (element: HTMLElement, config?: Record<string, unknown>) => any;
    };
  }
}

interface ProteinViewer3DProps {
  pdbData: string;
  height?: number;
  backgroundColor?: string;
  spin?: boolean;
}

const THREE_DMOL_SCRIPT = 'https://3Dmol.org/build/3Dmol-min.js';
let scriptLoadPromise: Promise<void> | null = null;

function load3DmolScript(): Promise<void> {
  if (window.$3Dmol?.createViewer) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src=\"${THREE_DMOL_SCRIPT}\"]`);

    if (existing) {
      if (existing.dataset.loaded === 'true' || window.$3Dmol?.createViewer) {
        resolve();
        return;
      }

      existing.addEventListener(
        'load',
        () => {
          existing.dataset.loaded = 'true';
          resolve();
        },
        { once: true }
      );
      existing.addEventListener('error', () => reject(new Error('Failed to load 3Dmol script.')), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');
    script.src = THREE_DMOL_SCRIPT;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load 3Dmol script.'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

const ProteinViewer3D = ({
  pdbData,
  height = 320,
  backgroundColor = '#ffffff',
  spin = true
}: ProteinViewer3DProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const renderViewer = async () => {
      if (!containerRef.current || !pdbData.trim()) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await load3DmolScript();

        if (cancelled || !containerRef.current || !window.$3Dmol?.createViewer) {
          return;
        }

        const container = containerRef.current;
        container.innerHTML = '';

        const viewer = window.$3Dmol.createViewer(container, {
          backgroundColor
        });
        viewerRef.current = viewer;

        const model = viewer.addModel(pdbData, 'pdb');
        const atomCount = model?.selectedAtoms?.({})?.length ?? 0;

        if (atomCount === 0) {
          throw new Error('No atoms parsed from PDB data.');
        }

        viewer.setStyle({}, {
          cartoon: { colorscheme: 'spectrum' },
          stick: { radius: 0.18 }
        });
        viewer.zoomTo();
        viewer.render();
        viewer.resize();

        requestAnimationFrame(() => {
          if (cancelled || !viewerRef.current) {
            return;
          }

          viewerRef.current.resize();
          viewerRef.current.render();

          if (spin) {
            viewerRef.current.spin(true);
          }
        });

        resizeObserver = new ResizeObserver(() => {
          if (!viewerRef.current) {
            return;
          }

          viewerRef.current.resize();
          viewerRef.current.render();
        });
        resizeObserver.observe(container);
      } catch (viewerError) {
        const message = viewerError instanceof Error ? viewerError.message : 'Failed to render 3D view.';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    renderViewer();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();

      if (viewerRef.current) {
        try {
          viewerRef.current.spin(false);
          viewerRef.current.removeAllModels();
          viewerRef.current.render();
        } catch {
          // Best-effort cleanup.
        }
      }

      viewerRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [pdbData, height, backgroundColor, spin]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={containerRef}
        className={styles.viewer}
        style={{ height: `${height}px` }}
        aria-label="Interactive protein 3D viewer"
      />
      {loading && <p className={styles.info}>Rendering 3D structure...</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ProteinViewer3D;
