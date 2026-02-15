import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const GroupNameScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { event, settings } = location.state || {};

  const [groupName, setGroupName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!groupName.trim()) {
      setError('Veuillez entrer le nom de votre groupe');
      return;
    }

    if (settings?.require_consent && !consent) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    navigate('/photobooth/capture', {
      state: {
        event,
        settings,
        groupData: {
          name: groupName.trim(),
          email: email.trim() || null,
          consent
        }
      }
    });
  };

  const handleBack = () => {
    navigate('/photobooth');
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
      <div className="absolute inset-0 bg-black/70" />

      {/* Back Button */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-8 left-8 z-20"
      >
        <Button
          data-testid="back-btn"
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Retour
        </Button>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg glass-strong rounded-3xl p-10 border border-white/10"
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Nom de votre groupe
          </h2>
          <p className="text-white/60 text-center mb-8">
            Entrez un nom pour retrouver vos photos facilement
          </p>

          {/* Form */}
          <div className="space-y-6">
            {/* Group Name */}
            <div>
              <Label htmlFor="groupName" className="text-white/80 text-lg">
                Nom du groupe *
              </Label>
              <Input
                id="groupName"
                data-testid="group-name-input"
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setError('');
                }}
                placeholder="Ex: Les amis de Pierre"
                className="mt-2 h-16 text-xl text-center bg-black/50 border-2 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <Label htmlFor="email" className="text-white/80 text-lg">
                Email (optionnel)
              </Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Pour recevoir vos photos"
                className="mt-2 h-14 text-lg text-center bg-black/50 border-2 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>

            {/* Consent */}
            {settings?.require_consent && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                <Checkbox
                  id="consent"
                  data-testid="consent-checkbox"
                  checked={consent}
                  onCheckedChange={setConsent}
                  className="mt-1 w-6 h-6 border-2 border-white/40"
                />
                <Label htmlFor="consent" className="text-white/70 text-sm leading-relaxed cursor-pointer">
                  J'accepte que mes photos soient prises et partagées dans le cadre de cet événement.
                </Label>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Continue Button */}
            <Button
              data-testid="continue-btn"
              onClick={handleContinue}
              className="w-full h-16 text-xl font-bold rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white shadow-lg active:scale-95 transition-all duration-200"
            >
              Continuer
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GroupNameScreen;
