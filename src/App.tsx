/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Tests from './pages/Tests';
import Reports from './pages/Reports';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tests" element={<Tests />} />
          <Route path="reports" element={<Reports />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

