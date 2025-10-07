import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Plus,
  TrendingUp,
  History,
  Star,
  Users,
  Search,
  Award,
  Calendar,
  Target,
} from "lucide-react";
import { useApp } from "@/contexts/SupabaseAppContext";
import { XPAwardModal } from "@/components/modals/XPAwardModal";

export default function Experience() {
  const { characters, awardXP } = useApp();
  const [showXPModal, setShowXPModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const activeCharacters = characters.filter((c) => c.status === "active");
  const filteredCharacters = activeCharacters.filter(
    (character) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalXPAwarded = characters.reduce((sum, c) => sum + c.xp, 0);
  const averageXP =
    characters.length > 0 ? Math.round(totalXPAwarded / characters.length) : 0;
  const topCharacter = characters.reduce(
    (prev, current) => (prev.xp > current.xp ? prev : current),
    characters[0] || { xp: 0, name: "Nessuno" },
  );

  // XP history will be loaded from database when available
  const xpHistory: any[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Zap className="h-8 w-8 text-fantasy-gold" />
              <span>Gestione Esperienza</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Assegna e traccia i punti esperienza per tutti i personaggi
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => setShowXPModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assegna PE
          </Button>
        </div>

        {/* XP Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    PE Totali Assegnati
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalXPAwarded.toLocaleString()}
                  </p>
                  <p className="text-xs text-fantasy-gold flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    In crescita
                  </p>
                </div>
                <Zap className="h-8 w-8 text-fantasy-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    PE Medi per Personaggio
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {averageXP.toLocaleString()}
                  </p>
                  <p className="text-xs text-fantasy-primary flex items-center mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    Bilanciato
                  </p>
                </div>
                <Users className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Personaggi Attivi
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {activeCharacters.length}
                  </p>
                  <p className="text-xs text-fantasy-success flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    Coinvolti
                  </p>
                </div>
                <Star className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Top Personaggio
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {topCharacter.name}
                  </p>
                  <p className="text-xs text-fantasy-gold flex items-center mt-1">
                    <Award className="h-3 w-3 mr-1" />
                    {topCharacter.xp} PE
                  </p>
                </div>
                <Award className="h-8 w-8 text-fantasy-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="characters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="characters">Personaggi</TabsTrigger>
            <TabsTrigger value="history">Cronologia PE</TabsTrigger>
          </TabsList>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-6">
            {/* Search */}
            <Card className="fantasy-card">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca personaggi per nome, giocatore o ruolo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Characters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <Card
                  key={character.id}
                  className="fantasy-card hover:shadow-fantasy-lg transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {character.name}
                      </CardTitle>
                      <Badge
                        variant={
                          character.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {character.status === "active" ? "Attivo" : "Inattivo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Giocato da {character.player}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Ruolo:
                      </span>
                      <span className="text-sm font-medium">
                        {character.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        PE Attuali:
                      </span>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-fantasy-gold" />
                        <span className="text-lg font-bold text-fantasy-gold">
                          {character.xp.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Background:
                      </span>
                      <span
                        className="text-sm text-right max-w-32 truncate"
                        title={character.background}
                      >
                        {character.background}
                      </span>
                    </div>

                    <div className="pt-4">
                      <Button
                        className="w-full fantasy-button"
                        size="sm"
                        onClick={() => setShowXPModal(true)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Assegna PE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCharacters.length === 0 && (
              <Card className="fantasy-card">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm
                      ? "Nessun personaggio trovato"
                      : "Nessun personaggio attivo"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Prova ad aggiustare i criteri di ricerca"
                      : "Crea il primo personaggio per iniziare a tracciare l'esperienza"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* XP History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-fantasy-accent" />
                  <span>Cronologia Assegnazioni PE</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {xpHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-8 w-8 rounded-full bg-fantasy-gold/10 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-fantasy-gold" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {entry.characterName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {entry.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground ml-11">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>Assegnato da {entry.awardedBy}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(entry.date).toLocaleDateString("it-IT")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-fantasy-gold">
                          +{entry.amount}
                        </div>
                        <div className="text-xs text-muted-foreground">PE</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* XP Award Modal */}
        <XPAwardModal
          isOpen={showXPModal}
          onClose={() => setShowXPModal(false)}
        />
      </div>
    </div>
  );
}
