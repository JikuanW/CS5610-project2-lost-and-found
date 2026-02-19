// Shared navbar and login status

const navDiv = document.getElementById("nav");

if (navDiv) {
  renderNav();
}

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
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    });
  }
}

async function fetchMe() {
  const resp = await fetch("/api/auth/me");
  const data = await resp.json();
  if (!resp.ok) return { loggedIn: false, username: "" };
  return data;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}