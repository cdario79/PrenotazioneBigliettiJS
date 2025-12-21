/**
 * Booking Module - Logica Prenotazioni e Gestione Stato
 * Gestisce lo stato dell'applicazione e la logica di business
 */

import { generaPosti, getSalaConfig, generaPostiOccupatiCasuali } from './cinema.js';

// Chiave per localStorage
const STORAGE_KEY = 'cineverse_prenotazioni';

// Stato centrale dell'applicazione (Single Source of Truth)
const state = {
  filmAttivo: null,
  sala: null,
  posti: [],
  postiSelezionati: [],
  totale: 0,
  ui: {
    messaggio: null,
    errore: null
  }
};

/**
 * Inizializza lo stato dell'applicazione
 */
export function inizializzaStato() {
  caricaDatiLocali();
}

/**
 * Imposta il film attivo e inizializza la sala
 * @param {Film} film - Film selezionato
 */
export function setFilmAttivo(film) {
  // Se c'è un cambio di film con posti già selezionati, chiedi conferma
  if (state.filmAttivo && state.postiSelezionati.length > 0 && state.filmAttivo.id !== film.id) {
    const conferma = confirm(
      `Hai già selezionato ${state.postiSelezionati.length} posti per "${state.filmAttivo.titolo}". Vuoi cambiare film? I posti selezionati verranno resettati.`
    );
    if (!conferma) {
      return false;
    }
  }

  state.filmAttivo = film;
  state.sala = getSalaConfig(film);
  state.posti = generaPosti(state.sala);
  state.postiSelezionati = [];
  state.totale = 0;

  // Carica posti occupati dal localStorage o genera casuali
  caricaPostiOccupati(film.id);

  return true;
}

/**
 * Toggle selezione posto
 * @param {string} postoId - ID del posto
 * @returns {boolean} True se l'operazione è riuscita
 */
export function togglePosto(postoId) {
  const posto = state.posti.find(p => p.id === postoId);

  if (!posto) {
    setErrore('Posto non trovato');
    return false;
  }

  if (posto.occupato) {
    setErrore('Questo posto è già occupato');
    return false;
  }

  // Toggle selezione
  posto.selezionato = !posto.selezionato;

  // Aggiorna array posti selezionati
  if (posto.selezionato) {
    state.postiSelezionati.push(posto);
  } else {
    state.postiSelezionati = state.postiSelezionati.filter(p => p.id !== postoId);
  }

  // Ricalcola totale
  calcolaTotale();

  return true;
}

/**
 * Calcola il prezzo totale utilizzando reduce (programmazione funzionale)
 */
function calcolaTotale() {
  if (!state.filmAttivo) {
    state.totale = 0;
    return;
  }

  state.totale = state.postiSelezionati.reduce(
    (totale, posto) => totale + state.filmAttivo.prezzo,
    0
  );
}

/**
 * Valida la prenotazione
 * @returns {Object} Oggetto con proprietà valid e messaggio
 */
export function validaPrenotazione() {
  // Verifica che ci sia un film selezionato
  if (!state.filmAttivo) {
    return {
      valid: false,
      messaggio: 'Seleziona un film per continuare'
    };
  }

  // Verifica che almeno un posto sia selezionato
  if (state.postiSelezionati.length === 0) {
    return {
      valid: false,
      messaggio: 'Seleziona almeno un posto per continuare'
    };
  }

  // Verifica che i posti selezionati siano ancora disponibili
  const postiNonDisponibili = state.postiSelezionati.filter(p => p.occupato);
  if (postiNonDisponibili.length > 0) {
    return {
      valid: false,
      messaggio: 'Alcuni posti selezionati non sono più disponibili'
    };
  }

  return {
    valid: true,
    messaggio: 'Prenotazione valida'
  };
}

/**
 * Conferma la prenotazione
 * @returns {Object} Risultato della prenotazione
 */
export function confermaPrenotazione() {
  const validazione = validaPrenotazione();

  if (!validazione.valid) {
    setErrore(validazione.messaggio);
    return {
      success: false,
      messaggio: validazione.messaggio
    };
  }

  try {
    // Marca i posti come occupati
    state.postiSelezionati.forEach(posto => {
      posto.occupato = true;
      posto.selezionato = false;
    });

    // Salva nel localStorage
    salvaDatiLocali();

    // Crea riepilogo prenotazione
    const riepilogo = {
      film: state.filmAttivo.titolo,
      orario: state.filmAttivo.orario,
      sala: state.filmAttivo.sala,
      posti: state.postiSelezionati.map(p => p.id),
      totale: state.totale,
      data: new Date().toLocaleString('it-IT')
    };

    // Reset stato selezione
    state.postiSelezionati = [];
    state.totale = 0;

    setMessaggio('Prenotazione confermata con successo!');

    return {
      success: true,
      messaggio: 'Prenotazione confermata',
      riepilogo: riepilogo
    };
  } catch (error) {
    setErrore('Errore durante la conferma della prenotazione');
    console.error('Errore prenotazione:', error);
    return {
      success: false,
      messaggio: 'Errore durante la conferma'
    };
  }
}

