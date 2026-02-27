
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    const confirmed = window.confirm('检测到新版本，是否立即刷新以更新到最新版？');
    if (confirmed) {
      void updateSW(true);
    }
  },
  onOfflineReady() {
    console.info('[PWA] App is ready for offline usage.');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
