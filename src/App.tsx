import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@layouts/MainLayout/MainLayout';
import Home from '@pages/Home/Home';

const ProjectsAndPosts = lazy(() => import('@pages/ProjectsAndPosts/ProjectsAndPosts'));
const BlogPost = lazy(() => import('@pages/Blog/BlogPost'));
const BioinformaticToolbox = lazy(() => import('@pages/BioinformaticToolbox/BioinformaticToolbox'));
const Books = lazy(() => import('@pages/Books/Books'));
const BookDetail = lazy(() => import('@pages/Books/BookDetail'));

const routeFallback = <div style={{ padding: '2rem' }}>Loading...</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects-and-posts" element={<Suspense fallback={routeFallback}><ProjectsAndPosts /></Suspense>} />
          <Route path="/books" element={<Suspense fallback={routeFallback}><Books /></Suspense>} />
          <Route path="/books/:slug" element={<Suspense fallback={routeFallback}><BookDetail /></Suspense>} />
          <Route path="/projects/bioinformatic-toolbox" element={<Suspense fallback={routeFallback}><BioinformaticToolbox /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={routeFallback}><BlogPost /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
