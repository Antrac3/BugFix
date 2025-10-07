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
import { Calendar, MapPin, Users, Sword } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";

interface CampaignFormProps {
  isOpen: boolean;
  campaign?: any;
  onClose: () => void;
}

export function CampaignForm({ isOpen, campaign, onClose }: CampaignFormProps) {
  const { createCampaign, updateCampaign } = useCampaigns();
  const isEditMode = !!campaign;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    genre: "",
    setting: "",
    max_players: 8,
    difficulty: "medium" as const,
    start_date: "",
    location: "",
    game_system: "",
    session_frequency: "weekly" as const,
    duration: 4,
    notes: "",
    status: "planning" as const,
  });

  // Initialize form data when campaign prop changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || "",
        description: campaign.description || "",
        genre: campaign.genre || "",
        setting: campaign.setting || "",
        max_players: campaign.max_players || 8,
        difficulty: campaign.difficulty || "medium",
        start_date: campaign.start_date || "",
        location: campaign.location || "",
        game_system: campaign.game_system || "",
        session_frequency: campaign.session_frequency || "weekly",
        duration: campaign.duration || 4,
        notes: campaign.notes || "",
        status: campaign.status || "planning",
      });
    } else {
      // Reset to default values when creating new campaign
      setFormData({
        name: "",
        description: "",
        genre: "",
        setting: "",
        max_players: 8,
        difficulty: "medium",
        start_date: "",
        location: "",
        game_system: "",
        session_frequency: "weekly",
        duration: 4,
        notes: "",
        status: "planning",
      });
    }
  }, [campaign, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        console.error("Nome campagna richiesto");
        return;
      }

      if (!formData.description.trim()) {
        console.error("Descrizione richiesta");
        return;
      }

      // Create or update campaign in database
      const campaignData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        genre: formData.genre || undefined,
        setting: formData.setting || undefined,
        max_players: formData.max_players,
        difficulty: formData.difficulty,
        start_date: formData.start_date || undefined,
        location: formData.location || undefined,
        game_system: formData.game_system || undefined,
        session_frequency: formData.session_frequency,
        duration: formData.duration,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      const result = isEditMode
        ? await updateCampaign(campaign.id, campaignData)
        : await createCampaign(campaignData);

      if (result.success) {
        // Reset form
        setFormData({
          name: "",
          description: "",
          genre: "",
          setting: "",
          max_players: 8,
          difficulty: "medium",
          start_date: "",
          location: "",
          game_system: "",
          session_frequency: "weekly",
          duration: 4,
          notes: "",
          status: "planning",
        });

        onClose();
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-fantasy-primary">
            <Sword className="h-5 w-5" />
            {isEditMode ? "Modifica Campagna LARP" : "Nuova Campagna LARP"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica i dettagli della tua campagna LARP."
              : "Crea una nuova campagna LARP. Definisci ambientazione, personaggi e tutti i dettagli necessari."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Campagna *</Label>
              <Input
                id="name"
                placeholder="Le Cronache di Valeria, La Corte dei Vampiri..."
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genere</Label>
              <Select
                value={formData.genre}
                onValueChange={(value) => handleInputChange("genre", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona genere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fantasy">Fantasy/Medievale</SelectItem>
                  <SelectItem value="historical">Storico</SelectItem>
                  <SelectItem value="urban_fantasy">Urban Fantasy</SelectItem>
                  <SelectItem value="horror">Horror</SelectItem>
                  <SelectItem value="cyberpunk">Cyberpunk/Sci-Fi</SelectItem>
                  <SelectItem value="steampunk">Steampunk</SelectItem>
                  <SelectItem value="vampire">Vampiri</SelectItem>
                  <SelectItem value="nordic">Nordic LARP</SelectItem>
                  <SelectItem value="custom">Personalizzato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione *</Label>
            <Textarea
              id="description"
              placeholder="Descrivi l'ambientazione, i conflitti principali, l'atmosfera che i giocatori vivranno..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setting">Ambientazione</Label>
              <Input
                id="setting"
                placeholder="Regno di Valeria, Milano del 1920..."
                value={formData.setting}
                onChange={(e) => handleInputChange("setting", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="game_system">Sistema/Regole</Label>
              <Input
                id="game_system"
                placeholder="Custom, D&D Live, Vampire LARP..."
                value={formData.game_system}
                onChange={(e) =>
                  handleInputChange("game_system", e.target.value)
                }
              />
            </div>
          </div>

          {/* Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_players" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Max Giocatori
              </Label>
              <Select
                value={formData.max_players.toString()}
                onValueChange={(value) =>
                  handleInputChange("max_players", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 giocatori</SelectItem>
                  <SelectItem value="6">6 giocatori</SelectItem>
                  <SelectItem value="8">8 giocatori</SelectItem>
                  <SelectItem value="10">10 giocatori</SelectItem>
                  <SelectItem value="15">15 giocatori</SelectItem>
                  <SelectItem value="20">20 giocatori</SelectItem>
                  <SelectItem value="30">30+ giocatori</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficoltà</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  handleInputChange("difficulty", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                  <SelectItem value="expert">Esperto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durata (ore)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) =>
                  handleInputChange("duration", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 ore</SelectItem>
                  <SelectItem value="3">3 ore</SelectItem>
                  <SelectItem value="4">4 ore</SelectItem>
                  <SelectItem value="6">6 ore</SelectItem>
                  <SelectItem value="8">8 ore (giornata)</SelectItem>
                  <SelectItem value="24">24 ore (weekend)</SelectItem>
                  <SelectItem value="48">48+ ore (evento)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Stato Campagna</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">In Pianificazione</SelectItem>
                  <SelectItem value="active">Attiva</SelectItem>
                  <SelectItem value="paused">In Pausa</SelectItem>
                  <SelectItem value="completed">Completata</SelectItem>
                  <SelectItem value="cancelled">Annullata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data Inizio
              </Label>
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
              <Label htmlFor="session_frequency">Frequenza Sessioni</Label>
              <Select
                value={formData.session_frequency}
                onValueChange={(value) =>
                  handleInputChange("session_frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Settimanale</SelectItem>
                  <SelectItem value="biweekly">Bisettimanale</SelectItem>
                  <SelectItem value="monthly">Mensile</SelectItem>
                  <SelectItem value="irregular">Irregolare</SelectItem>
                  <SelectItem value="oneshot">One-Shot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Castello medievale, Centro sociale, Villa storica..."
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note Aggiuntive</Label>
            <Textarea
              id="notes"
              placeholder="Equipaggiamento richiesto, preparazione pre-gioco, regole speciali..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="fantasy-button"
              disabled={isLoading}
            >
              {isLoading
                ? isEditMode
                  ? "Aggiornamento..."
                  : "Creazione..."
                : isEditMode
                  ? "Aggiorna Campagna"
                  : "Crea Campagna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
