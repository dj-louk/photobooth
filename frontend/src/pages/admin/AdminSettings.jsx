import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Camera, Users, Settings, Calendar, LogOut,
  Image, Volume2, Mail, Shield, Palette, Cloud, Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { settingsApi } from '@/lib/api';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Paramètres enregistrés');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

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
            <Button variant="ghost" className="w-full justify-start">
              <Users className="w-5 h-5 mr-3" />
              Groupes
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="secondary" className="w-full justify-start">
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
            <h2 className="text-3xl font-bold">Paramètres</h2>
            <p className="text-muted-foreground">Configurez votre photobooth</p>
          </div>
          <Button data-testid="save-settings-btn" onClick={handleSave} disabled={saving}>
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="photos">
              <Image className="w-4 h-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="interface">
              <Palette className="w-4 h-4 mr-2" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="sound">
              <Volume2 className="w-4 h-4 mr-2" />
              Sons
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres photos</CardTitle>
                <CardDescription>Configurez la prise de photos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Nombre de photos par session</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.photo_count]}
                      onValueChange={([value]) => updateSetting('photo_count', value)}
                      min={1}
                      max={6}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold">{settings.photo_count}</span>
                  </div>
                </div>

                <div>
                  <Label>Délai entre les photos (secondes)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.delay_between_photos]}
                      onValueChange={([value]) => updateSetting('delay_between_photos', value)}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold">{settings.delay_between_photos}s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer GIF animé</Label>
                    <p className="text-sm text-muted-foreground">
                      Créer un GIF avec toutes les photos
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_gif}
                    onCheckedChange={(value) => updateSetting('enable_gif', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer les filtres</Label>
                    <p className="text-sm text-muted-foreground">
                      Proposer des filtres photo
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_filters}
                    onCheckedChange={(value) => updateSetting('enable_filters', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interface Tab */}
          <TabsContent value="interface">
            <Card>
              <CardHeader>
                <CardTitle>Interface utilisateur</CardTitle>
                <CardDescription>Personnalisez l'apparence du photobooth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="welcomeMessage">Message d'accueil</Label>
                  <Input
                    id="welcomeMessage"
                    value={settings.welcome_message}
                    onChange={(e) => updateSetting('welcome_message', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="endMessage">Message de fin</Label>
                  <Input
                    id="endMessage"
                    value={settings.end_message}
                    onChange={(e) => updateSetting('end_message', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Thème du photobooth</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => updateSetting('theme', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Sombre (Club)</SelectItem>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="louk-party">LOUK Party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hashtag">Hashtag personnalisé</Label>
                  <Input
                    id="hashtag"
                    value={settings.hashtag}
                    onChange={(e) => updateSetting('hashtag', e.target.value)}
                    className="mt-2"
                    placeholder="#MonEvenement"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sound Tab */}
          <TabsContent value="sound">
            <Card>
              <CardHeader>
                <CardTitle>Sons et audio</CardTitle>
                <CardDescription>Gérez les effets sonores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer les sons</Label>
                    <p className="text-sm text-muted-foreground">
                      Sons du compte à rebours et de capture
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_sounds}
                    onCheckedChange={(value) => updateSetting('enable_sounds', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Configuration email</CardTitle>
                <CardDescription>Paramètres d'envoi des photos par email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer l'envoi par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux invités d'envoyer leurs photos
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_email}
                    onCheckedChange={(value) => updateSetting('enable_email', value)}
                  />
                </div>

                <div>
                  <Label htmlFor="emailText">Texte de l'email</Label>
                  <Textarea
                    id="emailText"
                    value={settings.email_text}
                    onChange={(e) => updateSetting('email_text', e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité et confidentialité</CardTitle>
                <CardDescription>Gérez les paramètres de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Consentement obligatoire</Label>
                    <p className="text-sm text-muted-foreground">
                      Demander l'accord avant la prise de photos
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_consent}
                    onCheckedChange={(value) => updateSetting('require_consent', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modération des photos</Label>
                    <p className="text-sm text-muted-foreground">
                      Vérifier les photos avant publication
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_moderation}
                    onCheckedChange={(value) => updateSetting('enable_moderation', value)}
                  />
                </div>

                <div>
                  <Label>Masquer les groupes après (minutes)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.hide_group_after_minutes]}
                      onValueChange={([value]) => updateSetting('hide_group_after_minutes', value)}
                      min={30}
                      max={180}
                      step={15}
                      className="flex-1"
                    />
                    <span className="w-16 text-center font-bold">{settings.hide_group_after_minutes}min</span>
                  </div>
                </div>

                <div>
                  <Label>Suppression auto après (jours)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={[settings.auto_delete_days]}
                      onValueChange={([value]) => updateSetting('auto_delete_days', value)}
                      min={7}
                      max={90}
                      step={7}
                      className="flex-1"
                    />
                    <span className="w-16 text-center font-bold">{settings.auto_delete_days}j</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;
