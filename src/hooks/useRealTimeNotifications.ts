import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "@/hooks/use-toast";

export interface RealtimeNotification {
  id: number;
  type: "message" | "session" | "alert" | "update" | "approval";
  title: string;
  content: string;
  sender: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  action_required: boolean;
  related_data?: any;
  read: boolean;
  created_at: string;
  user_id: string;
}

export function useRealTimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load initial notifications
    loadNotifications();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as RealtimeNotification;

          // Add to notifications list
          setNotifications((prev) => [newNotification, ...prev]);

          // Update unread count
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
          }

          // Show toast notification for high priority items
          if (
            newNotification.priority === "high" ||
            newNotification.priority === "urgent"
          ) {
            toast({
              title: newNotification.title,
              description: newNotification.content,
              variant:
                newNotification.priority === "urgent"
                  ? "destructive"
                  : "default",
            });
          }

          // Browser notification (if permission granted)
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.content,
              icon: "/favicon.ico",
              tag: newNotification.id.toString(),
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as RealtimeNotification;

          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === updatedNotification.id ? updatedNotification : notif,
            ),
          );

          // Update unread count if read status changed
          if (updatedNotification.read && payload.old?.read === false) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") {
          console.log("✅ Real-time notifications connected");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );

      setUnreadCount(0);

      toast({
        title: "Notifiche segnate come lette",
        description: "Tutte le notifiche sono state segnate come lette",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user?.id);

      if (error) throw error;

      const notification = notifications.find((n) => n.id === notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    refetch: loadNotifications,
  };
}
