import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import RecentPage from './pages/recent';
import Layout from './pages/layout';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="recent" element={<RecentPage />} />
          <Route path="template" element={<RecentPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);