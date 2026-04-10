let state = loadState();

const serviceStatus = qs("#serviceStatus");
const serviceStatusBadge = qs("#serviceStatusBadge");
const serviceStartText = qs("#serviceStartText");
const serviceEndText = qs("#serviceEndText");
const serviceTimer = qs("#serviceTimer");
const serviceSessionHint = qs("#serviceSessionHint");

const serviceCodename = qs("#serviceCodename");
const serviceRapporto = qs("#serviceRapporto");
const serviceGhetti = qs("#serviceGhetti");
const serviceInformazioni = qs("#serviceInformazioni");
const serviceModulePreview = qs("#serviceModulePreview");

const clockInBtn = qs("#clockInBtn");
const clockOutBtn = qs("#clockOutBtn");
const copyShiftModuleBtn = qs("#copyShiftModuleBtn");

const persistService = debounce(() => saveState(state), 180);

function buildServiceModule() {
  return `Nome in Codice: ${state.service.codename || DEFAULT_SERVICE_CODENAME}
Orario d'entrata: ${formatTime(state.service.startAt)}
Orario d'uscita: ${formatTime(state.service.endAt)}
Rapporto: ${state.service.rapporto || ""}
Ghetti attivi: ${state.service.ghetti || "//"}
Informazioni: ${state.service.informazioni || "//"}`;
}

function updatePreview() {
  serviceModulePreview.textContent = buildServiceModule();
}

function updateSessionHint() {
  if (state.service.active && state.service.startAt) {
    serviceSessionHint.textContent = `Timer attivo da ${formatDuration(Date.now() - state.service.startAt)}.`;
    return;
  }

  if (state.service.endAt) {
    serviceSessionHint.textContent = `Ultimo turno chiuso alle ${formatTime(state.service.endAt)}.`;
    return;
  }

  serviceSessionHint.textContent = "Timbrando l'entrata avvii il timer e il salvataggio automatico della sessione.";
}

function updateTimer() {
  if (state.service.active && state.service.startAt) {
    serviceTimer.textContent = formatDuration(Date.now() - state.service.startAt);
  } else {
    serviceTimer.textContent = "00:00:00";
  }

  updateSessionHint();
}

function renderService() {
  serviceStatus.textContent = state.service.active ? "In servizio" : "Fuori servizio";
  serviceStartText.textContent = formatDateTime(state.service.startAt);
  serviceEndText.textContent = formatDateTime(state.service.endAt);

  serviceCodename.value = state.service.codename || DEFAULT_SERVICE_CODENAME;
  serviceRapporto.value = state.service.rapporto || "";
  serviceGhetti.value = state.service.ghetti || "//";
  serviceInformazioni.value = state.service.informazioni || "//";

  setStatusPill(serviceStatusBadge, serviceStatus.textContent, state.service.active);
  clockInBtn.disabled = state.service.active;
  clockOutBtn.disabled = !state.service.active;

  updatePreview();
  updateTimer();
}

function clockIn() {
  if (state.service.active) {
    showToast("Sei gia' in servizio.", "error");
    return;
  }

  state.service.active = true;
  state.service.startAt = Date.now();
  state.service.endAt = null;
  saveState(state);
  renderService();
  showToast("Entrata registrata.", "success");
}

function clockOut() {
  if (!state.service.active) {
    showToast("Non risulti in servizio.", "error");
    return;
  }

  state.service.active = false;
  state.service.endAt = Date.now();
  saveState(state);
  renderService();
  showToast("Uscita registrata.", "success");
}

function syncFields() {
  state.service.codename = serviceCodename.value.trim() || DEFAULT_SERVICE_CODENAME;
  state.service.rapporto = serviceRapporto.value;
  state.service.ghetti = serviceGhetti.value.trim() || "//";
  state.service.informazioni = serviceInformazioni.value.trim() || "//";

  updatePreview();
  persistService();
}

function copyModule() {
  copyText(buildServiceModule(), "Modulo servizio copiato.");
}

function bindEvents() {
  clockInBtn.addEventListener("click", clockIn);
  clockOutBtn.addEventListener("click", clockOut);
  copyShiftModuleBtn.addEventListener("click", copyModule);

  [serviceCodename, serviceRapporto, serviceGhetti, serviceInformazioni].forEach(element => {
    element.addEventListener("input", syncFields);
  });
}

bindEvents();
renderService();
window.setInterval(updateTimer, 1000);
window.addEventListener("beforeunload", () => saveState(state));
