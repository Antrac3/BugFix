import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  category: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  related_entity_type?: string; // character, event, player, etc.
  related_entity_id?: string;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes
  const loadNotes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get notes from database first
      // Include user's own notes AND public notes from other users
      const { data: dbNotes, error: dbError } = await supabase
        .from("notes")
        .select("*")
        .or(`created_by.eq.${user.id},is_private.eq.false`)
        .order("created_at", { ascending: false });

      if (dbError) {
        // If table doesn't exist, fall back to localStorage
        console.log("Notes table not found, using localStorage:", dbError);

        // Get user's own notes
        const userNotes = localStorage.getItem(`notes_${user.id}`);
        const parsedUserNotes = userNotes ? JSON.parse(userNotes) : [];

        // Get public notes from all users
        const publicNotes = localStorage.getItem("notes_public") || "[]";
        const parsedPublicNotes = JSON.parse(publicNotes);

        // Combine and filter out duplicates
        const allNotes = [
          ...parsedUserNotes,
          ...parsedPublicNotes.filter(
            (note: Note) => note.created_by !== user.id,
          ),
        ];

        setNotes(allNotes);
      } else {
        // Successfully got notes from database
        setNotes(dbNotes || []);
        if (import.meta.env.DEV) {
          console.log("✅ Notes loaded from database:", dbNotes?.length || 0);
          console.log("📝 Notes breakdown:", {
            total: dbNotes?.length || 0,
            myNotes:
              dbNotes?.filter((note) => note.created_by === user.id).length ||
              0,
            publicNotes:
              dbNotes?.filter(
                (note) => !note.is_private && note.created_by !== user.id,
              ).length || 0,
            privateNotes:
              dbNotes?.filter((note) => note.is_private).length || 0,
          });
        }
      }
    } catch (err: any) {
      console.error("Error loading notes:", err);
      setError(err.message);
      // Fall back to localStorage on any error
      const userNotes = localStorage.getItem(`notes_${user.id}`);
      const parsedUserNotes = userNotes ? JSON.parse(userNotes) : [];

      const publicNotes = localStorage.getItem("notes_public") || "[]";
      const parsedPublicNotes = JSON.parse(publicNotes);

      const allNotes = [
        ...parsedUserNotes,
        ...parsedPublicNotes.filter(
          (note: Note) => note.created_by !== user.id,
        ),
      ];

      setNotes(allNotes);

      toast({
        title: "Note caricate da storage locale",
        description: "Connessione al database non disponibile",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create note
  const createNote = async (
    noteData: Omit<Note, "id" | "created_at" | "updated_at" | "created_by">,
  ) => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      const noteToCreate = {
        ...noteData,
        created_by: user.id,
      };

      // Try to save to database first
      const { data: dbNote, error: dbError } = await supabase
        .from("notes")
        .insert([noteToCreate])
        .select()
        .single();

      if (dbError) {
        // Fall back to localStorage
        console.log("Notes table not found, using localStorage:", dbError);
        const newNote: Note = {
          ...noteToCreate,
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Save to user's private storage
        const localNotes = localStorage.getItem(`notes_${user.id}`);
        const existingNotes = localNotes ? JSON.parse(localNotes) : [];
        const updatedUserNotes = [newNote, ...existingNotes];
        localStorage.setItem(
          `notes_${user.id}`,
          JSON.stringify(updatedUserNotes),
        );

        // If public, also save to shared public storage
        if (!newNote.is_private) {
          const publicNotes = localStorage.getItem("notes_public") || "[]";
          const existingPublicNotes = JSON.parse(publicNotes);
          const updatedPublicNotes = [newNote, ...existingPublicNotes];
          localStorage.setItem(
            "notes_public",
            JSON.stringify(updatedPublicNotes),
          );
        }

        // Update local state with all visible notes (reload all notes)
        await loadNotes();

        toast({
          title: "Nota salvata localmente",
          description: "La nota è stata salvata nel browser",
        });

        return { success: true, data: newNote };
      } else {
        // Successfully saved to database
        setNotes((prev) => [dbNote, ...prev]);

        if (import.meta.env.DEV) {
          console.log("✅ Note created in database:", dbNote.id);
        }

        toast({
          title: "Successo",
          description: "Nota creata con successo",
        });

        return { success: true, data: dbNote };
      }
    } catch (err: any) {
      console.error("Error creating note:", err);

      // Fall back to localStorage on any error
      const newNote: Note = {
        ...noteData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id,
      };

      // Save to user's private storage
      const localNotes = localStorage.getItem(`notes_${user.id}`);
      const existingNotes = localNotes ? JSON.parse(localNotes) : [];
      const updatedUserNotes = [newNote, ...existingNotes];
      localStorage.setItem(
        `notes_${user.id}`,
        JSON.stringify(updatedUserNotes),
      );

      // If public, also save to shared public storage
      if (!newNote.is_private) {
        const publicNotes = localStorage.getItem("notes_public") || "[]";
        const existingPublicNotes = JSON.parse(publicNotes);
        const updatedPublicNotes = [newNote, ...existingPublicNotes];
        localStorage.setItem(
          "notes_public",
          JSON.stringify(updatedPublicNotes),
        );
      }

      // Update local state with all visible notes (reload all notes)
      await loadNotes();

      toast({
        title: "Nota salvata localmente",
        description: "Errore database, salvata nel browser",
        variant: "default",
      });

      return { success: true, data: newNote };
    }
  };

  // Update note
  const updateNote = async (id: number, updates: Partial<Note>) => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Try to update in database first
      const { error: dbError } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", id)
        .eq("created_by", user.id);

      if (dbError) {
        // Fall back to localStorage
        console.log("Notes table not found, using localStorage:", dbError);
        // Update in user's storage
        const localNotes = localStorage.getItem(`notes_${user.id}`);
        const existingNotes = localNotes ? JSON.parse(localNotes) : [];
        const updatedNotes = existingNotes.map((note: Note) =>
          note.id === id ? { ...note, ...updateData } : note,
        );
        localStorage.setItem(`notes_${user.id}`, JSON.stringify(updatedNotes));

        // Also update in public storage if the note is public
        const updatedNote = updatedNotes.find((note: Note) => note.id === id);
        if (updatedNote && !updatedNote.is_private) {
          const publicNotes = localStorage.getItem("notes_public") || "[]";
          const existingPublicNotes = JSON.parse(publicNotes);
          const updatedPublicNotes = existingPublicNotes.map((note: Note) =>
            note.id === id ? { ...note, ...updateData } : note,
          );
          // If not found in public notes, add it
          if (!existingPublicNotes.find((note: Note) => note.id === id)) {
            updatedPublicNotes.push(updatedNote);
          }
          localStorage.setItem(
            "notes_public",
            JSON.stringify(updatedPublicNotes),
          );
        }

        // Reload all notes to reflect changes
        await loadNotes();

        toast({
          title: "Nota aggiornata localmente",
          description: "Le modifiche sono state salvate nel browser",
        });
      } else {
        // Successfully updated in database
        setNotes((prev) =>
          prev.map((note) =>
            note.id === id ? { ...note, ...updateData } : note,
          ),
        );

        if (import.meta.env.DEV) {
          console.log("✅ Note updated in database:", id);
        }

        toast({
          title: "Successo",
          description: "Nota aggiornata con successo",
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error("Error updating note:", err);

      // Fall back to localStorage on any error
      const localNotes = localStorage.getItem(`notes_${user.id}`);
      const existingNotes = localNotes ? JSON.parse(localNotes) : [];
      const updatedNotes = existingNotes.map((note: Note) =>
        note.id === id
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note,
      );
      localStorage.setItem(`notes_${user.id}`, JSON.stringify(updatedNotes));

      // Also update in public storage if applicable
      const updatedNote = updatedNotes.find((note: Note) => note.id === id);
      if (updatedNote && !updatedNote.is_private) {
        const publicNotes = localStorage.getItem("notes_public") || "[]";
        const existingPublicNotes = JSON.parse(publicNotes);
        const updatedPublicNotes = existingPublicNotes.map((note: Note) =>
          note.id === id ? updatedNote : note,
        );
        if (!existingPublicNotes.find((note: Note) => note.id === id)) {
          updatedPublicNotes.push(updatedNote);
        }
        localStorage.setItem(
          "notes_public",
          JSON.stringify(updatedPublicNotes),
        );
      }

      // Reload all notes to reflect changes
      await loadNotes();

      toast({
        title: "Nota aggiornata localmente",
        description: "Errore database, salvata nel browser",
        variant: "default",
      });

      return { success: true };
    }
  };

  // Delete note
  const deleteNote = async (id: number) => {
    if (!user) return { success: false, error: "User not authenticated" };

    try {
      // Try to delete from database first
      const { error: dbError } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("created_by", user.id);

      if (dbError) {
        // Fall back to localStorage
        console.log("Notes table not found, using localStorage:", dbError);
        // Find the note before deleting to check if it's public
        const localNotes = localStorage.getItem(`notes_${user.id}`);
        const existingNotes = localNotes ? JSON.parse(localNotes) : [];
        const noteToDelete = existingNotes.find((note: Note) => note.id === id);

        const updatedNotes = existingNotes.filter(
          (note: Note) => note.id !== id,
        );
        localStorage.setItem(`notes_${user.id}`, JSON.stringify(updatedNotes));

        // Also remove from public storage if it was public
        if (noteToDelete && !noteToDelete.is_private) {
          const publicNotes = localStorage.getItem("notes_public") || "[]";
          const existingPublicNotes = JSON.parse(publicNotes);
          const updatedPublicNotes = existingPublicNotes.filter(
            (note: Note) => note.id !== id,
          );
          localStorage.setItem(
            "notes_public",
            JSON.stringify(updatedPublicNotes),
          );
        }

        // Reload all notes to reflect changes
        await loadNotes();

        toast({
          title: "Nota eliminata localmente",
          description: "La nota è stata rimossa dal browser",
        });
      } else {
        // Successfully deleted from database
        setNotes((prev) => prev.filter((note) => note.id !== id));

        if (import.meta.env.DEV) {
          console.log("✅ Note deleted from database:", id);
        }

        toast({
          title: "Successo",
          description: "Nota eliminata con successo",
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error("Error deleting note:", err);

      // Fall back to localStorage on any error
      const localNotes = localStorage.getItem(`notes_${user.id}`);
      const existingNotes = localNotes ? JSON.parse(localNotes) : [];
      const noteToDelete = existingNotes.find((note: Note) => note.id === id);

      const updatedNotes = existingNotes.filter((note: Note) => note.id !== id);
      localStorage.setItem(`notes_${user.id}`, JSON.stringify(updatedNotes));

      // Also remove from public storage if it was public
      if (noteToDelete && !noteToDelete.is_private) {
        const publicNotes = localStorage.getItem("notes_public") || "[]";
        const existingPublicNotes = JSON.parse(publicNotes);
        const updatedPublicNotes = existingPublicNotes.filter(
          (note: Note) => note.id !== id,
        );
        localStorage.setItem(
          "notes_public",
          JSON.stringify(updatedPublicNotes),
        );
      }

      // Reload all notes to reflect changes
      await loadNotes();

      toast({
        title: "Nota eliminata localmente",
        description: "Errore database, rimossa dal browser",
        variant: "default",
      });

      return { success: true };
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: loadNotes,
  };
}
