import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@layouts/MainLayout/MainLayout';
import Home from '@pages/Home/Home';
import About from '@pages/About/About';
import Projects from '@pages/Projects/Projects';
import Blog from '@pages/Blog/Blog';
import BlogPost from '@pages/Blog/BlogPost';
import Contact from '@pages/Contact/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
