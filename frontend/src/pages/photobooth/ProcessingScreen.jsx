import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Loader2, QrCode, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { groupsApi, photosApi } from '@/lib/api';

const ProcessingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { event, settings, groupData, photos } = location.state || {};

  const [status, setStatus] = useState('processing'); // processing, success, error
  const [group, setGroup] = useState(null);
  const [error, setError] = useState('');
  
  // Prevent double execution
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const processPhotos = async () => {
      if (!event || !groupData || !photos) {
        setError('Données manquantes');
        setStatus('error');
        return;
      }

      try {
        // Create group
        const createdGroup = await groupsApi.create({
          event_id: event.event_id,
          name: groupData.name,
          email: groupData.email,
          consent: groupData.consent
        });

        // Upload photos
        await photosApi.uploadBatch(createdGroup.group_id, photos);

        setGroup(createdGroup);
        setStatus('success');
      } catch (err) {
        console.error('Processing error:', err);
        setError(err.message || 'Une erreur est survenue');
        setStatus('error');
      }
    };

    processPhotos();
  }, [event, groupData, photos]);

  const handleNewSession = () => {
    navigate('/photobooth');
  };

  const qrUrl = group ? `${window.location.origin}/gallery/${group.group_id}` : '';

  return (
    <div className="min-h-screen kiosk-mode relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1758117169154-ba6ffd8f51ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5lb24lMjBwdXJwbGUlMjBibHVlJTIwZ3JhZGllbnQlMjBiYWNrZ3JvdW5kJTIwdGVjaG5vfGVufDB8fHx8MTc3MTE4MDgxM3ww&ixlib=rb-4.1.0&q=85')`
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Processing State */}
        {status === 'processing' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8">
              <Loader2 className="w-24 h-24 text-primary animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Traitement en cours...
            </h2>
            <p className="text-xl text-white/70">
              Vos photos sont en cours d'enregistrement
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && group && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Check className="w-14 h-14 text-white" />
            </motion.div>

            {/* Message */}
            <h2 className="text-4xl font-bold text-white mb-4 neon-text">
              {settings?.end_message || 'Merci !'}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Vos photos sont prêtes à être récupérées à la station de partage.
            </p>

            {/* Group Name */}
            <div className="glass-strong rounded-2xl p-6 mb-8 inline-block">
              <p className="text-white/60 text-sm mb-2">Votre groupe</p>
              <p className="text-2xl font-bold text-white">{groupData?.name}</p>
            </div>

            {/* QR Code */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-strong rounded-3xl p-8 mb-8"
            >
              <div className="flex items-center gap-3 mb-6 justify-center">
                <QrCode className="w-6 h-6 text-primary" />
                <p className="text-white font-medium">
                  Scannez pour accéder à vos photos
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl inline-block">
                <QRCodeSVG 
                  value={qrUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </motion.div>

            {/* New Session Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                data-testid="new-session-btn"
                onClick={handleNewSession}
                className="h-16 px-10 text-lg font-bold rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white shadow-lg active:scale-95 transition-all"
              >
                <Home className="w-6 h-6 mr-2" />
                Nouvelle session
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-5xl text-white">!</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Oups, une erreur s'est produite
            </h2>
            <p className="text-xl text-white/70 mb-8">
              {error}
            </p>
            <Button
              data-testid="retry-btn"
              onClick={handleNewSession}
              className="h-16 px-10 text-lg font-bold rounded-full bg-primary text-white"
            >
              Recommencer
            </Button>
          </motion.div>
        )}

        {/* Auto Return Timer */}
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-white/50 text-sm"
          >
            Retour automatique dans 60 secondes
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default ProcessingScreen;
