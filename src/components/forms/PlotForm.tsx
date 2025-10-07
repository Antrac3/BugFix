import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { BookOpen, Crown, Sword, Heart, Shield, X } from "lucide-react";
import { usePlots } from "@/hooks/usePlots";

interface PlotFormProps {
  campaigns: any[];
  selectedCampaignId?: number | null;
  plot?: any;
  onClose: () => void;
  onSubmit: () => void;
}

export function PlotForm({
  campaigns,
  selectedCampaignId,
  plot,
  onClose,
  onSubmit,
}: PlotFormProps) {
  const { createPlot, updatePlot } = usePlots();
  const isEditMode = !!plot;
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(plot?.tags || []);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    campaign_id: plot?.campaign_id || selectedCampaignId || "",
    title: plot?.title || "",
    description: plot?.description || "",
    plot_type: plot?.plot_type || "main",
    priority: plot?.priority || 3,
    start_date: plot?.start_date || "",
    target_end_date: plot?.target_end_date || "",
    notes: plot?.notes || "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        console.error("Titolo trama richiesto");
        return;
      }

      if (!formData.campaign_id) {
        console.error("Campagna richiesta");
        return;
      }

      const plotData = {
        campaign_id: parseInt(formData.campaign_id.toString()),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        plot_type: formData.plot_type as any,
        priority: formData.priority,
        start_date: formData.start_date || undefined,
        target_end_date: formData.target_end_date || undefined,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes.trim() || undefined,
      };

      const result = isEditMode
        ? await updatePlot(plot.id, plotData)
        : await createPlot(plotData);

      if (result.success) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error submitting plot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "main":
        return <Crown className="h-4 w-4" />;
      case "side":
        return <Sword className="h-4 w-4" />;
      case "personal":
        return <Heart className="h-4 w-4" />;
      case "background":
        return <Shield className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
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
            <BookOpen className="h-5 w-5" />
            {isEditMode ? "Modifica Trama" : "Nuova Trama"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica i dettagli della trama per perfezionare la narrativa"
              : "Crea una nuova trama per arricchire la narrativa della campagna"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campagna *</Label>
              <Select
                value={formData.campaign_id.toString()}
                onValueChange={(value) =>
                  handleInputChange("campaign_id", value)
                }
                disabled={isEditMode} // Don't allow changing campaign in edit mode
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona campagna" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem
                      key={campaign.id}
                      value={campaign.id.toString()}
                    >
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plot_type">Tipo Trama</Label>
              <Select
                value={formData.plot_type}
                onValueChange={(value) => handleInputChange("plot_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Principale
                    </div>
                  </SelectItem>
                  <SelectItem value="side">
                    <div className="flex items-center gap-2">
                      <Sword className="h-4 w-4" />
                      Secondaria
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Personale
                    </div>
                  </SelectItem>
                  <SelectItem value="background">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Background
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titolo Trama *</Label>
            <Input
              id="title"
              placeholder="Il Segreto del Re Perduto, La Vendetta di Lady Blackthorne..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Descrivi la trama principale, i personaggi coinvolti, i conflitti centrali e gli obiettivi narrativi..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          {/* Priority and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_end_date">Data Fine Prevista</Label>
              <Input
                id="target_end_date"
                type="date"
                value={formData.target_end_date}
                onChange={(e) =>
                  handleInputChange("target_end_date", e.target.value)
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tag</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi tag (es. mistero, politica, vendetta...)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Aggiungi
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note Aggiuntive</Label>
            <Textarea
              id="notes"
              placeholder="Note per il master, collegamenti con altre trame, idee future..."
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
                  ? "Aggiorna Trama"
                  : "Crea Trama"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
