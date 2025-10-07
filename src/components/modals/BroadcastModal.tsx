import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Users, Crown, Sparkles } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useCommunications } from "@/hooks/useCommunications";

const broadcastSchema = z.object({
  subject: z.string().min(1, "L'oggetto è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  recipientGroup: z.enum(["tutti", "giocatori", "gm", "personaggi_attivi"]),
});

type BroadcastFormData = z.infer<typeof broadcastSchema>;

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastModal({ isOpen, onClose }: BroadcastModalProps) {
  const { createCommunication } = useCommunications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      recipientGroup: "tutti",
    },
  });

  const recipientGroup = watch("recipientGroup");

  const getRecipientCount = () => {
    switch (recipientGroup) {
      case "tutti":
        return "Tutti gli utenti";
      case "giocatori":
        return "Solo giocatori";
      case "gm":
        return "Solo Game Masters";
      case "personaggi_attivi":
        return "Partecipanti eventi";
      default:
        return "Nessuno";
    }
  };

  const getRecipientsList = () => {
    return [];
  };

  const onSubmit = async (data: BroadcastFormData) => {
    setIsSubmitting(true);

    try {
      await createCommunication({
        title: data.subject,
        content: data.content,
        type: "announcement",
        priority: "normal",
        target_audience:
          data.recipientGroup === "tutti"
            ? "all"
            : data.recipientGroup === "giocatori"
              ? "players"
              : data.recipientGroup === "gm"
                ? "gms"
                : "event_participants",
        published_at: new Date().toISOString(),
      });

      reset();
      onClose();
    } catch (error) {
      console.error("Error sending broadcast:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Trasmetti Messaggio"
      description="Invia un annuncio a giocatori o gruppi specifici"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Recipient Group */}
        <div className="space-y-2">
          <Label htmlFor="recipientGroup">Gruppo Destinatari</Label>
          <Select
            value={recipientGroup}
            onValueChange={(value) => setValue("recipientGroup", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutti">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Tutti i Giocatori</span>
                </div>
              </SelectItem>
              <SelectItem value="giocatori">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Solo Giocatori</span>
                </div>
              </SelectItem>
              <SelectItem value="gm">
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Solo Game Master</span>
                </div>
              </SelectItem>
              <SelectItem value="personaggi_attivi">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Personaggi Attivi</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Questo messaggio sarà inviato a {getRecipientCount()} destinatari
          </p>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Oggetto</Label>
          <Input
            id="subject"
            {...register("subject")}
            placeholder="es. Aggiornamento Sessione 16, Nuove Regole, ecc."
            className={errors.subject ? "border-red-500" : ""}
          />
          {errors.subject && (
            <p className="text-sm text-red-500">{errors.subject.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Messaggio</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder="Scrivi qui il tuo annuncio..."
            rows={6}
            className={errors.content ? "border-red-500" : ""}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        {/* Preview Recipients */}
        {recipientGroup && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-medium mb-2">Anteprima Destinatari:</h4>
            <div className="flex flex-wrap gap-2">
              {getRecipientsList()
                .slice(0, 5)
                .map((name, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-fantasy-primary/10 text-fantasy-primary rounded"
                  >
                    {name}
                  </span>
                ))}
              {getRecipientsList().length > 5 && (
                <span className="px-2 py-1 text-xs bg-muted rounded">
                  +{getRecipientsList().length - 5} altri
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 fantasy-button"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Invio in corso..." : "Invia Trasmissione"}
          </Button>

          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={isSubmitting}
            className="flex-1"
          >
            Annulla
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
