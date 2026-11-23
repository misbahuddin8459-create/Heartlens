import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  db,
  ensureSignedIn,
  getActiveTone,
  hybridModel,
} from "./firebase.js";

const modeBadge = document.getElementById("modeBadge");
const toneBadge = document.getElementById("toneBadge");
const situationInput = document.getElementById("situationInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("result");
const historyList = document.getElementById("historyList");

let currentTone = "gentle";
let currentModeLabel = "Cloud Fallback";

async function updateModeBadge() {
  try {
    if (typeof LanguageModel !== "undefined") {
      const status = await LanguageModel.availability();
      if (status === "available") {
        currentModeLabel = "On-Device (Gemini Nano)";
        modeBadge.textContent = "🟢 On-Device AI Ready (Gemini Nano — Private & Offline)";
        return;
      }
      if (status === "downloadable" || status === "downloading") {
        currentModeLabel = "Cloud Fallback (Nano Downloading)";
        modeBadge.textContent = "🟡 On-Device Model Downloading (Using Cloud Fallback)";
        return;
      }
    }
  } catch (err) {
    console.warn("On-device check failed:", err);
  }
  currentModeLabel = "Cloud Fallback";
  modeBadge.textContent = "☁️ Cloud Fallback Active (Firebase AI Logic)";
}

async function loadHistory() {
  try {
    const user = await ensureSignedIn();
    const ref = collection(db, "users", user.uid, "reflections");
    const q = query(ref, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      historyList.textContent = "No reflections saved yet. Analyze a situation above to start.";
      return;
    }

    historyList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "history-card";
      card.innerHTML = `
        <div class="history-meta">${data.mode || "Hybrid AI"} • Tone: ${data.tone || "gentle"}</div>
        <div class="history-situation"></div>
        <div class="history-response"></div>
      `;
      card.querySelector(".history-situation").textContent = data.situation;
      card.querySelector(".history-response").textContent = data.response;
      historyList.appendChild(card);
    });
  } catch (err) {
    console.error("History load error:", err);
    historyList.textContent = "Could not load history (check Firestore rules or connection).";
  }
}

async function initApp() {
  await updateModeBadge();
  currentTone = await getActiveTone();
  toneBadge.textContent = `🎛️ Tone (Remote Config): ${currentTone}`;
  await loadHistory();
}

initApp();

analyzeBtn.addEventListener("click", async () => {
  const text = situationInput.value.trim();
  if (!text) return;

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  resultBox.style.display = "block";
  resultBox.textContent = "Thinking...";

  try {
    const user = await ensureSignedIn();

    const toneInstruction =
      currentTone === "direct"
        ? "Be concise, straightforward, and no-nonsense."
        : "Be warm, empathetic, calm, and reassuring.";

    const prompt = `You are HeartLens, a grounded, objective relationship advisor.
${toneInstruction}
Analyze the user's situation below and respond in three short, clear sections:
1. Valid Concerns (what is genuinely worth paying attention to)
2. Possible Overthinking (assumptions or anxiety talking)
3. Suggested Next Step (one practical, healthy action)

Situation: "${text}"`;

    const response = await hybridModel.generateContent(prompt);
    const aiText = response.response.text();
    resultBox.textContent = aiText;

    // Save privately to Firestore under the user's UID
    await addDoc(collection(db, "users", user.uid, "reflections"), {
      situation: text,
      response: aiText,
      mode: currentModeLabel,
      tone: currentTone,
      createdAt: serverTimestamp(),
    });

    await loadHistory();
  } catch (error) {
    console.error("AI Error:", error);
    resultBox.textContent = `Error: ${error.message}`;
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Situation";
  }
});
// 1. Press Enter inside the input box to click "Analyze Situation"
// (Shift + Enter still creates a new line)
situationInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!analyzeBtn.disabled) {
      analyzeBtn.click();
    }
  }
});

// 2. Background video sound toggle
const bgVideo = document.getElementById("bgVideo");
const soundBtn = document.getElementById("soundBtn");

soundBtn.addEventListener("click", () => {
  if (bgVideo.muted) {
    bgVideo.muted = false;
    bgVideo.play();
    soundBtn.textContent = "🔊 Sound On";
  } else {
    bgVideo.muted = true;
    soundBtn.textContent = "🔇 Sound Off";
  }
});