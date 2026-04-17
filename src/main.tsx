import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  const isDark = localStorage.getItem('66ai-theme') === 'dark';
  const bgColor = isDark ? '#0D1520' : '#EAE5DE';
  try { tg.setHeaderColor(bgColor); } catch {}
  try { tg.setBackgroundColor(bgColor); } catch {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
