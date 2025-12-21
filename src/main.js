/**
 * Main Entry Point - Applicazione Prenotazione Biglietti CineVerse
 * Orchestrazione dei moduli e gestione eventi
 */

import { FILM_DISPONIBILI } from './modules/cinema.js';
import {
  inizializzaStato,
  setFilmAttivo,
  togglePosto,
  confermaPrenotazione,
  resetApplicazione,
  getStato
} from './modules/booking.js';
import {
  inizializzaDOM,
  renderFilm,
  evidenziaFilmAttivo,
  renderPosti,
  mostraSala,
  renderRiepilogo,
  aggiornaPosto,
  mostraErrore,
  mostraSuccesso,
  mostraModalConferma,
  resetUI,
  checkCompatibility
} from './modules/ui.js';

/**
 * Inizializzazione applicazione
 */
function init() {
  console.log('🎬 Inizializzazione CineVerse...');

  // Verifica compatibilità browser
  const compatibility = checkCompatibility();
  if (!compatibility.compatible) {
    console.warn('Browser non completamente compatibile:', compatibility.unsupported);
  }

  // Inizializza riferimenti DOM
  inizializzaDOM();

  // Inizializza stato applicazione
  inizializzaStato();

  // Renderizza lista film
  renderFilm(FILM_DISPONIBILI, handleFilmSelect);

  // Setup event listeners
  setupEventListeners();

  console.log('✅ CineVerse inizializzato correttamente');
}

/**
 * Setup event listeners globali
 */
function setupEventListeners() {
  const btnConferma = document.getElementById('btn-conferma');
  const btnReset = document.getElementById('btn-reset');

  // Conferma prenotazione
  btnConferma.addEventListener('click', handleConfermaPrenotazione);

  // Reset applicazione
  btnReset.addEventListener('click', handleReset);

  // Keyboard shortcuts (opzionale)
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handler selezione film
 * @param {number} filmId - ID del film selezionato
 */
function handleFilmSelect(filmId) {
  console.log(`Film selezionato: ${filmId}`);

  // Trova film nell'array
  const film = FILM_DISPONIBILI.find(f => f.id === filmId);

  if (!film) {
    mostraErrore('Film non trovato');
    return;
  }

  // Imposta film attivo nello stato
  const success = setFilmAttivo(film);

  if (!success) {
    // L'utente ha annullato il cambio film
    return;
  }

  // Evidenzia film selezionato
  evidenziaFilmAttivo(filmId);

  // Ottieni stato aggiornato
  const stato = getStato();

  // Renderizza griglia posti
  renderPosti(stato.posti, handlePostoClick);

  // Mostra sezione sala
  mostraSala();

  // Renderizza riepilogo
  renderRiepilogo();

  // Feedback
  mostraSuccesso(`Film "${film.titolo}" selezionato`);
}

/**
 * Handler click su posto
 * @param {string} postoId - ID del posto cliccato
 */
function handlePostoClick(postoId) {
  console.log(`Posto cliccato: ${postoId}`);

  // Toggle selezione posto
  const success = togglePosto(postoId);

  if (!success) {
    // L'errore è già gestito nel modulo booking
    // UI mostra già il messaggio di errore
    return;
  }

  // Ottieni stato aggiornato
  const stato = getStato();

  // Trova il posto aggiornato
  const posto = stato.posti.find(p => p.id === postoId);

  // Aggiorna visualmente solo il posto modificato (performance)
  aggiornaPosto(postoId, posto);

  // Aggiorna riepilogo
  renderRiepilogo();

  // Feedback sonoro leggero (opzionale, commentato per default)
  // if (posto.selezionato) {
  //   playSelectSound();
  // }
}

/**
 * Handler conferma prenotazione
 */
function handleConfermaPrenotazione() {
  console.log('Conferma prenotazione richiesta');

  // Disabilita pulsante durante elaborazione
  const btnConferma = document.getElementById('btn-conferma');
  const testoOriginale = btnConferma.innerHTML;
  btnConferma.disabled = true;
  btnConferma.innerHTML = '<span class="loading"></span> Elaborazione...';

  // Simula piccolo ritardo per feedback UX
  setTimeout(() => {
    // Conferma prenotazione
    const risultato = confermaPrenotazione();

    // Ripristina pulsante
    btnConferma.innerHTML = testoOriginale;

    if (risultato.success) {
      // Mostra modal conferma
      mostraModalConferma(risultato.riepilogo);

      // Aggiorna UI
      const stato = getStato();
      renderPosti(stato.posti, handlePostoClick);
      renderRiepilogo();

      console.log('✅ Prenotazione confermata:', risultato.riepilogo);
    } else {
      // Mostra errore
      mostraErrore(risultato.messaggio);
      btnConferma.disabled = false;
      console.error('❌ Errore prenotazione:', risultato.messaggio);
    }
  }, 800);
}

/**
 * Handler reset applicazione
 */
function handleReset() {
  console.log('Reset applicazione richiesto');

  // Conferma se ci sono posti selezionati
  const stato = getStato();
  if (stato.postiSelezionati.length > 0) {
    const conferma = confirm(
      'Sei sicuro di voler ricominciare? I posti selezionati verranno persi.'
    );
    if (!conferma) {
      return;
    }
  }

  // Reset stato
  resetApplicazione();

  // Reset UI
  resetUI();

  mostraSuccesso('Applicazione resettata. Seleziona un nuovo film!');
  console.log('🔄 Applicazione resettata');
}

/**
 * Handler keyboard shortcuts
 * @param {KeyboardEvent} e - Evento tastiera
 */
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + R: Reset
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    handleReset();
  }

  // Ctrl/Cmd + Enter: Conferma (se pulsante abilitato)
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const btnConferma = document.getElementById('btn-conferma');
    if (!btnConferma.disabled) {
      e.preventDefault();
      handleConfermaPrenotazione();
    }
  }

  // Escape: Deseleziona tutti i posti
  if (e.key === 'Escape') {
    const stato = getStato();
    if (stato.postiSelezionati.length > 0) {
      // Deseleziona tutti i posti
      stato.postiSelezionati.forEach(posto => {
        togglePosto(posto.id);
      });

      // Aggiorna UI
      const statoAggiornato = getStato();
      renderPosti(statoAggiornato.posti, handlePostoClick);
      renderRiepilogo();

      mostraSuccesso('Selezione cancellata');
    }
  }
}

/**
 * Gestione errori globali
 */
window.addEventListener('error', (e) => {
  console.error('Errore globale:', e.error);
  mostraErrore('Si è verificato un errore. Ricarica la pagina se il problema persiste.');
});

/**
 * Gestione promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejection non gestita:', e.reason);
  mostraErrore('Si è verificato un errore durante un\'operazione asincrona.');
});

/**
 * Debug: Esponi alcune funzioni per testing in console
 * NOTA: Rimuovere in produzione
 */
if (typeof window !== 'undefined') {
  window.CineVerseDebug = {
    getStato,
    resetApplicazione,
    FILM_DISPONIBILI
  };
  console.log('🐛 Debug mode attivo. Usa window.CineVerseDebug per testing');
}

// ===== Inizializzazione automatica al caricamento DOM =====

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM già caricato
  init();
}

// ===== Export per testing (opzionale) =====
export {
  handleFilmSelect,
  handlePostoClick,
  handleConfermaPrenotazione,
  handleReset
};
