import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Camera, Users, Settings, Calendar, LogOut,
  Plus, Edit, Trash2, Power, PowerOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { eventsApi } from '@/lib/api';
import { toast } from 'sonner';

const AdminEvents = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEventName, setNewEventName] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }

    try {
      await eventsApi.create({ name: newEventName.trim() });
      toast.success('Événement créé');
      setNewEventName('');
      setDialogOpen(false);
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      await eventsApi.update(editingEvent.event_id, { name: editingEvent.name });
      toast.success('Événement mis à jour');
      setEditingEvent(null);
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleToggleActive = async (event) => {
    try {
      await eventsApi.update(event.event_id, { is_active: !event.is_active });
      toast.success(event.is_active ? 'Événement désactivé' : 'Événement activé');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventsApi.delete(eventId);
      toast.success('Événement supprimé');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

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
            <Button variant="secondary" className="w-full justify-start">
              <Calendar className="w-5 h-5 mr-3" />
              Événements
            </Button>
          </Link>
          <Link to="/admin/groups">
            <Button variant="ghost" className="w-full justify-start">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Événements</h2>
            <p className="text-muted-foreground">Gérez vos événements photobooth</p>
          </div>

          {/* Create Event Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-event-btn">
                <Plus className="w-5 h-5 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un événement</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="eventName">Nom de l'événement</Label>
                <Input
                  id="eventName"
                  data-testid="event-name-input"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Ex: Mariage Pierre & Marie"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button data-testid="confirm-create-btn" onClick={handleCreateEvent}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.div
              key={event.event_id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        event.is_active 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{event.name}</h3>
                          {event.is_active && (
                            <Badge className="bg-green-500">Actif</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Créé le {new Date(event.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle Active */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleActive(event)}
                        data-testid={`toggle-event-${event.event_id}`}
                      >
                        {event.is_active ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Edit */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingEvent({ ...event })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier l'événement</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="editEventName">Nom de l'événement</Label>
                            <Input
                              id="editEventName"
                              value={editingEvent?.name || ''}
                              onChange={(e) => setEditingEvent({ 
                                ...editingEvent, 
                                name: e.target.value 
                              })}
                              className="mt-2"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingEvent(null)}>
                              Annuler
                            </Button>
                            <Button onClick={handleUpdateEvent}>
                              Enregistrer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'événement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action supprimera définitivement l'événement "{event.name}" ainsi que tous les groupes et photos associés.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(event.event_id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {events.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">Aucun événement</h3>
              <p className="text-muted-foreground">
                Créez votre premier événement pour commencer
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEvents;
