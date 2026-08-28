import '@/styles/globals.css';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useGmailStore from '@/store/gmailStore';
import useThemeStore from '@/store/themeStore';
import ToastContainer from '@/components/ui/ToastContainer';
import api from '@/services/api';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const setGmailStatus = useGmailStore((s) => s.setGmailStatus);
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    // Apply saved or system theme immediately
    initTheme();

    // Hydrate auth state from existing session cookie
    initAuth().then(() => {
      // After auth is confirmed, fetch Gmail status
      api
        .get('/gmail/status')
        .then((res) => {
          const { isConnected, email } = res.data.data;
          setGmailStatus({ isConnected, email });
        })
        .catch(() => {
          // Not connected or not authenticated — no action needed here
        });
    });
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
}

