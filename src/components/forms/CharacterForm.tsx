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
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Database } from "@/lib/database.types";

type Character = Database["public"]["Tables"]["characters"]["Row"];
import { BaseModal } from "@/components/modals/BaseModal";

const characterSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  role: z.string().min(1, "Il ruolo è obbligatorio"),
  background: z.string().min(1, "Il background è obbligatorio"),
  status: z.enum(["active", "inactive"]),
  abilities: z.string(),
  description: z.string().optional(),
});

type CharacterFormData = z.infer<typeof characterSchema>;

interface CharacterFormProps {
  isOpen: boolean;
  onClose: () => void;
  character?: Character;
}

const characterRoles = [
  "Nobile",
  "Mercante",
  "Soldato",
  "Chierico",
  "Studioso",
  "Artigiano",
  "Contadino",
  "Guaritore",
  "Esploratore",
  "Diplomatico",
  "Assassino",
  "Mistico",
  "Cantastorie",
  "Ranger",
];

export function CharacterForm({
  isOpen,
  onClose,
  character,
}: CharacterFormProps) {
  const { addCharacter, updateCharacter } = useApp();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: character
      ? {
          name: character.name,
          role: character.role,
          background: character.background,
          status: character.status,
          abilities: character.abilities.join(", "),
          description: character.description || "",
        }
      : {
          status: "active" as const,
          abilities: "",
          description: "",
        },
  });

  const onSubmit = async (data: CharacterFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const characterData = {
        name: data.name,
        role: data.role,
        player_id: user.id,
        status: data.status,
        background: data.background,
        last_session:
          character?.last_session || new Date().toISOString().split("T")[0],
        abilities: data.abilities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        description: data.description || "",
      };

      if (character) {
        await updateCharacter(character.id, characterData);
      } else {
        await addCharacter({
          ...characterData,
          xp: 0,
        });
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={character ? "Modifica Personaggio" : "Crea Nuovo Personaggio"}
      description={
        character
          ? "Modifica i dettagli del personaggio"
          : "Crea un nuovo personaggio per la campagna"
      }
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Personaggio *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Es. Aria Ombratessitrice"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Ruolo *</Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona ruolo" />
              </SelectTrigger>
              <SelectContent>
                {characterRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Player assignment is automatic for current user */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Giocatore:</strong> {user?.name || user?.email}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Il personaggio verrà automaticamente assegnato al tuo account.
            </p>
          </div>

          <div>
            <Label htmlFor="status">Stato</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as "active" | "inactive")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="inactive">Inattivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="background">Background *</Label>
          <Input
            id="background"
            {...register("background")}
            placeholder="Es. Assassino di Gilda"
          />
          {errors.background && (
            <p className="text-red-500 text-sm mt-1">
              {errors.background.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">
            Descrizione Personaggio (Opzionale)
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrivi il personaggio, la sua personalità, aspetto, etc..."
            className="min-h-20"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="abilities">Abilità (separate da virgola)</Label>
          <Textarea
            id="abilities"
            {...register("abilities")}
            placeholder="Attacco Furtivo, Scassinare, Movimento Silenzioso"
            className="min-h-20"
          />
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
              : character
                ? "Aggiorna Personaggio"
                : "Crea Personaggio"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
