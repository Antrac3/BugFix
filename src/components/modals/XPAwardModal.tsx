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
import { useApp } from "@/contexts/SupabaseAppContext";
import { BaseModal } from "./BaseModal";
import { Zap } from "lucide-react";

const xpSchema = z.object({
  characterId: z.number().min(1, "Seleziona un personaggio"),
  xpAmount: z.number().min(1, "I PE devono essere maggiori di 0"),
  reason: z.string().min(1, "Il motivo è obbligatorio"),
});

type XPFormData = z.infer<typeof xpSchema>;

interface XPAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCharacterId?: number;
}

export function XPAwardModal({
  isOpen,
  onClose,
  preselectedCharacterId,
}: XPAwardModalProps) {
  const { characters, awardXP } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<XPFormData>({
    resolver: zodResolver(xpSchema),
    defaultValues: {
      characterId: preselectedCharacterId || 0,
      xpAmount: 25,
      reason: "",
    },
  });

  const onSubmit = async (data: XPFormData) => {
    setIsSubmitting(true);
    try {
      awardXP(data.characterId, data.xpAmount, data.reason);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedCharacter = characters.find(
    (c) => c.id === watch("characterId"),
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assegna Punti Esperienza"
      description="Assegna PE a un personaggio per le sue azioni nella sessione"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="characterId">Personaggio *</Label>
          <Select
            value={watch("characterId")?.toString() || ""}
            onValueChange={(value) => setValue("characterId", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona personaggio" />
            </SelectTrigger>
            <SelectContent>
              {characters
                .filter((c) => c.status === "active")
                .map((character) => (
                  <SelectItem
                    key={character.id}
                    value={character.id.toString()}
                  >
                    {character.name} - Lv. {character.level} ({character.class})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.characterId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.characterId.message}
            </p>
          )}
        </div>

        {selectedCharacter && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="h-5 w-5 text-fantasy-gold" />
              <h3 className="font-medium">Informazioni Personaggio</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">PE Attuali:</span>
                <span className="ml-2 font-medium">{selectedCharacter.xp}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Livello:</span>
                <span className="ml-2 font-medium">
                  {selectedCharacter.level}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Giocatore:</span>
                <span className="ml-2 font-medium">
                  {selectedCharacter.player}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Classe:</span>
                <span className="ml-2 font-medium">
                  {selectedCharacter.class}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="xpAmount">Punti Esperienza *</Label>
          <Input
            id="xpAmount"
            type="number"
            min="1"
            {...register("xpAmount", { valueAsNumber: true })}
            placeholder="25"
          />
          {errors.xpAmount && (
            <p className="text-red-500 text-sm mt-1">
              {errors.xpAmount.message}
            </p>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            Suggerimenti: Azione minore (5-10 PE), Buon roleplay (15-25 PE),
            Obiettivo completato (25-50 PE), Impresa eroica (50+ PE)
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Motivo *</Label>
          <Textarea
            id="reason"
            {...register("reason")}
            placeholder="Es. Excellent roleplay durante la negoziazione, Completamento missione principale, Azione eroica per salvare il gruppo..."
            className="min-h-20"
          />
          {errors.reason && (
            <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedCharacter}
            className="fantasy-button"
          >
            {isSubmitting ? "Assegnando..." : "Assegna PE"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
