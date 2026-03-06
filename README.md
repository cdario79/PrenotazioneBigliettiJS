# CineVerse - Sistema Prenotazione Biglietti Cinema

Applicazione web moderna per la prenotazione di biglietti cinematografici, sviluppata con Vanilla JavaScript, HTML5 e CSS3 seguendo le best practices del web development moderno.

## Descrizione

CineVerse è un'applicazione Single Page Application (SPA) che permette agli utenti di:
- Visualizzare i film disponibili con orari e prezzi
- Selezionare posti in sala cinematografica
- Confermare prenotazioni con persistenza locale
- Gestire l'esperienza utente in modo fluido e intuitivo

Il progetto è stato sviluppato con **JavaScript ES6+**, **manipolazione DOM**, **state management** e **design responsive**.

---

## Funzionalità Principali

### Selezione Film
- **4 film disponibili** con diverse informazioni (titolo, orario, durata, sala, prezzo, genere)
- **Badge colorati** per genere cinematografico
- **Feedback visivo** su film selezionato
- **Cambio film intelligente** con conferma se ci sono posti già selezionati

### Gestione Posti
- **Griglia interattiva** che mostra tutti i posti della sala
- **3 stati posti**: disponibile, selezionato, occupato
- **Selezione multipla** con feedback visivo immediato
- **Animazioni** su selezione/deselezione
- **Label di riga** per orientamento (A, B, C...)

### Riepilogo Prenotazione
- **Calcolo prezzo in tempo reale** utilizzando `reduce()`
- **Lista dettagliata** posti selezionati
- **Validazione automatica** prima della conferma
- **Modal di conferma** con tutti i dettagli della prenotazione

### Persistenza Dati
- **LocalStorage** per salvare posti occupati
- **Ripristino automatico** al ricaricamento pagina
- **Simulazione realistica** con posti occupati casuali per ogni film al primo caricamento

### UI/UX Avanzata
- **Design moderno** con gradients e animazioni CSS
- **Responsive design** (desktop, tablet, mobile)
- **Alert toast** animati per feedback utente
- **Loading states** durante operazioni asincrone
- **Keyboard shortcuts** (Ctrl+R reset, Ctrl+Enter conferma, ESC deseleziona)

---

## Tecnologie Utilizzate

### Core Technologies
- **HTML5** - Struttura semantica e accessibile
- **CSS3** - Styling moderno con Flexbox, Grid, animazioni
- **JavaScript ES6+** - Logica applicativa moderna

### Frameworks & Libraries
- **Bootstrap 5.3** - Framework CSS per layout responsive
- **Bootstrap Icons** - Iconografia moderna

### Tools & Development
- **ES6 Modules** - Import/export per modularità
- **Live Server** - Development server con hot reload
- **LocalStorage API** - Persistenza dati lato client

### Concetti Applicati
- **Programmazione Funzionale** (map, filter, reduce, pure functions)
- **OOP con Classi ES6** (Film, Sala)
- **State Management** centralizzato
- **Event Delegation** per performance
- **Immutabilità** dei dati
- **Separation of Concerns** (SoC)

---

## Installazione e Avvio

### Prerequisiti
- **Node.js** >= 14.0.0
- **npm** >= 6.0.0

### Step 1: Clone o Download
```bash
# Clone repository (se disponibile)
git clone https://github.com/...

# Oppure scarica e decomprimi lo ZIP nella cartella
cd PrenotazioneBiglietti
```

### Step 2: Installa Dipendenze
```bash
npm install
```

### Step 3: Avvia l'Applicazione
```bash
# Avvia server con apertura automatica browser
npm start

# Oppure modalità development con watch
npm run dev

# Server senza apertura browser
npm run serve
```

L'applicazione sarà disponibile su **http://localhost:3000**

---

## Struttura del Progetto

```
PrenotazioneBiglietti/
│
├── index.html                 # Pagina principale con struttura HTML
│
├── styles/
│   └── style.css             # Stili personalizzati e animazioni
│
├── src/
│   ├── main.js               # Entry point - orchestrazione applicazione
│   └── modules/
│       ├── cinema.js         # Gestione film, sale e configurazioni
│       ├── booking.js        # Logica prenotazioni e state management
│       └── ui.js             # Manipolazione DOM e rendering
│
├── package.json              # Configurazione npm e scripts
├── README.md                 # Documentazione progetto (questo file)
└── .gitignore                # File da ignorare in Git
```

### Descrizione Moduli

#### `src/main.js`
- **Entry point** dell'applicazione
- Inizializzazione e orchestrazione
- Gestione eventi globali
- Keyboard shortcuts
- Error handling globale

#### `src/modules/cinema.js`
- Classi `Film` e `Sala`
- Configurazione film disponibili
- Generazione configurazione posti
- Utility per gestione cinema

#### `src/modules/booking.js`
- **State management** centralizzato (single source of truth)
- Logica di business per prenotazioni
- Validazione input utente
- Gestione LocalStorage
- Programmazione funzionale (reduce, filter, map)

#### `src/modules/ui.js`
- Manipolazione DOM
- Rendering dinamico componenti
- Gestione alert e modal
- Feedback visivo
- Accessibilità (ARIA attributes)

---

