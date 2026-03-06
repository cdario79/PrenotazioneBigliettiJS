/**
 * UI Module - Manipolazione DOM e Rendering
 * Gestisce l'interfaccia utente e l'interazione con il DOM
 */

import { getStato } from './booking.js';

// Riferimenti agli elementi DOM (cache per performance)
const DOM = {
  filmList: null,
  salaSection: null,
  seatsGrid: null,
  summarySection: null,
  summaryFilm: null,
  summaryOrario: null,
  summarySala: null,
  summaryPosti: null,
  summaryPostiList: null,
  summaryTotale: null,
  btnConferma: null,
  btnReset: null,
  alertContainer: null
};

/**
 * Inizializza i riferimenti DOM
 */
export function inizializzaDOM() {
  DOM.filmList = document.getElementById('film-list');
  DOM.salaSection = document.getElementById('sala-section');
  DOM.seatsGrid = document.getElementById('seats-grid');
  DOM.summarySection = document.getElementById('summary-section');
  DOM.summaryFilm = document.getElementById('summary-film');
  DOM.summaryOrario = document.getElementById('summary-orario');
  DOM.summarySala = document.getElementById('summary-sala');
  DOM.summaryPosti = document.getElementById('summary-posti');
  DOM.summaryPostiList = document.getElementById('summary-posti-list');
  DOM.summaryTotale = document.getElementById('summary-totale');
  DOM.btnConferma = document.getElementById('btn-conferma');
  DOM.btnReset = document.getElementById('btn-reset');
  DOM.alertContainer = document.getElementById('alert-container');
}

/**
 * Renderizza la lista dei film disponibili
 * @param {Array} film - Array di film
 * @param {Function} onFilmSelect - Callback per selezione film
 */
export function renderFilm(film, onFilmSelect) {
  // Usa DocumentFragment per performance (un solo reflow)
  const fragment = document.createDocumentFragment();

  film.forEach(f => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-3';

    // Template literal per generare HTML
    col.innerHTML = `
      <div class="film-card" data-film-id="${f.id}" role="button" tabindex="0"
           aria-label="Seleziona ${f.titolo}, orario ${f.orario}, prezzo ${f.prezzo} euro">
        <span class="film-badge badge-${f.genere}">${getGenreLabel(f.genere)}</span>
        <h3>${f.titolo}</h3>
        <div class="film-info">
          <div><i class="bi bi-clock"></i> ${f.orario}</div>
          <div><i class="bi bi-hourglass"></i> ${f.durata}</div>
          <div><i class="bi bi-door-open"></i> ${f.sala}</div>
        </div>
        <div class="film-price">€${f.prezzo.toFixed(2)}</div>
      </div>
    `;

    // Event listener per click
    const card = col.querySelector('.film-card');
    card.addEventListener('click', () => onFilmSelect(f.id));

    // Accessibilità: supporto tastiera (Enter / Space)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onFilmSelect(f.id);
      }
    });

    fragment.appendChild(col);
  });

  // Un solo append per performance
  DOM.filmList.innerHTML = '';
  DOM.filmList.appendChild(fragment);
}

/**
 * Evidenzia il film attivo
 * @param {number} filmId - ID del film attivo
 */
export function evidenziaFilmAttivo(filmId) {
  // Rimuovi classe active da tutti i film
  document.querySelectorAll('.film-card').forEach(card => {
    card.classList.remove('active');
    card.setAttribute('aria-selected', 'false');
  });

  // Aggiungi classe active al film selezionato
  const filmCard = document.querySelector(`[data-film-id="${filmId}"]`);
  if (filmCard) {
    filmCard.classList.add('active');
    filmCard.setAttribute('aria-selected', 'true');
  }
}

/**
 * Renderizza la griglia dei posti
 * @param {Array} posti - Array di posti
 * @param {Function} onPostoClick - Callback per click posto
 */
