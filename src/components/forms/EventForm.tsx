import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Zap,
  BookOpen,
  Sword,
  Eye,
  Target,
  CheckCircle,
  X,
} from "lucide-react";
import { usePlots } from "@/hooks/usePlots";

interface EventFormProps {
  isOpen: boolean;
  plots?: any[];
  event?: any;
  onClose: () => void;
  onSubmit?: () => void;
}

export function EventForm({
  isOpen,
  plots = [],
  event,
  onClose,
  onSubmit,
}: EventFormProps) {
  const { createEvent } = usePlots();
  const isEditMode = !!event;
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<string[]>(
    event?.participants || [],
  );
  const [prerequisites, setPrerequisites] = useState<string[]>(
    event?.prerequisites || [],
  );
  const [newParticipant, setNewParticipant] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");

  const [formData, setFormData] = useState({
    plot_id: event?.plot_id || "",
    title: event?.title || "",
    description: event?.description || "",
    event_type: event?.event_type || "story",
    scheduled_time: event?.scheduled_time || "",
    duration_minutes: event?.duration_minutes || 60,
    location: event?.location || "",
    consequences: event?.consequences || "",
    trigger_condition: event?.trigger_condition || "",
    is_automatic: event?.is_automatic || false,
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddParticipant = () => {
    if (
      newParticipant.trim() &&
      !participants.includes(newParticipant.trim())
    ) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant("");
    }
  };

  const handleRemoveParticipant = (participantToRemove: string) => {
    setParticipants(
      participants.filter((participant) => participant !== participantToRemove),
    );
  };

  const handleAddPrerequisite = () => {
    if (
      newPrerequisite.trim() &&
      !prerequisites.includes(newPrerequisite.trim())
    ) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite("");
    }
  };

  const handleRemovePrerequisite = (prerequisiteToRemove: string) => {
    setPrerequisites(
      prerequisites.filter(
        (prerequisite) => prerequisite !== prerequisiteToRemove,
      ),
    );
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: "participant" | "prerequisite",
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "participant") {
        handleAddParticipant();
      } else {
        handleAddPrerequisite();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        console.error("Titolo evento richiesto");
        return;
      }

      if (!formData.plot_id) {
        console.error("Trama richiesta");
        return;
      }

      const eventData = {
        plot_id: parseInt(formData.plot_id.toString()),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        event_type: formData.event_type as any,
        scheduled_time: formData.scheduled_time || undefined,
        duration_minutes: formData.duration_minutes || undefined,
        location: formData.location.trim() || undefined,
        participants: participants.length > 0 ? participants : undefined,
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
        consequences: formData.consequences.trim() || undefined,
        trigger_condition: formData.trigger_condition.trim() || undefined,
        is_automatic: formData.is_automatic,
      };

      const result = await createEvent(eventData);

      if (result.success) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "story":
        return <BookOpen className="h-4 w-4" />;
      case "action":
        return <Sword className="h-4 w-4" />;
      case "revelation":
        return <Eye className="h-4 w-4" />;
      case "conflict":
        return <Target className="h-4 w-4" />;
      case "resolution":
        return <CheckCircle className="h-4 w-4" />;
      case "npc_appearance":
        return <Users className="h-4 w-4" />;
      case "trigger":
        return <Zap className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "story":
        return "Narrativo";
      case "action":
        return "Azione";
      case "revelation":
        return "Rivelazione";
      case "conflict":
        return "Conflitto";
      case "resolution":
        return "Risoluzione";
      case "npc_appearance":
        return "Apparizione PNG";
      case "trigger":
        return "Trigger";
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-fantasy-primary">
            <Calendar className="h-5 w-5" />
            {isEditMode ? "Modifica Evento" : "Nuovo Evento"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica i dettagli dell'evento per perfezionare la timeline narrativa"
              : "Crea un nuovo evento per arricchire la timeline della trama"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plot_id">Trama *</Label>
              <Select
                value={formData.plot_id.toString()}
                onValueChange={(value) => handleInputChange("plot_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona trama" />
                </SelectTrigger>
                <SelectContent>
                  {plots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id.toString()}>
                      {plot.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo Evento</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) =>
                  handleInputChange("event_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Narrativo
                    </div>
                  </SelectItem>
                  <SelectItem value="action">
                    <div className="flex items-center gap-2">
                      <Sword className="h-4 w-4" />
                      Azione
                    </div>
                  </SelectItem>
                  <SelectItem value="revelation">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Rivelazione
                    </div>
                  </SelectItem>
                  <SelectItem value="conflict">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Conflitto
                    </div>
                  </SelectItem>
                  <SelectItem value="resolution">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Risoluzione
                    </div>
                  </SelectItem>
                  <SelectItem value="npc_appearance">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Apparizione PNG
                    </div>
                  </SelectItem>
                  <SelectItem value="trigger">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Trigger
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titolo Evento *</Label>
            <Input
              id="title"
              placeholder="L'arrivo del messaggero, Lo scontro nella taverna, La rivelazione del segreto..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Descrivi cosa accade durante questo evento, chi è coinvolto, e quali sono le conseguenze..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Timing and Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Data e Ora</Label>
              <Input
                id="scheduled_time"
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) =>
                  handleInputChange("scheduled_time", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Durata (minuti)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) =>
                  handleInputChange(
                    "duration_minutes",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Luogo</Label>
              <Input
                id="location"
                placeholder="Taverna del Drago, Sala del Trono, Foresta Oscura..."
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>Partecipanti</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {participants.map((participant) => (
                <Badge
                  key={participant}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {participant}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveParticipant(participant)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi partecipante (nome personaggio o ruolo)"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "participant")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddParticipant}
              >
                Aggiungi
              </Button>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label>Prerequisiti</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {prerequisites.map((prerequisite) => (
                <Badge
                  key={prerequisite}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {prerequisite}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemovePrerequisite(prerequisite)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi prerequisito (cosa deve accadere prima)"
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "prerequisite")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPrerequisite}
              >
                Aggiungi
              </Button>
            </div>
          </div>

          {/* Consequences and Triggers */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consequences">Conseguenze</Label>
              <Textarea
                id="consequences"
                placeholder="Cosa succede dopo questo evento? Come cambia la situazione? Quali nuove trame si aprono?"
                value={formData.consequences}
                onChange={(e) =>
                  handleInputChange("consequences", e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger_condition">Condizioni di Trigger</Label>
              <Textarea
                id="trigger_condition"
                placeholder="Condizioni che scatenano automaticamente questo evento (opzionale)"
                value={formData.trigger_condition}
                onChange={(e) =>
                  handleInputChange("trigger_condition", e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_automatic"
                checked={formData.is_automatic}
                onCheckedChange={(checked) =>
                  handleInputChange("is_automatic", checked)
                }
              />
              <Label htmlFor="is_automatic">Evento automatico</Label>
              <span className="text-sm text-muted-foreground">
                (si attiva automaticamente quando le condizioni sono
                soddisfatte)
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="fantasy-button"
            >
              {isLoading
                ? isEditMode
                  ? "Aggiornamento..."
                  : "Creazione..."
                : isEditMode
                  ? "Aggiorna Evento"
                  : "Crea Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
