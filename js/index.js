let state = loadState();

const statFolders = qs("#statFolders");
const statPlates = qs("#statPlates");
const statService = qs("#statService");
const statRonda = qs("#statRonda");

const exportBtn = qs("#exportDataBtn");
const importInput = qs("#importDataInput");
const resetBtn = qs("#resetAllBtn");

function renderDashboard() {
  statFolders.textContent = state.folders.length;
  statPlates.textContent = state.plates.length;
  statService.textContent = state.service.active ? "In servizio" : "Fuori servizio";
  statRonda.textContent = state.ronda.active ? "Attiva" : "Non attiva";
}

function bindBackupActions() {
  exportBtn?.addEventListener("click", () => {
    exportState(state);
  });

  importInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importStateFromFile(file, (error, newState) => {
      if (error) {
        alert("File backup non valido.");
        return;
      }

      state = newState;
      saveState(state);
      renderDashboard();
      alert("Backup importato correttamente.");
      event.target.value = "";
    });
  });

  resetBtn?.addEventListener("click", () => {
    if (!confirm("Vuoi davvero cancellare tutti i dati?")) return;
    if (!confirm("Conferma finale: operazione irreversibile.")) return;

    state = defaultState();
    saveState(state);
    renderDashboard();
  });
}

renderDashboard();
bindBackupActions();