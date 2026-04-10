let state = loadState();

const newFolderName = qs("#newFolderName");
const createFolderBtn = qs("#createFolderBtn");
const folderSearchInput = qs("#folderSearchInput");
const foldersList = qs("#foldersList");
const folderHeader = qs("#folderHeader");
const folderContent = qs("#folderContent");
const folderTotalCount = qs("#folderTotalCount");
const folderReadyCount = qs("#folderReadyCount");
const folderSearchStatus = qs("#folderSearchStatus");

const persistState = debounce(() => saveState(state), 180);

function getSelectedFolder() {
  return state.folders.find(folder => folder.id === state.selectedFolderId) || null;
}

function countCheckedProofs(folder) {
  return folder.proofs.filter(proof => proof.checked).length;
}

function getProgressPercent(folder) {
  return Math.round((countCheckedProofs(folder) / folder.proofs.length) * 100);
}

function getFilteredFolders() {
  const query = folderSearchInput.value.trim().toLowerCase();
  if (!query) return state.folders;

  return state.folders.filter(folder => folder.name.toLowerCase().includes(query));
}

function updateSidebarStats(filteredCount) {
  const readyCount = state.folders.filter(folder => countCheckedProofs(folder) >= 7).length;

  folderTotalCount.textContent = state.folders.length;
  folderReadyCount.textContent = readyCount;

  if (!state.folders.length) {
    folderSearchStatus.textContent = "Nessuna cartella presente.";
    return;
  }

  if (!folderSearchInput.value.trim()) {
    folderSearchStatus.textContent = `Visualizzazione completa: ${state.folders.length} cartelle.`;
    return;
  }

  folderSearchStatus.textContent = `Risultati filtro: ${filteredCount} su ${state.folders.length}.`;
}

