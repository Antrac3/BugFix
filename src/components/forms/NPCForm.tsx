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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useApp, NPC } from "@/contexts/SupabaseAppContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { BaseModal } from "@/components/modals/BaseModal";

const npcSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  role: z.string().min(1, "Il ruolo è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  location: z.string().optional(),
  linked_events: z.array(z.string()),
  notes: z.string().optional(),
});

type NPCFormData = z.infer<typeof npcSchema>;

interface NPCFormProps {
  isOpen: boolean;
  onClose: () => void;
  npc?: NPC;
}

const npcRoles = [
  "Mercante",
  "Guardia",
  "Nobile",
  "Criminale",
  "Chierico",
  "Artigiano",
  "Contadino",
  "Soldato",
  "Mago",
  "Taverniere",
  "Ladro",
  "Assassino",
  "Re/Regina",
  "Principe/Principessa",
  "Cavaliere",
  "Spia",
  "Studioso",
  "Eremita",
  "Bandito",
  "Guaritore",
];

const commonEvents = [
  "Battaglia del Ponte di Ferro",
  "Festa di Mezza Estate",
  "Mercato delle Gilde",
  "Torneo Reale",
  "Cerimonia di Incoronazione",
  "Invasione degli Orchi",
  "Missione di Salvataggio",
  "Negoziazione di Pace",
  "Rituale Magico",
  "Caccia al Tesoro",
];

export function NPCForm({ isOpen, onClose, npc }: NPCFormProps) {
  const { addNPC, updateNPC } = useApp();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    npc?.linked_events || [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NPCFormData>({
    resolver: zodResolver(npcSchema),
    defaultValues: npc
      ? {
          name: npc.name,
          role: npc.role,
          description: npc.description,
          location: npc.location || "",
          linked_events: npc.linked_events,
          notes: npc.notes,
        }
      : {
          linked_events: [],
        },
  });

  const onSubmit = async (data: NPCFormData) => {
    setIsSubmitting(true);
    try {
      const npcData = {
        ...data,
        linked_events: selectedEvents,
        created_by: user?.id || "",
        created_at: npc?.created_at || new Date().toISOString().split("T")[0],
        stats: npc?.stats || {},
      };

      if (npc) {
        updateNPC(npc.id, npcData);
      } else {
        addNPC(npcData);
      }

      reset();
      setSelectedEvents([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEvents([]);
    onClose();
  };

  const addEvent = (event: string) => {
    if (!selectedEvents.includes(event)) {
      const newEvents = [...selectedEvents, event];
      setSelectedEvents(newEvents);
      setValue("linked_events", newEvents);
    }
  };

  const removeEvent = (event: string) => {
    const newEvents = selectedEvents.filter((e) => e !== event);
    setSelectedEvents(newEvents);
    setValue("linked_events", newEvents);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={npc ? "Modifica PNG" : "Crea Nuovo PNG"}
      description={
        npc
          ? "Modifica i dettagli del personaggio non giocante"
          : "Crea un nuovo PNG per la campagna"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome PNG *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Es. Ser Aldric il Valoroso"
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
                {npcRoles.map((role) => (
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
        </div>

        <div>
          <Label htmlFor="description">Descrizione *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrivi l'aspetto, la personalità e la storia del PNG..."
            className="min-h-24"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Location Associata</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Es. Taverna del Drago Rosso, Castello di Valdris"
          />
        </div>

        <div>
          <Label>Eventi Collegati</Label>
          <Select onValueChange={addEvent}>
            <SelectTrigger>
              <SelectValue placeholder="Aggiungi evento" />
            </SelectTrigger>
            <SelectContent>
              {commonEvents
                .filter((event) => !selectedEvents.includes(event))
                .map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedEvents.map((event) => (
              <Badge
                key={event}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {event}
                <button
                  type="button"
                  onClick={() => removeEvent(event)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Note</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Note aggiuntive per il GM, motivazioni, obiettivi, segreti..."
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
            {isSubmitting ? "Salvando..." : npc ? "Aggiorna PNG" : "Crea PNG"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
