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
import { useApp, Location } from "@/contexts/SupabaseAppContext";
import { BaseModal } from "@/components/modals/BaseModal";

const locationSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(["outdoor", "indoor", "industrial", "garden"]),
  capacity: z.number().min(1, "La capacità deve essere maggiore di 0"),
  status: z.enum(["available", "booked", "maintenance"]),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  amenities: z.array(z.string()),
  contact: z.string().min(1, "Il contatto è obbligatorio"),
  notes: z.string().optional(),
  price_range: z.string().min(1, "Il range di prezzo è obbligatorio"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location;
}

const locationTypes = [
  { value: "outdoor", label: "Esterno" },
  { value: "indoor", label: "Interno" },
  { value: "industrial", label: "Industriale" },
  { value: "garden", label: "Giardino" },
];

const commonAmenities = [
  "Parcheggio",
  "Bagni",
  "Accesso all'acqua",
  "Gazebo/Padiglione",
  "Cucina",
  "Attrezzatura A/V",
  "Tavoli/Sedie",
  "Controllo Climatico",
  "Dock di Carico",
  "Illuminazione Base",
  "Sentieri del Giardino",
  "Fontana",
  "Aree Fotografiche",
  "Wi-Fi",
  "Generatore",
  "Area Picnic",
];

export function LocationForm({ isOpen, onClose, location }: LocationFormProps) {
  const { addLocation, updateLocation } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    location?.amenities || [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location
      ? {
          name: location.name,
          address: location.address,
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng,
          type: location.type,
          capacity: location.capacity,
          status: location.status,
          description: location.description,
          amenities: location.amenities,
          contact: location.contact,
          notes: location.notes,
          price_range: location.price_range,
        }
      : {
          type: "outdoor",
          status: "available",
          capacity: 20,
          latitude: 41.9028,
          longitude: 12.4964,
          amenities: [],
        },
  });

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      const locationData = {
        name: data.name,
        address: data.address,
        coordinates: { lat: data.latitude, lng: data.longitude },
        type: data.type,
        capacity: data.capacity,
        status: data.status,
        description: data.description,
        amenities: selectedAmenities,
        contact: data.contact,
        notes: data.notes || "",
        images: location?.images || [],
        upcoming_events: location?.upcoming_events || [],
        last_used:
          location?.last_used || new Date().toISOString().split("T")[0],
        rating: location?.rating || 4.0,
        price_range: data.price_range,
      };

      if (location) {
        updateLocation(location.id, locationData);
      } else {
        addLocation(locationData);
      }

      reset();
      setSelectedAmenities([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedAmenities([]);
    onClose();
  };

  const addAmenity = (amenity: string) => {
    if (!selectedAmenities.includes(amenity)) {
      const newAmenities = [...selectedAmenities, amenity];
      setSelectedAmenities(newAmenities);
      setValue("amenities", newAmenities);
    }
  };

  const removeAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.filter((a) => a !== amenity);
    setSelectedAmenities(newAmenities);
    setValue("amenities", newAmenities);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={location ? "Modifica Location" : "Aggiungi Nuova Location"}
      description={
        location
          ? "Modifica i dettagli della location"
          : "Aggiungi una nuova location per le sessioni"
      }
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Location *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Es. Prati Mistici"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="capacity">Capacità *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              {...register("capacity", { valueAsNumber: true })}
              placeholder="20"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Indirizzo *</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Via Esempio 123, Roma, Italia"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitudine *</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register("latitude", { valueAsNumber: true })}
              placeholder="41.9028"
            />
            {errors.latitude && (
              <p className="text-red-500 text-sm mt-1">
                {errors.latitude.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="longitude">Longitudine *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register("longitude", { valueAsNumber: true })}
              placeholder="12.4964"
            />
            {errors.longitude && (
              <p className="text-red-500 text-sm mt-1">
                {errors.longitude.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) =>
                setValue(
                  "type",
                  value as "outdoor" | "indoor" | "industrial" | "garden",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Stato</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue(
                  "status",
                  value as "available" | "booked" | "maintenance",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponibile</SelectItem>
                <SelectItem value="booked">Prenotata</SelectItem>
                <SelectItem value="maintenance">Manutenzione</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price_range">Range Prezzo *</Label>
            <Input
              id="price_range"
              {...register("price_range")}
              placeholder="€50-100/giorno"
            />
            {errors.price_range && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price_range.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrizione *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrivi la location, l'atmosfera e le caratteristiche..."
            className="min-h-24"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact">Contatto *</Label>
          <Input
            id="contact"
            {...register("contact")}
            placeholder="Mario Rossi - +39 123 456 7890"
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">
              {errors.contact.message}
            </p>
          )}
        </div>

        <div>
          <Label>Servizi Disponibili</Label>
          <Select onValueChange={addAmenity}>
            <SelectTrigger>
              <SelectValue placeholder="Aggiungi servizio" />
            </SelectTrigger>
            <SelectContent>
              {commonAmenities
                .filter((amenity) => !selectedAmenities.includes(amenity))
                .map((amenity) => (
                  <SelectItem key={amenity} value={amenity}>
                    {amenity}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAmenities.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
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
            placeholder="Note aggiuntive, istruzioni speciali, restrizioni..."
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
              : location
                ? "Aggiorna Location"
                : "Aggiungi Location"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
