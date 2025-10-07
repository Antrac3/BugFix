import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Star,
  Clock,
  Zap,
  MessageSquare,
  Award,
  Target,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useApp } from "@/contexts/SupabaseAppContext";

// Real analytics data will be calculated from useApp data

const monthlyTrends = [
  { month: "Sep", sessions: 3, players: 8, xp: 1200 },
  { month: "Oct", sessions: 4, players: 10, xp: 1800 },
  { month: "Nov", sessions: 4, players: 12, xp: 2100 },
  { month: "Dec", sessions: 5, players: 14, xp: 2400 },
  { month: "Jan", sessions: 4, players: 15, xp: 2200 },
];

export default function Analytics() {
  const { players, characters, tasks, messages, locations, contacts } =
    useApp();

  // Calculate real analytics from actual data
  const playerAnalytics = {
    totalPlayers: players?.length || 0,
    activeThisMonth: players?.filter((p) => p.status === "active")?.length || 0,
    newJoins: 0, // Would need creation dates to calculate
    retention: 0, // Would need historical data
    avgSessionAttendance: 0, // Would need session data
    topPlayer: players?.length > 0 ? players[0].name : "Nessun giocatore",
  };

  const characterAnalytics = {
    totalCharacters: characters?.length || 0,
    activeCharacters:
      characters?.filter((c) => c.status === "active")?.length || 0,
    avgLevel: 0, // Would need level data
    totalXpAwarded: characters?.reduce((sum, c) => sum + c.xp, 0) || 0,
    topClass: "Nessun dato",
    characterRetention: 0,
  };

  const sessionAnalytics = {
    totalSessions: 0, // Would need session data
    thisMonth: 0,
    avgDuration: 0,
    avgAttendance: 0,
    cancelationRate: 0,
    topLocation: locations?.length > 0 ? locations[0].name : "Nessuna location",
  };

  const popularLocations =
    locations?.slice(0, 4).map((loc) => ({
      name: loc.name,
      sessions: 0, // Would need session data
      rating: loc.rating || 0,
    })) || [];

  const playerEngagement =
    players?.slice(0, 4).map((player) => ({
      name: player.name,
      sessions: 0, // Would need session data
      xp: 0, // Would need to calculate from characters
      messages: 0, // Would need to calculate from messages
    })) || [];

  // Calculate real statistics from actual data
  const statsData = {
    totalPlayers: players?.length || 0,
    activeCampaigns: 1, // For now, assuming single campaign
    avgSessionAttendance: 0, // Would need session data to calculate
    topPlayer: players?.length > 0 ? players[0].name : "Nessun giocatore",
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-fantasy-primary" />
              <span>Campaign Analytics</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Insights and metrics for campaign performance and player
              engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-fantasy-success text-white">
              <TrendingUp className="h-3 w-3 mr-1" />
              Campaign Health: Excellent
            </Badge>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Giocatori Attivi
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {playerAnalytics.activeThisMonth}
                  </p>
                  <p className="text-xs text-fantasy-success">
                    +{playerAnalytics.newJoins} questo mese
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
                    Sessioni Questo Mese
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {sessionAnalytics.thisMonth}
                  </p>
                  <p className="text-xs text-fantasy-accent">
                    {sessionAnalytics.avgDuration}h durata media
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Partecipazione Media
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {sessionAnalytics.avgAttendance}
                  </p>
                  <p className="text-xs text-fantasy-gold">
                    {playerAnalytics.avgSessionAttendance}% tasso di
                    partecipazione
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-fantasy-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale XP Assegnati
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {(characterAnalytics.totalXpAwarded / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-fantasy-gold">
                    Livello medio: {characterAnalytics.avgLevel}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-fantasy-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends Chart */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-fantasy-primary" />
                    <span>Tendenze Mensili</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyTrends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="font-medium">{trend.month}</div>
                        <div className="flex space-x-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Sessioni:{" "}
                            </span>
                            <span className="font-medium">
                              {trend.sessions}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Giocatori:{" "}
                            </span>
                            <span className="font-medium">{trend.players}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">XP: </span>
                            <span className="font-medium">{trend.xp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Health */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-fantasy-success" />
                    <span>Salute Campagna</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Ritenzione Giocatori
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-fantasy-success rounded-full"
                            style={{ width: `${playerAnalytics.retention}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {playerAnalytics.retention}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Partecipazione Sessioni
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-fantasy-primary rounded-full"
                            style={{
                              width: `${playerAnalytics.avgSessionAttendance}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {playerAnalytics.avgSessionAttendance}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Ritenzione Personaggi
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-fantasy-gold rounded-full"
                            style={{
                              width: `${characterAnalytics.characterRetention}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {characterAnalytics.characterRetention}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Successo Sessioni
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-fantasy-accent rounded-full"
                            style={{
                              width: `${100 - sessionAnalytics.cancelationRate}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {100 - sessionAnalytics.cancelationRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Players */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-fantasy-gold" />
                    <span>Top Players</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {playerEngagement.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-fantasy-gradient text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {player.sessions} sessions attended
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {player.xp.toLocaleString()} XP
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {player.messages} messages
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Player Statistics */}
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-fantasy-primary" />
                    <span>Player Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {playerAnalytics.totalPlayers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Players
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-success">
                        {playerAnalytics.activeThisMonth}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active This Month
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-accent">
                        {playerAnalytics.newJoins}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        New Joins
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-gold">
                        {playerAnalytics.retention}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Retention Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-fantasy-accent" />
                    <span>Session Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {sessionAnalytics.totalSessions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Sessions
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-accent">
                        {sessionAnalytics.thisMonth}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        This Month
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-gold">
                        {sessionAnalytics.avgDuration}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Duration
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="text-2xl font-bold text-fantasy-success">
                        {sessionAnalytics.avgAttendance}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Attendance
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="fantasy-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-fantasy-primary" />
                    <span>Session Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div
                            className="h-2 bg-fantasy-success rounded-full"
                            style={{
                              width: `${100 - sessionAnalytics.cancelationRate}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {100 - sessionAnalytics.cancelationRate}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sessionAnalytics.cancelationRate}% cancellation rate
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <Card className="fantasy-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-fantasy-primary" />
                  <span>Popular Locations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularLocations.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-fantasy-gradient text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.sessions} sessions hosted
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-fantasy-gold fill-current" />
                        <span className="text-sm font-medium">
                          {location.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