export function renderPosti(posti, onPostoClick) {
  const stato = getStato();
  const postiPerRiga = stato.sala ? stato.sala.postiPerRiga : 10;

  // Imposta il numero di colonne della griglia (etichetta + posti)
  DOM.seatsGrid.style.gridTemplateColumns = `auto repeat(${postiPerRiga}, 1fr)`;

  // Performance: misura tempo rendering
  console.time('Generazione griglia');

  const fragment = document.createDocumentFragment();

  posti.forEach((posto, index) => {
    // Aggiungi label di riga all'inizio di ogni nuova riga
    if (index % postiPerRiga === 0) {
      const rowLabel = document.createElement('div');
      rowLabel.className = 'seat seat-row-label';
      rowLabel.textContent = posto.riga;
      rowLabel.setAttribute('aria-hidden', 'true');
      fragment.appendChild(rowLabel);
    }

    const seatElement = document.createElement('div');
    seatElement.className = 'seat';
    seatElement.dataset.postoId = posto.id;
    seatElement.textContent = posto.numero;
    seatElement.setAttribute('role', 'button');
    seatElement.setAttribute('tabindex', '0');

    // Imposta stato iniziale
    aggiornaStatoPosto(seatElement, posto);

    // Event listener solo se il posto non è occupato
    if (!posto.occupato) {
      seatElement.addEventListener('click', () => onPostoClick(posto.id));

      // Accessibilità: tastiera
      seatElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPostoClick(posto.id);
        }
      });
    }

    fragment.appendChild(seatElement);
  });

  DOM.seatsGrid.innerHTML = '';
  DOM.seatsGrid.appendChild(fragment);

  console.timeEnd('Generazione griglia');
}

/**
 * Aggiorna visivamente lo stato di un singolo posto
 * @param {HTMLElement} element - Elemento DOM del posto
 * @param {Object} posto - Oggetto posto
 */
