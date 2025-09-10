// ===== Estado global (se usa "namespace" para guardar separado por modalidad) =====
let xp = 0, streak = 0, hearts = 3;
let STORAGE_NS = "default";

// Cargar estado por namespace
function loadState(ns) {
  STORAGE_NS = ns || "default";
  xp     = parseInt(localStorage.getItem(`xp_${STORAGE_NS}`)     || "0", 10);
  streak = parseInt(localStorage.getItem(`streak_${STORAGE_NS}`) || "0", 10);
  hearts = parseInt(localStorage.getItem(`hearts_${STORAGE_NS}`) || "3", 10);
}

// Guardar estado por namespace
function saveState() {
  localStorage.setItem(`xp_${STORAGE_NS}`, xp);
  localStorage.setItem(`streak_${STORAGE_NS}`, streak);
  localStorage.setItem(`hearts_${STORAGE_NS}`, hearts);
}

// Render stats
function renderStats() {
  document.getElementById("xp").textContent = xp;
  document.getElementById("streak").textContent = streak;
  document.getElementById("hearts").textContent = hearts;
}

// ===== Inicializar tarjetas dinámicamente =====
function initLessons(LESSONS, { ns = "default" } = {}) {
  loadState(ns);
  renderStats();

  const container = document.getElementById("lessonContainer");
  container.innerHTML = "";

  LESSONS.forEach((lesson) => {
    const card = document.createElement("div");
    card.className = "card";
    card.id = `lesson-${lesson.id}`;

    card.innerHTML = `
      <h2>Ejercicio ${lesson.id}</h2>
      <button class="btn btn-green" onclick="playAudio(${lesson.id})">🔊 Reproducir</button>
      <audio id="audio-${lesson.id}" src="${lesson.audio}"></audio>

      <div>
        <input type="text" id="input-${lesson.id}" placeholder="Escribe aquí...">
      </div>

      <div>
        <button id="compare-${lesson.id}" class="btn btn-green" onclick="checkAnswer(${lesson.id})">Comparar</button>
        <button id="hint-${lesson.id}" class="btn btn-amber" onclick="showHint(${lesson.id})">💡 Pista</button>
      </div>

      <p class="feedback" id="feedback-${lesson.id}"></p>
    `;
    container.appendChild(card);
  });

  // Reiniciar progreso
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      xp = 0; streak = 0; hearts = 3;
      saveState();
      renderStats();

      LESSONS.forEach(l => {
        const input = document.getElementById(`input-${l.id}`);
        const fb    = document.getElementById(`feedback-${l.id}`);
        input.value = "";
        input.disabled = false;
        fb.textContent = "";
        document.getElementById(`compare-${l.id}`).disabled = false;
        document.getElementById(`hint-${l.id}`).disabled = false;
        // permitir reproducir de nuevo
        const playBtn = document.querySelector(`#lesson-${l.id} button[onclick="playAudio(${l.id})"]`);
        if (playBtn) playBtn.disabled = false;
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    }, { once: false });
  }
}

// ===== Lógica de interacción =====
function playAudio(id) {
  const audio = document.getElementById(`audio-${id}`);
  if (audio) audio.play();
}

function checkAnswer(id) {
  // Obtener lección actual
  const allLessons = window.__CURRENT_LESSONS__ || [];
  const lesson = allLessons.find(l => l.id === id);
  if (!lesson) return;

  const input  = document.getElementById(`input-${id}`);
  const fb     = document.getElementById(`feedback-${id}`);
  const user   = (input.value || "").trim().toLowerCase();
  const target = (lesson.answer || "").trim().toLowerCase();

  if (hearts <= 0) {
    fb.textContent = "💔 Sin vidas. Reinicia para seguir.";
    fb.style.color = "#ef4444";
    return;
  }

  if (user === target) {
    fb.textContent = "✅ ¡Correcto!";
    fb.style.color = "#10b981";

    xp += 10; streak += 1;
    saveState();
    renderStats();

    // Bloquear elementos de esta tarjeta
    input.disabled = true;
    document.getElementById(`compare-${id}`).disabled = true;
    document.getElementById(`hint-${id}`).disabled = true;

    const playBtn = document.querySelector(`#lesson-${id} button[onclick="playAudio(${id})"]`);
    if (playBtn) playBtn.disabled = true;

  } else {
    fb.textContent = "❌ Incorrecto. Intenta otra vez.";
    fb.style.color = "#ef4444";
    hearts = Math.max(0, hearts - 1);
    saveState();
    renderStats();
    if (hearts === 0) {
      alert("💔 Te quedaste sin vidas. Pulsa 'Reiniciar' para volver a jugar.");
    }
  }
}

function showHint(id) {
  const allLessons = window.__CURRENT_LESSONS__ || [];
  const lesson = allLessons.find(l => l.id === id);
  if (!lesson) return;

  const fb = document.getElementById(`feedback-${id}`);
  fb.textContent = `💡 Pista: ${lesson.hint}`;
  fb.style.color = "#facc15";
}

/* Helper para que cada modalidad registre sus lecciones */
function setCurrentLessons(lessons) {
  window.__CURRENT_LESSONS__ = lessons.slice(); // copia
}
