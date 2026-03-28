let state = loadState();

const rondaStatus = qs("#rondaStatus");
const rondaStartText = qs("#rondaStartText");
const rondaEndText = qs("#rondaEndText");
const rondaTimer = qs("#rondaTimer");

const rondaName = qs("#rondaName");
const rondaTarghe = qs("#rondaTarghe");

const startRondaBtn = qs("#startRondaBtn");
const endRondaBtn = qs("#endRondaBtn");
const copyRondaModuleBtn = qs("#copyRondaModuleBtn");

function renderRonda() {
  rondaStatus.textContent = state.ronda.active ? "Attiva" : "Non attiva";
  rondaStartText.textContent = formatDateTime(state.ronda.startAt);
  rondaEndText.textContent = formatDateTime(state.ronda.endAt);

  rondaName.value = state.ronda.name || "Detroit";
  rondaTarghe.value = state.ronda.targhe || "";
}

function updateTimer() {
  if (state.ronda.active && state.ronda.startAt) {
    rondaTimer.textContent = formatDuration(Date.now() - state.ronda.startAt);
  } else {
    rondaTimer.textContent = "00:00:00";
  }
}

function startRonda() {
  if (state.ronda.active) {
    alert("La ronda è già attiva.");
    return;
  }

  state.ronda.active = true;
  state.ronda.startAt = Date.now();
  state.ronda.endAt = null;
  state.ronda.name = rondaName.value || "Detroit";
  saveState(state);
  renderRonda();
}

function endRonda() {
  if (!state.ronda.active) {
    alert("Nessuna ronda attiva.");
    return;
  }

  state.ronda.active = false;
  state.ronda.endAt = Date.now();
  state.ronda.name = rondaName.value || "Detroit";
  state.ronda.targhe = rondaTarghe.value || "";
  saveState(state);
  renderRonda();
}

function syncFields() {
  state.ronda.name = rondaName.value;
  state.ronda.targhe = rondaTarghe.value;
  saveState(state);
}

function copyModule() {
  const text = `Nome e Cognome: ${rondaName.value || "Detroit"}
Inizio Ronda: ${formatTime(state.ronda.startAt)}
Fine Ronde: ${formatTime(state.ronda.endAt)}
Targhe Prese (Clip): ${rondaTarghe.value || ""}`;

  copyText(text, "Modulo ronda copiato.");
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
updateTimer();
setInterval(updateTimer, 1000);