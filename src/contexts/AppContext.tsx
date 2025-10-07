import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

// Tipi per le entità
export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  role: "player" | "gm";
  joinDate: string;
  lastActive: string;
  characters: string[];
  campaigns: string[];
  socialLinks: Record<string, string>;
  notes: string;
  emergencyContact: string;
  location: string;
}

export interface Character {
  id: number;
  name: string;
  role: string;
  player: string;
  playerId: number;
  status: "active" | "inactive";
  xp: number;
  avatar?: string;
  background: string;
  lastSession: string;
  abilities: string[];
  description?: string;
  inventory: InventoryItem[];
}

export interface NPC {
  id: number;
  name: string;
  role: string;
  description: string;
  stats?: Record<string, number>;
  location?: string;
  linked_events: string[];
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type: "outdoor" | "indoor" | "industrial" | "garden";
  capacity: number;
  status: "available" | "booked" | "maintenance";
  description: string;
  amenities: string[];
  contact: string;
  notes: string;
  images: string[];
  upcoming_events: Array<{ name: string; date: string }>;
  last_used: string;
  rating: number;
  price_range: string;
}

export interface Contact {
  id: number;
  name: string;
  type: "vendor" | "actor" | "collaborator" | "supplier";
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  tags: string[];
  rating: number;
  notes: string;
  last_contact: string;
  total_interactions: number;
  services: string[];
  price_range: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignees: string[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  deadline: string;
  created: string;
  category: string;
  tags: string[];
  comments: TaskComment[];
  completedBy?: string;
  estimated_hours: number;
  actual_hours: number;
}

export interface TaskComment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  effects: string;
  character_id?: number;
}

export interface Message {
  id: number;
  from_character: string;
  to_character: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_in_character: boolean;
}

export interface Approval {
  id: number;
  type:
    | "scambio_oggetto"
    | "aggiornamento_personaggio"
    | "nuovo_personaggio"
    | "evento_speciale";
  title: string;
  description: string;
  requester: string;
  requesterId: number;
  priority: "bassa" | "media" | "alta";
  status: "pendente" | "approvato" | "rifiutato";
  submitted: string;
  details: any;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface SystemModule {
  id: string;
  name: string;
  status: "operativo" | "manutenzione" | "errore";
  lastUpdate: string;
  users: number;
  uptime: number;
  version: string;
}

export interface CampaignSettings {
  name: string;
  description: string;
  defaultLocation: string;
  timezone: string;
  theme: string;
  accentColor: string;
  animationEffects: boolean;
  compactMode: boolean;
  emailNotifications: boolean;
  sessionReminders: boolean;
  autoBackup: boolean;
  backupFrequency: string;
  retentionPeriod: string;
}

export interface BroadcastMessage {
  id: number;
  subject: string;
  content: string;
  recipientGroup: "tutti" | "giocatori" | "gm" | "personaggi_attivi";
  sender: string;
  sentAt: string;
  recipients: string[];
  status: "bozza" | "inviato" | "programmato";
}

export interface SystemStats {
  activePlayers: number;
  totalCharacters: number;
  sessionsThisMonth: number;
  upcomingEvents: number;
  systemHealth: "eccellente" | "buono" | "attenzione" | "critico";
  uptime: number;
  lastBackup: string;
}

// Context interface
interface AppContextType {
  // Data
  players: Player[];
  characters: Character[];
  npcs: NPC[];
  locations: Location[];
  contacts: Contact[];
  tasks: Task[];
  inventoryItems: InventoryItem[];
  messages: Message[];

  // CRUD Operations
  // Players
  addPlayer: (player: Omit<Player, "id">) => void;
  updatePlayer: (id: number, player: Partial<Player>) => void;
  deletePlayer: (id: number) => void;

  // Characters
  addCharacter: (character: Omit<Character, "id">) => void;
  updateCharacter: (id: number, character: Partial<Character>) => void;
  deleteCharacter: (id: number) => void;
  awardXP: (characterId: number, xp: number, reason: string) => void;

  // NPCs
  addNPC: (npc: Omit<NPC, "id">) => void;
  updateNPC: (id: number, npc: Partial<NPC>) => void;
  deleteNPC: (id: number) => void;

