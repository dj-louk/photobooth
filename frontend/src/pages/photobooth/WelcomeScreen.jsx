import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { settingsApi, eventsApi } from '@/lib/api';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [holdTimer, setHoldTimer] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, eventData] = await Promise.all([
          settingsApi.get(),
          eventsApi.getActive()
        ]);
        setSettings(settingsData);
        setActiveEvent(eventData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleStart = () => {
    if (!activeEvent) {
      alert('Aucun événement actif. Veuillez contacter l\'administrateur.');
      return;
    }
    navigate('/photobooth/group', { state: { event: activeEvent, settings } });
  };

  // Hidden admin access - hold in corner for 3 seconds
  const handleCornerHoldStart = () => {
    setHoldProgress(0);
    const timer = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate('/admin/login');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    setHoldTimer(timer);
  };

  const handleCornerHoldEnd = () => {
    if (holdTimer) {
      clearInterval(holdTimer);
      setHoldTimer(null);
      setHoldProgress(0);
    }
  };

  return (
    <div className="min-h-screen kiosk-mode relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1758117169154-ba6ffd8f51ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBwdXJwbGUlMjBibHVlJTIwZ3JhZGllbnQlMjBiYWNrZ3JvdW5kJTIwdGVjaG5vfGVufDB8fHx8MTc3MTE4MDgxM3ww&ixlib=rb-4.1.0&q=85')`
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Hidden Admin Access Corner */}
      <div
        className="absolute top-0 left-0 w-24 h-24 z-50"
        onMouseDown={handleCornerHoldStart}
        onMouseUp={handleCornerHoldEnd}
        onMouseLeave={handleCornerHoldEnd}
        onTouchStart={handleCornerHoldStart}
        onTouchEnd={handleCornerHoldEnd}
      >
        {holdProgress > 0 && (
          <div className="absolute bottom-2 right-2 w-8 h-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-white/20"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={88}
                strokeDashoffset={88 - (88 * holdProgress) / 100}
                className="text-primary transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
              <Camera className="w-16 h-16 text-white" />
            </div>
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold text-white text-center mb-4 neon-text"
        >
          DJ LOUK
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-2xl md:text-3xl text-white/90 text-center mb-16 font-light"
        >
          {settings?.welcome_message || 'Bienvenue au Photobooth'}
        </motion.p>

        {/* Active Event Badge */}
        {activeEvent && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mb-12 px-6 py-2 rounded-full glass border border-white/20"
          >
            <p className="text-white/80 text-lg">
              {activeEvent.name}
            </p>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button
            data-testid="start-photobooth-btn"
            onClick={handleStart}
            className="h-24 px-16 text-2xl font-bold rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-95 transition-all duration-200"
          >
            Touchez pour commencer
          </Button>
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 flex gap-3"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-white/50"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
