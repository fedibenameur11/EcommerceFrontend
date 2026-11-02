import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import App from './App';
import { NotificationProvider } from '@/context/NotificationContext';
import './index.css';

/**
 * Application entry point
 * Wraps App with Redux Provider and StrictMode
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </Provider>
  </StrictMode>
);
