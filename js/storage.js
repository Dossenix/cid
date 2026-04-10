const STORAGE_KEY = "archivio_investigativo_multi_v1";
const DEFAULT_SERVICE_CODENAME = "<@1084580275582931044>";
const DEFAULT_RONDA_NAME = "Detroit";

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
      codename: DEFAULT_SERVICE_CODENAME,
      startAt: null,
      endAt: null,
      rapporto: "",
      ghetti: "//",
      informazioni: "//"
    },
    ronda: {
      active: false,
      name: DEFAULT_RONDA_NAME,
      startAt: null,
      endAt: null,
      targhe: ""
    },
    plates: []
  };
}

function safeText(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safeTimestamp(value) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function generateId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "id-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function normalizeProof(proof, index) {
  const title = safeText(proof?.title, PROOF_TEMPLATES[index]).trim() || PROOF_TEMPLATES[index];

  return {
    id: index + 1,
    title,
    checked: Boolean(proof?.checked),
    data: safeText(proof?.data),
    clip: safeText(proof?.clip)
  };
}

function normalizeFolder(folder, index) {
  const rawProofs = Array.isArray(folder?.proofs) ? folder.proofs : [];
  const fallbackName = `Cartella ${index + 1}`;
  const folderId = safeText(folder?.id).trim() || generateId();

  return {
    id: folderId,
    name: safeText(folder?.name, fallbackName).trim() || fallbackName,
    notes: safeText(folder?.notes),
    proofs: PROOF_TEMPLATES.map((item, proofIndex) => normalizeProof(rawProofs[proofIndex], proofIndex))
  };
}

function normalizeService(service) {
  return {
    active: Boolean(service?.active),
    codename: safeText(service?.codename, DEFAULT_SERVICE_CODENAME),
    startAt: safeTimestamp(service?.startAt),
    endAt: safeTimestamp(service?.endAt),
    rapporto: safeText(service?.rapporto),
    ghetti: safeText(service?.ghetti, "//"),
    informazioni: safeText(service?.informazioni, "//")
  };
}

function normalizeRonda(ronda) {
  return {
    active: Boolean(ronda?.active),
    name: safeText(ronda?.name, DEFAULT_RONDA_NAME),
    startAt: safeTimestamp(ronda?.startAt),
    endAt: safeTimestamp(ronda?.endAt),
    targhe: safeText(ronda?.targhe)
  };
}

function normalizePlate(plate, index) {
  const plateId = safeText(plate?.id).trim() || generateId();
  const numero = safeText(plate?.numero, `Targa ${index + 1}`).trim() || `Targa ${index + 1}`;

  return {
    id: plateId,
    numero,
    soggetto: safeText(plate?.soggetto),
    ghetto: safeText(plate?.ghetto),
    link: safeText(plate?.link),
    createdAt: safeTimestamp(plate?.createdAt) || Date.now()
  };
}

function normalizeState(source = {}) {
  const base = defaultState();
  const folders = Array.isArray(source.folders) ? source.folders.map(normalizeFolder) : [];
  const plates = Array.isArray(source.plates) ? source.plates.map(normalizePlate) : [];
  const selectedFolderId = folders.some(folder => folder.id === source.selectedFolderId)
    ? source.selectedFolderId
    : folders[0]?.id || null;

  return {
    ...base,
    selectedFolderId,
    folders,
    service: normalizeService(source.service),
    ronda: normalizeRonda(source.ronda),
    plates
  };
}

function createDefaultFolder(name) {
  return normalizeFolder({ name }, 0);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.error(error);
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

function exportState(state) {
  const blob = new Blob([JSON.stringify(normalizeState(state), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "archivio-investigativo-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importStateFromFile(file, callback) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      callback(null, normalizeState(imported));
    } catch (error) {
      callback(error, null);
    }
  };

  reader.readAsText(file);
}
