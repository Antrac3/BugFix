import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  Edit,
  Trash2,
  User,
  Shield,
  Zap,
  Heart,
  Activity,
  Eye,
  CloudRain,
  Info,
} from "lucide-react";

interface CampaignDetailsModalProps {
  campaign: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CampaignDetailsModal({
  campaign,
  onClose,
  onEdit,
  onDelete,
}: CampaignDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "planning":
        return "secondary";
      case "active":
        return "default";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planning":
        return "In Pianificazione";
      case "active":
        return "Attiva";
      case "completed":
        return "Completata";
      default:
        return status;
    }
  };

  const getCombatStyleText = (style: string) => {
    switch (style) {
      case "none":
        return "Nessun Combattimento";
      case "light":
        return "Combattimento Leggero";
      case "boffer":
        return "Armi Boffer";
      case "latex":
        return "Armi Latex";
      default:
        return style;
    }
  };

  const getPhysicalIntensityText = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "Bassa";
      case "moderate":
        return "Moderata";
      case "high":
        return "Alta";
      case "extreme":
        return "Estrema";
      default:
        return intensity;
    }
  };

  const getPhysicalIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "extreme":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-fantasy-primary">
                {campaign.name}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusVariant(campaign.status)}>
                  {getStatusText(campaign.status)}
                </Badge>
                {campaign.genre && (
                  <Badge variant="outline" className="capitalize">
                    {campaign.genre.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-fantasy-primary text-fantasy-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Dettagli Generali
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "larp"
                ? "border-fantasy-primary text-fantasy-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("larp")}
          >
            Specifiche LARP
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "players"
                ? "border-fantasy-primary text-fantasy-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("players")}
          >
            Giocatori
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Description */}
            {campaign.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Descrizione</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {campaign.description}
                </p>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informazioni Base</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-fantasy-primary" />
                    <div>
                      <span className="font-medium">Giocatori:</span>
                      <span className="ml-2 text-muted-foreground">
                        {campaign.player_count || 0}/{campaign.max_players}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-fantasy-primary" />
                    <div>
                      <span className="font-medium">Durata:</span>
                      <span className="ml-2 text-muted-foreground">
                        {campaign.duration}h per sessione
                      </span>
                    </div>
                  </div>

                  {campaign.start_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">Data Inizio:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(campaign.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {campaign.end_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">Data Fine:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(campaign.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {campaign.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">Luogo:</span>
                        <span className="ml-2 text-muted-foreground">
                          {campaign.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dettagli Aggiuntivi</h3>

                <div className="space-y-3">
                  {campaign.setting && (
                    <div>
                      <span className="font-medium">Ambientazione:</span>
                      <p className="text-muted-foreground mt-1">
                        {campaign.setting}
                      </p>
                    </div>
                  )}

                  {campaign.rules_system && (
                    <div>
                      <span className="font-medium">Sistema di Regole:</span>
                      <p className="text-muted-foreground mt-1">
                        {campaign.rules_system}
                      </p>
                    </div>
                  )}

                  {campaign.session_frequency && (
                    <div>
                      <span className="font-medium">Frequenza Sessioni:</span>
                      <p className="text-muted-foreground mt-1">
                        {campaign.session_frequency}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "larp" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LARP Type & Physical Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Tipo e Requisiti Fisici
                </h3>

                <div className="space-y-3">
                  {campaign.larp_type && (
                    <div className="flex items-center space-x-3">
                      <Sparkles className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">Tipo LARP:</span>
                        <span className="ml-2 text-muted-foreground capitalize">
                          {campaign.larp_type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  )}

                  {campaign.physical_intensity && (
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">Intensità Fisica:</span>
                        <span
                          className={`ml-2 font-medium ${getPhysicalIntensityColor(campaign.physical_intensity)}`}
                        >
                          {getPhysicalIntensityText(
                            campaign.physical_intensity,
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {campaign.combat_style && (
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">
                          Stile Combattimento:
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          {getCombatStyleText(campaign.combat_style)}
                        </span>
                      </div>
                    </div>
                  )}

                  {campaign.age_rating && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-fantasy-primary" />
                      <div>
                        <span className="font-medium">Età Minima:</span>
                        <span className="ml-2 text-muted-foreground">
                          {campaign.age_rating}+
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment & Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Equipaggiamento</h3>

                <div className="space-y-3">
                  {campaign.costume_requirements && (
                    <div>
                      <span className="font-medium">Requisiti Costume:</span>
                      <p className="text-muted-foreground mt-1">
                        {campaign.costume_requirements}
                      </p>
                    </div>
                  )}

                  {campaign.props_needed && (
                    <div>
                      <span className="font-medium">Oggetti di Scena:</span>
                      <p className="text-muted-foreground mt-1">
                        {campaign.props_needed}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Considerations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Considerazioni Speciali</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaign.accessibility_notes && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-fantasy-primary" />
                      <span className="font-medium">Accessibilità</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.accessibility_notes}
                    </p>
                  </div>
                )}

                {campaign.weather_dependency && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudRain className="h-4 w-4 text-fantasy-primary" />
                      <span className="font-medium">Dipendenza dal Meteo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.weather_dependency}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Giocatori ({campaign.player_count || 0}/{campaign.max_players})
              </h3>
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Gestisci Giocatori
              </Button>
            </div>

            {/* Players would be loaded from a separate query/hook */}
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                La gestione dei giocatori sarà implementata nella prossima
                versione
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
