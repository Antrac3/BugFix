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
import { useApp, Player } from "@/contexts/SupabaseAppContext";
import { BaseModal } from "@/components/modals/BaseModal";

const playerSchema = z.object({
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
  status: z.enum(["active", "inactive", "suspended"]),
  role: z.enum(["player", "gm"]),
  location: z.string().min(1, "La località è obbligatoria"),
  emergencyContact: z
    .string()
    .min(1, "Il contatto di emergenza è obbligatorio"),
  notes: z.string().optional(),
  discord: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  isOpen: boolean;
  onClose: () => void;
  player?: Player;
}

export function PlayerForm({ isOpen, onClose, player }: PlayerFormProps) {
  const { addPlayer, updatePlayer } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: player
      ? {
          firstName: player.firstName,
          lastName: player.lastName,
          email: player.email,
          phone: player.phone,
          status: player.status,
          role: player.role,
          location: player.location,
          emergencyContact: player.emergencyContact,
          notes: player.notes,
          discord: player.socialLinks.discord || "",
          instagram: player.socialLinks.instagram || "",
          twitter: player.socialLinks.twitter || "",
        }
      : {
          status: "active",
          role: "player",
        },
  });

  const onSubmit = async (data: PlayerFormData) => {
    setIsSubmitting(true);
    try {
      const playerData = {
        ...data,
        name: `${data.firstName} ${data.lastName}`,
        socialLinks: {
          discord: data.discord || "",
          instagram: data.instagram || "",
          twitter: data.twitter || "",
        },
        joinDate: player?.joinDate || new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString().split("T")[0],
        characters: player?.characters || [],
        campaigns: player?.campaigns || ["Ombre di Valdris"],
      };

      if (player) {
        updatePlayer(player.id, playerData);
      } else {
        addPlayer(playerData);
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
      title={player ? "Modifica Giocatore" : "Aggiungi Nuovo Giocatore"}
      description={
        player
          ? "Modifica le informazioni del giocatore"
          : "Inserisci i dettagli del nuovo giocatore"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nome *</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="Es. Elena"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Cognome *</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Es. Martinez"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="elena@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Telefono *</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+39 123 456 7890"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Località *</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Milano, Italia"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Stato</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as "active" | "inactive" | "suspended")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="inactive">Inattivo</SelectItem>
                <SelectItem value="suspended">Sospeso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Ruolo</Label>
            <Select
              value={watch("role")}
              onValueChange={(value) =>
                setValue("role", value as "player" | "gm")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Giocatore</SelectItem>
                <SelectItem value="gm">Game Master</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="emergencyContact">Contatto di Emergenza *</Label>
          <Input
            id="emergencyContact"
            {...register("emergencyContact")}
            placeholder="Maria Martinez - +39 123 456 7891"
          />
          {errors.emergencyContact && (
            <p className="text-red-500 text-sm mt-1">
              {errors.emergencyContact.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                {...register("discord")}
                placeholder="username#1234"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register("instagram")}
                placeholder="@username"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register("twitter")}
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Note</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Note aggiuntive sul giocatore..."
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
              : player
                ? "Aggiorna Giocatore"
                : "Aggiungi Giocatore"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
