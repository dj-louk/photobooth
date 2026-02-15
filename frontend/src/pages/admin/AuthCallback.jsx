import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found');
          navigate('/admin/login', { replace: true });
          return;
        }

        // Exchange session_id for user data
        const userData = await authApi.exchangeSession(sessionId);

        // Clear the hash from URL and navigate to dashboard
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/admin/dashboard', { 
          replace: true, 
          state: { user: userData } 
        });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/admin/login', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
