let state = loadState();

const rondaStatus = qs("#rondaStatus");
const rondaStatusBadge = qs("#rondaStatusBadge");
const rondaStartText = qs("#rondaStartText");
const rondaEndText = qs("#rondaEndText");
const rondaTimer = qs("#rondaTimer");
const rondaSessionHint = qs("#rondaSessionHint");

const rondaName = qs("#rondaName");
const rondaTarghe = qs("#rondaTarghe");
const rondaPlateCount = qs("#rondaPlateCount");
const rondaModulePreview = qs("#rondaModulePreview");

const startRondaBtn = qs("#startRondaBtn");
const endRondaBtn = qs("#endRondaBtn");
const copyRondaModuleBtn = qs("#copyRondaModuleBtn");

const persistRonda = debounce(() => saveState(state), 180);

function buildRondaModule() {
  return `Nome e Cognome: ${state.ronda.name || DEFAULT_RONDA_NAME}
Inizio Ronda: ${formatTime(state.ronda.startAt)}
Fine Ronda: ${formatTime(state.ronda.endAt)}
Targhe Prese (Clip): ${state.ronda.targhe || ""}`;
}

function updatePreview() {
  rondaModulePreview.textContent = buildRondaModule();
}

function updatePlateCount() {
  const count = formatListLines(state.ronda.targhe).length;
  rondaPlateCount.textContent = `${count} ${count === 1 ? "targa annotata." : "targhe annotate."}`;
}

function updateSessionHint() {
  if (state.ronda.active && state.ronda.startAt) {
    rondaSessionHint.textContent = `Ronda attiva da ${formatDuration(Date.now() - state.ronda.startAt)}.`;
    return;
  }

  if (state.ronda.endAt) {
    rondaSessionHint.textContent = `Ultima ronda chiusa alle ${formatTime(state.ronda.endAt)}.`;
    return;
  }

  rondaSessionHint.textContent = "Avvia la sessione per far partire il timer e mantenere lo storico salvato automaticamente.";
}

function updateTimer() {
  if (state.ronda.active && state.ronda.startAt) {
    rondaTimer.textContent = formatDuration(Date.now() - state.ronda.startAt);
  } else {
    rondaTimer.textContent = "00:00:00";
  }

  updateSessionHint();
}

function renderRonda() {
  rondaStatus.textContent = state.ronda.active ? "Attiva" : "Non attiva";
  rondaStartText.textContent = formatDateTime(state.ronda.startAt);
  rondaEndText.textContent = formatDateTime(state.ronda.endAt);

  rondaName.value = state.ronda.name || DEFAULT_RONDA_NAME;
  rondaTarghe.value = state.ronda.targhe || "";

  setStatusPill(rondaStatusBadge, rondaStatus.textContent, state.ronda.active);
  startRondaBtn.disabled = state.ronda.active;
  endRondaBtn.disabled = !state.ronda.active;

  updatePlateCount();
  updatePreview();
  updateTimer();
}

function startRonda() {
  if (state.ronda.active) {
    showToast("La ronda e' gia' attiva.", "error");
    return;
  }

  state.ronda.active = true;
  state.ronda.startAt = Date.now();
  state.ronda.endAt = null;
  state.ronda.name = rondaName.value.trim() || DEFAULT_RONDA_NAME;
  saveState(state);
  renderRonda();
  showToast("Ronda avviata.", "success");
}

function endRonda() {
  if (!state.ronda.active) {
    showToast("Nessuna ronda attiva.", "error");
    return;
  }

  state.ronda.active = false;
  state.ronda.endAt = Date.now();
  state.ronda.name = rondaName.value.trim() || DEFAULT_RONDA_NAME;
  state.ronda.targhe = rondaTarghe.value;
  saveState(state);
  renderRonda();
  showToast("Ronda chiusa.", "success");
}

function syncFields() {
  state.ronda.name = rondaName.value.trim() || DEFAULT_RONDA_NAME;
  state.ronda.targhe = rondaTarghe.value;

  updatePlateCount();
  updatePreview();
  persistRonda();
}

function copyModule() {
  copyText(buildRondaModule(), "Modulo ronda copiato.");
}

function bindEvents() {
  startRondaBtn.addEventListener("click", startRonda);
  endRondaBtn.addEventListener("click", endRonda);
  copyRondaModuleBtn.addEventListener("click", copyModule);
  rondaName.addEventListener("input", syncFields);
  rondaTarghe.addEventListener("input", syncFields);
}

bindEvents();
renderRonda();
window.setInterval(updateTimer, 1000);
window.addEventListener("beforeunload", () => saveState(state));
