// Login/logout logic

import { playSuccess, playError } from "/js/sound.js";

const form = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const msg = document.getElementById("msg");

// Shows a message box so the user can see success or error feedback.
function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

// When the user submits the login form, send credentials to the server and redirect on success.
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await resp.json();

    if (resp.ok) {
      playSuccess(); // success sound
      // Small delay so the sound can start
      setTimeout(() => {
        window.location.href = "/lost-my.html?login=success";
      }, 120);
    } else {
      playError(); // error sound
      showMsg(data.error || "Login failed", false);
    }
  } catch {
    playError(); // error sound
    showMsg("Network error", false);
  }
});

// When the user clicks Logout, tell the server to end the session and refresh the page.
logoutBtn.addEventListener("click", async () => {
  try {
    const resp = await fetch("/api/auth/logout", { method: "POST" });
    const data = await resp.json();

    if (resp.ok) {
      playSuccess(); // success sound
      setTimeout(() => window.location.reload(), 120);
    } else {
      playError(); // error sound
      showMsg(data.error || "Logout failed", false);
    }
  } catch {
    playError(); // error sound
    showMsg("Network error", false);
  }
});
