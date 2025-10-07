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
import { useApp, InventoryItem } from "@/contexts/SupabaseAppContext";
import { BaseModal } from "@/components/modals/BaseModal";

const inventoryItemSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  quantity: z.number().min(1, "La quantità deve essere maggiore di 0"),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]),
  effects: z.string().optional(),
  character_id: z.number().optional(),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem;
}

const rarityOptions = [
  { value: "common", label: "Comune", color: "text-gray-600" },
  { value: "uncommon", label: "Non Comune", color: "text-green-600" },
  { value: "rare", label: "Raro", color: "text-blue-600" },
  { value: "epic", label: "Epico", color: "text-purple-600" },
  { value: "legendary", label: "Leggendario", color: "text-orange-600" },
];

export function InventoryItemForm({
  isOpen,
  onClose,
  item,
}: InventoryItemFormProps) {
  const { addInventoryItem, updateInventoryItem, characters } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          rarity: item.rarity,
          effects: item.effects,
          character_id: item.character_id || undefined,
        }
      : {
          quantity: 1,
          rarity: "common",
        },
  });

  const onSubmit = async (data: InventoryItemFormData) => {
    setIsSubmitting(true);
    try {
      const itemData = {
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        rarity: data.rarity,
        effects: data.effects || "",
        character_id: data.character_id,
      };

      if (item) {
        updateInventoryItem(item.id, itemData);
      } else {
        addInventoryItem(itemData);
      }

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

  const selectedRarity = watch("rarity");
  const rarityInfo = rarityOptions.find((r) => r.value === selectedRarity);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={item ? "Modifica Oggetto" : "Aggiungi Nuovo Oggetto"}
      description={
        item
          ? "Modifica i dettagli dell'oggetto"
          : "Aggiungi un nuovo oggetto all'inventario"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Oggetto *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Es. Spada Incantata"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantità *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { valueAsNumber: true })}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrizione *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrivi l'aspetto e le caratteristiche dell'oggetto..."
            className="min-h-24"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rarity">Rarità *</Label>
            <Select
              value={watch("rarity")}
              onValueChange={(value) =>
                setValue(
                  "rarity",
                  value as
                    | "common"
                    | "uncommon"
                    | "rare"
                    | "epic"
                    | "legendary",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((rarity) => (
                  <SelectItem key={rarity.value} value={rarity.value}>
                    <span className={rarity.color}>{rarity.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rarityInfo && (
              <p className={`text-sm mt-1 ${rarityInfo.color}`}>
                Rarità: {rarityInfo.label}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="character_id">Assegnato a</Label>
            <Select
              value={watch("character_id")?.toString() || "none"}
              onValueChange={(value) =>
                setValue(
                  "character_id",
                  value === "none" ? undefined : parseInt(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Nessun assegnatario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Inventario Generale</SelectItem>
                {characters
                  .filter((c) => c.status === "active")
                  .map((character) => (
                    <SelectItem
                      key={character.id}
                      value={character.id.toString()}
                    >
                      {character.name} ({character.class})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="effects">Effetti e Proprietà Speciali</Label>
          <Textarea
            id="effects"
            {...register("effects")}
            placeholder="Descrivi gli effetti magici, bonus alle statistiche, poteri speciali..."
            className="min-h-20"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Esempi: +2 Forza, Resistenza al fuoco, Cura 1d4 HP al giorno
          </p>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="fantasy-button"
          >
            {isSubmitting
              ? "Salvando..."
              : item
                ? "Aggiorna Oggetto"
                : "Aggiungi Oggetto"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
