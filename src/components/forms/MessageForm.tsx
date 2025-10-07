import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/contexts/SupabaseAppContext";
import { BaseModal } from "@/components/modals/BaseModal";

const messageSchema = z.object({
  fromCharacter: z.string().min(1, "Seleziona il personaggio mittente"),
  toCharacter: z.string().min(1, "Seleziona il personaggio destinatario"),
  content: z
    .string()
    .min(1, "Il messaggio non può essere vuoto")
    .max(1000, "Il messaggio non può superare i 1000 caratteri"),
  isInCharacter: z.boolean(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFrom?: string;
  preselectedTo?: string;
}

export function MessageForm({
  isOpen,
  onClose,
  preselectedFrom,
  preselectedTo,
}: MessageFormProps) {
  const { sendMessage, characters } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      fromCharacter: preselectedFrom || "",
      toCharacter: preselectedTo || "",
      content: "",
      isInCharacter: true,
    },
  });

  const onSubmit = async (data: MessageFormData) => {
    setIsSubmitting(true);
    try {
      // Find the character to get the player ID
      const toCharacterObj = characters.find(
        (c) => c.name === data.toCharacter,
      );
      const toUserId =
        toCharacterObj?.playerId || toCharacterObj?.player_id || "unknown";

      if (!toUserId || toUserId === "unknown") {
        console.error("Cannot find player ID for character:", data.toCharacter);
        return;
      }

      await sendMessage(
        data.fromCharacter,
        data.toCharacter,
        data.content,
        toUserId.toString(),
        data.isInCharacter,
      );

      reset();
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const activeCharacters = characters.filter((c) => c.status === "active");
  const selectedFrom = watch("fromCharacter");
  const selectedTo = watch("toCharacter");
  const messageContent = watch("content");
  const isInCharacter = watch("isInCharacter");

  // Filtra i destinatari per escludere il mittente
  const availableRecipients = activeCharacters.filter(
    (c) => c.name !== selectedFrom,
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invia Messaggio"
      description="Invia un messaggio tra personaggi della campagna"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromCharacter">Da (Mittente) *</Label>
            <Select
              value={watch("fromCharacter")}
              onValueChange={(value) => {
                setValue("fromCharacter", value);
                // Se il destinatario è lo stesso del mittente, resettiamo
                if (watch("toCharacter") === value) {
                  setValue("toCharacter", "");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona mittente" />
              </SelectTrigger>
              <SelectContent>
                {activeCharacters.map((character) => (
                  <SelectItem key={character.id} value={character.name}>
                    {character.name} ({character.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fromCharacter && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fromCharacter.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="toCharacter">A (Destinatario) *</Label>
            <Select
              value={watch("toCharacter")}
              onValueChange={(value) => setValue("toCharacter", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona destinatario" />
              </SelectTrigger>
              <SelectContent>
                {availableRecipients.map((character) => (
                  <SelectItem key={character.id} value={character.name}>
                    {character.name} ({character.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.toCharacter && (
              <p className="text-red-500 text-sm mt-1">
                {errors.toCharacter.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isInCharacter"
            checked={watch("isInCharacter")}
            onCheckedChange={(checked) => setValue("isInCharacter", checked)}
          />
          <Label htmlFor="isInCharacter">Messaggio In-Character</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          {isInCharacter
            ? "Il messaggio sarà inviato come comunicazione tra personaggi durante il gioco"
            : "Il messaggio sarà inviato come comunicazione fuori dal gioco (OOC)"}
        </p>

        <div>
          <Label htmlFor="content">Messaggio *</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder={
              isInCharacter
                ? "Scrivi il messaggio dal punto di vista del tuo personaggio..."
                : "Scrivi il messaggio come comunicazione tra giocatori..."
            }
            className="min-h-32"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {messageContent.length}/1000 caratteri
            </p>
          </div>
        </div>

        {selectedFrom && selectedTo && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-medium mb-2">Anteprima Messaggio</h4>
            <div className="text-sm">
              <span className="font-medium">{selectedFrom}</span>
              <span className="text-muted-foreground">
                {isInCharacter ? " (IC)" : " (OOC)"} →
              </span>
              <span className="font-medium"> {selectedTo}</span>
            </div>
            {messageContent && (
              <div className="mt-2 p-2 bg-background rounded border">
                <p className="text-sm italic">"{messageContent}"</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedFrom || !selectedTo}
            className="fantasy-button"
          >
            {isSubmitting ? "Inviando..." : "Invia Messaggio"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
