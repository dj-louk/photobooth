import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, Mail, QrCode, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { groupsApi, photosApi } from '@/lib/api';
import { toast } from 'sonner';

const StationGallery = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadData();
  }, [groupId]);

  useEffect(() => {
  loadGroups();
}, [loadGroups]); // ajout de loadGroups


  const loadData = async () => {
    try {
      const [groupData, photosData] = await Promise.all([
        groupsApi.getById(groupId),
        photosApi.getByGroup(groupId)
      ]);
      setGroup(groupData);
      setPhotos(photosData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Groupe non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photo) => {
    // Create download link
    const link = document.createElement('a');
    link.href = photo.data;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increment download count
    await groupsApi.incrementDownload(groupId);
    toast.success('Photo téléchargée');
  };

  const handleDownloadAll = async () => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.data;
        link.download = photo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });

    await groupsApi.incrementDownload(groupId);
    toast.success('Toutes les photos téléchargées');
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }
    
    // Note: Email functionality would require Mailgun integration
    toast.info('Fonctionnalité email à configurer avec Mailgun');
    setEmailDialogOpen(false);
  };

  const qrUrl = `${window.location.origin}/gallery/${groupId}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Groupe non trouvé</p>
          <Button onClick={() => navigate('/station')}>
            Retour à la recherche
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/station')}
          data-testid="back-to-search-btn"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </Button>

        <div className="flex gap-4">
          {/* QR Code Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="show-qr-btn">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scannez pour accéder à vos photos</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG value={qrUrl} size={200} level="H" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Scannez ce QR code avec votre téléphone pour accéder à vos photos
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Email Dialog */}
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="send-email-btn">
                <Mail className="w-5 h-5 mr-2" />
                Envoyer par email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Envoyer les photos par email</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSendEmail}>
                  Envoyer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleDownloadAll} data-testid="download-all-btn">
            <Download className="w-5 h-5 mr-2" />
            Tout télécharger
          </Button>
        </div>
      </motion.div>

      {/* Group Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
        <p className="text-muted-foreground">
          {photos.length} photo{photos.length > 1 ? 's' : ''} • 
          {new Date(group.created_at).toLocaleString('fr-FR')}
        </p>
      </motion.div>

      {/* Photos Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.photo_id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="overflow-hidden group">
                <div className="aspect-video relative">
                  <img
                    src={photo.data}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleDownload(photo)}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucune photo dans ce groupe
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StationGallery;