/**
 * Reset completo dell'applicazione
 */
export function resetApplicazione() {
  state.filmAttivo = null;
  state.sala = null;
  state.posti = [];
  state.postiSelezionati = [];
  state.totale = 0;
  clearMessaggi();
}

/**
 * Ottiene lo stato corrente (immutabile - copia profonda)
 * @returns {Object} Copia dello stato
 */
export function getStato() {
  return {
    filmAttivo: state.filmAttivo ? { ...state.filmAttivo } : null,
    sala: state.sala ? { ...state.sala } : null,
    posti: state.posti.map(p => ({ ...p })),
    postiSelezionati: state.postiSelezionati.map(p => ({ ...p })),
    totale: state.totale,
    ui: { ...state.ui }
  };
}

/**
 * Ottiene i posti disponibili (programmazione funzionale)
 * @returns {Array} Array di posti disponibili
 */
export function getPostiDisponibili() {
  return state.posti.filter(posto => !posto.occupato && !posto.selezionato);
}

/**
 * Ottiene i posti occupati (programmazione funzionale)
 * @returns {Array} Array di posti occupati
 */
export function getPostiOccupati() {
  return state.posti.filter(posto => posto.occupato);
}

/**
 * Imposta un messaggio di successo
 * @param {string} messaggio
 */
export function setMessaggio(messaggio) {
  state.ui.messaggio = messaggio;
  state.ui.errore = null;
}

/**
 * Imposta un messaggio di errore
 * @param {string} errore
 */
export function setErrore(errore) {
  state.ui.errore = errore;
  state.ui.messaggio = null;
}

/**
 * Cancella i messaggi UI
 */
export function clearMessaggi() {
  state.ui.messaggio = null;
  state.ui.errore = null;
}

// ===== LocalStorage Management =====

/**
 * Salva i dati delle prenotazioni nel localStorage
 */
function salvaDatiLocali() {
  try {
    const datiDaSalvare = {};

    // Salva posti occupati per ogni film
    if (state.filmAttivo) {
      const postiOccupati = state.posti
        .filter(p => p.occupato)
        .map(p => p.id);

      datiDaSalvare[`film_${state.filmAttivo.id}`] = {
        postiOccupati: postiOccupati,
        ultimoAggiornamento: new Date().toISOString()
      };

      // Carica dati esistenti e unisci
      const datiEsistenti = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const datiAggiornati = { ...datiEsistenti, ...datiDaSalvare };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(datiAggiornati));
    }
  } catch (error) {
    console.error('Errore nel salvataggio localStorage:', error);
    // Gestisce quota exceeded o browser privato
    if (error.name === 'QuotaExceededError') {
      setErrore('Spazio di archiviazione esaurito');
    }
  }
}

/**
 * Carica i dati dal localStorage
 */
function caricaDatiLocali() {
  try {
    const datiSalvati = localStorage.getItem(STORAGE_KEY);
    if (datiSalvati) {
      return JSON.parse(datiSalvati);
    }
  } catch (error) {
    console.error('Errore nel caricamento localStorage:', error);
  }
  return {};
}

/**
 * Carica i posti occupati per un film specifico
 * @param {number} filmId - ID del film
 */
function caricaPostiOccupati(filmId) {
  const datiLocali = caricaDatiLocali();
  const datiFilm = datiLocali[`film_${filmId}`];

  if (datiFilm && datiFilm.postiOccupati) {
    // Carica posti occupati salvati
    datiFilm.postiOccupati.forEach(postoId => {
      const posto = state.posti.find(p => p.id === postoId);
      if (posto) {
        posto.occupato = true;
      }
    });
  } else {
    // Genera posti occupati casuali per simulazione
    const postiOccupatiCasuali = generaPostiOccupatiCasuali(state.posti.length, 0.25);
    postiOccupatiCasuali.forEach(postoId => {
      const posto = state.posti.find(p => p.id === postoId);
      if (posto) {
        posto.occupato = true;
      }
    });
  }
}

/**
 * Cancella tutti i dati salvati (per testing)
 */
export function cancellaStorageCompleto() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    setMessaggio('Dati cancellati con successo');
  } catch (error) {
    console.error('Errore nella cancellazione storage:', error);
  }
}