  // Locations
  addLocation: (location: Omit<Location, "id">) => void;
  updateLocation: (id: number, location: Partial<Location>) => void;
  deleteLocation: (id: number) => void;

  // Contacts
  addContact: (contact: Omit<Contact, "id">) => void;
  updateContact: (id: number, contact: Partial<Contact>) => void;
  deleteContact: (id: number) => void;

  // Tasks
  addTask: (task: Omit<Task, "id" | "comments">) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  addTaskComment: (taskId: number, comment: Omit<TaskComment, "id">) => void;

  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: number, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: number) => void;
  transferItem: (
    itemId: number,
    fromCharacterId: number,
    toCharacterId: number,
  ) => void;

  // Messages
  sendMessage: (
    message: Omit<Message, "id" | "created_at" | "is_read">,
  ) => void;
  markMessageAsRead: (messageId: number) => void;

  // Director Functions
  approvals: Approval[];
  systemModules: SystemModule[];
  campaignSettings: CampaignSettings;
  systemStats: SystemStats;
  broadcastMessages: BroadcastMessage[];

  // Approval Management
  addApproval: (approval: Omit<Approval, "id">) => void;
  approveRequest: (id: number, reviewNotes?: string) => void;
  rejectRequest: (id: number, reviewNotes?: string) => void;

  // System Management
  updateSystemModule: (id: string, updates: Partial<SystemModule>) => void;
  toggleMaintenanceMode: (moduleId: string) => void;

  // Settings Management
  updateCampaignSettings: (settings: Partial<CampaignSettings>) => void;

  // Broadcast Management
  sendBroadcast: (
    broadcast: Omit<BroadcastMessage, "id" | "sentAt" | "status">,
  ) => void;

  // System Actions
  restartApplication: () => void;
  optimizeDatabase: () => void;
  exportSystemLogs: () => void;
  clearCache: () => void;
  createManualBackup: () => void;

  // UI State
  showNotification: (
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// localStorage utility functions
const STORAGE_KEYS = {
  PLAYERS: "larp_manager_players",
  CHARACTERS: "larp_manager_characters",
  NPCS: "larp_manager_npcs",
  LOCATIONS: "larp_manager_locations",
  CONTACTS: "larp_manager_contacts",
  TASKS: "larp_manager_tasks",
  INVENTORY_ITEMS: "larp_manager_inventory_items",
  MESSAGES: "larp_manager_messages",
  APPROVALS: "larp_manager_approvals",
  SYSTEM_MODULES: "larp_manager_system_modules",
  CAMPAIGN_SETTINGS: "larp_manager_campaign_settings",
  SYSTEM_STATS: "larp_manager_system_stats",
  BROADCAST_MESSAGES: "larp_manager_broadcast_messages",
};

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Utility to update state and save to localStorage
function updateAndSave<T>(
  data: T[],
  setData: (data: T[]) => void,
  storageKey: string,
  newData: T[],
): void {
  setData(newData);
  saveToStorage(storageKey, newData);
}

// Default data
const DEFAULT_PLAYERS: Player[] = [
  {
    id: 1,
    firstName: "Elena",
    lastName: "Martinez",
    name: "Elena Martinez",
    email: "elena.martinez@email.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    role: "player",
    joinDate: "2023-03-15",
    lastActive: "2024-01-15",
    characters: ["Aria Ombratessitrice"],
    campaigns: ["Ombre di Valdris"],
    socialLinks: {
      discord: "elena_m#1234",
      instagram: "@elena_cosplay",
    },
    notes: "Roleplayer esperta, eccellente nello sviluppo del personaggio",
    emergencyContact: "Maria Martinez - +1 (555) 123-4568",
    location: "Los Angeles, CA",
  },
  {
    id: 2,
    firstName: "Marcus",
    lastName: "Stone",
    name: "Marcus Stone",
    email: "marcus.stone@email.com",
    phone: "+1 (555) 234-5678",
    status: "active",
    role: "gm",
    joinDate: "2022-11-08",
    lastActive: "2024-01-15",
    characters: ["Thorin Barbadferro"],
    campaigns: ["Ombre di Valdris", "Venti del Deserto"],
    socialLinks: {
      discord: "marcus_gm#5678",
    },
    notes: "GM assistente, aiuta con world-building e gestione PNG",
    emergencyContact: "Sarah Stone - +1 (555) 234-5679",
    location: "San Francisco, CA",
  },
];

const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Aria Ombratessitrice",
    role: "Assassino",
    player: "Elena Martinez",
    playerId: 1,
    status: "active",
    xp: 2250,
    background: "Assassino di Gilda specializzato in missioni urbane",
    lastSession: "2024-01-15",
    abilities: ["Movimento Silenzioso", "Scassinare", "Pugnali"],
    description:
      "Un'ombra tra le ombre, Aria opera per la gilda degli assassini",
    inventory: [],
  },
  {
    id: 2,
    name: "Thorin Barbadferro",
    role: "Soldato",
    player: "Marcus Stone",
    playerId: 2,
    status: "active",
    xp: 4100,
    background: "Veterano del Clan della Montagna",
    lastSession: "2024-01-15",
    abilities: ["Combattimento con Ascia", "Resistenza", "Leadership"],
    description:
      "Guerriero del clan montano, leader nato e combattente esperto",
    inventory: [],
  },
];