function aggiornaStatoPosto(element, posto) {
  // Rimuovi tutte le classi di stato
  element.classList.remove('available', 'selected', 'occupied');

  if (posto.occupato) {
    element.classList.add('occupied');
    element.setAttribute('aria-label', `Posto ${posto.id}, occupato`);
    element.setAttribute('aria-disabled', 'true');
  } else if (posto.selezionato) {
    element.classList.add('selected');
    element.setAttribute('aria-label', `Posto ${posto.id}, selezionato`);
    element.setAttribute('aria-pressed', 'true');
  } else {
    element.classList.add('available');
    element.setAttribute('aria-label', `Posto ${posto.id}, disponibile`);
    element.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Aggiorna singolo posto nel DOM (per performance)
 * @param {string} postoId - ID del posto
 * @param {Object} posto - Dati aggiornati del posto
 */
export function aggiornaPosto(postoId, posto) {
  const element = document.querySelector(`[data-posto-id="${postoId}"]`);
  if (element) {
    aggiornaStatoPosto(element, posto);
  }
}

/**
 * Renderizza il riepilogo prenotazione
 */
export function renderRiepilogo() {
  const stato = getStato();

  if (!stato.filmAttivo) {
    DOM.summarySection.style.display = 'none';
    return;
  }

  DOM.summarySection.style.display = 'block';

  // Aggiorna campi riepilogo
  DOM.summaryFilm.textContent = stato.filmAttivo.titolo;
  DOM.summaryOrario.textContent = stato.filmAttivo.orario;
  DOM.summarySala.textContent = stato.filmAttivo.sala;
  DOM.summaryPosti.textContent = stato.postiSelezionati.length;

  // Lista posti selezionati
  if (stato.postiSelezionati.length > 0) {
    const postiIds = stato.postiSelezionati
      .map(p => p.id)
      .sort()
      .join(', ');
    DOM.summaryPostiList.textContent = postiIds;
  } else {
    DOM.summaryPostiList.textContent = '-';
  }

  // Totale con animazione
  const totaleFormatted = `€${stato.totale.toFixed(2)}`;
  DOM.summaryTotale.textContent = totaleFormatted;

  // Abilita/disabilita pulsante conferma
  DOM.btnConferma.disabled = stato.postiSelezionati.length === 0;
}

/**
 * Mostra la sezione sala
 */
export function mostraSala() {
  DOM.salaSection.style.display = 'block';
  // Scroll smooth alla sala
  DOM.salaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Nasconde la sezione sala
 */
export function nascondiSala() {
  DOM.salaSection.style.display = 'none';
}

/**
 * Mostra alert con messaggio
 * @param {string} messaggio - Testo del messaggio
 * @param {string} tipo - Tipo di alert (success, danger, warning, info)
 * @param {number} durata - Durata in millisecondi (default: 4000)
 */
export function mostraAlert(messaggio, tipo = 'info', durata = 4000) {
  const alertId = `alert-${Date.now()}`;

  const alertHTML = `
    <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      <strong>${getTitoloAlert(tipo)}</strong> ${messaggio}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Chiudi"></button>
    </div>
  `;

  DOM.alertContainer.insertAdjacentHTML('beforeend', alertHTML);

  // Auto-remove dopo durata
  setTimeout(() => {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      // Usa Bootstrap per rimuovere con animazione
      const bsAlert = new bootstrap.Alert(alertElement);
      bsAlert.close();
    }
  }, durata);
}

/**
 * Mostra alert di errore
 * @param {string} messaggio - Messaggio di errore
 */
export function mostraErrore(messaggio) {
  mostraAlert(messaggio, 'danger', 5000);
}

/**
 * Mostra alert di successo
 * @param {string} messaggio - Messaggio di successo
 */
export function mostraSuccesso(messaggio) {
  mostraAlert(messaggio, 'success', 4000);
}

/**
 * Mostra alert di warning
 * @param {string} messaggio - Messaggio di warning
 */
export function mostraWarning(messaggio) {
  mostraAlert(messaggio, 'warning', 4000);
}

/**
 * Mostra modal di conferma prenotazione
 * @param {Object} riepilogo - Dati riepilogo prenotazione
 * @param {Function} onDismiss - Callback da eseguire alla chiusura del modal
 */
export function mostraModalConferma(riepilogo, onDismiss = null) {
  const modalHTML = `
    <div class="modal fade" id="modalConferma" tabindex="-1" aria-labelledby="modalConfermaLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="modalConfermaLabel">
              <i class="bi bi-check-circle-fill"></i> Prenotazione Confermata!
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-4">
              <i class="bi bi-ticket-perforated-fill text-success" style="font-size: 4rem;"></i>
            </div>
            <h6 class="mb-3">Dettagli Prenotazione:</h6>
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td><strong>Film:</strong></td>
                  <td>${riepilogo.film}</td>
                </tr>
                <tr>
                  <td><strong>Orario:</strong></td>
                  <td>${riepilogo.orario}</td>
                </tr>
                <tr>
                  <td><strong>Sala:</strong></td>
                  <td>${riepilogo.sala}</td>
                </tr>
                <tr>
                  <td><strong>Posti:</strong></td>
                  <td>${riepilogo.posti.join(', ')}</td>
                </tr>
                <tr>
                  <td><strong>Data:</strong></td>
                  <td>${riepilogo.data}</td>
                </tr>
                <tr class="table-success">
                  <td><strong>Totale:</strong></td>
                  <td><strong>€${riepilogo.totale.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="alert alert-info mt-3">
              <i class="bi bi-info-circle"></i> I tuoi biglietti sono stati prenotati.
              Riceverai una email di conferma all'indirizzo registrato.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Rimuovi modal precedente se esiste
  const modalEsistente = document.getElementById('modalConferma');
  if (modalEsistente) {
    modalEsistente.remove();
  }

  // Aggiungi nuovo modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Mostra modal
  const modalElement = document.getElementById('modalConferma');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  // Rimuovi dal DOM quando viene chiuso
  modalElement.addEventListener('hidden.bs.modal', () => {
    modalElement.remove();
    // Esegui callback di chiusura se presente
    if (onDismiss) {
      onDismiss();
    }
  });
}

/**
 * Reset UI allo stato iniziale
 */
export function resetUI() {
  nascondiSala();
  renderRiepilogo();
  evidenziaFilmAttivo(null);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Utility Functions =====

/**
 * Ottiene la label localizzata per il genere
 * @param {string} genere - Codice genere
 * @returns {string} Label genere
 */
function getGenreLabel(genere) {
  const labels = {
    action: 'Azione',
    drama: 'Drammatico',
    comedy: 'Commedia',
    scifi: 'Fantascienza',
    horror: 'Horror',
    thriller: 'Thriller'
  };
  return labels[genere] || genere;
}

/**
 * Ottiene il titolo dell'alert in base al tipo
 * @param {string} tipo - Tipo di alert
 * @returns {string} Titolo
 */
function getTitoloAlert(tipo) {
  const titoli = {
    success: '✓ Successo!',
    danger: '✗ Errore!',
    warning: '⚠ Attenzione!',
    info: 'ℹ Info'
  };
  return titoli[tipo] || 'Notifica';
}

/**
 * Verifica compatibilità browser
 * @returns {Object} Oggetto con info compatibilità
 */
export function checkCompatibility() {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    classList: 'classList' in document.createElement('div'),
    es6: (() => {
      try {
        eval('const x = () => {}');
        return true;
      } catch (e) {
        return false;
      }
    })()
  };

  const unsupported = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);

  if (unsupported.length > 0) {
    console.warn('Funzionalità non supportate:', unsupported);
    mostraWarning(
      `Il tuo browser potrebbe non supportare tutte le funzionalità.
       Funzionalità non supportate: ${unsupported.join(', ')}`
    );
  }

  return {
    compatible: unsupported.length === 0,
    unsupported: unsupported
  };
}
