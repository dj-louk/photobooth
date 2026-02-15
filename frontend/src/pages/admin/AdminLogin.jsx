import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const AdminLogin = () => {
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = '/admin/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1758774019261-e11c8aadacb2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxkaiUyMHR1cm50YWJsZSUyMG1peGVyJTIwY2xvc2UlMjB1cCUyMGRhcmslMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcxMTgwODEzfDA&ixlib=rb-4.1.0&q=85')`
        }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-strong rounded-3xl p-10 border border-white/10"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center">
              <Camera className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            DJ LOUK
          </h1>
          <p className="text-white/60 text-center mb-8">
            Panel d'administration
          </p>

          {/* Google Login Button */}
          <Button
            data-testid="google-login-btn"
            onClick={login}
            className="w-full h-14 text-lg font-medium rounded-xl bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Se connecter avec Google
          </Button>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-white/20" />
            <span className="px-4 text-white/40 text-sm">Accès réservé</span>
            <div className="flex-1 border-t border-white/20" />
          </div>

          {/* Info */}
          <p className="text-white/50 text-center text-sm">
            Seuls les administrateurs autorisés peuvent accéder à ce panel.
          </p>
        </motion.div>

        {/* Back to Photobooth */}
        <motion.a
          href="/"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-white/60 hover:text-white transition-colors"
        >
          ← Retour au photobooth
        </motion.a>
      </div>
    </div>
  );
};

export default AdminLogin;
