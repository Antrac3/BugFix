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
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Plus, Eye, Users, Lock } from "lucide-react";
import { BaseModal } from "./BaseModal";

const ruleSectionSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  category: z.string().min(1, "Seleziona una categoria"),
  priority: z.enum(["bassa", "media", "alta"]),
  isPublic: z.boolean(),
  tags: z.string().optional(),
});

type RuleSectionFormData = z.infer<typeof ruleSectionSchema>;

interface RuleSection {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: "bassa" | "media" | "alta";
  isPublic: boolean;
  tags: string[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  version: number;
}

interface AddRuleSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  "Regole Base",
  "Combattimento",
  "Roleplay",
  "Equipaggiamento",
  "Magia e Abilità",
  "Sicurezza",
  "Comportamento",
  "Eventi Speciali",
  "Sistema PE",
  "Altro",
];

export function AddRuleSectionModal({
  isOpen,
  onClose,
}: AddRuleSectionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ruleSections, setRuleSections] = useState<RuleSection[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RuleSectionFormData>({
    resolver: zodResolver(ruleSectionSchema),
    defaultValues: {
      priority: "media",
      isPublic: true,
    },
  });

  const isPublic = watch("isPublic");
  const selectedCategory = watch("category");

  const onSubmit = async (data: RuleSectionFormData) => {
    setIsSubmitting(true);

    // Simula creazione sezione
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSection: RuleSection = {
      id: Date.now(),
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      isPublic: data.isPublic,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      created_by: "Game Master",
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      version: 1,
    };

    setRuleSections((prev) => [...prev, newSection]);

    setIsSubmitting(false);
    reset();
    onClose();

    // Simula notifica
    console.log(
      `Nuova sezione regolamento creata: ${data.title} (${data.category})`,
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "text-red-500";
      case "media":
        return "text-yellow-500";
      case "bassa":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Aggiungi Sezione Regolamento"
      description="Crea una nuova sezione per il regolamento della campagna"
      size="large"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo Sezione</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="es. Regole di Combattimento"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Contenuto</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder="Scrivi qui il contenuto della sezione regolamento. Puoi usare markdown per la formattazione..."
            rows={8}
            className={errors.content ? "border-red-500" : ""}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Suggerimento: Usa markdown per formattare il testo (es.
            **grassetto**, *corsivo*, liste)
          </p>
        </div>

        {/* Priority and Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priorità</Label>
            <Select
              value={watch("priority")}
              onValueChange={(value) =>
                setValue("priority", value as "bassa" | "media" | "alta")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bassa">
                  <span className="text-green-500">Bassa</span>
                </SelectItem>
                <SelectItem value="media">
                  <span className="text-yellow-500">Media</span>
                </SelectItem>
                <SelectItem value="alta">
                  <span className="text-red-500">Alta</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setValue("isPublic", !!checked)}
              />
              <Label htmlFor="isPublic" className="text-sm flex items-center">
                {isPublic ? (
                  <Eye className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 mr-2 text-red-500" />
                )}
                {isPublic ? "Visibile ai giocatori" : "Solo per GM"}
              </Label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tag (Opzionale)</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="combattimento, sicurezza, pvp (separati da virgola)"
          />
          <p className="text-xs text-muted-foreground">
            Aggiungi tag per categorizzare meglio questa sezione
          </p>
        </div>

        {/* Preview Section */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Anteprima Sezione:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>
                <strong>Titolo:</strong> {watch("title") || "Da specificare"}
              </span>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs ${getPriorityColor(watch("priority"))}`}
                >
                  Priorità {watch("priority")}
                </span>
                {isPublic ? (
                  <Users className="h-3 w-3 text-green-500" />
                ) : (
                  <Lock className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
            <div>
              <strong>Categoria:</strong> {selectedCategory || "Da selezionare"}
            </div>
            <div>
              <strong>Visibilità:</strong>{" "}
              {isPublic ? "Pubblica per i giocatori" : "Riservata ai GM"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 fantasy-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creando..." : "Crea Sezione"}
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
