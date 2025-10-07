import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  User,
  Calendar,
} from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useApp, Approval } from "@/contexts/SupabaseAppContext";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval?: Approval;
}

export function ApprovalModal({
  isOpen,
  onClose,
  approval,
}: ApprovalModalProps) {
  const { approveRequest, rejectRequest } = useApp();
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!approval) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing
    approveRequest(approval.id, reviewNotes);
    setIsProcessing(false);
    setReviewNotes("");
    onClose();
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing
    rejectRequest(approval.id, reviewNotes);
    setIsProcessing(false);
    setReviewNotes("");
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scambio_oggetto":
        return <Package className="h-5 w-5" />;
      case "aggiornamento_personaggio":
        return <User className="h-5 w-5" />;
      case "nuovo_personaggio":
        return <User className="h-5 w-5" />;
      case "evento_speciale":
        return <Calendar className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-500 text-white";
      case "media":
        return "bg-yellow-500 text-white";
      case "bassa":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Revisiona Richiesta"
      description="Esamina i dettagli della richiesta e prendi una decisione"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-fantasy-primary/10 flex items-center justify-center text-fantasy-primary">
              {getTypeIcon(approval.type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{approval.title}</h3>
              <p className="text-sm text-muted-foreground">
                Richiesta da {approval.requester}
              </p>
            </div>
          </div>
          <Badge className={getPriorityColor(approval.priority)}>
            {approval.priority}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Descrizione
            </Label>
            <p className="mt-1 text-sm">{approval.description}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Data Richiesta
            </Label>
            <p className="mt-1 text-sm">
              {new Date(approval.submitted).toLocaleDateString("it-IT")}
            </p>
          </div>

          {approval.details && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Dettagli Specifici
              </Label>
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border text-sm">
                {Object.entries(approval.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="font-medium capitalize">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review Notes */}
        <div className="space-y-2">
          <Label htmlFor="reviewNotes">Note di Revisione (Opzionale)</Label>
          <Textarea
            id="reviewNotes"
            placeholder="Aggiungi note o commenti per questa decisione..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isProcessing ? "Approvando..." : "Approva Richiesta"}
          </Button>

          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isProcessing ? "Rifiutando..." : "Rifiuta Richiesta"}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            disabled={isProcessing}
            className="flex-1"
          >
            Annulla
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
