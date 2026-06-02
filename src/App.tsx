import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from '@layouts/MainLayout/MainLayout';
import Home from '@pages/Home/Home';

const ProjectsAndPosts = lazy(() => import('@pages/ProjectsAndPosts/ProjectsAndPosts'));
const BlogPost = lazy(() => import('@pages/Blog/BlogPost'));
const BioinformaticToolbox = lazy(() => import('@pages/BioinformaticToolbox/BioinformaticToolbox'));
const Books = lazy(() => import('@pages/Books/Books'));
const BookDetail = lazy(() => import('@pages/Books/BookDetail'));
const NotFound = lazy(() => import('@pages/NotFound/NotFound'));

const routeFallback = <div style={{ padding: '2rem' }}>Loading...</div>;

const ScrollToAnchor = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = hash.slice(1);
    const timeout = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [hash, pathname]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToAnchor />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Navigate to="/#about" replace />} />
          <Route path="/projects-and-posts" element={<Suspense fallback={routeFallback}><ProjectsAndPosts /></Suspense>} />
          <Route path="/books" element={<Suspense fallback={routeFallback}><Books /></Suspense>} />
          <Route path="/books/:slug" element={<Suspense fallback={routeFallback}><BookDetail /></Suspense>} />
          <Route path="/projects/bioinformatic-toolbox" element={<Suspense fallback={routeFallback}><BioinformaticToolbox /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={routeFallback}><BlogPost /></Suspense>} />
          <Route path="*" element={<Suspense fallback={routeFallback}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
