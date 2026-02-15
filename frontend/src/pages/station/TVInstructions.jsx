import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Search, QrCode, Download } from 'lucide-react';
import { eventsApi } from '@/lib/api';

const TVInstructions = () => {
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await eventsApi.getActive();
        setActiveEvent(event);
      } catch (error) {
        console.error('Error loading event:', error);
      }
    };
    loadEvent();

    // Refresh every minute
    const interval = setInterval(loadEvent, 60000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: Search,
      title: "1. Trouvez votre groupe",
      description: "Recherchez le nom de votre groupe sur l'iPad"
    },
    {
      icon: QrCode,
      title: "2. Scannez le QR Code",
      description: "Utilisez votre téléphone pour scanner le code"
    },
    {
      icon: Download,
      title: "3. Téléchargez vos photos",
      description: "Récupérez toutes vos photos instantanément"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-12 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-6xl font-extrabold neon-text">DJ LOUK</h1>
        </div>
        
        {activeEvent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl text-primary font-medium"
          >
            {activeEvent.name}
          </motion.p>
        )}
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-20 relative z-10"
      >
        <h2 className="text-5xl font-bold mb-4">
          Récupérez vos photos
        </h2>
        <p className="text-2xl text-muted-foreground">
          Suivez ces étapes simples sur l'iPad à côté
        </p>
      </motion.div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.2 }}
              className="text-center"
            >
              <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-card border border-border flex items-center justify-center shadow-xl">
                <step.icon className="w-14 h-14 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-lg text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-0 right-0 text-center"
      >
        <p className="text-muted-foreground text-lg">
          Besoin d'aide ? Demandez à un membre de l'équipe
        </p>
      </motion.div>

      {/* Animated Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-primary/50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default TVInstructions;
