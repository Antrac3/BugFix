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
import { useApp, Task } from "@/contexts/SupabaseAppContext";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { BaseModal } from "@/components/modals/BaseModal";

const taskSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().min(1, "La descrizione è obbligatoria"),
  assignees: z
    .array(z.string())
    .min(1, "Almeno un assegnatario è obbligatorio"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
  deadline: z.string().min(1, "La scadenza è obbligatoria"),
  category: z.string().min(1, "La categoria è obbligatoria"),
  tags: z.array(z.string()),
  estimated_hours: z
    .number()
    .min(0.1, "Le ore stimate devono essere maggiori di 0"),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
}

const categories = [
  "Logistica",
  "Comunicazione",
  "Gestione Personaggi",
  "Sviluppo Storia",
  "Preparazione Sessione",
  "Amministrazione",
];

const assigneeOptions = [
  "Game Master",
  "Elena Rodriguez",
  "Marcus Stone",
  "Sarah Chen",
  "Alex Rivers",
];

export function TaskForm({ isOpen, onClose, task }: TaskFormProps) {
  const { addTask, updateTask } = useApp();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    task?.assignees || [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          assignees: task.assignees,
          priority: task.priority,
          status: task.status,
          deadline: task.deadline,
          category: task.category,
          tags: task.tags,
          estimated_hours: task.estimated_hours,
        }
      : {
          priority: "medium",
          status: "pending",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          estimated_hours: 1,
          assignees: [],
          tags: [],
        },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const taskData = {
        ...data,
        assignees: selectedAssignees,
        tags: selectedTags,
        created: task?.created || new Date().toISOString().split("T")[0],
        actual_hours: task?.actual_hours || 0,
        created_by: user?.id || "",
      };

      if (task) {
        updateTask(task.id, taskData);
      } else {
        addTask(taskData);
      }

      reset();
      setSelectedAssignees([]);
      setSelectedTags([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedAssignees([]);
    setSelectedTags([]);
    onClose();
  };

  const addAssignee = (assignee: string) => {
    if (!selectedAssignees.includes(assignee)) {
      const newAssignees = [...selectedAssignees, assignee];
      setSelectedAssignees(newAssignees);
      setValue("assignees", newAssignees);
    }
  };

  const removeAssignee = (assignee: string) => {
    const newAssignees = selectedAssignees.filter((a) => a !== assignee);
    setSelectedAssignees(newAssignees);
    setValue("assignees", newAssignees);
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? "Modifica Attività" : "Crea Nuova Attività"}
      description={
        task
          ? "Modifica i dettagli dell'attività"
          : "Crea una nuova attività per la campagna"
      }
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Titolo *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Es. Preparare oggetti di scena per la prossima sessione"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrizione *</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrivi cosa deve essere fatto..."
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
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={watch("category")}
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
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Priorità</Label>
            <Select
              value={watch("priority")}
              onValueChange={(value) =>
                setValue(
                  "priority",
                  value as "low" | "medium" | "high" | "urgent",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bassa</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
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
                  value as
                    | "pending"
                    | "in-progress"
                    | "completed"
                    | "cancelled",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="in-progress">In Corso</SelectItem>
                <SelectItem value="completed">Completata</SelectItem>
                <SelectItem value="cancelled">Cancellata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deadline">Scadenza *</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">
                {errors.deadline.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="estimated_hours">Ore Stimate</Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.5"
            min="0.1"
            {...register("estimated_hours", { valueAsNumber: true })}
            placeholder="1"
          />
          {errors.estimated_hours && (
            <p className="text-red-500 text-sm mt-1">
              {errors.estimated_hours.message}
            </p>
          )}
        </div>

        <div>
          <Label>Assegnatari *</Label>
          <Select onValueChange={addAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Aggiungi assegnatario" />
            </SelectTrigger>
            <SelectContent>
              {assigneeOptions
                .filter((assignee) => !selectedAssignees.includes(assignee))
                .map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAssignees.map((assignee) => (
              <Badge
                key={assignee}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {assignee}
                <button
                  type="button"
                  onClick={() => removeAssignee(assignee)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {errors.assignees && (
            <p className="text-red-500 text-sm mt-1">
              {errors.assignees.message}
            </p>
          )}
        </div>

        <div>
          <Label>Tag</Label>
          <div className="flex gap-2">
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
          <div className="flex flex-wrap gap-2 mt-2">
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
              : task
                ? "Aggiorna Attività"
                : "Crea Attività"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