function renderFolders() {
  const filteredFolders = getFilteredFolders();
  foldersList.innerHTML = "";
  updateSidebarStats(filteredFolders.length);

  if (!state.folders.length) {
    foldersList.innerHTML = `<p class="muted">Nessuna cartella presente.</p>`;
    return;
  }

  if (!filteredFolders.length) {
    foldersList.innerHTML = `<p class="muted">Nessuna cartella corrisponde al filtro attuale.</p>`;
    return;
  }

  filteredFolders.forEach(folder => {
    const checkedCount = countCheckedProofs(folder);
    const canAssault = checkedCount >= 7;
    const item = document.createElement("div");
    item.className = "folder-item";

    const main = document.createElement("div");
    main.className = "folder-item-main";

    const selectBtn = document.createElement("button");
    selectBtn.type = "button";
    selectBtn.className = "folder-select";
    if (folder.id === state.selectedFolderId) {
      selectBtn.classList.add("active");
    }
    selectBtn.textContent = folder.name;
    selectBtn.addEventListener("click", () => {
      state.selectedFolderId = folder.id;
      saveState(state);
      renderAll();
    });

    const meta = document.createElement("div");
    meta.className = "folder-item-meta";
    meta.innerHTML = `
      <span>${checkedCount}/28 confermate</span>
      <span>${canAssault ? "Pronta all'assalto" : "Da completare"}</span>
    `;

    const progress = document.createElement("div");
    progress.className = "folder-item-progress";

    const progressBar = document.createElement("span");
    progressBar.className = "folder-item-progress-bar";
    progressBar.style.width = `${getProgressPercent(folder)}%`;
    progress.appendChild(progressBar);

    main.appendChild(selectBtn);
    main.appendChild(meta);
    main.appendChild(progress);

    const actions = document.createElement("div");
    actions.className = "folder-actions";

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "icon-btn";
    renameBtn.textContent = "✎";
    renameBtn.title = "Rinomina cartella";
    renameBtn.setAttribute("aria-label", `Rinomina ${folder.name}`);
    renameBtn.addEventListener("click", () => renameFolder(folder.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-btn";
    deleteBtn.textContent = "🗑";
    deleteBtn.title = "Elimina cartella";
    deleteBtn.setAttribute("aria-label", `Elimina ${folder.name}`);
    deleteBtn.addEventListener("click", () => deleteFolder(folder.id));

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(main);
    item.appendChild(actions);
    foldersList.appendChild(item);
  });
}

function renderFolderHeader(folder) {
  const checkedCount = countCheckedProofs(folder);
  const canAssault = checkedCount >= 7;
  const progressPercent = getProgressPercent(folder);

  folderHeader.className = "";
  folderHeader.innerHTML = `
    <div class="folder-overview">
      <div class="folder-title-row">
        <div>
          <p class="eyebrow">Cartella selezionata</p>
          <h2>${escapeHtml(folder.name)}</h2>
          <p class="panel-subtitle">Gestione completa delle 28 prove investigative con salvataggio live.</p>
        </div>

        <span class="badge ${canAssault ? "badge-ready" : "badge-not-ready"}">
          ${canAssault ? "Assaltabile" : "Da completare"}
        </span>
      </div>

      <div class="folder-progress-line">
        <div>
          <strong>${checkedCount}/28</strong>
          <span>prove confermate</span>
        </div>
        <span>${progressPercent}% completato</span>
      </div>

      <div class="progress-bar" aria-hidden="true">
        <span class="progress-bar-fill" style="width: ${progressPercent}%"></span>
      </div>

      <div class="summary-strip">
        <div class="mini-stat">
          <span>Prove mancanti</span>
          <strong>${28 - checkedCount}</strong>
        </div>

        <div class="mini-stat">
          <span>Stato</span>
          <strong>${canAssault ? "Pronta" : "Non pronta"}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderSelectedFolder() {
  const folder = getSelectedFolder();

  if (!folder) {
    folderHeader.className = "empty-state";
    folderHeader.innerHTML = `
      <h2>Nessuna cartella selezionata</h2>
      <p>Crea o seleziona una cartella dalla colonna laterale per iniziare.</p>
    `;
    folderContent.innerHTML = "";
    return;
  }

  renderFolderHeader(folder);

  const notesSection = document.createElement("section");
  notesSection.className = "panel notes-panel";
  notesSection.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Note cartella</p>
        <h2>Appunti operativi</h2>
        <p class="panel-subtitle">Spazio libero per annotazioni, contesto e promemoria legati a questa cartella.</p>
      </div>
    </div>

    <div class="stack">
      <div>
        <label for="folderNotes">Note estese</label>
        <textarea
          id="folderNotes"
          class="notes-textarea"
          data-folder-notes="true"
          placeholder="Scrivi qui note, riassunti, dettagli utili o promemoria..."
        >${escapeHtml(folder.notes || "")}</textarea>
      </div>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "proofs-grid";

  folder.proofs.forEach((proof, index) => {
    const card = document.createElement("article");
    card.className = `proof-card${proof.checked ? " is-checked" : ""}`;
    card.dataset.proofCard = String(proof.id);

    card.innerHTML = `
      <div class="proof-top">
        <div>
          <span class="proof-index">Prova ${String(index + 1).padStart(2, "0")} / 28</span>
          <h3 data-title-display="${proof.id}">${escapeHtml(proof.title)}</h3>
          <p class="panel-subtitle">Aggiorna titolo, data e clip senza perdere il focus in scrittura.</p>
        </div>

        <label class="checkbox-line" for="proof-check-${proof.id}">
          <input
            id="proof-check-${proof.id}"
            type="checkbox"
            data-check="${proof.id}"
            ${proof.checked ? "checked" : ""}
          />
          Confermata
        </label>
      </div>

      <div class="stack">
        <div>
          <label for="proof-title-${proof.id}">Titolo del punto</label>
          <input
            id="proof-title-${proof.id}"
            type="text"
            data-title="${proof.id}"
            value="${escapeHtml(proof.title)}"
          />
        </div>

        <div class="proof-fields">
          <div>
            <label for="proof-date-${proof.id}">Data</label>
            <input
              id="proof-date-${proof.id}"
              type="text"
              data-date="${proof.id}"
              value="${escapeHtml(proof.data)}"
              placeholder="Data..."
            />
          </div>

          <div>
            <label for="proof-clip-${proof.id}">Clip o note</label>
            <input
              id="proof-clip-${proof.id}"
              type="text"
              data-clip="${proof.id}"
              value="${escapeHtml(proof.clip)}"
              placeholder="Link clip o note..."
            />
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  folderContent.innerHTML = "";
  folderContent.appendChild(notesSection);
  folderContent.appendChild(grid);
}

function updateProofField(proofId, field, value) {
  const folder = getSelectedFolder();
  if (!folder) return;

  const proof = folder.proofs.find(item => item.id === proofId);
  if (!proof) return;

  proof[field] = field === "title" ? value.trim() || PROOF_TEMPLATES[proofId - 1] : value;
  persistState();
}

function syncProofCardState(proofId, checked) {
  const card = qs(`[data-proof-card="${proofId}"]`, folderContent);
  if (!card) return;

  card.classList.toggle("is-checked", checked);
}

function syncProofTitleDisplay(proofId, title) {
  const heading = qs(`[data-title-display="${proofId}"]`, folderContent);
  if (!heading) return;

  heading.textContent = title || `Prova ${String(proofId).padStart(2, "0")}`;
}

function createFolder() {
  const name = newFolderName.value.trim();
  if (!name) {
    showToast("Inserisci un nome per la cartella.", "error");
    newFolderName.focus();
    return;
  }

  const folder = createDefaultFolder(name);
  state.folders.push(folder);
  state.selectedFolderId = folder.id;
  newFolderName.value = "";
  folderSearchInput.value = "";
  saveState(state);
  renderAll();
  showToast("Cartella creata.", "success");
}

function renameFolder(folderId) {
  const folder = state.folders.find(item => item.id === folderId);
  if (!folder) return;

  const newName = prompt("Nuovo nome cartella:", folder.name);
  if (!newName || !newName.trim()) return;

  folder.name = newName.trim();
  saveState(state);
  renderAll();
  showToast("Cartella rinominata.", "success");
}

function deleteFolder(folderId) {
  const folder = state.folders.find(item => item.id === folderId);
  if (!folder) return;

  if (!confirm(`Eliminare la cartella "${folder.name}"?`)) return;

  state.folders = state.folders.filter(item => item.id !== folderId);

  if (state.selectedFolderId === folderId) {
    state.selectedFolderId = state.folders[0]?.id || null;
  }

  saveState(state);
  renderAll();
  showToast("Cartella eliminata.", "success");
}

function handleFolderInput(event) {
  if (event.target.dataset.folderNotes) {
    const folder = getSelectedFolder();
    if (!folder) return;

    folder.notes = event.target.value;
    persistState();
    return;
  }

  const titleId = Number(event.target.dataset.title);
  const dateId = Number(event.target.dataset.date);
  const clipId = Number(event.target.dataset.clip);

  if (titleId) {
    updateProofField(titleId, "title", event.target.value);
    syncProofTitleDisplay(titleId, event.target.value.trim() || PROOF_TEMPLATES[titleId - 1]);
    return;
  }

  if (dateId) {
    updateProofField(dateId, "data", event.target.value);
    return;
  }

  if (clipId) {
    updateProofField(clipId, "clip", event.target.value);
  }
}

function handleFolderChange(event) {
  const checkId = Number(event.target.dataset.check);
  if (!checkId) return;

  const folder = getSelectedFolder();
  if (!folder) return;

  const proof = folder.proofs.find(item => item.id === checkId);
  if (!proof) return;

  proof.checked = event.target.checked;
  saveState(state);
  syncProofCardState(checkId, proof.checked);
  renderFolderHeader(folder);
  renderFolders();
}

function bindEvents() {
  createFolderBtn.addEventListener("click", createFolder);
  folderSearchInput.addEventListener("input", renderFolders);
  folderContent.addEventListener("input", handleFolderInput);
  folderContent.addEventListener("change", handleFolderChange);

  newFolderName.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      createFolder();
    }
  });
}

function renderAll() {
  renderFolders();
  renderSelectedFolder();
}

bindEvents();
renderAll();
window.addEventListener("beforeunload", () => saveState(state));
