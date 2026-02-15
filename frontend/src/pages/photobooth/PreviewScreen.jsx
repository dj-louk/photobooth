import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PreviewScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { event, settings, groupData, photos } = location.state || {};

  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const handleRetake = () => {
    navigate('/photobooth/capture', {
      state: { event, settings, groupData }
    });
  };

  const handleConfirm = () => {
    navigate('/photobooth/processing', {
      state: { event, settings, groupData, photos }
    });
  };

  const handleCancel = () => {
    navigate('/photobooth');
  };

  if (!photos || photos.length === 0) {
    navigate('/photobooth');
    return null;
  }

  return (
    <div className="min-h-screen kiosk-mode relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1633786207050-e1e183d06217?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMG5lb24lMjBwdXJwbGUlMjBibHVlJTIwZ3JhZGllbnQlMjBiYWNrZ3JvdW5kJTIwdGVjaG5vfGVufDB8fHx8MTc3MTE4MDgxM3ww&ixlib=rb-4.1.0&q=85')`
        }}
      />
      <div className="absolute inset-0 bg-black/80" />

      {/* Cancel Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-8 right-8 z-20"
      >
        <Button
          data-testid="cancel-preview-btn"
          variant="ghost"
          onClick={handleCancel}
          className="text-white hover:bg-white/10 rounded-full w-14 h-14"
        >
          <X className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-12">
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-white text-center mb-8"
        >
          Aperçu de vos photos
        </motion.h2>

        {/* Main Photo Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="w-[600px] h-[400px] rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
            <img 
              src={photos[selectedPhoto]} 
              alt={`Photo ${selectedPhoto + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Photo Number Badge */}
          <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full">
            <span className="text-white font-bold">
              {selectedPhoto + 1} / {photos.length}
            </span>
          </div>
        </motion.div>

        {/* Thumbnail Strip */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 mb-12"
        >
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedPhoto(index)}
              className={`w-24 h-24 rounded-xl overflow-hidden border-4 transition-all duration-200 ${
                index === selectedPhoto 
                  ? 'border-primary scale-110 shadow-lg' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <img 
                src={photo} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-6"
        >
          <Button
            data-testid="retake-btn"
            onClick={handleRetake}
            variant="outline"
            className="h-16 px-8 text-lg font-bold rounded-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Reprendre
          </Button>
          
          <Button
            data-testid="confirm-btn"
            onClick={handleConfirm}
            className="h-16 px-12 text-lg font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg active:scale-95 transition-all"
          >
            <Check className="w-6 h-6 mr-2" />
            Confirmer
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PreviewScreen;
