import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept all fetch calls starting with /api/ to allow a configurable backend URL
try {
  const baseUrl = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '');
  const isLocalhostPage = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isBaseUrlLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

  // Only apply custom VITE_API_URL if it's a valid remote URL or we are actually on localhost ourselves
  const shouldApplyBaseUrl = 
    baseUrl && 
    baseUrl !== 'undefined' && 
    baseUrl !== 'null' && 
    (baseUrl.startsWith('http://') || baseUrl.startsWith('https://') || baseUrl.startsWith('/')) &&
    (!isBaseUrlLocalhost || isLocalhostPage);

  if (shouldApplyBaseUrl) {
    console.log("[API Interceptor] Rewriting /api fetch requests to base URL:", baseUrl);
    const originalFetch = window.fetch.bind(window);
    const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
      let urlStr = '';
      if (typeof input === 'string') {
        urlStr = input;
      } else if (input instanceof URL) {
        urlStr = input.pathname;
      } else if (input && typeof input === 'object' && 'url' in input) {
        urlStr = (input as any).url;
      }

      if (urlStr.startsWith('/api/')) {
        if (typeof input === 'string') {
          return originalFetch(`${baseUrl}${input}`, init);
        } else if (input instanceof URL) {
          return originalFetch(new URL(`${baseUrl}${input.pathname}${input.search}`), init);
        } else {
          const newRequest = new Request(`${baseUrl}${urlStr}`, input as any);
          return originalFetch(newRequest, init);
        }
      }
      return originalFetch(input, init);
    };

    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
    });
  } else {
    console.log("[API Interceptor] Using relative paths for API endpoints.");
  }
} catch (error) {
  console.warn("Could not override window.fetch safely:", error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
