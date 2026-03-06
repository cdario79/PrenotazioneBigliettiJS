/**
 * Cinema Module - Gestione Film e Sale
 * Gestisce i dati dei film, le sale e la configurazione dei posti
 */

// Classe Film - Rappresenta un film con le sue proprietà
export class Film {
  constructor(id, titolo, orario, sala, prezzo, genere, durata) {
    this.id = id;
    this.titolo = titolo;
    this.orario = orario;
    this.sala = sala;
    this.prezzo = prezzo;
    this.genere = genere;
    this.durata = durata;
  }
}

// Classe Sala - Rappresenta una sala cinematografica
export class Sala {
  constructor(numero, nome, righe, postiPerRiga) {
    this.numero = numero;
    this.nome = nome;
    this.righe = righe;
    this.postiPerRiga = postiPerRiga;
    this.totaliPosti = righe * postiPerRiga;
  }
}

// Configurazione film disponibili
export const FILM_DISPONIBILI = [
  new Film(
    1,
    'Dune: Parte Due',
    '20:30',
    'Sala 1',
    12.50,
    'action',
    '166 min'
  ),
  new Film(
    2,
    'Oppenheimer',
    '21:00',
    'Sala 2',
    13.00,
    'drama',
    '180 min'
  ),
  new Film(
    3,
    'Barbie',
    '19:00',
    'Sala 3',
    11.00,
    'comedy',
    '114 min'
  ),
  new Film(
    4,
    'Interstellar',
    '21:30',
    'Sala 1',
    12.00,
    'scifi',
    '169 min'
  )
];

// Configurazione sale cinematografiche
export const SALE = {
  'Sala 1': new Sala(1, 'Sala 1', 8, 10),
  'Sala 2': new Sala(2, 'Sala 2', 10, 10),
  'Sala 3': new Sala(3, 'Sala 3', 6, 8)
};

/**
 * Genera la configurazione dei posti per una sala specifica
 * @param {Sala} sala - Oggetto sala
 * @returns {Array} Array di oggetti posto
 */
export function generaPosti(sala) {
  const posti = [];
  const lettere = 'ABCDEFGHIJ';

  for (let riga = 0; riga < sala.righe; riga++) {
    for (let numero = 1; numero <= sala.postiPerRiga; numero++) {
      const id = `${lettere[riga]}${numero}`;
      posti.push({
        id: id,
        riga: lettere[riga],
        numero: numero,
        disponibile: true,
        selezionato: false,
        occupato: false
      });
    }
  }

  return posti;
}

/**
 * Trova un film per ID
 * @param {number} filmId - ID del film
 * @returns {Film|undefined} Film trovato o undefined
 */
export function trovaFilm(filmId) {
  return FILM_DISPONIBILI.find(film => film.id === filmId);
}

/**
 * Ottiene la configurazione della sala per un film
 * @param {Film} film - Oggetto film
 * @returns {Sala} Configurazione sala
 */
export function getSalaConfig(film) {
  return SALE[film.sala];
}

/**
 * Genera posti occupati casuali per simulazione
 * @param {number} numPosti - Numero totale di posti
 * @param {number} percentuale - Percentuale di posti da occupare (0-1)
 * @returns {Array} Array di ID posti occupati
 */
export function generaPostiOccupatiCasuali(sala, percentuale = 0.3) {
  const numOccupati = Math.floor(sala.totaliPosti * percentuale);
  const lettere = 'ABCDEFGHIJ';
  const postiOccupati = [];

  while (postiOccupati.length < numOccupati) {
    const rigaIndex = Math.floor(Math.random() * sala.righe);
    const numeroIndex = Math.floor(Math.random() * sala.postiPerRiga) + 1;
    const id = `${lettere[rigaIndex]}${numeroIndex}`;

    if (!postiOccupati.includes(id)) {
      postiOccupati.push(id);
    }
  }

  return postiOccupati;
}

/**
 * Valida se un posto esiste ed è disponibile
 * @param {Array} posti - Array di posti
 * @param {string} postoId - ID del posto
 * @returns {boolean} True se il posto è valido e disponibile
 */
export function isPostoDisponibile(posti, postoId) {
  const posto = posti.find(p => p.id === postoId);
  return posto && posto.disponibile && !posto.occupato;
}
