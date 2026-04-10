let state = loadState();

const statFolders = qs("#statFolders");
const statReadyFolders = qs("#statReadyFolders");
const statCheckedProofs = qs("#statCheckedProofs");
const statPlates = qs("#statPlates");
const statService = qs("#statService");
const statRonda = qs("#statRonda");
const statServiceNote = qs("#statServiceNote");
const statRondaNote = qs("#statRondaNote");

const exportBtn = qs("#exportDataBtn");
const importInput = qs("#importDataInput");
const resetBtn = qs("#resetAllBtn");

function countCheckedProofs(folder) {
  return folder.proofs.filter(proof => proof.checked).length;
}

function getReadyFoldersCount() {
  return state.folders.filter(folder => countCheckedProofs(folder) >= 7).length;
}

function getTotalCheckedProofs() {
  return state.folders.reduce((total, folder) => total + countCheckedProofs(folder), 0);
}

function buildServiceNote() {
  if (state.service.active && state.service.startAt) {
    return `Attivo da ${formatDuration(Date.now() - state.service.startAt)}`;
  }

  if (state.service.endAt) {
    return `Ultima chiusura alle ${formatTime(state.service.endAt)}`;
  }

  return "Nessun turno attivo";
}

function buildRondaNote() {
  if (state.ronda.active && state.ronda.startAt) {
    return `Attiva da ${formatDuration(Date.now() - state.ronda.startAt)}`;
  }

  const plateCount = formatListLines(state.ronda.targhe).length;
  if (state.ronda.endAt) {
    return plateCount
      ? `${plateCount} targhe annotate nell'ultima ronda`
      : `Ultima chiusura alle ${formatTime(state.ronda.endAt)}`;
  }

  return "Nessuna ronda in corso";
}

function renderDashboard() {
  statFolders.textContent = state.folders.length;
  statReadyFolders.textContent = getReadyFoldersCount();
  statCheckedProofs.textContent = getTotalCheckedProofs();
  statPlates.textContent = state.plates.length;
  statService.textContent = state.service.active ? "In servizio" : "Fuori servizio";
  statRonda.textContent = state.ronda.active ? "Attiva" : "Non attiva";
  statServiceNote.textContent = buildServiceNote();
  statRondaNote.textContent = buildRondaNote();
}

function bindBackupActions() {
  exportBtn?.addEventListener("click", () => {
    exportState(state);
    showToast("Backup esportato correttamente.", "success");
  });

  importInput?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;

    importStateFromFile(file, (error, newState) => {
      event.target.value = "";

      if (error) {
        showToast("File backup non valido.", "error");
        return;
      }

      state = newState;
      saveState(state);
      renderDashboard();
      showToast("Backup importato correttamente.", "success");
    });
  });

  resetBtn?.addEventListener("click", () => {
    if (!confirm("Vuoi davvero cancellare tutti i dati?")) return;
    if (!confirm("Conferma finale: operazione irreversibile.")) return;

    state = defaultState();
    saveState(state);
    renderDashboard();
    showToast("Dati resettati.", "success");
  });
}

renderDashboard();
bindBackupActions();
window.setInterval(renderDashboard, 1000);
