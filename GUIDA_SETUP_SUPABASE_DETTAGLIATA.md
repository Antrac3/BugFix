# 📖 Guida Completa Setup Supabase - LARP Manager

## 🎯 Panoramica

Questa guida ti accompagna passo-passo nella configurazione completa di Supabase per il LARP Manager. Ogni punto è spiegato in dettaglio con esempi pratici e troubleshooting.

---

## 🚀 **PUNTO 1: Crea un Progetto Supabase**

### **1.1 Registrazione su Supabase**

**Cosa faremo:** Creare un account gratuito su Supabase e inizializzare il nostro primo progetto.

**Passaggi dettagliati:**

#### **Step 1.1.1: Accesso alla piattaforma**

```bash
# Apri il browser e vai su:
https://supabase.com
```

**Cosa vedrai:**

- Homepage di Supabase con il pulsante "Start your project"
- Opzioni di pricing (useremo il tier gratuito)
- Documentazione e esempi

#### **Step 1.1.2: Registrazione account**

```bash
# Clicca su "Start your project" o "Sign up"
# Opzioni disponibili:
```

**Metodi di registrazione:**

- **GitHub** (consigliato per sviluppatori)
- **Google** (più veloce)
- **Email/Password** (tradizionale)

**Vantaggi GitHub:**

- Sync automatico con repository
- Integrazione CI/CD facilitata
- Gestione team semplificata

#### **Step 1.1.3: Verifica email**

Se usi email/password, controlla la tua casella di posta:

```
Oggetto: "Confirm your signup to Supabase"
Contenuto: Link di conferma da cliccare
Tempo: Arriva entro 2-3 minuti
```

### **1.2 Creazione del Progetto**

#### **Step 1.2.1: Dashboard iniziale**

Dopo il login vedrai:

- **"New Project"** - Il pulsante principale
- **Organization** - Gestione team (possiamo saltare)
- **Templates** - Esempi preconfigurati

#### **Step 1.2.2: Configurazione progetto**

**Clicca "New Project" e compila:**

```yaml
# Informazioni richieste:
Project Name: "larp-manager" # Nome che vedrai nel dashboard
Database Password: "TuaPasswordSicura123" # IMPORTANTE: salvala!
Region: "West Europe (London)" # Scegli la più vicina a te
Pricing Plan: "Free" # Perfetto per iniziare
```

**📝 Suggerimenti per la password:**

