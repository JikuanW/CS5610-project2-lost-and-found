// Shared navbar and login status
import { playSuccess, playError } from "/js/sound.js";

const navDiv = document.getElementById("nav");
if (navDiv) {
  renderNav();
}

async function renderNav() {
  const me = await fetchMe();

  // Fetch pending claims count if logged in
  let pendingCount = 0;
  if (me.loggedIn) {
    try {
      const resp = await fetch("/api/claims/received");
      const data = await resp.json();
      if (resp.ok) {
        pendingCount = data.claims.filter(c => c.status === "pending").length;
      }
    } catch { /* silent fail */ }
  }

  const initials = me.loggedIn ? me.username.slice(0, 2).toUpperCase() : "?";

  navDiv.innerHTML = `
    <style>
      .topnav {
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
        padding: 0 28px;
        display: flex;
        align-items: center;
        height: 60px;
        gap: 32px;
        position: sticky;
        top: 0;
        z-index: 100;
        font-family: 'Inter', sans-serif;
      }
      .topnav-logo {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        text-decoration: none;
        letter-spacing: -0.5px;
        white-space: nowrap;
      }
      .topnav-logo span { color: #3b82f6; }
      .topnav-links {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
      }
      .topnav-links a {
        padding: 6px 11px;
        border-radius: 7px;
        font-size: 14px;
        font-weight: 500;
        color: #475569;
        text-decoration: none;
        transition: background 0.1s, color 0.1s;
        white-space: nowrap;
      }
      .topnav-links a:hover { background: #f1f5f9; color: #0f172a; }
      .topnav-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .btn-login {
        padding: 7px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #fff;
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        cursor: pointer;
        text-decoration: none;
        font-family: 'Inter', sans-serif;
        transition: background 0.1s;
      }
      .btn-login:hover { background: #f8fafc; }
      .btn-signup {
        padding: 7px 16px;
        border: none;
        border-radius: 8px;
        background: #3b82f6;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        cursor: pointer;
        text-decoration: none;
        font-family: 'Inter', sans-serif;
        transition: background 0.1s;
      }
      .btn-signup:hover { background: #2563eb; }

      /* Profile avatar */
      .avatar-btn {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: #0f172a;
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        font-family: 'Inter', sans-serif;
      }
      .profile-dropdown {
        display: none;
        position: absolute;
        right: 0; top: 46px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 8px 28px rgba(0,0,0,0.13);
        min-width: 195px;
        z-index: 999;
        overflow: hidden;
      }
      .profile-dropdown a, .profile-dropdown-item {
        display: flex; align-items: center; gap: 9px;
        padding: 10px 16px;
        font-size: 14px; color: #334155;
        text-decoration: none;
        transition: background 0.1s;
      }
      .profile-dropdown a:hover { background: #f8fafc; }

      /* Notification banner */
      .notif-banner {
        background: #eff6ff;
        border-bottom: 1px solid #bfdbfe;
        padding: 10px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-family: 'Inter', sans-serif;
      }
      .notif-banner-text { font-size: 14px; color: #1e40af; display: flex; align-items: center; gap: 8px; }
      .notif-banner-btn {
        font-size: 13px; font-weight: 600; color: #1d4ed8;
        white-space: nowrap; text-decoration: none;
        padding: 5px 12px; border: 1px solid #bfdbfe;
        border-radius: 6px; background: #fff;
      }
    </style>

    <nav class="topnav" role="navigation" aria-label="Main navigation">
      <a href="/index.html" class="topnav-logo">Lost<span>&</span>Found</a>

      <div class="topnav-links">
        <a href="/found-browse.html">Browse Items</a>
        <a href="/lost-new.html">Report Lost</a>
        <a href="/found-new.html">Post Found</a>
        <a href="/claims.html">
          My Claims
          ${pendingCount > 0 ? `<span style="background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px;margin-left:4px;vertical-align:middle;">${pendingCount}</span>` : ""}
        </a>
        ${me.role === "admin" ? `<a href="/admin.html">Admin</a>` : ""}
      </div>

      <div class="topnav-right">
        ${me.loggedIn ? `
          <div style="position:relative;">
            <button class="avatar-btn" id="profileBtn" aria-label="Open profile menu" aria-haspopup="true">${initials}</button>
            <div class="profile-dropdown" id="profileDropdown" role="menu">
              <div style="padding: 14px 16px 10px; border-bottom: 1px solid #f1f5f9;">
                <div style="font-weight:700; font-size:14px; color:#0f172a;">${escapeHtml(me.username)}</div>
                <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Logged in</div>
              </div>
              <a href="/found-my.html" role="menuitem"><span>📦</span> My Found Items</a>
              <a href="/lost-my.html"  role="menuitem"><span>🔍</span> My Lost Items</a>
              <a href="/claims.html"   role="menuitem">
                <span>📋</span> My Claims
                ${pendingCount > 0 ? `<span style="background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:1px 7px;border-radius:20px;margin-left:auto;">${pendingCount}</span>` : ""}
              </a>
              ${me.role === "admin" ? `<a href="/admin.html" role="menuitem"><span>🛡️</span> Admin Portal</a>` : ""}
              <div style="border-top:1px solid #f1f5f9; padding:10px 16px;">
                <button id="navLogoutBtn" type="button" style="
                  width:100%; padding:8px; background:#fee2e2; color:#991b1b;
                  border:none; border-radius:8px; font-size:13px; font-weight:600;
                  cursor:pointer; font-family:'Inter',sans-serif;
                ">Logout</button>
              </div>
            </div>
          </div>
        ` : `
          <a href="/login.html" class="btn-login">Login</a>
          <a href="/register.html" class="btn-signup">Sign Up</a>
        `}
      </div>
    </nav>

    ${pendingCount > 0 ? `
    <div class="notif-banner">
      <div class="notif-banner-text">
        <span>🔔</span>
        You have <strong style="margin:0 3px;">${pendingCount} pending claim request${pendingCount > 1 ? "s" : ""}</strong> waiting for your review.
      </div>
      <a href="/claims.html" class="notif-banner-btn">Review →</a>
    </div>` : ""}
  `;

  // Profile dropdown toggle
  const profileBtn = document.getElementById("profileBtn");
  const dropdown   = document.getElementById("profileDropdown");
  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", () => {
      if (dropdown) dropdown.style.display = "none";
    });
  }

  // Logout
  const logoutBtn = document.getElementById("navLogoutBtn");
  if (logoutBtn) {
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

async function fetchMe() {
  const resp = await fetch("/api/auth/me");
  const data = await resp.json();
  if (!resp.ok) return { loggedIn: false, username: "", role: "" };
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
