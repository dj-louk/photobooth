import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Camera, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { groupsApi, photosApi } from '@/lib/api';
import { toast } from 'sonner';

const PublicGallery = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photo) => {
    const link = document.createElement('a');
    link.href = photo.data;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await groupsApi.incrementDownload(groupId);
    toast.success('Photo téléchargée !');
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
      }, index * 300);
    });

    await groupsApi.incrementDownload(groupId);
    toast.success('Toutes les photos téléchargées !');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photos - ${group?.name}`,
          text: 'Regarde nos photos du photobooth DJ LOUK !',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Camera className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">Chargement de vos photos...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Groupe non trouvé</h1>
          <p className="text-muted-foreground">
            Ce lien n'est plus valide ou le groupe a été supprimé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">DJ LOUK</h1>
                <p className="text-xs text-muted-foreground">Photobooth</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-1" />
                Partager
              </Button>
              <Button size="sm" onClick={handleDownloadAll}>
                <Download className="w-4 h-4 mr-1" />
                Tout télécharger
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Group Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">{group.name}</h2>
          <p className="text-muted-foreground">
            {photos.length} photo{photos.length > 1 ? 's' : ''} • 
            {new Date(group.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </motion.div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.photo_id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="overflow-hidden group cursor-pointer" onClick={() => handleDownload(photo)}>
                <div className="aspect-video relative">
                  <img
                    src={photo.data}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white">
                      <Download className="w-6 h-6" />
                      <span className="font-medium">Télécharger</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucune photo dans ce groupe
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Photos prises avec le Photobooth DJ LOUK
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicGallery;
