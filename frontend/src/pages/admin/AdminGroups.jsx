import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Camera, Users, Settings, Calendar, LogOut,
  Search, Trash2, Download, QrCode, RefreshCw, Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { groupsApi, eventsApi, photosApi } from '@/lib/api';
import { toast } from 'sonner';

const AdminGroups = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupPhotos, setGroupPhotos] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadGroups();
  }, [selectedEvent]);

  useEffect(() => {
  loadGroups();
}, [loadGroups]); // ajout de loadGroups


  const loadData = async () => {
    try {
      const eventsData = await eventsApi.getAll();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadGroups = async () => {
    setLoading(true);
    try {
      const eventId = selectedEvent === 'all' ? null : selectedEvent;
      const data = await groupsApi.getAll(eventId);
      setGroups(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGroups();
      return;
    }

    try {
      const eventId = selectedEvent === 'all' ? null : selectedEvent;
      const data = await groupsApi.search(searchQuery, eventId);
      setGroups(data);
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    }
  };

  const handleViewPhotos = async (group) => {
    setSelectedGroup(group);
    try {
      const photos = await photosApi.getByGroup(group.group_id);
      setGroupPhotos(photos);
    } catch (error) {
      toast.error('Erreur lors du chargement des photos');
    }
  };

  const handleRegenerateQR = async (groupId) => {
    try {
      await groupsApi.regenerateQr(groupId);
      toast.success('QR Code régénéré');
      loadGroups();
    } catch (error) {
      toast.error('Erreur lors de la régénération');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupsApi.delete(groupId);
      toast.success('Groupe supprimé');
      loadGroups();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const filteredGroups = groups.filter(group => 
    searchQuery ? group.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 z-40">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">DJ LOUK</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link to="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/events">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="w-5 h-5 mr-3" />
              Événements
            </Button>
          </Link>
          <Link to="/admin/groups">
            <Button variant="secondary" className="w-full justify-start">
              <Users className="w-5 h-5 mr-3" />
              Groupes
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-5 h-5 mr-3" />
              Paramètres
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-24 left-6 right-6">
          <p className="text-sm text-muted-foreground mb-2">Thème</p>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Sombre (Club)</SelectItem>
              <SelectItem value="light">Clair</SelectItem>
              <SelectItem value="louk-party">LOUK Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 mb-4">
            {user?.picture && (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Groupes</h2>
          <p className="text-muted-foreground">Gérez les groupes de photos</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-testid="search-groups-input"
                    placeholder="Rechercher un groupe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Tous les événements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.event_id} value={event.event_id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Groups Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du groupe</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Téléchargements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.group_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{group.name}</p>
                        {group.email && (
                          <p className="text-sm text-muted-foreground">{group.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(group.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{group.photo_count}</Badge>
                    </TableCell>
                    <TableCell>{group.download_count}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* View Photos */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewPhotos(group)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Photos - {selectedGroup?.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {groupPhotos.map((photo, index) => (
                                <div key={photo.photo_id} className="aspect-video rounded-lg overflow-hidden">
                                  <img
                                    src={photo.data}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* View QR */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <QrCode className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>QR Code - {group.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center py-6">
                              {group.qr_code && (
                                <img
                                  src={`data:image/png;base64,${group.qr_code}`}
                                  alt="QR Code"
                                  className="w-64 h-64"
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Regenerate QR */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRegenerateQR(group.group_id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le groupe ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement le groupe "{group.name}" et toutes ses photos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGroup(group.group_id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredGroups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun groupe trouvé</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminGroups;
