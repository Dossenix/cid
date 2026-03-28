let state = loadState();

const newFolderName = qs("#newFolderName");
const createFolderBtn = qs("#createFolderBtn");
const foldersList = qs("#foldersList");
const folderHeader = qs("#folderHeader");
const folderContent = qs("#folderContent");

function getSelectedFolder() {
  return state.folders.find(folder => folder.id === state.selectedFolderId) || null;
}

function renderFolders() {
  foldersList.innerHTML = "";

  if (!state.folders.length) {
    foldersList.innerHTML = `<p class="muted">Nessuna cartella presente.</p>`;
    return;
  }

  state.folders.forEach(folder => {
    const item = document.createElement("div");
    item.className = "folder-item";

    const selectBtn = document.createElement("button");
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

    const actions = document.createElement("div");
    actions.className = "folder-actions";

    const renameBtn = document.createElement("button");
    renameBtn.className = "icon-btn";
    renameBtn.textContent = "✏️";
    renameBtn.title = "Rinomina";
    renameBtn.addEventListener("click", () => renameFolder(folder.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn";
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Elimina";
    deleteBtn.addEventListener("click", () => deleteFolder(folder.id));

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(selectBtn);
    item.appendChild(actions);
    foldersList.appendChild(item);
  });
}

function renderSelectedFolder() {
  const folder = getSelectedFolder();

  if (!folder) {
    folderHeader.className = "empty-state";
    folderHeader.innerHTML = `
      <h2>Nessuna cartella selezionata</h2>
      <p>Crea o seleziona una cartella dalla colonna sinistra.</p>
    `;
    folderContent.innerHTML = "";
    return;
  }

  const checkedCount = folder.proofs.filter(proof => proof.checked).length;
  const canAssault = checkedCount >= 7;

  folderHeader.className = "";
  folderHeader.innerHTML = `
    <h2>${escapeHtml(folder.name)}</h2>
    <p class="muted">Gestione completa delle 28 prove investigative.</p>
    <div class="folder-meta">
      <span class="badge">Prove confermate: ${checkedCount}/28</span>
      <span class="badge ${canAssault ? "badge-ready" : "badge-not-ready"}">
        ${canAssault ? "Assaltabile: almeno 7 prove presenti" : "Non assaltabile: servono almeno 7 prove"}
      </span>
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "proofs-grid";

  folder.proofs.forEach((proof, index) => {
    const card = document.createElement("div");
    card.className = "proof-card";

    card.innerHTML = `
      <div class="proof-top">
        <h3>0/28 PROVE PER ASSALTARE — ${index + 1}</h3>
        <label class="checkbox-line">
          <input type="checkbox" data-check="${proof.id}" ${proof.checked ? "checked" : ""} />
          Confermata
        </label>
      </div>

      <div class="stack">
        <div>
          <label>Titolo del punto</label>
          <input type="text" data-title="${proof.id}" value="${escapeHtml(proof.title)}" />
        </div>

        <div class="proof-fields">
          <div>
            <label>Data</label>
            <input type="text" data-date="${proof.id}" value="${escapeHtml(proof.data)}" placeholder="Data..." />
          </div>

          <div>
            <label>Clip</label>
            <input type="text" data-clip="${proof.id}" value="${escapeHtml(proof.clip)}" placeholder="Link clip / note..." />
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  folderContent.innerHTML = "";
  folderContent.appendChild(grid);

  qsa("[data-check]").forEach(el => {
    el.addEventListener("change", (event) => {
      updateProof(Number(event.target.dataset.check), "checked", event.target.checked);
    });
  });

  qsa("[data-title]").forEach(el => {
    el.addEventListener("input", (event) => {
      updateProof(Number(event.target.dataset.title), "title", event.target.value);
    });
  });

  qsa("[data-date]").forEach(el => {
    el.addEventListener("input", (event) => {
      updateProof(Number(event.target.dataset.date), "data", event.target.value);
    });
  });

  qsa("[data-clip]").forEach(el => {
    el.addEventListener("input", (event) => {
      updateProof(Number(event.target.dataset.clip), "clip", event.target.value);
    });
  });
}

function updateProof(proofId, field, value) {
  const folder = getSelectedFolder();
  if (!folder) return;

  const proof = folder.proofs.find(item => item.id === proofId);
  if (!proof) return;

  proof[field] = value;
  saveState(state);
  renderSelectedFolder();
}

function createFolder() {
  const name = newFolderName.value.trim();
  if (!name) {
    alert("Inserisci un nome per la cartella.");
    return;
  }

  const folder = createDefaultFolder(name);
  state.folders.push(folder);
  state.selectedFolderId = folder.id;
  newFolderName.value = "";
  saveState(state);
  renderAll();
}

function renameFolder(folderId) {
  const folder = state.folders.find(item => item.id === folderId);
  if (!folder) return;

  const newName = prompt("Nuovo nome cartella:", folder.name);
  if (!newName || !newName.trim()) return;

  folder.name = newName.trim();
  saveState(state);
  renderAll();
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
}

function bindEvents() {
  createFolderBtn.addEventListener("click", createFolder);

  newFolderName.addEventListener("keydown", (event) => {
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