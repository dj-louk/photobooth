import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Camera, Users, Settings, Image, LogOut,
  Calendar, TrendingUp, Clock, Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statsApi, eventsApi } from '@/lib/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await statsApi.get();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const statCards = [
    {
      title: 'Groupes total',
      value: stats?.total_groups || 0,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Photos prises',
      value: stats?.total_photos || 0,
      icon: Image,
      color: 'text-green-500'
    },
    {
      title: 'Téléchargements',
      value: stats?.total_downloads || 0,
      icon: Download,
      color: 'text-purple-500'
    },
    {
      title: 'Moy. photos/groupe',
      value: stats?.avg_photos_per_group || 0,
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">DJ LOUK</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="w-full justify-start">
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
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-5 h-5 mr-3" />
              Paramètres
            </Button>
          </Link>
        </nav>

        {/* Theme Selector */}
        <div className="absolute bottom-24 left-6 right-6">
          <p className="text-sm text-muted-foreground mb-2">Thème</p>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger data-testid="theme-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Sombre (Club)</SelectItem>
              <SelectItem value="light">Clair</SelectItem>
              <SelectItem value="louk-party">LOUK Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User & Logout */}
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
          <Button 
            data-testid="logout-btn"
            variant="outline" 
            onClick={handleLogout} 
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Vue d'ensemble du photobooth</p>
        </div>

        {/* Active Event Banner */}
        {stats?.active_event && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary font-medium mb-1">Événement actif</p>
                <h3 className="text-2xl font-bold">{stats.active_event.name}</h3>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-2xl font-bold">{stats.active_event_groups}</p>
                  <p className="text-sm text-muted-foreground">groupes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active_event_photos}</p>
                  <p className="text-sm text-muted-foreground">photos</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Last Group */}
        {stats?.last_group && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Dernier groupe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold">{stats.last_group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(stats.last_group.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.last_group.photo_count}</p>
                    <p className="text-sm text-muted-foreground">photos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link to="/admin/events">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <Calendar className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-bold">Gérer les événements</h4>
                <p className="text-sm text-muted-foreground">Créer, modifier ou fermer des événements</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/groups">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-green-500 mb-3" />
                <h4 className="font-bold">Voir les groupes</h4>
                <p className="text-sm text-muted-foreground">Consulter et gérer les groupes</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/settings">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <Settings className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold">Paramètres</h4>
                <p className="text-sm text-muted-foreground">Configurer le photobooth</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
