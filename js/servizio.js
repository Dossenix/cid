let state = loadState();

const serviceStatus = qs("#serviceStatus");
const serviceStartText = qs("#serviceStartText");
const serviceEndText = qs("#serviceEndText");
const serviceTimer = qs("#serviceTimer");

const serviceCodename = qs("#serviceCodename");
const serviceRapporto = qs("#serviceRapporto");
const serviceGhetti = qs("#serviceGhetti");
const serviceInformazioni = qs("#serviceInformazioni");

const clockInBtn = qs("#clockInBtn");
const clockOutBtn = qs("#clockOutBtn");
const copyShiftModuleBtn = qs("#copyShiftModuleBtn");

function renderService() {
  serviceStatus.textContent = state.service.active ? "In servizio" : "Fuori servizio";
  serviceStartText.textContent = formatDateTime(state.service.startAt);
  serviceEndText.textContent = formatDateTime(state.service.endAt);

  serviceCodename.value = state.service.codename || "<@1084580275582931044>";
  serviceRapporto.value = state.service.rapporto || "";
  serviceGhetti.value = state.service.ghetti || "//";
  serviceInformazioni.value = state.service.informazioni || "//";
}

function updateTimer() {
  if (state.service.active && state.service.startAt) {
    serviceTimer.textContent = formatDuration(Date.now() - state.service.startAt);
  } else {
    serviceTimer.textContent = "00:00:00";
  }
}

function clockIn() {
  if (state.service.active) {
    alert("Sei già in servizio.");
    return;
  }

  state.service.active = true;
  state.service.startAt = Date.now();
  state.service.endAt = null;
  saveState(state);
  renderService();
}

function clockOut() {
  if (!state.service.active) {
    alert("Non risulti in servizio.");
    return;
  }

  state.service.active = false;
  state.service.endAt = Date.now();
  saveState(state);
  renderService();
}

function syncFields() {
  state.service.codename = serviceCodename.value;
  state.service.rapporto = serviceRapporto.value;
  state.service.ghetti = serviceGhetti.value;
  state.service.informazioni = serviceInformazioni.value;
  saveState(state);
}

function copyModule() {
  const text = `Nome in Codice: ${serviceCodename.value || "<@1084580275582931044>"}
Orario d'entrata: ${formatTime(state.service.startAt)}
Orario d'uscita: ${formatTime(state.service.endAt)}
Rapporto: ${serviceRapporto.value || ""}
Ghetti attivi: ${serviceGhetti.value || "//"}
Informazioni: ${serviceInformazioni.value || "//"}`;

  copyText(text, "Modulo servizio copiato.");
}

function bindEvents() {
  clockInBtn.addEventListener("click", clockIn);
  clockOutBtn.addEventListener("click", clockOut);
  copyShiftModuleBtn.addEventListener("click", copyModule);

  [serviceCodename, serviceRapporto, serviceGhetti, serviceInformazioni].forEach(el => {
    el.addEventListener("input", syncFields);
  });
}

bindEvents();
renderService();
updateTimer();
setInterval(updateTimer, 1000);