## Scelte Tecniche

### 1. **ES6 Modules per Modularità**

**Scelta**: Struttura modulare con `import`/`export`

**Motivazione**:
- **Separation of Concerns** - ogni modulo ha responsabilità chiare
- **Riutilizzabilità** del codice
- **Manutenibilità** migliorata
- Organizzazione professionale del codice

**Implementazione**:
```javascript
// cinema.js - gestione dati
export class Film { ... }

// booking.js - logica business
import { Film } from './cinema.js';

// main.js - orchestrazione
import { inizializzaStato } from './modules/booking.js';
```

---

### 2. **State Management Centralizzato**

**Scelta**: Oggetto `state` centralizzato come **single source of truth**

**Motivazione**:
- **Predicibilità** - unica fonte di verità per lo stato dell'app
- **Debugging facilitato** - stato controllato e tracciabile
- **Immutabilità** - copie dello stato invece di mutazioni dirette

**Implementazione**:
```javascript
const state = {
  filmAttivo: null,
  sala: null,
  posti: [],
  postiSelezionati: [],
  totale: 0,
  ui: { messaggio: null, errore: null }
};

// Accesso allo stato sempre tramite getter (copia immutabile)
export function getStato() {
  return {
    filmAttivo: state.filmAttivo ? { ...state.filmAttivo } : null,
    posti: state.posti.map(p => ({ ...p })),
    // ...
  };
}
```

---

### 3. **Programmazione Funzionale**

**Scelta**: Utilizzo estensivo di metodi funzionali degli array

**Motivazione**:
- **Codice dichiarativo** più leggibile
- **Immutabilità** - no side effects

**Esempi**:
```javascript
// Calcolo totale con reduce
const totale = postiSelezionati.reduce(
  (acc, posto) => acc + prezzo, 0
);

// Filtraggio posti disponibili
const disponibili = posti.filter(p => !p.occupato);

// Trasformazione per UI
const postiIds = posti.map(p => p.id).sort().join(', ');
```

---

### 4. **LocalStorage per Persistenza**

**Scelta**: LocalStorage invece di backend reale

**Motivazione**:
- **Simulazione realistica** di persistenza dati
- **No backend necessario** - applicazione standalone
- **Funziona offline**

**Gestione Errori**:
```javascript
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (error) {
  // Gestisce QuotaExceededError e browser privato
  if (error.name === 'QuotaExceededError') {
    mostraErrore('Spazio di archiviazione esaurito');
  }
}
```

---

### 5. **Event Delegation per Performance**

**Scelta**: Event listener sul container invece che su ogni posto

**Motivazione**:
- **Performance** - un listener invece di 50-100
- **Memoria** ottimizzata
- **Elementi dinamici** gestiti automaticamente

**Implementazione**:
```javascript
// ❌ EVITATO: listener per ogni posto
posti.forEach(posto => {
  posto.addEventListener('click', handler);
});

// ✅ IMPLEMENTATO: delegation su container
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('seat')) {
    handleSeatClick(e.target.dataset.postoId);
  }
});
```

---

### 6. **DocumentFragment per Ottimizzazione DOM**

**Scelta**: Batch DOM manipulations con DocumentFragment

**Motivazione**:
- **Performance** - un solo reflow invece di N reflow
- Rendering griglia 50-100 posti < 100ms
- Best practice per inserimenti multipli

**Implementazione**:
```javascript
const fragment = document.createDocumentFragment();
posti.forEach(posto => {
  const element = creaPosto(posto);
  fragment.appendChild(element);
});
// Un solo reflow qui
container.appendChild(fragment);
```

---

### 7. **Bootstrap 5 per UI Framework**

**Scelta**: Bootstrap invece di CSS puro o altri framework

**Motivazione**:
- **Grid system** responsive robusto
- **Componenti** pre-costruiti (modal, alert)
- **Utility classes** per rapid prototyping
- **Accessibilità** built-in
- **Cross-browser** testato estensivamente

**Personalizzazione**:
- CSS custom per identità brand (gradients viola/blu)
- Override classi Bootstrap quando necessario
- Componenti custom (griglia posti, film cards)

---

### 8. **Accessibilità (A11y) Integrata**

**Scelta**: ARIA attributes, keyboard navigation, focus management

**Motivazione**:
- **Inclusività** - app utilizzabile da tutti
- **Best practice** web moderne

**Implementazioni**:
```javascript
// Stato posti con ARIA
seat.setAttribute('aria-label', `Posto ${id}, ${stato}`);
seat.setAttribute('aria-pressed', isSelected);
seat.setAttribute('tabindex', '0');

// Keyboard navigation
seat.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    selectSeat();
  }
});
```

---

### 9. **Gestione Edge Cases**

**Scelta**: Gestione esplicita di casi limite

**Motivazione**:
- **Stabilità** applicazione
- **UX** senza sorprese
- **Professionalità**

**Casi gestiti**:
- Cambio film con posti già selezionati (conferma utente)
- Sala completamente occupata (messaggio informativo)
- Click su posto già occupato (feedback errore)
- Conferma senza selezione posti (validazione)
- JavaScript disabilitato (fallback noscript)
- LocalStorage non disponibile (graceful degradation)
- Browser non compatibile (warning)

