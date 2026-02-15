import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { groupsApi, eventsApi } from '@/lib/api';

const StationSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventData, groupsData] = await Promise.all([
        eventsApi.getActive(),
        groupsApi.getAll()
      ]);
      setActiveEvent(eventData);
      setGroups(groupsData.slice(0, 20)); // Show last 20 groups
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const eventId = activeEvent?.event_id;
      const results = await groupsApi.search(searchQuery, eventId);
      setGroups(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (group) => {
    navigate(`/station/gallery/${group.group_id}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-2">Station de partage</h1>
        <p className="text-muted-foreground text-lg">
          Retrouvez vos photos par nom de groupe
        </p>
        {activeEvent && (
          <p className="mt-4 text-primary font-medium">
            {activeEvent.name}
          </p>
        )}
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              data-testid="station-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Entrez le nom de votre groupe..."
              className="h-16 pl-14 text-xl rounded-2xl"
            />
          </div>
          <Button
            data-testid="station-search-btn"
            onClick={handleSearch}
            className="h-16 px-8 text-lg rounded-2xl"
          >
            Rechercher
          </Button>
        </div>
      </motion.div>

      {/* Groups List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Groupes récents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group, index) => (
            <motion.div
              key={group.group_id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleSelectGroup(group)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(group.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{group.photo_count}</p>
                      <p className="text-sm text-muted-foreground">photos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {groups.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                Aucun groupe trouvé
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StationSearch;
