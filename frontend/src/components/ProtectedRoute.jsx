import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If user passed from AuthCallback via state, use it directly
    if (location.state?.user) {
      setIsChecking(false);
      return;
    }

    const verify = async () => {
      const userData = await checkAuth();
      if (!userData) {
        navigate('/admin/login', { replace: true });
      }
      setIsChecking(false);
    };

    if (!isLoading) {
      if (!user) {
        verify();
      } else {
        setIsChecking(false);
      }
    }
  }, [user, isLoading, checkAuth, navigate, location.state]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!user && !location.state?.user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
