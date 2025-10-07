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
import { Package, ArrowRight, Users } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useApp } from "@/contexts/SupabaseAppContext";

const tradeSchema = z.object({
  fromCharacterId: z.number().min(1, "Seleziona il personaggio mittente"),
  toCharacterId: z.number().min(1, "Seleziona il personaggio destinatario"),
  itemId: z.number().min(1, "Seleziona l'oggetto da scambiare"),
  notes: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface ItemTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ItemTradeModal({ isOpen, onClose }: ItemTradeModalProps) {
  const { characters, inventoryItems, transferItem, addApproval } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
  });

  const fromCharacterId = watch("fromCharacterId");
  const toCharacterId = watch("toCharacterId");
  const itemId = watch("itemId");

  const activeCharacters = characters.filter((c) => c.status === "active");
  const availableItems = inventoryItems.filter(
    (item) => item.character_id === fromCharacterId,
  );

  const selectedItem = inventoryItems.find((item) => item.id === itemId);
  const fromCharacter = characters.find((c) => c.id === fromCharacterId);
  const toCharacter = characters.find((c) => c.id === toCharacterId);

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true);

    // Simula processo di scambio
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Crea richiesta di approvazione per lo scambio
    addApproval({
      type: "scambio_oggetto",
      title: `Scambio ${selectedItem?.name}`,
      description: `Scambio ${selectedItem?.name} da ${fromCharacter?.name} a ${toCharacter?.name}`,
      requester: fromCharacter?.player || "Sconosciuto",
      requesterId: fromCharacterId,
      priority: "media",
      status: "pendente",
      submitted: new Date().toISOString(),
      details: {
        from: fromCharacter?.name,
        to: toCharacter?.name,
        item: selectedItem?.name,
        notes: data.notes,
      },
    });

    setIsSubmitting(false);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gestisci Scambi Oggetti"
      description="Organizza e approva scambi di oggetti tra personaggi"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* From Character */}
        <div className="space-y-2">
          <Label htmlFor="fromCharacterId">Personaggio Mittente</Label>
          <Select
            value={fromCharacterId?.toString()}
            onValueChange={(value) =>
              setValue("fromCharacterId", parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona personaggio che cede l'oggetto" />
            </SelectTrigger>
            <SelectContent>
              {activeCharacters.map((character) => (
                <SelectItem key={character.id} value={character.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {character.name} ({character.player})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fromCharacterId && (
            <p className="text-sm text-red-500">
              {errors.fromCharacterId.message}
            </p>
          )}
        </div>

        {/* Item Selection */}
        {fromCharacterId && (
          <div className="space-y-2">
            <Label htmlFor="itemId">Oggetto da Scambiare</Label>
            <Select
              value={itemId?.toString()}
              onValueChange={(value) => setValue("itemId", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona oggetto" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>
                        {item.name} ({item.rarity})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableItems.length === 0 && fromCharacterId && (
              <p className="text-sm text-muted-foreground">
                Questo personaggio non ha oggetti nell'inventario
              </p>
            )}
            {errors.itemId && (
              <p className="text-sm text-red-500">{errors.itemId.message}</p>
            )}
          </div>
        )}

        {/* Trade Arrow */}
        {fromCharacterId && itemId && (
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-fantasy-primary" />
          </div>
        )}

        {/* To Character */}
        <div className="space-y-2">
          <Label htmlFor="toCharacterId">Personaggio Destinatario</Label>
          <Select
            value={toCharacterId?.toString()}
            onValueChange={(value) =>
              setValue("toCharacterId", parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona personaggio che riceve l'oggetto" />
            </SelectTrigger>
            <SelectContent>
              {activeCharacters
                .filter((c) => c.id !== fromCharacterId)
                .map((character) => (
                  <SelectItem
                    key={character.id}
                    value={character.id.toString()}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {character.name} ({character.player})
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.toCharacterId && (
            <p className="text-sm text-red-500">
              {errors.toCharacterId.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Note Aggiuntive (Opzionale)</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Aggiungi dettagli sul motivo dello scambio..."
            rows={3}
          />
        </div>

        {/* Trade Preview */}
        {fromCharacter && toCharacter && selectedItem && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-medium mb-2">Anteprima Scambio:</h4>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{fromCharacter.name}</span>
                <span className="text-muted-foreground"> cede </span>
                <span className="font-medium text-fantasy-accent">
                  {selectedItem.name}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-fantasy-primary" />
              <div>
                <span className="font-medium">{toCharacter.name}</span>
              </div>
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
            <Package className="h-4 w-4 mr-2" />
            {isSubmitting ? "Processando..." : "Crea Richiesta Scambio"}
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
