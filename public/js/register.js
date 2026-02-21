// Register page logic

import { playSuccess, playError } from "/js/sound.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

// Shows a message box so the user can see success or error feedback.
function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

// When the user submits the registration form, create a new account on the server.
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const resp = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await resp.json();

    if (resp.ok) {
      playSuccess();
      showMsg("Registered. Go to login page.", true);
      form.reset();
    } else {
      playError();
      showMsg(data.error || "Register failed", false);
    }
  } catch {
    playError();
    showMsg("Network error", false);
  }
});
