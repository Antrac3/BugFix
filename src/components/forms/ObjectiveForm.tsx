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
import { Target, Eye, EyeOff, Users, AlertCircle } from "lucide-react";
import { usePlots } from "@/hooks/usePlots";

interface ObjectiveFormProps {
  plots: any[];
  objective?: any;
  onClose: () => void;
  onSubmit: () => void;
}

export function ObjectiveForm({
  plots,
  objective,
  onClose,
  onSubmit,
}: ObjectiveFormProps) {
  const { createObjective } = usePlots();
  const isEditMode = !!objective;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    plot_id: objective?.plot_id || "",
    character_id: objective?.character_id || "",
    title: objective?.title || "",
    description: objective?.description || "",
    objective_type: objective?.objective_type || "public",
    priority: objective?.priority || 3,
    completion_condition: objective?.completion_condition || "",
    reward_description: objective?.reward_description || "",
    is_mandatory: objective?.is_mandatory || false,
    reveal_condition: objective?.reveal_condition || "",
    deadline: objective?.deadline || "",
    notes: objective?.notes || "",
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        console.error("Titolo obiettivo richiesto");
        return;
      }

      if (!formData.plot_id) {
        console.error("Trama richiesta");
        return;
      }

      const objectiveData = {
        plot_id: parseInt(formData.plot_id.toString()),
        character_id: formData.character_id
          ? parseInt(formData.character_id.toString())
          : undefined,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        objective_type: formData.objective_type as any,
        priority: formData.priority,
        completion_condition: formData.completion_condition.trim() || undefined,
        reward_description: formData.reward_description.trim() || undefined,
        is_mandatory: formData.is_mandatory,
        reveal_condition: formData.reveal_condition.trim() || undefined,
        deadline: formData.deadline || undefined,
        notes: formData.notes.trim() || undefined,
      };

      const result = await createObjective(objectiveData);

      if (result.success) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error submitting objective:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Eye className="h-4 w-4" />;
      case "private":
        return <Users className="h-4 w-4" />;
      case "secret":
        return <EyeOff className="h-4 w-4" />;
      case "hidden":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "Critica";
      case 2:
        return "Alta";
      case 3:
        return "Media";
      case 4:
        return "Bassa";
      case 5:
        return "Molto Bassa";
      default:
        return "Media";
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "text-red-600";
      case 2:
        return "text-orange-600";
      case 3:
        return "text-yellow-600";
      case 4:
        return "text-green-600";
      case 5:
        return "text-gray-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-fantasy-primary">
            <Target className="h-5 w-5" />
            {isEditMode ? "Modifica Obiettivo" : "Nuovo Obiettivo"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica i dettagli dell'obiettivo per rifinire gli scopi narrativi"
              : "Crea un nuovo obiettivo per guidare lo sviluppo della trama"}
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
              <Label htmlFor="objective_type">Tipo Obiettivo</Label>
              <Select
                value={formData.objective_type}
                onValueChange={(value) =>
                  handleInputChange("objective_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Pubblico
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Privato
                    </div>
                  </SelectItem>
                  <SelectItem value="secret">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      Segreto
                    </div>
                  </SelectItem>
                  <SelectItem value="hidden">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Nascosto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titolo Obiettivo *</Label>
            <Input
              id="title"
              placeholder="Scopri il segreto del Re, Elimina il traditore, Ottieni l'alleanza..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Descrivi cosa deve fare il personaggio, come raggiungere l'obiettivo, e perché è importante..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorità</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) =>
                  handleInputChange("priority", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((priority) => (
                    <SelectItem key={priority} value={priority.toString()}>
                      <div className="flex items-center gap-2">
                        <span className={getPriorityColor(priority)}>
                          P{priority}
                        </span>
                        <span>{getPriorityLabel(priority)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Scadenza</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completion_condition">
                Condizioni di Completamento
              </Label>
              <Textarea
                id="completion_condition"
                placeholder="Cosa deve accadere perché l'obiettivo sia considerato completato? Es: 'Consegnare la lettera al Lord', 'Ottenere conferma pubblica'..."
                value={formData.completion_condition}
                onChange={(e) =>
                  handleInputChange("completion_condition", e.target.value)
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reveal_condition">
                Condizioni di Rivelazione
              </Label>
              <Textarea
                id="reveal_condition"
                placeholder="Quando/come rivelare questo obiettivo al giocatore? Es: 'All'inizio del gioco', 'Dopo aver parlato con il PNG X'..."
                value={formData.reveal_condition}
                onChange={(e) =>
                  handleInputChange("reveal_condition", e.target.value)
                }
                rows={2}
              />
            </div>
          </div>

          {/* Reward and Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward_description">Ricompensa</Label>
              <Input
                id="reward_description"
                placeholder="Quale ricompensa riceve il personaggio? Es: '100 monete d'oro', 'Informazioni segrete', 'Alleanza politica'..."
                value={formData.reward_description}
                onChange={(e) =>
                  handleInputChange("reward_description", e.target.value)
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_mandatory"
                checked={formData.is_mandatory}
                onCheckedChange={(checked) =>
                  handleInputChange("is_mandatory", checked)
                }
              />
              <Label htmlFor="is_mandatory">Obiettivo obbligatorio</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note per il Master</Label>
            <Textarea
              id="notes"
              placeholder="Note private per il master, suggerimenti per il roleplay, collegamenti con altri obiettivi..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
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
                  ? "Aggiorna Obiettivo"
                  : "Crea Obiettivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
