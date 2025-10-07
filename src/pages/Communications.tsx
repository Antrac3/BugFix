import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Eye,
  AlertTriangle,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import {
  useCommunications,
  Communication,
  CreateCommunicationData,
} from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const Communications = () => {
  const { profile } = useAuth();
  const {
    communications,
    loading,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    publishCommunication,
    markAsRead,
    getPublishedCommunications,
  } = useCommunications();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageCommunications =
    profile?.role === "gm" || profile?.role === "admin";

  const filteredCommunications = communications.filter((comm) => {
    const matchesSearch =
      comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || comm.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || comm.priority === priorityFilter;

    return matchesSearch && matchesType && matchesPriority;
  });

  const publishedCommunications = filteredCommunications.filter(
    (comm) => comm.status === "published",
  );
  const draftCommunications = filteredCommunications.filter(
    (comm) => comm.status === "draft",
  );
  const scheduledCommunications = filteredCommunications.filter(
    (comm) => comm.status === "scheduled",
  );

  const handleCreateCommunication = async (data: CreateCommunicationData) => {
    setIsSubmitting(true);
    try {
      const result = await createCommunication(data);
      if (result) {
        setShowCreateDialog(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCommunication = async (data: CreateCommunicationData) => {
    if (!selectedCommunication) return;

    setIsSubmitting(true);
    try {
      const result = await updateCommunication(selectedCommunication.id, data);
      if (result) {
        setShowEditDialog(false);
        setSelectedCommunication(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCommunication = async () => {
    if (!selectedCommunication) return;

    const success = await deleteCommunication(selectedCommunication.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedCommunication(null);
    }
  };

  const handlePublish = async (id: number) => {
    await publishCommunication(id);
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "normal":
        return "Normale";
      case "low":
        return "Bassa";
      default:
        return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement":
        return "Annuncio";
      case "news":
        return "Notizia";
      case "event":
        return "Evento";
      case "rule_update":
        return "Aggiornamento Regole";
      case "system":
        return "Sistema";
      default:
        return type;
    }
  };

  const isUserRead = (comm: Communication) => {
    return comm.read_by?.includes(parseInt(profile?.id || "0")) || false;
  };

  // Communication Form Component
  const CommunicationForm = ({
    communication,
    onSubmit,
    onCancel,
  }: {
    communication?: Communication;
    onSubmit: (data: CreateCommunicationData) => Promise<void>;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<CreateCommunicationData>({
      title: communication?.title || "",
      content: communication?.content || "",
      type: communication?.type || "announcement",
      priority: communication?.priority || "normal",
      target_audience: communication?.target_audience || "all",
      published_at: communication?.published_at?.slice(0, 16) || "",
      expires_at: communication?.expires_at?.slice(0, 16) || "",
      tags: communication?.tags || [],
      event_id: communication?.event_id || undefined,
    });

    const [publishNow, setPublishNow] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim() || !formData.content.trim()) {
        return;
      }

      const submitData = {
        ...formData,
        published_at: publishNow
          ? new Date().toISOString()
          : formData.published_at?.trim() || null,
        expires_at: formData.expires_at?.trim() || null,
        event_id: formData.event_id || null,
      };

      await onSubmit(submitData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Titolo della comunicazione"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as CreateCommunicationData["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Annuncio</SelectItem>
                  <SelectItem value="news">Notizia</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                  <SelectItem value="rule_update">
                    Aggiornamento Regole
                  </SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priorità</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value as CreateCommunicationData["priority"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bassa</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target_audience">Destinatari</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    target_audience:
                      value as CreateCommunicationData["target_audience"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="players">Solo Giocatori</SelectItem>
                  <SelectItem value="gms">Solo Game Masters</SelectItem>
                  <SelectItem value="admins">Solo Amministratori</SelectItem>
                  <SelectItem value="event_participants">
                    Partecipanti Eventi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="published_at">Data Pubblicazione</Label>
              <Input
                id="published_at"
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    published_at: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="expires_at">Data Scadenza</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expires_at: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="publish_now"
                checked={publishNow}
                onCheckedChange={setPublishNow}
              />
              <Label htmlFor="publish_now">Pubblica Immediatamente</Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="content">Contenuto *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Contenuto della comunicazione..."
            rows={8}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : communication ? "Aggiorna" : "Crea"}
          </Button>
        </div>
      </form>
    );
  };

  const CommunicationCard = ({ comm }: { comm: Communication }) => (
    <Card
      className={`hover:shadow-md transition-shadow ${
        !isUserRead(comm) && comm.status === "published"
          ? "ring-2 ring-blue-200"
          : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{comm.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(comm.priority)}>
                {getPriorityLabel(comm.priority)}
              </Badge>
              <Badge variant="outline">{getTypeLabel(comm.type)}</Badge>
              {comm.status !== "published" && (
                <Badge variant="secondary">{comm.status}</Badge>
              )}
            </div>
          </div>
          {canManageCommunications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {comm.status === "draft" && (
                  <DropdownMenuItem onClick={() => handlePublish(comm.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Pubblica
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCommunication(comm);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCommunication(comm);
                    setShowDeleteDialog(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {comm.content}
        </CardDescription>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {comm.author && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {comm.author.first_name} {comm.author.last_name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(comm.created_at), "PPP", { locale: it })}
              </span>
            </div>
            {comm.expires_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Scade:{" "}
                  {format(new Date(comm.expires_at), "PPP", { locale: it })}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isUserRead(comm) && comm.status === "published" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAsRead(comm.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Segna come Letto
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Leggi Tutto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Comunicazioni</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h1 className="text-3xl font-bold">Comunicazioni</h1>
          {canManageCommunications && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Comunicazione
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cerca comunicazioni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
              <SelectItem value="announcement">Annuncio</SelectItem>
              <SelectItem value="news">Notizia</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="rule_update">Aggiornamento Regole</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Priorità" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le priorit��</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="low">Bassa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Communications Tabs */}
        <Tabs defaultValue="published" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="published">
              Pubblicate ({publishedCommunications.length})
            </TabsTrigger>
            {canManageCommunications && (
              <>
                <TabsTrigger value="drafts">
                  Bozze ({draftCommunications.length})
                </TabsTrigger>
                <TabsTrigger value="scheduled">
                  Programmate ({scheduledCommunications.length})
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="published" className="mt-6">
            {publishedCommunications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nessuna comunicazione
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Non ci sono comunicazioni pubblicate al momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {publishedCommunications.map((comm) => (
                  <CommunicationCard key={comm.id} comm={comm} />
                ))}
              </div>
            )}
          </TabsContent>

          {canManageCommunications && (
            <>
              <TabsContent value="drafts" className="mt-6">
                {draftCommunications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Edit className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Nessuna bozza
                      </h3>
                      <p className="text-muted-foreground">
                        Non hai bozze salvate.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {draftCommunications.map((comm) => (
                      <CommunicationCard key={comm.id} comm={comm} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="mt-6">
                {scheduledCommunications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Nessuna comunicazione programmata
                      </h3>
                      <p className="text-muted-foreground">
                        Non hai comunicazioni programmate.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {scheduledCommunications.map((comm) => (
                      <CommunicationCard key={comm.id} comm={comm} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Create Communication Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuova Comunicazione</DialogTitle>
              <DialogDescription>
                Crea una nuova comunicazione per i membri della community.
              </DialogDescription>
            </DialogHeader>
            <CommunicationForm
              onSubmit={handleCreateCommunication}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Communication Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica Comunicazione</DialogTitle>
              <DialogDescription>
                Aggiorna i dettagli della comunicazione.
              </DialogDescription>
            </DialogHeader>
            {selectedCommunication && (
              <CommunicationForm
                communication={selectedCommunication}
                onSubmit={handleUpdateCommunication}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedCommunication(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Elimina Comunicazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare la comunicazione "
                {selectedCommunication?.title}"? Questa azione non può essere
                annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedCommunication(null);
                }}
              >
                Annulla
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCommunication}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Communications;
