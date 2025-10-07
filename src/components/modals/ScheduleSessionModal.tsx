import { useState, useEffect } from "react";
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
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useEvents } from "@/hooks/useEvents";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const sessionSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  date: z.string().min(1, "La data è obbligatoria"),
  startTime: z.string().min(1, "L'orario di inizio è obbligatorio"),
  endTime: z.string().min(1, "L'orario di fine è obbligatorio"),
  locationId: z.string().optional(),
  maxParticipants: z.number().min(1, "Numero massimo partecipanti richiesto"),
  notes: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleSessionModal({
  isOpen,
  onClose,
}: ScheduleSessionModalProps) {
  const { createEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      maxParticipants: 15,
    },
  });

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("id, name, address")
          .eq("status", "available")
          .order("name");

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };

    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const onSubmit = async (data: SessionFormData) => {
    setIsSubmitting(true);

    try {
      // Create start and end datetime strings
      const startDateTime = `${data.date}T${data.startTime}:00`;
      const endDateTime = `${data.date}T${data.endTime}:00`;

      // Validate end time is after start time
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast({
          title: "Errore",
          description:
            "L'orario di fine deve essere successivo a quello di inizio",
          variant: "destructive",
        });
        return;
      }

      const result = await createEvent({
        title: data.title,
        description: data.description,
        event_type: "session",
        start_date: startDateTime,
        end_date: endDateTime,
        location_id:
          data.locationId && data.locationId !== "none"
            ? parseInt(data.locationId)
            : undefined,
        max_participants: data.maxParticipants,
        visibility: "public",
        requires_approval: false,
        entry_fee: 0,
        notes: data.notes,
      });

      if (result) {
        toast({
          title: "Successo",
          description: "Sessione programmata con successo!",
        });
        reset();
        onClose();
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare la sessione",
        variant: "destructive",
      });
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
      title="Programma Nuova Sessione"
      description="Crea una nuova sessione LARP e invita i giocatori"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Titolo */}
          <div className="md:col-span-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Titolo Sessione *
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Es. Sessione 1: L'Inizio dell'Avventura"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.date && (
              <p className="text-sm text-destructive mt-1">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Max Partecipanti */}
          <div>
            <Label
              htmlFor="maxParticipants"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Max Partecipanti *
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              max="50"
              {...register("maxParticipants", { valueAsNumber: true })}
            />
            {errors.maxParticipants && (
              <p className="text-sm text-destructive mt-1">
                {errors.maxParticipants.message}
              </p>
            )}
          </div>

          {/* Orario Inizio */}
          <div>
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Inizio *
            </Label>
            <Input id="startTime" type="time" {...register("startTime")} />
            {errors.startTime && (
              <p className="text-sm text-destructive mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>

          {/* Orario Fine */}
          <div>
            <Label htmlFor="endTime">Fine *</Label>
            <Input id="endTime" type="time" {...register("endTime")} />
            {errors.endTime && (
              <p className="text-sm text-destructive mt-1">
                {errors.endTime.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <Label htmlFor="locationId" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Select onValueChange={(value) => setValue("locationId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuna location specifica</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name} - {location.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descrizione */}
        <div>
          <Label htmlFor="description">Descrizione *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrivi la sessione, la trama, gli obiettivi..."
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <Label htmlFor="notes">Note Aggiuntive</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Equipaggiamento necessario, prerequisiti, note speciali..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Programmando..." : "Programma Sessione"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
