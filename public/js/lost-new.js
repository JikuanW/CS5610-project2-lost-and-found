// Create lost item page logic

import { playSuccess, playError } from "/js/sound.js";

const form = document.getElementById("lostForm");
const msg = document.getElementById("msg");

// Show a message box with success/error styling.
function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
    date: formData.get("date"),
    image: formData.get("image"),
  };

  try {
    const resp = await fetch("/api/lost-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (resp.ok) {
      playSuccess();
      showMsg("Created lost item.", true);
      form.reset();
    } else {
      playError();
      showMsg(data.error || "Create failed", false);
    }
  } catch {
    playError();
    showMsg("Network error", false);
  }
});
