import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PhotoSequenceScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { event, settings, groupData } = location.state || {};

  const [phase, setPhase] = useState('ready'); // ready, countdown, capture, delay, done
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showFlash, setShowFlash] = useState(false);

  const totalPhotos = settings?.photo_count || 3;
  const delayBetween = settings?.delay_between_photos || 2;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera error:', error);
      }
    };
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Flip horizontally for mirror effect
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  // Photo sequence logic
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Take photo
        setPhase('capture');
        setShowFlash(true);
        
        const photoData = capturePhoto();
        if (photoData) {
          setCapturedPhotos(prev => [...prev, photoData]);
        }
        
        setTimeout(() => setShowFlash(false), 300);
        
        const nextPhoto = currentPhoto + 1;
        if (nextPhoto < totalPhotos) {
          // More photos to take
          setTimeout(() => {
            setCurrentPhoto(nextPhoto);
            setCountdown(3);
            setPhase('countdown');
          }, delayBetween * 1000);
        } else {
          // All photos taken
          setPhase('done');
        }
      }
    }
  }, [phase, countdown, currentPhoto, totalPhotos, delayBetween, capturePhoto]);

  // Navigate when done
  useEffect(() => {
    if (phase === 'done' && capturedPhotos.length === totalPhotos) {
      setTimeout(() => {
        navigate('/photobooth/preview', {
          state: {
            event,
            settings,
            groupData,
            photos: capturedPhotos
          }
        });
      }, 1000);
    }
  }, [phase, capturedPhotos, totalPhotos, navigate, event, settings, groupData]);

  const handleStart = () => {
    setPhase('countdown');
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/photobooth');
  };

  return (
    <div className="min-h-screen kiosk-mode relative overflow-hidden bg-black">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Flash Effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50"
          />
        )}
      </AnimatePresence>

      {/* Cancel Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-8 right-8 z-20"
      >
        <Button
          data-testid="cancel-btn"
          variant="ghost"
          onClick={handleCancel}
          className="text-white hover:bg-white/10 rounded-full w-14 h-14"
        >
          <X className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Photo Counter */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-8 z-20"
      >
        <div className="glass px-6 py-3 rounded-full">
          <p className="text-white font-bold text-lg">
            Photo {Math.min(currentPhoto + 1, totalPhotos)} / {totalPhotos}
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Ready State */}
        {phase === 'ready' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-8 neon-text">
              Prêt pour la photo ?
            </h2>
            <p className="text-xl text-white/80 mb-12">
              {totalPhotos} photos seront prises automatiquement
            </p>
            <Button
              data-testid="start-capture-btn"
              onClick={handleStart}
              className="h-20 px-12 text-2xl font-bold rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white neon-glow active:scale-95 transition-transform"
            >
              <Camera className="w-8 h-8 mr-3" />
              Commencer
            </Button>
          </motion.div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && countdown > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <span className="countdown-font text-[200px] leading-none text-white neon-text">
                {countdown}
              </span>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Capture Moment */}
        {phase === 'capture' && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Camera className="w-24 h-24 text-white mx-auto animate-pulse" />
          </motion.div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white neon-text">
              Photos prises !
            </h2>
            <p className="text-xl text-white/80 mt-4">
              Préparation de l'aperçu...
            </p>
          </motion.div>
        )}
      </div>

      {/* Preview Thumbnails */}
      {capturedPhotos.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex gap-4">
            {capturedPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/30"
              >
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PhotoSequenceScreen;
