# Configurazione Supabase per LARP Manager

## 🚀 Setup Rapido

### 1. Crea un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Clicca su "New Project"
3. Scegli un nome per il progetto (es. "larp-manager")
4. Imposta una password sicura per il database
5. Seleziona la regione più vicina a te
6. Clicca "Create new project"

### 2. Configura le Credenziali

1. Nel dashboard Supabase, vai su **Settings** > **API**
2. Copia il **Project URL** e la **anon/public key**
3. Rinomina il file `.env.example` in `.env`
4. Sostituisci i valori nel file `.env`:

```bash
VITE_SUPABASE_URL=https://tuo-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key
```

### 3. Crea il Database

1. Nel dashboard Supabase, vai su **SQL Editor**
2. Clicca su "New query"
3. Copia e incolla tutto il contenuto del file `supabase_migration.sql`
4. Clicca "Run" per eseguire lo script
5. Verifica che tutte le tabelle siano state create andando su **Table Editor**

### 4. Configura l'Autenticazione

1. Vai su **Authentication** > **Settings**
2. In **Site URL**, aggiungi: `http://localhost:5173`
3. In **Redirect URLs**, aggiungi:
   - `http://localhost:5173/reset-password-confirm`
   - `http://localhost:5173/**`
4. In **Auth Providers**, abilita **Email** se non già attivo

### 5. Configura Row Level Security (Opzionale)

Le politiche RLS sono già incluse nello script SQL, ma puoi verificarle:

1. Vai su **Authentication** > **Policies**
2. Verifica che le policy siano attive per tutte le tabelle
3. Controlla i permessi per ogni ruolo utente

### 6. Configura Storage (Opzionale)

Per gli avatar e i file:

1. Vai su **Storage**
2. Verifica che i bucket `avatars` e `documents` siano stati creati
3. Configura le policy di accesso se necessario

## 🔐 Primo Utente Admin

### Opzione 1: Registrazione Tramite App

1. Avvia l'app con `npm run dev`
2. Registra un nuovo utente tramite il form
3. Vai nel dashboard Supabase > **Table Editor** > **profiles**
4. Trova il tuo utente e cambia il campo `role` da `player` a `admin`

### Opzione 2: Inserimento Manuale

Nel SQL Editor di Supabase, esegui:

```sql
-- Crea un utente admin (sostituisci email e password)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'admin@tuosito.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"first_name": "Admin", "last_name": "User"}'::jsonb
);

-- Aggiorna il profilo per renderlo admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@tuosito.com';
```

## 📋 Verifica Setup

### Checklist

- [ ] Progetto Supabase creato
- [ ] Credenziali configurate in `.env`
- [ ] Script SQL eseguito
- [ ] Tabelle create (verifica in Table Editor)
- [ ] Autenticazione configurata
- [ ] Primo utente admin creato
- [ ] App avviata e test login funzionante

### Test delle Funzionalità

1. **Registrazione**: Crea un nuovo account
2. **Login**: Accedi con le credenziali
3. **Personaggi**: Crea un nuovo personaggio
4. **Messaggi**: Invia un messaggio
5. **Regole**: Visualizza le regole esistenti
6. **Notifiche**: Controlla le notifiche

## 🔧 Risoluzione Problemi

### Errore: "Invalid API key"

- Verifica che l'URL e la chiave in `.env` siano corretti
- Controlla che non ci siano spazi extra nelle variabili

### Errore: "relation does not exist"

- Assicurati di aver eseguito tutto lo script SQL
- Verifica che le tabelle esistano in Table Editor

### Errore di autenticazione

- Controlla le impostazioni in Authentication > Settings
- Verifica che Site URL sia corretto

### Problemi di permessi

- Controlla le policy RLS in Authentication > Policies
- Verifica che l'utente abbia il ruolo corretto

## 📚 Documentazione Utile

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)

## 🆘 Supporto

Se incontri problemi:

1. Controlla i log della console browser (F12)
2. Verifica i log Supabase nel dashboard
3. Consulta la documentazione ufficiale
4. Controlla che tutte le dipendenze siano installate: `npm install`
