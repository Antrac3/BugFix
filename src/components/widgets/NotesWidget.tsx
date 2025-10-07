import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  StickyNote,
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Lock,
  Globe,
  Calendar,
} from "lucide-react";
import { useNotes, type Note } from "@/hooks/useNotes";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface NotesWidgetProps {
  relatedEntityType?: string;
  relatedEntityId?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

const categories = [
  "Generale",
  "Pianificazione",
  "Sessioni",
  "Personaggi",
  "Storia",
  "Regole",
  "Eventi",
  "Feedback",
];

export function NotesWidget({
  relatedEntityType,
  relatedEntityId,
  showHeader = true,
  maxHeight = "400px",
}: NotesWidgetProps) {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    category: "Generale",
    is_private: true,
    tags: "",
  });

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || note.category === selectedCategory;

    const matchesEntity =
      !relatedEntityType ||
      (note.related_entity_type === relatedEntityType &&
        note.related_entity_id === relatedEntityId);

    return matchesSearch && matchesCategory && matchesEntity;
  });

  const openNoteDialog = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        title: note.title,
        content: note.content,
        category: note.category,
        is_private: note.is_private,
        tags: note.tags.join(", "),
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        title: "",
        content: "",
        category: "Generale",
        is_private: true,
        tags: "",
      });
    }
    setShowNoteDialog(true);
  };

  const handleSaveNote = async () => {
    const noteData = {
      ...noteForm,
      tags: noteForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
    };

    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await createNote(noteData);
    }

    setShowNoteDialog(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (confirm("Sei sicuro di voler eliminare questa nota?")) {
      await deleteNote(noteId);
    }
  };

  return (
    <Card className="fantasy-card fantasy-border-glow border-purple-500/30">
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center space-x-2 flex-1 min-w-0">
              <StickyNote className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span className="truncate">Note e Appunti</span>
              <Badge
                variant="outline"
                className="text-xs border-purple-500/50 text-purple-400 flex-shrink-0"
              >
                {filteredNotes.length}
              </Badge>
            </CardTitle>
            <Button
              size="sm"
              onClick={() => openNoteDialog()}
              className="fantasy-button flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuova Nota
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-32 text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes List */}
        <div
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight: maxHeight }}
        >
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fantasy-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            </div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 max-w-full">
                      <h4 className="font-medium text-sm truncate flex-1 min-w-0">
                        {note.title}
                      </h4>
                      {note.is_private ? (
                        <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground break-words line-clamp-2 overflow-hidden">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openNoteDialog(note)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {note.category}
                    </Badge>
                    {note.tags.length > 0 && (
                      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                        <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground text-xs truncate">
                          {note.tags.slice(0, 2).join(", ")}
                          {note.tags.length > 2 && "..."}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(note.updated_at), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <StickyNote className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nessuna nota trovata
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openNoteDialog()}
                className="mt-2"
              >
                Crea la prima nota
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Modifica Nota" : "Nuova Nota"}
            </DialogTitle>
            <DialogDescription>
              {editingNote
                ? "Modifica i dettagli della nota"
                : "Crea una nuova nota o appunto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titolo</label>
              <Input
                value={noteForm.title}
                onChange={(e) =>
                  setNoteForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Titolo della nota..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Contenuto
              </label>
              <Textarea
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Scrivi i tuoi appunti qui..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Categoria
                </label>
                <Select
                  value={noteForm.category}
                  onValueChange={(value) =>
                    setNoteForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <Input
                  value={noteForm.tags}
                  onChange={(e) =>
                    setNoteForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="tag1, tag2..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={noteForm.is_private}
                  onCheckedChange={(checked) =>
                    setNoteForm((prev) => ({ ...prev, is_private: checked }))
                  }
                />
                <label htmlFor="private" className="text-sm font-medium">
                  Nota privata
                </label>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {noteForm.is_private ? (
                  <>
                    <Lock className="h-3 w-3" />
                    <span>Solo tu</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3" />
                    <span>Visibile al team</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={!noteForm.title.trim() || !noteForm.content.trim()}
              className="fantasy-button"
            >
              {editingNote ? "Aggiorna" : "Crea Nota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
