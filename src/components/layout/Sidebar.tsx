import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCog,
  Zap,
  Package,
  BookOpen,
  MessageSquare,
  Home,
  X,
  Sword,
  Crown,
  Sparkles,
  MapPin,
  Contact,
  CheckSquare,
  Settings,
  BarChart3,
  Shield,
  Bell,
  Calendar,
  Megaphone,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibilityToolbar } from "@/components/ui/accessibility-toolbar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  // Dashboard - sempre in cima
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    section: "overview",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },

  // Sezione Gioco - Tutto quello che riguarda il gioco attivo
  {
    name: "Personaggi",
    href: "/characters",
    icon: Sword,
    section: "game",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },
  {
    name: "Eventi",
    href: "/events",
    icon: Calendar,
    section: "game",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },
  {
    name: "Inventario",
    href: "/inventory",
    icon: Package,
    section: "game",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },
  {
    name: "Esperienza",
    href: "/experience",
    icon: Zap,
    section: "game",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },

  // Sezione Narrativa - Gestione Master per trame e world building
  {
    name: "Trame",
    href: "/plots",
    icon: BookOpen,
    section: "narrative",
    requiredRoles: ["gm", "admin", "super_admin"],
  },
  {
    name: "PNG",
    href: "/npcs",
    icon: UserCog,
    section: "narrative",
    requiredRoles: ["gm", "admin", "super_admin"],
  },
  {
    name: "Location",
    href: "/locations",
    icon: MapPin,
    section: "narrative",
    requiredRoles: ["gm", "admin", "super_admin"],
  },
  {
    name: "Attività",
    href: "/tasks",
    icon: CheckSquare,
    section: "narrative",
    requiredRoles: ["gm", "admin", "super_admin"],
  },

  // Sezione Comunicazione - Tutto quello che riguarda l'interazione
  {
    name: "Comunicazioni",
    href: "/communications",
    icon: Megaphone,
    section: "communication",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },
  {
    name: "Messaggi",
    href: "/messages",
    icon: MessageSquare,
    section: "communication",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },
  {
    name: "Notifiche",
    href: "/notifications",
    icon: Bell,
    section: "communication",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },

  // Sezione Gestione - Amministrazione giocatori e sistema
  {
    name: "Giocatori",
    href: "/players",
    icon: Users,
    section: "management",
    requiredRoles: ["gm", "admin", "super_admin"],
  },
  {
    name: "Contatti",
    href: "/contacts",
    icon: Contact,
    section: "management",
    requiredRoles: ["gm", "admin", "super_admin"],
  },
  {
    name: "Analisi",
    href: "/analytics",
    icon: BarChart3,
    section: "management",
    requiredRoles: ["gm", "admin", "super_admin"],
  },

  // Sezione Sistema - Configurazione e amministrazione avanzata
  {
    name: "Regolamento",
    href: "/rules",
    icon: Shield,
    section: "system",
    requiredRoles: ["player", "gm", "admin", "super_admin"],
  },
  {
    name: "Pannello Direttivo",
    href: "/director",
    icon: Crown,
    section: "system",
    requiredRoles: ["admin", "super_admin"],
  },
  {
    name: "Gestione Utenti",
    href: "/user-management",
    icon: UserCog,
    section: "system",
    requiredRoles: ["super_admin"],
  },
  {
    name: "Impostazioni",
    href: "/settings",
    icon: Settings,
    section: "system",
    requiredRoles: ["admin", "super_admin"],
  },
];

const sections = {
  overview: { title: "Panoramica", color: "text-fantasy-gold" },
  game: { title: "Gioco", color: "text-green-500" },
  narrative: { title: "Narrativa", color: "text-fantasy-primary" },
  communication: { title: "Comunicazione", color: "text-blue-500" },
  management: { title: "Gestione", color: "text-fantasy-secondary" },
  system: { title: "Sistema", color: "text-red-400" },
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const { settings } = useAccessibility();
  const { showToolbar, toggleToolbar } = useAccessibilityToolbar();

  const renderNavigation = () => {
    // Filter navigation items based on user role
    const filteredNavigation = navigation.filter(
      (item) =>
        user &&
        (user.role === "super_admin" || item.requiredRoles.includes(user.role)),
    );

    const groupedNav = filteredNavigation.reduce(
      (acc, item) => {
        if (!acc[item.section]) {
          acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
      },
      {} as Record<string, typeof filteredNavigation>,
    );

    return Object.entries(groupedNav).map(([sectionKey, items]) => {
      const section = sections[sectionKey as keyof typeof sections];
      return (
        <div key={sectionKey} className="mb-6">
          <div className="flex items-center mb-3 px-3">
            <div className={cn("h-1 w-1 rounded-full mr-2", section.color)} />
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                section.color,
              )}
            >
              {section.title}
            </h3>
          </div>
          <div className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "min-h-[44px]", // Touch-friendly size
                    isActive
                      ? "bg-fantasy-gradient text-white shadow-fantasy"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    settings.reducedMotion && "transition-none",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  role="menuitem"
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-4 w-4 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <Sparkles
                      className="ml-auto h-3 w-3 text-fantasy-gold"
                      aria-label="Pagina corrente"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar border-r border-sidebar-border">
          <div className="flex items-center flex-shrink-0 px-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sword className="h-8 w-8 text-fantasy-primary" />
                <Crown className="h-4 w-4 text-fantasy-gold absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  LARP Manager
                </h1>
                <p className="text-xs text-muted-foreground">CMS Campagna</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-4">{renderNavigation()}</nav>

            {/* User info at bottom */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent/50">
                <div className="h-8 w-8 rounded-full bg-fantasy-gradient flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    Game Master
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Accesso Direttivo
                  </p>
                </div>
                <div className="flex items-center">
                  <Shield className="h-3 w-3 text-fantasy-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sword className="h-8 w-8 text-fantasy-primary" />
                <Crown className="h-4 w-4 text-fantasy-gold absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  LARP Manager
                </h1>
                <p className="text-xs text-muted-foreground">CMS Campagna</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-4">{renderNavigation()}</nav>

            {/* User info at bottom */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent/50">
                <div className="h-8 w-8 rounded-full bg-fantasy-gradient flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    Game Master
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Accesso Direttivo
                  </p>
                </div>
                <div className="flex items-center">
                  <Shield className="h-3 w-3 text-fantasy-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
