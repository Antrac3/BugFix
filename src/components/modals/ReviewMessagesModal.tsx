import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Eye,
  Crown,
  Users,
  Clock,
  Mail,
  MailOpen,
} from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useApp } from "@/contexts/SupabaseAppContext";

interface ReviewMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewMessagesModal({
  isOpen,
  onClose,
}: ReviewMessagesModalProps) {
  const { messages, markMessageAsRead } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.fromCharacter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.toCharacter.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "unread") return matchesSearch && !message.is_read;
    if (selectedTab === "ic") return matchesSearch && message.is_in_character;
    if (selectedTab === "ooc") return matchesSearch && !message.is_in_character;

    return matchesSearch;
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
      return date.toLocaleDateString("it-IT");
    }
  };

  const handleMessageClick = (messageId: number) => {
    markMessageAsRead(messageId);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Rivedi Messaggi"
      description="Gestisci e modera i messaggi tra personaggi"
      size="large"
    >
      <div className="space-y-6">
        {/* Search and Filter */}
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
        </div>

        {/* Message Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-foreground">
              {messages.length}
            </div>
            <div className="text-xs text-muted-foreground">Messaggi Totali</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-fantasy-danger">
              {unreadMessages.length}
            </div>
            <div className="text-xs text-muted-foreground">Non Letti</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-fantasy-primary">
              {icMessages.length}
            </div>
            <div className="text-xs text-muted-foreground">In-Character</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-fantasy-secondary">
              {oocMessages.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Out-of-Character
            </div>
          </div>
        </div>

        {/* Messages Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tutti ({messages.length})</TabsTrigger>
            <TabsTrigger value="unread">
              Non Letti ({unreadMessages.length})
            </TabsTrigger>
            <TabsTrigger value="ic">IC ({icMessages.length})</TabsTrigger>
            <TabsTrigger value="ooc">OOC ({oocMessages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-md ${
                        !message.is_read
                          ? "border-fantasy-accent border-2 bg-fantasy-accent/5"
                          : "border-border"
                      }`}
                      onClick={() => handleMessageClick(message.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
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

                      <div className="bg-muted/30 p-3 rounded-lg border-l-4 border-fantasy-accent">
                        <p className="text-sm italic text-foreground">
                          "{message.content}"
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchTerm
                      ? "Nessun messaggio trovato"
                      : "Nessun messaggio"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Prova ad aggiustare i criteri di ricerca"
                      : "Non ci sono messaggi in questa categoria"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end pt-6">
          <Button onClick={onClose} className="fantasy-button">
            <Eye className="h-4 w-4 mr-2" />
            Chiudi Revisione
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