const DEFAULT_APPROVALS: Approval[] = [
  {
    id: 1,
    type: "scambio_oggetto",
    title: "Scambio Spada Incantata",
    description: "Scambio Spada Incantata tra Aria e Kai",
    requester: "Elena Martinez",
    requesterId: 1,
    priority: "media",
    status: "pendente",
    submitted: "2024-01-14",
    details: {
      from: "Aria Ombratessitrice",
      to: "Kai Ventotempesta",
      item: "Spada Incantata +2",
    },
  },
];

const DEFAULT_SYSTEM_MODULES: SystemModule[] = [
  {
    id: "character-management",
    name: "Gestione Personaggi",
    status: "operativo",
    lastUpdate: "2024-01-15",
    users: 12,
    uptime: 99.8,
    version: "2.1.4",
  },
  {
    id: "location-system",
    name: "Sistema Location",
    status: "operativo",
    lastUpdate: "2024-01-14",
    users: 3,
    uptime: 99.5,
    version: "1.8.2",
  },
  {
    id: "messaging-system",
    name: "Sistema Messaggi",
    status: "manutenzione",
    lastUpdate: "2024-01-12",
    users: 0,
    uptime: 0,
    version: "1.4.1",
  },
];

const DEFAULT_CAMPAIGN_SETTINGS: CampaignSettings = {
  name: "Ombre di Valdris",
  description:
    "Campagna LARP fantasy epica ambientata nel regno mistico di Valdris",
  defaultLocation: "Parco dei Prati Mistici",
  timezone: "Europe/Rome",
  theme: "fantasy-dark",
  accentColor: "purple",
  animationEffects: true,
  compactMode: false,
  emailNotifications: true,
  sessionReminders: true,
  autoBackup: true,
  backupFrequency: "daily",
  retentionPeriod: "30",
};

