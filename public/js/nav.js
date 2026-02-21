// Shared navbar and login status

import { playSuccess, playError } from "/js/sound.js";

const navDiv = document.getElementById("nav");

if (navDiv) {
  renderNav();
}

// Builds the navigation bar based on whether the user is logged in.
async function renderNav() {
  const me = await fetchMe();

  const accountText = me.loggedIn
    ? `Account: ${escapeHtml(me.username)}`
    : "Account: Not logged in";

  navDiv.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="app-title">
            Lost &amp; Found Tracker
          </div>
          <div class="spacer"></div>
          <div class="row">
            <span class="muted">${accountText}</span>
            ${
              me.loggedIn
                ? `<button id="navLogoutBtn" class="btn btn-danger" type="button">Logout</button>`
                : ""
            }
          </div>
        </div>

        <div style="margin-top: 10px;" class="row">
          <a href="/register.html">Register</a>
          <span class="muted">•</span>
          <a href="/login.html">Login</a>
          <span class="muted">•</span>
          <a href="/lost-new.html">Create Lost</a>
          <span class="muted">•</span>
          <a href="/lost-my.html">My Lost</a>
        </div>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById("navLogoutBtn");
  if (logoutBtn) {
    // When the user clicks Logout in the navbar, log out on the server and reload the page.
    logoutBtn.addEventListener("click", async () => {
      try {
        const resp = await fetch("/api/auth/logout", { method: "POST" });
        const data = await resp.json();

        if (resp.ok) {
          playSuccess();
          setTimeout(() => window.location.reload(), 120);
        } else {
          playError();
          console.log(data.error || "Logout failed");
        }
      } catch {
        playError();
        console.log("Network error");
      }
    });
  }
}

// Asks the server who the current user is (logged in or not) for showing account status.
async function fetchMe() {
  const resp = await fetch("/api/auth/me");
  const data = await resp.json();
  if (!resp.ok) return { loggedIn: false, username: "" };
  return data;
}

// Escapes text so it is safe to insert into HTML (prevents broken markup/injection).
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