- Minimo 8 caratteri
- Maiuscole, minuscole, numeri
- Caratteri speciali (!@#$%)
- **SALVALA** - non è recuperabile facilmente

**🌍 Scelta della regione:**

- **Europa:** `West Europe (London)` o `Central Europe (Frankfurt)`
- **Italia:** `West Europe (London)` è ottimale
- **Latenza:** Più vicino = più veloce

#### **Step 1.2.3: Processo di creazione**

**Cosa succede dopo aver cliccato "Create new project":**

```
⏳ Fase 1: "Setting up your project..." (30-60 secondi)
   - Creazione database PostgreSQL
   - Configurazione rete e sicurezza
   - Inizializzazione servizi

⏳ Fase 2: "Configuring database..." (1-2 minuti)
   - Setup tabelle di sistema
   - Configurazione Row Level Security
   - Preparazione API REST

⏳ Fase 3: "Finalizing..." (30 secondi)
   - Generazione chiavi API
   - Setup dashboard
   - Configurazione URL
```

**✅ Successo:** Vedrai il dashboard del progetto con:

- Sidebar con tutte le sezioni
- Overview con statistiche
- Quick start guide

### **1.3 Orientamento nel Dashboard**

#### **Sezioni principali:**

```
📊 Home           - Statistiche e overview
🗄️  Table Editor  - Gestione tabelle database
🔐 Authentication - Gestione utenti e auth
🔌 API           - Documentazione API auto-generata
📦 Storage        - File upload/download
📊 SQL Editor     - Console per query SQL
⚙️  Settings      - Configurazioni progetto
```

**💡 Primo orientamento:**

1. **Home** - Familiarizza con le metriche
2. **API** - Nota l'URL del progetto e le chiavi
3. **SQL Editor** - Qui caricheremo il nostro schema

---

## 🔑 **PUNTO 2: Configura le Credenziali**

### **2.1 Recupero delle Credenziali**

**Cosa sono:** Le credenziali permettono al nostro frontend di comunicare con Supabase in modo sicuro.

#### **Step 2.1.1: Navigazione alle impostazioni**

```bash
# Nel dashboard Supabase:
Sidebar → Settings → API
```

#### **Step 2.1.2: Credenziali da copiare**

**Troverai queste informazioni:**

```yaml
# 1. PROJECT URL (sempre visibile)
URL: "https://abc123def456.supabase.co"
Descrizione: "Endpoint principale del tuo progetto"
Utilizzato per: "Tutte le chiamate API"

# 2. ANON/PUBLIC KEY (sezione "Project API keys")
anon/public: "eyJhbGciOiJIUzI1NiIsI..."
Descrizione: "Chiave per accesso pubblico con RLS"
Utilizzato per: "Autenticazione frontend"

# 3. SERVICE_ROLE KEY (⚠️ SEGRETA)
service_role: "eyJhbGciOiJIUzI1NiIsI..."
Descrizione: "Chiave admin - bypassa RLS"
Utilizzato per: "Script server-side (NON nel frontend)"
```

**🚨 ATTENZIONE SICUREZZA:**

- **anon/public** → ✅ Sicura nel frontend
- **service_role** → ❌ MAI nel frontend (bypassa sicurezza)

### **2.2 Configurazione File .env**

#### **Step 2.2.1: Preparazione file ambiente**

**Nel tuo progetto locale:**

```bash
# Se esiste .env.example, rinominalo:
mv .env.example .env

# Oppure creane uno nuovo:
touch .env
```

#### **Step 2.2.2: Struttura del file .env**

**Apri `.env` e inserisci:**

```bash
# Configurazione Supabase LARP Manager
# =====================================

# 🌐 URL del progetto (sostituisci abc123def456 con il tuo project ID)
VITE_SUPABASE_URL=https://abc123def456.supabase.co

# 🔑 Chiave pubblica (sostituisci con la tua anon key)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM2RlZjQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.ESEMPIO_KEY_SOSTITUISCI_CON_LA_TUA

# 🚀 Ambiente di sviluppo
VITE_APP_ENV=development

# 📝 Note per il team:
# - Non committare questo file su Git (.gitignore)
# - Condividi le credenziali solo con il team autorizzato
# - Per produzione, usa variabili d'ambiente del server
```

#### **Step 2.2.3: Verifica configurazione**

**Test delle credenziali:**

```bash
# Avvia il progetto per testare
npm run dev

# Controlla console browser (F12) per errori tipo:
# ✅ "Supabase client initialized"
# ❌ "Invalid API key" o "Project not found"
```

### **2.3 Sicurezza delle Credenziali**

#### **Step 2.3.1: File .gitignore**

**Verifica che `.env` sia ignorato da Git:**

```bash
# Controlla se .gitignore contiene:
.env
.env.local
.env.production

# Se non c'è, aggiungilo:
echo ".env" >> .gitignore
```

#### **Step 2.3.2: Condivisione sicura**

**Per condividere con il team:**

```bash
# ✅ Opzioni sicure:
1. Documento condiviso crittografato (1Password, Bitwarden)
2. Chat sicura temporanea
3. File separato inviato privatamente

# ❌ MAI condividere via:
1. Email non crittografata
2. Chat pubbliche (Discord, Slack)
3. Repository Git pubblici
```

#### **Step 2.3.3: Rotazione chiavi**

**Se le chiavi sono compromesse:**

```bash
# In Supabase Dashboard:
Settings → API → "Generate new anon key"

# Poi aggiorna tutti i .env del team
```

---

## 🗄️ **PUNTO 3: Crea il Database**

### **3.1 Comprensione dello Schema**

**Il nostro database include:**

- **11 tabelle principali** per dati LARP
- **Row Level Security** per protezione
- **Trigger automatici** per timestamp
- **Relazioni Foreign Key** tra entità
- **Indici ottimizzati** per performance

#### **Tabelle che creeremo:**

```sql
-- 👥 GESTIONE UTENTI
profiles          -- Profili utenti estesi
notifications     -- Sistema notifiche

-- 🎭 GESTIONE PERSONAGGI
characters        -- Personaggi giocatori
npcs              -- Personaggi non giocanti
xp_awards         -- Storico assegnazione PE

-- 🏰 GESTIONE MONDO DI GIOCO
locations         -- Location per sessioni
inventory_items   -- Oggetti e equipaggiamento
rules             -- Regolamento versioned

-- 💼 GESTIONE ORGANIZZATIVA
contacts          -- Fornitori e collaboratori
tasks             -- Attività e todo
messages          -- Messaggi in-character
```

### **3.2 Caricamento dello Schema**

#### **Step 3.2.1: Accesso SQL Editor**

```bash
# Nel dashboard Supabase:
Sidebar → SQL Editor
```

**Cosa vedrai:**

- **"New query"** - Per creare script personalizzati
- **"Quickstarts"** - Template predefiniti
- **"Templates"** - Esempi comuni
- **History** - Query precedenti

#### **Step 3.2.2: Preparazione dello script**

**Apri il file `supabase_migration.sql` dal progetto:**

```bash
# Il file contiene tutto lo schema necessario:
- Creazione tipi enumerati
- Definizione tabelle con relazioni
- Trigger per timestamp automatici
- Policy Row Level Security
- Indici per performance
- Dati di esempio iniziali
```

#### **Step 3.2.3: Esecuzione dello script**

**Nel SQL Editor:**

1. **Clicca "New query"**
2. **Copia tutto il contenuto** di `supabase_migration.sql`
3. **Incolla nel editor SQL**
4. **Clicca "Run"** (o Ctrl+Enter)

**⏳ Processo di esecuzione:**

```
Step 1: Creazione extensions     (5 secondi)
Step 2: Definizione enums        (10 secondi)
Step 3: Creazione tabelle        (15 secondi)
Step 4: Aggiunta relazioni       (10 secondi)
Step 5: Creazione indici         (15 secondi)
Step 6: Setup Row Level Security (20 secondi)
Step 7: Inserimento dati demo    (10 secondi)
```

**✅ Successo:** Vedrai nella console:

```sql
-- Messaggi tipo:
CREATE EXTENSION
CREATE TYPE
CREATE TABLE
CREATE INDEX
CREATE POLICY
INSERT 0 5
-- etc...
```

**❌ Errori comuni:**

```sql
-- Se vedi errori tipo:
ERROR: relation "auth.users" does not exist
SOLUZIONE: Assicurati di essere nel progetto giusto

ERROR: insufficient privileges
SOLUZIONE: Usa il SQL Editor di Supabase (non client esterni)

ERROR: duplicate key value violates unique constraint
SOLUZIONE: Il database ha già dati - cancella e riprova
```

### **3.3 Verifica del Database**

#### **Step 3.3.1: Controllo tabelle**

```bash
# Vai a: Table Editor nel dashboard
# Dovresti vedere tutte le tabelle:
```

**Lista tabelle create:**

```
✅ profiles (11 righe circa)
✅ characters (2-3 righe demo)
✅ npcs (vuota inizialmente)
✅ locations (vuota inizialmente)
✅ contacts (vuota inizialmente)
✅ tasks (vuota inizialmente)
✅ inventory_items (vuota inizialmente)
✅ messages (vuota inizialmente)
✅ rules (2-3 regole demo)
✅ xp_awards (vuota inizialmente)
✅ notifications (vuota inizialmente)
```

#### **Step 3.3.2: Test delle relazioni**

**Nel SQL Editor, prova questa query:**

```sql
-- Test join tra characters e profiles
SELECT
    c.name as character_name,
    c.role as character_role,
    p.first_name || ' ' || p.last_name as player_name,
    p.email as player_email
FROM characters c
JOIN profiles p ON c.player_id = p.id;
```

**Risultato atteso:**

```
character_name | character_role | player_name | player_email
Aria Ombra...  | Assassino     | Elena...    | elena@...
Thorin Bar...  | Soldato       | Marcus...   | marcus@...
```

#### **Step 3.3.3: Verifica Row Level Security**

**Controllo policy attive:**

```bash
# Vai a: Authentication → Policies
# Dovresti vedere policy per ogni tabella tipo:
```

```sql
-- Esempi di policy create:
profiles: "Users can view their own profile"
characters: "Users can view their own characters"
messages: "Users can view their own messages"
rules: "Everyone can view public rules"
-- etc...
```

### **3.4 Troubleshooting Database**

#### **Problemi comuni:**

**❌ "No tables found"**

```bash
CAUSA: Script non eseguito o fallito
SOLUZIONE:
1. Ricontrolla i messaggi nella console SQL
2. Riprova con script pulito
3. Verifica permessi progetto
```

**❌ "Permission denied"**

```bash
CAUSA: RLS attivato senza utenti autenticati
SOLUZIONE:
1. Le policy sono corrette - vedrai dati dopo login
2. Per test, disabilita temporaneamente RLS
```

**❌ "Foreign key constraint fails"**

```bash
CAUSA: Ordine creazione tabelle sbagliato
SOLUZIONE:
1. Cancella tutte le tabelle
2. Riesegui script completo
3. Non modificare ordine istruzioni
```

---

## 🔐 **PUNTO 4: Configura l'Autenticazione**

### **4.1 Impostazioni Base Authentication**

**Cosa configureremo:**

- URL di redirect per l'app
- Provider di autenticazione
- Template email personalizzati
- Sicurezza avanzata

#### **Step 4.1.1: Accesso impostazioni Auth**

```bash
# Nel dashboard Supabase:
Sidebar → Authentication → Settings
```

#### **Step 4.1.2: Configurazione Site URL**

**Nella sezione "Site URL":**

```bash
# Per sviluppo locale:
Site URL: http://localhost:5173

# Spiegazione:
- Questo è l'URL base della tua app React/Vite
- Supabase reindirizzerà qui dopo email confirmation
- Cambialo per produzione (es: https://tuodominio.com)
```

**🔧 Come trovare la porta corretta:**

```bash
# Quando avvii npm run dev, vedrai:
Local:   http://localhost:5173/
Network: http://192.168.1.100:5173/

# Usa la porta del "Local" (di solito 5173 per Vite)
```

#### **Step 4.1.3: Configurazione Redirect URLs**

**Nella sezione "Redirect URLs":**

```bash
# Aggiungi queste URL (una per riga):
http://localhost:5173/**
http://localhost:5173/reset-password-confirm
http://localhost:5173/auth/callback

# Spiegazione:
- /** permette qualsiasi path dopo localhost:5173
- /reset-password-confirm gestisce reset password
- /auth/callback gestisce login provider esterni
```

### **4.2 Provider di Autenticazione**

#### **Step 4.2.1: Email Authentication (già attivo)**

**Configurazione predefinita:**

```yaml
Email: ✅ Abilitato di default
Conferma email: ✅ Richiesta (consigliato)
Password minima: 6 caratteri
Recovery: ✅ Abilitato
```

**Personalizzazione email:**

```bash
# Vai a: Authentication → Email Templates
# Puoi personalizzare:
- Confirm signup (email di conferma)
- Reset password (reset password)
- Magic Link (login senza password)
```

#### **Step 4.2.2: Provider sociali (opzionale)**

**Se vuoi abilitare Google/GitHub:**

**Per Google:**

```bash
1. Vai su Google Cloud Console
2. Crea progetto e abilita Google+ API
3. Configura OAuth consent screen
4. Crea credenziali OAuth 2.0
5. Copia Client ID e Secret in Supabase
```

**Per GitHub:**

```bash
1. Vai su GitHub → Settings → Developer settings
2. OAuth Apps → New OAuth App
3. Homepage URL: http://localhost:5173
4. Callback URL: https://tuoprogetto.supabase.co/auth/v1/callback
5. Copia Client ID e Secret in Supabase
```

### **4.3 Configurazione Sicurezza Avanzata**

#### **Step 4.3.1: Password Policy**

**In Authentication → Settings → Password Policy:**

```yaml
Minimum length: 8 # Lunghezza minima
Require uppercase: ✅ Sì # Almeno 1 maiuscola
Require lowercase: ✅ Sì # Almeno 1 minuscola
Require numbers: ✅ Sì # Almeno 1 numero
Require symbols: ⬜ Opzionale # Caratteri speciali
```

#### **Step 4.3.2: Rate Limiting**

**Protezione contro attacchi:**

```yaml
# Configurazioni automatiche:
Login attempts: 5 per minuto per IP
Signup attempts: 3 per ora per IP
Password reset: 2 per ora per email
Email confirmation: 3 per ora per email
```

#### **Step 4.3.3: Session Management**

```yaml
JWT expiry: 3600 secondi (1 ora)
Refresh token expiry: 2592000 secondi (30 giorni)
JWT Secret: Auto-generato (non modificare)
```

### **4.4 Test del Sistema Auth**

#### **Step 4.4.1: Test registrazione**

**Avvia la tua app:**

```bash
npm run dev
# Vai su http://localhost:5173/register
```

**Prova registrazione:**

```bash
1. Compila form con dati validi
2. Clicca "Crea Account"
3. Controlla email per conferma
4. Clicca link nella email
5. Dovresti essere reindirizzato all'app
```

#### **Step 4.4.2: Verifica nel dashboard**

**Controlla utenti creati:**

```bash
# Vai a: Authentication → Users
# Dovresti vedere il nuovo utente con:
- Email confermata ✅
- Created at (timestamp)
- Last sign in (se ha fatto login)
```

#### **Step 4.4.3: Test Row Level Security**

**Controlla che RLS funzioni:**

```bash
# Nel Table Editor:
1. Vai su tabella "profiles"
2. Se non vedi dati: ✅ RLS funziona
3. Se vedi tutti i profili: ❌ RLS non configurato

# In SQL Editor prova:
SELECT * FROM profiles;
-- Dovrebbe restituire solo il tuo profilo (se autenticato)
```

### **4.5 Troubleshooting Authentication**

#### **Problemi comuni:**

**❌ "Email not delivered"**

```bash
CAUSA: Configurazione email errata
SOLUZIONI:
1. Controlla spam/posta indesiderata
2. Verifica Site URL corretta
3. Controlla log in Authentication → Logs
4. Per sviluppo: usa email temporanee (temp-mail.org)
```

**❌ "Invalid redirect URL"**

```bash
CAUSA: URL non configurata in Redirect URLs
SOLUZIONI:
1. Aggiungi URL esatta in Settings
2. Usa /** per wildcard
3. Controlla porta dev server (5173)
```

**❌ "User already registered"**

```bash
CAUSA: Email già usata
SOLUZIONI:
1. Usa email diversa
2. O fai reset password dell'esistente
3. Controlla Users nel dashboard
```

**❌ "JWT malformed"**

```bash
CAUSA: Token corrotto o scaduto
SOLUZIONI:
1. Fai logout e login
2. Cancella localStorage browser
3. Riavvia dev server
```

---

## 🎯 **Riepilogo e Verifica Finale**

### **Checklist Completa Setup**

```bash
✅ 1. PROGETTO SUPABASE
   ├── Account creato su supabase.com
   ├── Progetto "larp-manager" creato
   ├── Password database salvata
   └── Dashboard accessibile

✅ 2. CREDENZIALI CONFIGURATE
   ├── URL progetto copiato
   ├── Anon key copiata
   ├── File .env configurato
   └── Credenziali testate

✅ 3. DATABASE CREATO
   ├── Script SQL eseguito completamente
   ├── 11 tabelle create
   ├── Row Level Security attivato
   └── Relazioni e indici configurati

✅ 4. AUTENTICAZIONE CONFIGURATA
   ├── Site URL impostata (localhost:5173)
   ├── Redirect URLs configurate
   ├── Email provider attivato
   └── Sicurezza configurata
```

### **Test Finale Sistema**

```bash
# 1. TEST CONNESSIONE
npm run dev → App si avvia senza errori

# 2. TEST REGISTRAZIONE
/register → Nuovo utente creato

# 3. TEST LOGIN
/login → Login funziona con credenziali

# 4. TEST DATABASE
Dashboard → Personaggi → Crea nuovo personaggio

# 5. TEST SICUREZZA
Logout → Dati non visibili da non autenticati
```

### **Prossimi Passi**

**Una volta completato il setup:**

1. **Personalizza** i dati demo con i tuoi contenuti
2. **Invita** altri utenti del team
3. **Configura** backup automatici
4. **Monitora** usage nel dashboard
5. **Pianifica** migrazione a produzione

**Per produzione dovrai:**

- Acquistare dominio personalizzato
- Configurare SSL/HTTPS
- Aggiornare tutte le URL
- Configurare backup
- Impostare monitoraggio

---

**🎉 Congratulazioni! Il tuo LARP Manager è ora completamente configurato con Supabase!**

Ora hai un sistema di gestione LARP completo, scalabile e sicuro pronto per essere utilizzato dal tuo gruppo di gioco.