const DEFAULT_SYSTEM_STATS: SystemStats = {
  activePlayers: 12,
  totalCharacters: 15,
  sessionsThisMonth: 4,
  upcomingEvents: 3,
  systemHealth: "eccellente",
  uptime: 99.7,
  lastBackup: "2024-01-15T14:30:00Z",
};

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize with data from localStorage or defaults
  const [players, setPlayers] = useState<Player[]>(() =>
    loadFromStorage(STORAGE_KEYS.PLAYERS, DEFAULT_PLAYERS),
  );
  const [characters, setCharacters] = useState<Character[]>(() =>
    loadFromStorage(STORAGE_KEYS.CHARACTERS, DEFAULT_CHARACTERS),
  );

  const [npcs, setNPCs] = useState<NPC[]>(() =>
    loadFromStorage(STORAGE_KEYS.NPCS, []),
  );
  const [locations, setLocations] = useState<Location[]>(() =>
    loadFromStorage(STORAGE_KEYS.LOCATIONS, []),
  );
  const [contacts, setContacts] = useState<Contact[]>(() =>
    loadFromStorage(STORAGE_KEYS.CONTACTS, []),
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage(STORAGE_KEYS.TASKS, []),
  );
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.INVENTORY_ITEMS, []),
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage(STORAGE_KEYS.MESSAGES, []),
  );

  // Director States
  const [approvals, setApprovals] = useState<Approval[]>(() =>
    loadFromStorage(STORAGE_KEYS.APPROVALS, DEFAULT_APPROVALS),
  );

  const [systemModules, setSystemModules] = useState<SystemModule[]>(() =>
    loadFromStorage(STORAGE_KEYS.SYSTEM_MODULES, DEFAULT_SYSTEM_MODULES),
  );

  const [campaignSettings, setCampaignSettings] = useState<CampaignSettings>(
    () =>
      loadFromStorage(
        STORAGE_KEYS.CAMPAIGN_SETTINGS,
        DEFAULT_CAMPAIGN_SETTINGS,
      ),
  );

  const [systemStats, setSystemStats] = useState<SystemStats>(() =>
    loadFromStorage(STORAGE_KEYS.SYSTEM_STATS, DEFAULT_SYSTEM_STATS),
  );

  const [broadcastMessages, setBroadcastMessages] = useState<
    BroadcastMessage[]
  >(() => loadFromStorage(STORAGE_KEYS.BROADCAST_MESSAGES, []));

  // CRUD Operations
  const addPlayer = (player: Omit<Player, "id">) => {
    const newId = Math.max(...players.map((p) => p.id), 0) + 1;
    const playerWithName = {
      ...player,
      id: newId,
      name: `${player.firstName} ${player.lastName}`,
    };
    const newPlayers = [...players, playerWithName];
    setPlayers(newPlayers);
    saveToStorage(STORAGE_KEYS.PLAYERS, newPlayers);
    showNotification("Giocatore aggiunto con successo!", "success");
  };

  const updatePlayer = (id: number, playerUpdate: Partial<Player>) => {
    const updatedPlayer = { ...playerUpdate };
    if (updatedPlayer.firstName || updatedPlayer.lastName) {
      const currentPlayer = players.find((p) => p.id === id);
      if (currentPlayer) {
        updatedPlayer.name = `${updatedPlayer.firstName || currentPlayer.firstName} ${updatedPlayer.lastName || currentPlayer.lastName}`;
      }
    }
    const newPlayers = players.map((p) =>
      p.id === id ? { ...p, ...updatedPlayer } : p,
    );
    setPlayers(newPlayers);
    saveToStorage(STORAGE_KEYS.PLAYERS, newPlayers);
    showNotification("Giocatore aggiornato con successo!", "success");
  };

  const deletePlayer = (id: number) => {
    const newPlayers = players.filter((p) => p.id !== id);
    updateAndSave(players, setPlayers, STORAGE_KEYS.PLAYERS, newPlayers);
    showNotification("Giocatore eliminato con successo!", "success");
  };

  const addCharacter = (character: Omit<Character, "id">) => {
    const newId = Math.max(...characters.map((c) => c.id), 0) + 1;
    const newCharacters = [
      ...characters,
      { ...character, id: newId, inventory: [] },
    ];
    updateAndSave(
      characters,
      setCharacters,
      STORAGE_KEYS.CHARACTERS,
      newCharacters,
    );
    showNotification("Personaggio creato con successo!", "success");
  };

  const updateCharacter = (id: number, characterUpdate: Partial<Character>) => {
    const newCharacters = characters.map((c) =>
      c.id === id ? { ...c, ...characterUpdate } : c,
    );
    updateAndSave(
      characters,
      setCharacters,
      STORAGE_KEYS.CHARACTERS,
      newCharacters,
    );
    showNotification("Personaggio aggiornato con successo!", "success");
  };

  const deleteCharacter = (id: number) => {
    const newCharacters = characters.filter((c) => c.id !== id);
    updateAndSave(
      characters,
      setCharacters,
      STORAGE_KEYS.CHARACTERS,
      newCharacters,
    );
    showNotification("Personaggio eliminato con successo!", "success");
  };

  const awardXP = (characterId: number, xp: number, reason: string) => {
    const newCharacters = characters.map((c) =>
      c.id === characterId ? { ...c, xp: c.xp + xp } : c,
    );
    updateAndSave(
      characters,
      setCharacters,
      STORAGE_KEYS.CHARACTERS,
      newCharacters,
    );
    showNotification(`${xp} PE assegnati per: ${reason}`, "success");
  };

  const addNPC = (npc: Omit<NPC, "id">) => {
    const newId = Math.max(...npcs.map((n) => n.id), 0) + 1;
    const newNPCs = [...npcs, { ...npc, id: newId }];
    updateAndSave(npcs, setNPCs, STORAGE_KEYS.NPCS, newNPCs);
    showNotification("PNG creato con successo!", "success");
  };

  const updateNPC = (id: number, npcUpdate: Partial<NPC>) => {
    const newNPCs = npcs.map((n) => (n.id === id ? { ...n, ...npcUpdate } : n));
    updateAndSave(npcs, setNPCs, STORAGE_KEYS.NPCS, newNPCs);
    showNotification("PNG aggiornato con successo!", "success");
  };

  const deleteNPC = (id: number) => {
    const newNPCs = npcs.filter((n) => n.id !== id);
    updateAndSave(npcs, setNPCs, STORAGE_KEYS.NPCS, newNPCs);
    showNotification("PNG eliminato con successo!", "success");
  };

  const addLocation = (location: Omit<Location, "id">) => {
    const newId = Math.max(...locations.map((l) => l.id), 0) + 1;
    const newLocations = [...locations, { ...location, id: newId }];
    updateAndSave(
      locations,
      setLocations,
      STORAGE_KEYS.LOCATIONS,
      newLocations,
    );
    showNotification("Location aggiunta con successo!", "success");
  };

  const updateLocation = (id: number, locationUpdate: Partial<Location>) => {
    const newLocations = locations.map((l) =>
      l.id === id ? { ...l, ...locationUpdate } : l,
    );
    updateAndSave(
      locations,
      setLocations,
      STORAGE_KEYS.LOCATIONS,
      newLocations,
    );
    showNotification("Location aggiornata con successo!", "success");
  };

  const deleteLocation = (id: number) => {
    const newLocations = locations.filter((l) => l.id !== id);
    updateAndSave(
      locations,
      setLocations,
      STORAGE_KEYS.LOCATIONS,
      newLocations,
    );
    showNotification("Location eliminata con successo!", "success");
  };

  const addContact = (contact: Omit<Contact, "id">) => {
    const newId = Math.max(...contacts.map((c) => c.id), 0) + 1;
    const newContacts = [...contacts, { ...contact, id: newId }];
    updateAndSave(contacts, setContacts, STORAGE_KEYS.CONTACTS, newContacts);
    showNotification("Contatto aggiunto con successo!", "success");
  };

  const updateContact = (id: number, contactUpdate: Partial<Contact>) => {
    const newContacts = contacts.map((c) =>
      c.id === id ? { ...c, ...contactUpdate } : c,
    );
    updateAndSave(contacts, setContacts, STORAGE_KEYS.CONTACTS, newContacts);
    showNotification("Contatto aggiornato con successo!", "success");
  };

  const deleteContact = (id: number) => {
    const newContacts = contacts.filter((c) => c.id !== id);
    updateAndSave(contacts, setContacts, STORAGE_KEYS.CONTACTS, newContacts);
    showNotification("Contatto eliminato con successo!", "success");
  };

  const addTask = (task: Omit<Task, "id" | "comments">) => {
    const newId = Math.max(...tasks.map((t) => t.id), 0) + 1;
    const newTasks = [...tasks, { ...task, id: newId, comments: [] }];
    updateAndSave(tasks, setTasks, STORAGE_KEYS.TASKS, newTasks);
    showNotification("Attività creata con successo!", "success");
  };

  const updateTask = (id: number, taskUpdate: Partial<Task>) => {
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, ...taskUpdate } : t,
    );
    updateAndSave(tasks, setTasks, STORAGE_KEYS.TASKS, newTasks);
    showNotification("Attività aggiornata con successo!", "success");
  };

  const deleteTask = (id: number) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    updateAndSave(tasks, setTasks, STORAGE_KEYS.TASKS, newTasks);
    showNotification("Attività eliminata con successo!", "success");
  };

  const addTaskComment = (taskId: number, comment: Omit<TaskComment, "id">) => {
    const newCommentId = Date.now();
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [...t.comments, { ...comment, id: newCommentId }],
            }
          : t,
      ),
    );
  };

  const addInventoryItem = (item: Omit<InventoryItem, "id">) => {
    const newId = Math.max(...inventoryItems.map((i) => i.id), 0) + 1;
    const newItems = [...inventoryItems, { ...item, id: newId }];
    updateAndSave(
      inventoryItems,
      setInventoryItems,
      STORAGE_KEYS.INVENTORY_ITEMS,
      newItems,
    );
    showNotification("Oggetto aggiunto all'inventario!", "success");
  };

  const updateInventoryItem = (
    id: number,
    itemUpdate: Partial<InventoryItem>,
  ) => {
    const newItems = inventoryItems.map((i) =>
      i.id === id ? { ...i, ...itemUpdate } : i,
    );
    updateAndSave(
      inventoryItems,
      setInventoryItems,
      STORAGE_KEYS.INVENTORY_ITEMS,
      newItems,
    );
    showNotification("Oggetto aggiornato!", "success");
  };

  const deleteInventoryItem = (id: number) => {
    const newItems = inventoryItems.filter((i) => i.id !== id);
    updateAndSave(
      inventoryItems,
      setInventoryItems,
      STORAGE_KEYS.INVENTORY_ITEMS,
      newItems,
    );
    showNotification("Oggetto eliminato dall'inventario!", "success");
  };

  const transferItem = (
    itemId: number,
    fromCharacterId: number,
    toCharacterId: number,
  ) => {
    const newItems = inventoryItems.map((i) =>
      i.id === itemId ? { ...i, characterId: toCharacterId } : i,
    );
    updateAndSave(
      inventoryItems,
      setInventoryItems,
      STORAGE_KEYS.INVENTORY_ITEMS,
      newItems,
    );
    showNotification("Oggetto trasferito con successo!", "success");
  };

  const sendMessage = (
    message: Omit<Message, "id" | "created_at" | "is_read">,
  ) => {
    const newId = Math.max(...messages.map((m) => m.id), 0) + 1;
    const newMessages = [
      ...messages,
      {
        ...message,
        id: newId,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ];
    updateAndSave(messages, setMessages, STORAGE_KEYS.MESSAGES, newMessages);
    showNotification("Messaggio inviato!", "success");
  };

  const markMessageAsRead = (messageId: number) => {
    const newMessages = messages.map((m) =>
      m.id === messageId ? { ...m, is_read: true } : m,
    );
    updateAndSave(messages, setMessages, STORAGE_KEYS.MESSAGES, newMessages);
  };

  // Director Functions Implementation
  const addApproval = (approval: Omit<Approval, "id">) => {
    const newId = Math.max(...approvals.map((a) => a.id), 0) + 1;
    const newApprovals = [...approvals, { ...approval, id: newId }];
    updateAndSave(
      approvals,
      setApprovals,
      STORAGE_KEYS.APPROVALS,
      newApprovals,
    );
    showNotification("Richiesta di approvazione creata", "success");
  };

  const approveRequest = (id: number, reviewNotes?: string) => {
    const newApprovals = approvals.map((approval) =>
      approval.id === id
        ? {
            ...approval,
            status: "approvato" as const,
            reviewedBy: "Game Master",
            reviewedAt: new Date().toISOString(),
            reviewNotes,
          }
        : approval,
    );
    updateAndSave(
      approvals,
      setApprovals,
      STORAGE_KEYS.APPROVALS,
      newApprovals,
    );
    showNotification("Richiesta approvata con successo", "success");
  };

  const rejectRequest = (id: number, reviewNotes?: string) => {
    const newApprovals = approvals.map((approval) =>
      approval.id === id
        ? {
            ...approval,
            status: "rifiutato" as const,
            reviewedBy: "Game Master",
            reviewedAt: new Date().toISOString(),
            reviewNotes,
          }
        : approval,
    );
    updateAndSave(
      approvals,
      setApprovals,
      STORAGE_KEYS.APPROVALS,
      newApprovals,
    );
    showNotification("Richiesta rifiutata", "info");
  };

  const updateSystemModule = (id: string, updates: Partial<SystemModule>) => {
    const newModules = systemModules.map((module) =>
      module.id === id ? { ...module, ...updates } : module,
    );
    updateAndSave(
      systemModules,
      setSystemModules,
      STORAGE_KEYS.SYSTEM_MODULES,
      newModules,
    );
    showNotification("Modulo sistema aggiornato", "success");
  };

  const toggleMaintenanceMode = (moduleId: string) => {
    const newModules = systemModules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            status:
              module.status === "manutenzione"
                ? ("operativo" as const)
                : ("manutenzione" as const),
            users: module.status === "manutenzione" ? module.users : 0,
          }
        : module,
    );
    updateAndSave(
      systemModules,
      setSystemModules,
      STORAGE_KEYS.SYSTEM_MODULES,
      newModules,
    );
    showNotification("Modalità manutenzione modificata", "info");
  };

  const updateCampaignSettings = (settings: Partial<CampaignSettings>) => {
    const newSettings = { ...campaignSettings, ...settings };
    setCampaignSettings(newSettings);
    saveToStorage(STORAGE_KEYS.CAMPAIGN_SETTINGS, newSettings);
    showNotification("Impostazioni campagna salvate", "success");
  };

  const sendBroadcast = (
    broadcast: Omit<BroadcastMessage, "id" | "sentAt" | "status">,
  ) => {
    const newId = Math.max(...broadcastMessages.map((b) => b.id), 0) + 1;
    const newBroadcast: BroadcastMessage = {
      ...broadcast,
      id: newId,
      sentAt: new Date().toISOString(),
      status: "inviato",
    };
    const newBroadcasts = [newBroadcast, ...broadcastMessages];
    updateAndSave(
      broadcastMessages,
      setBroadcastMessages,
      STORAGE_KEYS.BROADCAST_MESSAGES,
      newBroadcasts,
    );
    showNotification(
      `Messaggio trasmesso a ${broadcast.recipientGroup}`,
      "success",
    );
  };

  const restartApplication = () => {
    showNotification("Riavvio applicazione in corso...", "info");
    setTimeout(() => {
      showNotification("Applicazione riavviata con successo", "success");
    }, 3000);
  };

  const optimizeDatabase = () => {
    showNotification("Ottimizzazione database in corso...", "info");
    setTimeout(() => {
      showNotification("Database ottimizzato con successo", "success");
    }, 2000);
  };

  const exportSystemLogs = () => {
    showNotification("Esportazione log sistema in corso...", "info");
    setTimeout(() => {
      const logData = `System Logs Export - ${new Date().toISOString()}\n`;
      const blob = new Blob([logData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Log sistema esportati", "success");
    }, 1500);
  };

  const clearCache = () => {
    showNotification("Pulizia cache in corso...", "info");
    setTimeout(() => {
      showNotification("Cache pulita con successo", "success");
    }, 1000);
  };

  const createManualBackup = () => {
    showNotification("Creazione backup manuale in corso...", "info");
    setTimeout(() => {
      setSystemStats((prev) => ({
        ...prev,
        lastBackup: new Date().toISOString(),
      }));
      showNotification("Backup manuale creato con successo", "success");
    }, 3000);
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    toast({
      title:
        type === "success"
          ? "Successo"
          : type === "error"
            ? "Errore"
            : "Informazione",
      description: message,
      variant:
        type === "success"
          ? "default"
          : type === "error"
            ? "destructive"
            : "default",
    });
  };

  const value: AppContextType = {
    // Data
    players,
    characters,
    npcs,
    locations,
    contacts,
    tasks,
    inventoryItems,
    messages,

    // Director Data
    approvals,
    systemModules,
    campaignSettings,
    systemStats,
    broadcastMessages,

    // CRUD Operations
    addPlayer,
    updatePlayer,
    deletePlayer,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    awardXP,
    addNPC,
    updateNPC,
    deleteNPC,
    addLocation,
    updateLocation,
    deleteLocation,
    addContact,
    updateContact,
    deleteContact,
    addTask,
    updateTask,
    deleteTask,
    addTaskComment,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    transferItem,
    sendMessage,
    markMessageAsRead,

    // Director Functions
    addApproval,
    approveRequest,
    rejectRequest,
    updateSystemModule,
    toggleMaintenanceMode,
    updateCampaignSettings,
    sendBroadcast,
    restartApplication,
    optimizeDatabase,
    exportSystemLogs,
    clearCache,
    createManualBackup,

    showNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
