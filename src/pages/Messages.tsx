import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Plus,
  Users,
  Eye,
  Send,
  Search,
  Mail,
  MailOpen,
  Clock,
  User,
  Crown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/SupabaseAppContext";
import { ErgonomicEnhancer } from "@/components/ErgonomicEnhancer";
import { MessageForm } from "@/components/forms/MessageForm";

export default function Messages() {
  const { messages, characters, markMessageAsRead } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [characterFilter, setCharacterFilter] = useState("all");
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from_character.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.to_character.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCharacter =
      characterFilter === "all" ||
      message.from_character === characterFilter ||
      message.to_character === characterFilter;

    if (selectedTab === "all") {
      return matchesSearch && matchesCharacter;
    }
    if (selectedTab === "unread") {
      return matchesSearch && matchesCharacter && !message.is_read;
    }
    if (selectedTab === "ic") {
      return matchesSearch && matchesCharacter && message.is_in_character;
    }
    if (selectedTab === "ooc") {
      return matchesSearch && matchesCharacter && !message.is_in_character;
    }

    return matchesSearch && matchesCharacter;
  });

  const unreadMessages = messages.filter((m) => !m.is_read);
  const icMessages = messages.filter((m) => m.is_in_character);
  const oocMessages = messages.filter((m) => !m.is_in_character);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minuti fa`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ore fa`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMessageClick = async (messageId: number) => {
    const result = await markMessageAsRead(messageId);
    if (result.success) {
      console.log("✅ Message marked as read, forcing re-render");
      // Force re-render by updating the key
      setUpdateKey((prev) => prev + 1);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950"
      key={updateKey}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-fantasy-accent" />
              <span>Messaggi In-Character</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Facilita la comunicazione tra personaggi e il roleplay
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => setShowMessageForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Messaggio
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Messaggi Totali
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {messages.length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Non Letti
                  </p>
                  <p className="text-3xl font-bold text-fantasy-danger">
                    {unreadMessages.length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-fantasy-danger" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In-Character
                  </p>
                  <p className="text-3xl font-bold text-fantasy-primary">
                    {icMessages.length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Out-of-Character
                  </p>
                  <p className="text-3xl font-bold text-fantasy-secondary">
                    {oocMessages.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-fantasy-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="fantasy-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca messaggi per contenuto o personaggio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={characterFilter}
                  onValueChange={setCharacterFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Personaggio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i Personaggi</SelectItem>
                    {characters
                      .filter((c) => c.status === "active")
                      .map((character) => (
                        <SelectItem key={character.id} value={character.name}>
                          {character.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Tutti i Messaggi ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non Letti ({unreadMessages.length})
            </TabsTrigger>
            <TabsTrigger value="ic">
              In-Character ({icMessages.length})
            </TabsTrigger>
            <TabsTrigger value="ooc">OOC ({oocMessages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredMessages.length > 0 ? (
              <div className="space-y-4">
                {filteredMessages
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .map((message) => (
                    <Card
                      key={message.id}
                      className={`fantasy-card hover:shadow-fantasy-lg transition-all duration-300 cursor-pointer ${
                        !message.is_read ? "border-fantasy-accent border-2" : ""
                      }`}
                      onClick={() => handleMessageClick(message.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {message.is_read ? (
                              <MailOpen className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Mail className="h-5 w-5 text-fantasy-accent" />
                            )}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">
                                  {message.from_character}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium text-foreground">
                                  {message.to_character}
                                </span>
                                <Badge
                                  variant={
                                    message.is_in_character
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {message.is_in_character ? "IC" : "OOC"}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(message.created_at)}
                                </span>
                                {!message.is_read && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Non Letto
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-fantasy-accent">
                          <p className="text-sm italic text-foreground">
                            "{message.content}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="fantasy-card">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm || characterFilter !== "all"
                      ? "Nessun messaggio trovato"
                      : "Nessun messaggio"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || characterFilter !== "all"
                      ? "Prova ad aggiustare i criteri di ricerca o i filtri"
                      : "Invia il primo messaggio per iniziare la comunicazione tra personaggi"}
                  </p>
                  <Button
                    className="fantasy-button"
                    onClick={() => setShowMessageForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Messaggio
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modali */}
        <MessageForm
          isOpen={showMessageForm}
          onClose={() => setShowMessageForm(false)}
        />
      </div>
    </div>
  );
}
