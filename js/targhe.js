let state = loadState();

const plateNumero = qs("#plateNumero");
const plateSoggetto = qs("#plateSoggetto");
const plateGhetto = qs("#plateGhetto");
const plateLink = qs("#plateLink");
const savePlateBtn = qs("#savePlateBtn");
const platesList = qs("#platesList");

function renderPlates() {
  platesList.innerHTML = "";

  if (!state.plates.length) {
    platesList.innerHTML = `<p class="muted">Nessuna targa salvata.</p>`;
    return;
  }

  const reversed = [...state.plates].reverse();

  reversed.forEach(plate => {
    const card = document.createElement("div");
    card.className = "plate-card";

    card.innerHTML = `
      <h3>${escapeHtml(plate.numero)}</h3>
      <p><strong>Soggetto:</strong> ${escapeHtml(plate.soggetto)}</p>
      <p><strong>Ghetto:</strong> ${escapeHtml(plate.ghetto)}</p>
      <p><strong>Schedatura:</strong> ${escapeHtml(plate.link)}</p>
      <p><strong>Creato il:</strong> ${escapeHtml(formatDateTime(plate.createdAt))}</p>
      <div class="small-actions">
        <button class="btn btn-secondary" data-copy="${plate.id}">Copia</button>
        <button class="btn btn-danger" data-delete="${plate.id}">Elimina</button>
      </div>
    `;

    platesList.appendChild(card);
  });

  qsa("[data-copy]").forEach(btn => {
    btn.addEventListener("click", () => copyPlate(btn.dataset.copy));
  });

  qsa("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => deletePlate(btn.dataset.delete));
  });
}

function savePlate() {
  const numero = plateNumero.value.trim();
  const soggetto = plateSoggetto.value.trim();
  const ghetto = plateGhetto.value.trim();
  const link = plateLink.value.trim();

  if (!numero || !soggetto || !ghetto || !link) {
    alert("Compila tutti i campi della nuova targa.");
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
}

savePlateBtn.addEventListener("click", savePlate);
renderPlates();