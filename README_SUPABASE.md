# 🚀 LARP Manager con Supabase Backend

Il LARP Manager è ora completamente integrato con **Supabase** come backend, fornendo autenticazione robusta, database PostgreSQL e funzionalità real-time.

## ✨ Funzionalità Implementate

### 🔐 **Autenticazione Supabase**

- ✅ **Registrazione utenti** con conferma email
- ✅ **Login/Logout** sicuro con sessioni persistenti
- ✅ **Reset password** tramite email
- ✅ **Gestione ruoli** (Player, GM, Admin)
- ✅ **Row Level Security** per protezione dati

### 📊 **Database PostgreSQL**

- ✅ **Profiles** - Gestione utenti estesa
- ✅ **Characters** - Personaggi LARP con XP e abilities
- ✅ **NPCs** - Personaggi non giocanti
- ✅ **Locations** - Location per sessioni
- ✅ **Contacts** - Contatti fornitori/attori
- ✅ **Tasks** - Gestione attività
- ✅ **Inventory** - Sistema inventario oggetti
- ✅ **Messages** - Messaggi in-character
- ✅ **Rules** - Regolamento con versioning
- ✅ **XP Awards** - Storico assegnazione PE
- ✅ **Notifications** - Sistema notifiche

### 🎯 **Funzionalità Real-time**

- ✅ **Aggiornamenti automatici** quando i dati cambiano
- ✅ **Notifiche live** per nuovi messaggi
- ✅ **Sincronizzazione** tra dispositivi
- ✅ **Hook personalizzati** per operazioni CRUD

### 🛡️ **Sicurezza e Permessi**

- ✅ **Row Level Security** su tutte le tabelle
- ✅ **Controllo accessi** basato su ruoli
- ✅ **Protezione routes** frontend
- ✅ **Validazione dati** client e server

## 🏗️ Architettura

```
Frontend (React + TypeScript)
├── 🔐 SupabaseAuthContext - Gestione autenticazione
├── 📊 SupabaseAppContext - Gestione dati applicazione
├── 🪝 useSupabase hooks - Operazioni CRUD
├── 🛡️ ProtectedRoute - Protezione routes
└── 🎨 Components - UI components

Backend (Supabase)
├── 🔑 Auth - Sistema autenticazione
├── 🗄️ Database - PostgreSQL con RLS
├── 📡 Realtime - Aggiornamenti live
└── 📦 Storage - File e avatar
```

## 🚀 Setup Veloce

### 1. Crea Progetto Supabase

```bash
# Vai su https://supabase.com
# Crea nuovo progetto
# Copia URL e Anon Key
```

### 2. Configura Ambiente

```bash
# Rinomina .env.example in .env
cp .env.example .env

# Inserisci le tue credenziali
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=tua-anon-key
```

### 3. Crea Database

```bash
# Nel SQL Editor di Supabase, esegui:
# Copia tutto il contenuto di supabase_migration.sql
# Clicca "Run" per creare tabelle e policy
```

### 4. Avvia Applicazione

```bash
npm install
npm run dev
```

## 📋 Struttura Database

### **Tabelle Principali**

#### `profiles` - Profili Utenti

```sql
- id (UUID, FK auth.users)
- first_name, last_name, email
- role (player|gm|admin)
- avatar_url, preferences
- created_at, updated_at, last_login
```

#### `characters` - Personaggi LARP

```sql
- id, name, role (ruolo LARP)
- player_id (FK profiles)
- status, xp, background
- abilities[], description
- avatar_url, last_session
```

#### `messages` - Sistema Messaggi

```sql
- id, from_character, to_character
- content, timestamp, is_read
- from_user_id, to_user_id (FK profiles)
- is_in_character
```

#### `rules` - Regolamento

```sql
- id, title, content, category
- priority, visibility (public|gm_only)
- tags[], version
- created_by (FK profiles)
```

### **Sicurezza RLS**

```sql
-- Gli utenti vedono solo i loro dati
-- GM/Admin hanno accesso esteso
-- Regole pubbliche visibili a tutti
-- Messaggi visibili solo a mittente/destinatario
```

## 🔧 Sviluppo

### **Hook Personalizzati**

```typescript
// Hook generico CRUD
const { data, loading, create, update, remove } = useSupabaseCRUD("characters");

// Hook specifici
const characters = useCharacters(); // Con awardXP
const messages = useMessages(); // Con sendMessage
const rules = useRules(); // Con filtri visibilità
```

### **Componenti Auth**

```typescript
// Context autenticazione
const { user, signIn, signUp, signOut } = useAuth();

// Protezione route
<ProtectedRoute requiredRole="gm">
  <ComponentePerGM />
</ProtectedRoute>
```

### **Gestione Stato**

```typescript
// Context applicazione
const {
  characters,
  charactersLoading,
  addCharacter,
  updateCharacter,
  deleteCharacter,
} = useApp();
```

## 🎮 Utilizzo

### **Per Giocatori**

1. **Registrati** con email e scegli ruolo "Player"
2. **Crea personaggi** e gestisci il tuo profilo
3. **Invia messaggi** in-character ad altri giocatori
4. **Consulta regolamento** e ricevi notifiche

### **Per Game Master**

1. **Accesso completo** a giocatori e personaggi
2. **Gestisci PNG** e location per sessioni
3. **Assegna PE** e modera messaggi
4. **Crea regole** e invia notifiche

### **Per Admin**

1. **Controllo totale** del sistema
2. **Gestione utenti** e permessi
3. **Analisi e statistiche** complete
4. **Configurazione** sistema

## 🔍 Debug e Troubleshooting

### **Problemi Comuni**

#### Errore autenticazione

```bash
# Verifica credenziali in .env
# Controlla URL Supabase nel dashboard
# Verifica che Site URL sia configurato
```

#### Errori database

```bash
# Verifica che lo script SQL sia stato eseguito
# Controlla policy RLS
# Verifica permessi utente
```

#### Problemi permessi

```bash
# Controlla ruolo utente in profiles
# Verifica policy RLS per la tabella
# Controlla ProtectedRoute nel frontend
```

### **Log Utili**

```typescript
// Console browser (F12)
// Tab Network per chiamate API
// Supabase Dashboard > Logs
// Supabase Dashboard > Auth > Users
```

## 📚 Risorse

- [**Documentazione Supabase**](https://supabase.com/docs)
- [**Setup Dettagliato**](./SUPABASE_SETUP.md)
- [**Database Schema**](./supabase_migration.sql)
- [**Row Level Security**](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Prossimi Sviluppi

- [ ] **File Upload** per avatar e documenti
- [ ] **Notifiche Push** real-time
- [ ] **Chat real-time** con typing indicators
- [ ] **Calendario eventi** integrato
- [ ] **Backup automatico** configurabile
- [ ] **API esterne** per servizi terzi

---

**🎉 Il LARP Manager è ora una potente piattaforma full-stack pronta per la produzione!**

Con Supabase ottieni scalabilità, sicurezza e prestazioni enterprise mantenendo la semplicità di sviluppo. Perfetto per gestire campagne LARP di qualsiasi dimensione.
