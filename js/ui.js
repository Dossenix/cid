function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(timestamp) {
  if (!timestamp) return "--:--:--";
  return new Date(timestamp).toLocaleString("it-IT");
}

function formatTime(timestamp) {
  if (!timestamp) return "--:--:--";
  return new Date(timestamp).toLocaleTimeString("it-IT");
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "00:00:00";

  const total = Math.floor(ms / 1000);
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function sanitizeUrl(url) {
  const value = String(url ?? "").trim();
  if (!value) return "";

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function debounce(fn, wait = 220) {
  let timeoutId = null;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), wait);
  };
}

function formatListLines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function setStatusPill(element, label, active) {
  if (!element) return;

  element.textContent = label;
  element.classList.toggle("status-pill--active", active);
  element.classList.toggle("status-pill--idle", !active);
}

function ensureToastStack() {
  let stack = qs("#toastStack");

  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toastStack";
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    stack.setAttribute("aria-atomic", "true");
    document.body.appendChild(stack);
  }

  return stack;
}

function removeToast(toast) {
  toast.classList.remove("is-visible");
  window.setTimeout(() => toast.remove(), 180);
}

function showToast(message, type = "info") {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const text = document.createElement("span");
  text.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast-close";
  closeButton.setAttribute("aria-label", "Chiudi notifica");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => removeToast(toast));

  toast.appendChild(text);
  toast.appendChild(closeButton);
  stack.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  window.setTimeout(() => removeToast(toast), 3400);
}

async function copyText(text, successMessage = "Testo copiato.") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage, "success");
  } catch (error) {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    document.body.appendChild(fallback);
    fallback.select();

    try {
      document.execCommand("copy");
      showToast(successMessage, "success");
    } catch (fallbackError) {
      showToast("Copia non riuscita.", "error");
    } finally {
      document.body.removeChild(fallback);
    }
  }
}
