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
import { useApp, Contact } from "@/contexts/SupabaseAppContext";
import { BaseModal } from "@/components/modals/BaseModal";

const contactSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  type: z.enum(["vendor", "actor", "collaborator", "supplier"]),
  category: z.string().min(1, "La categoria è obbligatoria"),
  contact_person: z.string().min(1, "La persona di contatto è obbligatoria"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
  website: z.string().optional(),
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  services: z.array(z.string()),
  price_range: z.string().min(1, "Il range di prezzo è obbligatorio"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact;
}

const contactTypes = [
  { value: "vendor", label: "Fornitore" },
  { value: "actor", label: "Attore" },
  { value: "collaborator", label: "Collaboratore" },
  { value: "supplier", label: "Fornitore Servizi" },
];

const categories = {
  vendor: [
    "Oggetti di Scena & Costumi",
    "Catering",
    "Attrezzature",
    "Servizi Generali",
    "Tecnologia",
    "Trasporti",
  ],
  actor: ["Attori PNG", "Performer", "Artisti", "Musicisti", "Narratori"],
  collaborator: [
    "GM Freelance",
    "Scrittori",
    "World Builder",
    "Organizzatori",
    "Coordinatori",
  ],
  supplier: [
    "Servizi Tecnici",
    "Supporto Logistico",
    "Consulenze",
    "Marketing",
  ],
};

const commonTags = [
  "costumi",
  "armi",
  "armature",
  "oggetti-scena",
  "cibo-medievale",
  "eventi-tematici",
  "restrizioni-dietetiche",
  "villano",
  "nobile",
  "esperto",
  "gm-esperto",
  "world-building",
  "storytelling",
  "camping",
  "forniture",
  "ordini-bulk",
  "consegna-veloce",
];

const commonServices = [
  "Armature Personalizzate",
  "Noleggio Armi",
  "Design Costumi",
  "Banchetti Medievali",
  "Razioni da Viaggio",
  "Dolci Tematici",
  "Recitazione Villain",
  "Personaggi Nobili",
  "Voice Acting",
  "GMing Ospite",
  "World Building",
  "Sviluppo Trama",
  "Attrezzatura Camping",
  "Forniture Base",
  "Ordini Bulk",
];

export function ContactForm({ isOpen, onClose, contact }: ContactFormProps) {
  const { addContact, updateContact } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    contact?.tags || [],
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    contact?.services || [],
  );
  const [newTag, setNewTag] = useState("");
  const [newService, setNewService] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          name: contact.name,
          type: contact.type,
          category: contact.category,
          contact_person: contact.contact_person,
          email: contact.email,
          phone: contact.phone,
          website: contact.website || "",
          address: contact.address,
          tags: contact.tags,
          notes: contact.notes,
          services: contact.services,
          price_range: contact.price_range,
        }
      : {
          type: "vendor",
          tags: [],
          services: [],
        },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const contactData = {
        ...data,
        tags: selectedTags,
        services: selectedServices,
        rating: contact?.rating || 4.0,
        last_contact:
          contact?.last_contact || new Date().toISOString().split("T")[0],
        total_interactions: contact?.total_interactions || 0,
      };

      if (contact) {
        updateContact(contact.id, contactData);
      } else {
        addContact(contactData);
      }

      reset();
      setSelectedTags([]);
      setSelectedServices([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setSelectedServices([]);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      const newTags = [...selectedTags, newTag.trim()];
      setSelectedTags(newTags);
      setValue("tags", newTags);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };

  const addService = () => {
    if (newService.trim() && !selectedServices.includes(newService.trim())) {
      const newServices = [...selectedServices, newService.trim()];
      setSelectedServices(newServices);
      setValue("services", newServices);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    const newServices = selectedServices.filter((s) => s !== service);
    setSelectedServices(newServices);
    setValue("services", newServices);
  };

  const addCommonTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setValue("tags", newTags);
    }
  };

  const addCommonService = (service: string) => {
    if (!selectedServices.includes(service)) {
      const newServices = [...selectedServices, service];
      setSelectedServices(newServices);
      setValue("services", newServices);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={contact ? "Modifica Contatto" : "Aggiungi Nuovo Contatto"}
      description={
        contact
          ? "Modifica i dettagli del contatto"
          : "Aggiungi un nuovo contatto alla rubrica"
      }
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome/Azienda *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Es. Emporium Oggetti Medievali"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_person">Persona di Contatto *</Label>
            <Input
              id="contact_person"
              {...register("contact_person")}
              placeholder="Es. Roberto Smith"
            />
            {errors.contact_person && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contact_person.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) =>
                setValue(
                  "type",
                  value as "vendor" | "actor" | "collaborator" | "supplier",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contactTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                {selectedType &&
                  categories[selectedType]?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
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
              placeholder="ordini@contatto.com"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website">Sito Web</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder="www.esempio.com"
            />
          </div>

          <div>
            <Label htmlFor="price_range">Range Prezzo *</Label>
            <Input
              id="price_range"
              {...register("price_range")}
              placeholder="€-€€ o €150-250/sessione"
            />
            {errors.price_range && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price_range.message}
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

        <div>
          <Label>Servizi</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Aggiungi servizio"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addService();
                }
              }}
            />
            <Button type="button" onClick={addService} variant="outline">
              Aggiungi
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {commonServices
              .filter((service) => !selectedServices.includes(service))
              .slice(0, 6)
              .map((service) => (
                <Button
                  key={service}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addCommonService(service)}
                  className="h-6 px-2 text-xs"
                >
                  + {service}
                </Button>
              ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <Badge
                key={service}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Tag</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Aggiungi tag"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Aggiungi
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {commonTags
              .filter((tag) => !selectedTags.includes(tag))
              .slice(0, 8)
              .map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addCommonTag(tag)}
                  className="h-6 px-2 text-xs"
                >
                  + {tag}
                </Button>
              ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
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
            placeholder="Note aggiuntive, istruzioni speciali, esperienze passate..."
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
              : contact
                ? "Aggiorna Contatto"
                : "Aggiungi Contatto"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
