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
import SimulatorPage from './pages/SimulatorPage';
import SandboxPage from './pages/SandboxPage';
import SimulatorResultPage from './pages/SimulatorResultPage';
import Stage3Page from './pages/Stage3Page';
import ManagerDashboard from './pages/ManagerDashboard';
import { useAppStore } from './store/appStore';
import { useEffect } from 'react';

export default function App() {
  const loadAppData = useAppStore(state => state.loadAppData);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tests" element={<Tests />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="simulator/result" element={<SimulatorResultPage />} />
          <Route path="sandbox/:taskId" element={<SandboxPage />} />
          <Route path="stage3" element={<Stage3Page />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

