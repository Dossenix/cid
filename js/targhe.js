let state = loadState();

const plateNumero = qs("#plateNumero");
const plateSoggetto = qs("#plateSoggetto");
const plateGhetto = qs("#plateGhetto");
const plateLink = qs("#plateLink");
const plateSearchInput = qs("#plateSearchInput");
const plateTotalCount = qs("#plateTotalCount");
const plateVisibleCount = qs("#plateVisibleCount");
const plateSearchStatus = qs("#plateSearchStatus");
const savePlateBtn = qs("#savePlateBtn");
const platesList = qs("#platesList");

function getFilteredPlates() {
  const query = plateSearchInput.value.trim().toLowerCase();
  if (!query) return [...state.plates].reverse();

  return [...state.plates]
    .reverse()
    .filter(plate =>
      [plate.numero, plate.soggetto, plate.ghetto, plate.link]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
}

function updateCounters(filteredCount) {
  plateTotalCount.textContent = state.plates.length;
  plateVisibleCount.textContent = filteredCount;

  if (!state.plates.length) {
    plateSearchStatus.textContent = "Nessuna targa salvata.";
    return;
  }

  if (!plateSearchInput.value.trim()) {
    plateSearchStatus.textContent = `Visualizzazione completa: ${state.plates.length} targhe.`;
    return;
  }

  plateSearchStatus.textContent = `Risultati filtro: ${filteredCount} su ${state.plates.length}.`;
}

function renderPlates() {
  const filteredPlates = getFilteredPlates();
  platesList.innerHTML = "";
  updateCounters(filteredPlates.length);

  if (!state.plates.length) {
    platesList.innerHTML = `<p class="muted">Nessuna targa salvata.</p>`;
    return;
  }

  if (!filteredPlates.length) {
    platesList.innerHTML = `<p class="muted">Nessuna targa corrisponde al filtro attuale.</p>`;
    return;
  }

  filteredPlates.forEach(plate => {
    const safeLink = sanitizeUrl(plate.link);
    const card = document.createElement("article");
    card.className = "plate-card";

    card.innerHTML = `
      <h3>${escapeHtml(plate.numero)}</h3>
      <p><strong>Soggetto:</strong> ${escapeHtml(plate.soggetto)}</p>
      <p><strong>Ghetto:</strong> ${escapeHtml(plate.ghetto)}</p>
      <p>
        <strong>Schedatura:</strong>
        ${
          safeLink
            ? `<a class="text-link" href="${safeLink}" target="_blank" rel="noreferrer">${escapeHtml(plate.link)}</a>`
            : escapeHtml(plate.link)
        }
      </p>
      <p class="plate-meta"><strong>Creato il:</strong> ${escapeHtml(formatDateTime(plate.createdAt))}</p>
      <div class="small-actions">
        <button class="btn btn-secondary" type="button" data-copy="${plate.id}">Copia</button>
        <button class="btn btn-danger" type="button" data-delete="${plate.id}">Elimina</button>
      </div>
    `;

    platesList.appendChild(card);
  });
}

function savePlate() {
  const numero = plateNumero.value.trim();
  const soggetto = plateSoggetto.value.trim();
  const ghetto = plateGhetto.value.trim();
  const link = plateLink.value.trim();

  if (!numero) {
    showToast("Inserisci il numero della targa.", "error");
    plateNumero.focus();
    return;
  }

  if (!soggetto) {
    showToast("Inserisci il soggetto collegato alla targa.", "error");
    plateSoggetto.focus();
    return;
  }

  if (!ghetto) {
    showToast("Inserisci il ghetto di appartenenza.", "error");
    plateGhetto.focus();
    return;
  }

  if (!link) {
    showToast("Inserisci il link della schedatura.", "error");
    plateLink.focus();
    return;
  }

  state.plates.push({
    id: generateId(),
    numero,
    soggetto,
    ghetto,
    link,
    createdAt: Date.now()
  });

  saveState(state);

  plateNumero.value = "";
  plateSoggetto.value = "";
  plateGhetto.value = "";
  plateLink.value = "";

  renderPlates();
  plateNumero.focus();
  showToast("Targa salvata.", "success");
}

function copyPlate(id) {
  const plate = state.plates.find(item => item.id === id);
  if (!plate) return;

  const text = `Numero Della Targa: ${plate.numero}
Nome e Cognome (del soggetto): ${plate.soggetto}
Ghetto di appartenenza: ${plate.ghetto}
Schedatura Targa: ${plate.link}`;

  copyText(text, "Targa copiata.");
}

function deletePlate(id) {
  const plate = state.plates.find(item => item.id === id);
  if (!plate) return;

  if (!confirm(`Eliminare la targa "${plate.numero}"?`)) return;

  state.plates = state.plates.filter(item => item.id !== id);
  saveState(state);
  renderPlates();
  showToast("Targa eliminata.", "success");
}

function handlePlateActions(event) {
  const copyId = event.target.dataset.copy;
  const deleteId = event.target.dataset.delete;

  if (copyId) {
    copyPlate(copyId);
  }

  if (deleteId) {
    deletePlate(deleteId);
  }
}

savePlateBtn.addEventListener("click", savePlate);
plateSearchInput.addEventListener("input", renderPlates);
platesList.addEventListener("click", handlePlateActions);
renderPlates();
