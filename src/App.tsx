import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import MainLayout from '@layouts/MainLayout/MainLayout';
import Home from '@pages/Home/Home';

const About = lazy(() => import('@pages/About/About'));
const Projects = lazy(() => import('@pages/Projects/Projects'));
const Blog = lazy(() => import('@pages/Blog/Blog'));
const BlogPost = lazy(() => import('@pages/Blog/BlogPost'));
const Contact = lazy(() => import('@pages/Contact/Contact'));
const BioinformaticToolbox = lazy(() => import('@pages/BioinformaticToolbox/BioinformaticToolbox'));

const routeFallback = <div style={{ padding: '2rem' }}>Loading...</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Suspense fallback={routeFallback}><About /></Suspense>} />
          <Route path="/projects" element={<Suspense fallback={routeFallback}><Projects /></Suspense>} />
          <Route path="/work" element={<Navigate to="/projects" replace />} />
          <Route path="/projects/bioinformatic-toolbox" element={<Suspense fallback={routeFallback}><BioinformaticToolbox /></Suspense>} />
          <Route path="/projects/peak-finding" element={<Navigate to="/blog/peak-detection-deconvolution-overlapping-chromatograms" replace />} />
          <Route path="/blog" element={<Suspense fallback={routeFallback}><Blog /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={routeFallback}><BlogPost /></Suspense>} />
          <Route path="/playground/peak-finding" element={<Navigate to="/blog/peak-detection-deconvolution-overlapping-chromatograms" replace />} />
          <Route path="/contact" element={<Suspense fallback={routeFallback}><Contact /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
