const STORAGE_KEY = "archivio_investigativo_multi_v1";

const PROOF_TEMPLATES = [
  "1° PER RIPULIRE LA CITTÀ (ASSOCIAZIONE A DELINQUERE)",
  "2° TRAFFICANO ARMI",
  "3° RACCOLGONO / PROCESSANO SOSTANZE STUPEFACENTI",
  "4° RICICLANO / POSSEGGONO DENARO NON TRACCIABILE",
  "5° RAPISCONO FDO / CITTADINI / MEMBRI DI ALTRE GANG",
  "6° POSSIEDONO ARMI ILLEGALI / PESANTI",
  "7° FANNO RAPINE",
  "8° HANNO UNA MAFIA SOPRA",
  "9° HANNO RAPPORTI CON IL \"MERCATO NERO\"",
  "10° TRAFFICANO SOSTANZE STUPEFACENTI",
  "11° POSSIEDONO CORROTTI ALL'INTERNO DELLE FDO",
  "12° POSSIEDONO OGGETTI ILLEGALI (LOCKPICK, TRAPANI, CORDE, PILLOLE)",
  "13° HANNO ALLEANZE CON ALTRE GANG",
  "14° FANNO FURTI IN CASA E LI RIVENDONO",
  "15° FANNO RIGHE AL GHETTO (ARMATI, MASCHERATI)",
  "16° SI DIMOSTRANO OSTILI VERSO LE FDO",
  "17° AVVENGONO ATTIVITÀ ILLECITE DENTRO IL GHETTO",
  "18° HANNO SQUADRE SPECIALIZZATE PER COMMETTERE CRIMINI DIVERSI",
  "19° PRESENZE FISSE NEL QUARTIERE (PRESIDIO)",
  "20° RECLUTAMENTO DI NUOVI MEMBRI IN PUBBLICO",
  "21° PUNTI DI VENDITA (Campi droga)",
  "22° MODIFICHE/ALTERAZIONI DI VEICOLI (TARGHE, IDENTIFICATIVI)",
  "23° USO DI MASCHERE/COPERTURE DURANTE LE AZIONI",
  "24° USO DI RADIO IN OPERAZIONI",
  "25° MOVIMENTI DI GRUPPO ARMATI NEL QUARTIERE",
  "26° INCONTRI FREQUENTI CON ALTRE FAZIONI IN ZONE RISERVATE",
  "27° USO DI ABBIGLIAMENTO COORDINATO TRA MEMBRI",
  "28° TRASPORTO DI PERSONE MASCHERATE IN VEICOLI CHIUSI"
];

function defaultState() {
  return {
    selectedFolderId: null,
    folders: [],
    service: {
      active: false,
      codename: "<@1084580275582931044>",
      startAt: null,
      endAt: null,
      rapporto: "",
      ghetti: "//",
      informazioni: "//"
    },
    ronda: {
      active: false,
      name: "Detroit",
      startAt: null,
      endAt: null,
      targhe: ""
    },
    plates: []
  };
}

function createDefaultFolder(name) {
  return {
    id: generateId(),
    name,
    proofs: PROOF_TEMPLATES.map((title, index) => ({
      id: index + 1,
      title,
      checked: false,
      data: "",
      clip: ""
    }))
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      service: { ...defaultState().service, ...(parsed.service || {}) },
      ronda: { ...defaultState().ronda, ...(parsed.ronda || {}) },
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      plates: Array.isArray(parsed.plates) ? parsed.plates : []
    };
  } catch (error) {
    console.error(error);
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "archivio-investigativo-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importStateFromFile(file, callback) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      const newState = {
        ...defaultState(),
        ...imported,
        service: { ...defaultState().service, ...(imported.service || {}) },
        ronda: { ...defaultState().ronda, ...(imported.ronda || {}) },
        folders: Array.isArray(imported.folders) ? imported.folders : [],
        plates: Array.isArray(imported.plates) ? imported.plates : []
      };
      callback(null, newState);
    } catch (error) {
      callback(error, null);
    }
  };

  reader.readAsText(file);
}