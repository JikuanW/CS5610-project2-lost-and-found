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

  // Avatar initials from username
  const initials = me.loggedIn
    ? me.username.slice(0, 2).toUpperCase()
    : "?";

  navDiv.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="app-title">Lost &amp; Found Tracker</div>
          <div class="spacer"></div>
          <div class="row" style="gap: 8px; align-items: center;">
            ${me.loggedIn ? `
              <!-- Profile avatar with dropdown -->
              <div style="position: relative;" id="profileWrap">
                <button id="profileBtn" type="button" style="
                  width: 34px; height: 34px;
                  border-radius: 50%;
                  background: #0f172a;
                  color: #fff;
                  font-size: 13px;
                  font-weight: 700;
                  border: none;
                  cursor: pointer;
                  display: flex; align-items: center; justify-content: center;
                  letter-spacing: 0.03em;
                ">${initials}</button>

                <div id="profileDropdown" style="
                  display: none;
                  position: absolute;
                  right: 0; top: 42px;
                  background: #fff;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                  min-width: 180px;
                  z-index: 99;
                  overflow: hidden;
                ">
                  <div style="padding: 12px 16px 8px; border-bottom: 1px solid #f1f5f9;">
                    <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${escapeHtml(me.username)}</div>
                    <div style="font-size: 12px; color: #94a3b8;">Logged in</div>
                  </div>
                  <a href="/found-my.html" style="display:block; padding: 10px 16px; font-size: 14px; color: #334155; text-decoration:none;">📦 My Found Items</a>
                  <a href="/lost-my.html"  style="display:block; padding: 10px 16px; font-size: 14px; color: #334155; text-decoration:none;">🔍 My Lost Items</a>
                  <a href="/claims.html"   style="display:block; padding: 10px 16px; font-size: 14px; color: #334155; text-decoration:none;">
                    📋 My Claims
                    ${pendingCount > 0 ? `<span style="background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:6px;">${pendingCount}</span>` : ""}
                  </a>
                  <div style="border-top: 1px solid #f1f5f9; padding: 8px 16px 10px;">
                    <button id="navLogoutBtn" type="button" style="
                      width: 100%; padding: 7px;
                      background: #fee2e2; color: #991b1b;
                      border: none; border-radius: 8px;
                      font-size: 13px; font-weight: 600;
                      cursor: pointer; font-family: inherit;
                    ">Logout</button>
                  </div>
                </div>
              </div>
            ` : `<span class="muted">Not logged in</span>`}
          </div>
        </div>

        <div style="margin-top: 10px;" class="row">
          <a href="/register.html">Register</a>
          <span class="muted">•</span>
          <a href="/login.html">Login</a>
          <span class="muted">•</span>
          <a href="/found-browse.html">Browse Found</a>
          <span class="muted">•</span>
          <a href="/lost-new.html">Create Lost</a>
          <span class="muted">•</span>
          <a href="/found-new.html">Create Found</a>
          <span class="muted">•</span>
          <a href="/claims.html">My Claims</a>
          ${me.role === "admin"
            ? `<span class="muted">•</span><a href="/admin.html">Admin</a>`
            : ""}
        </div>
      </div>
    </div>

    ${pendingCount > 0 ? `
    <div style="
      margin-top: 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    ">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:18px;">🔔</span>
        <span style="font-size:14px; color:#1e40af;">
          You have <strong>${pendingCount} pending claim request${pendingCount > 1 ? "s" : ""}</strong> waiting for your review.
        </span>
      </div>
      <a href="/claims.html" style="
        font-size:13px; font-weight:600; color:#1d4ed8;
        white-space:nowrap; text-decoration:none;
        padding: 5px 12px; border: 1px solid #bfdbfe;
        border-radius: 6px; background: #fff;
      ">Review →</a>
    </div>` : ""}
  `;

  // Toggle dropdown
  const profileBtn = document.getElementById("profileBtn");
  const dropdown   = document.getElementById("profileDropdown");
  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", () => {
      dropdown.style.display = "none";
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



















// // Shared navbar and login status

// import { playSuccess, playError } from "/js/sound.js";

// const navDiv = document.getElementById("nav");

// if (navDiv) {
//   renderNav();
// }

// // Builds the navigation bar based on whether the user is logged in.
// async function renderNav() {
//   const me = await fetchMe();

//   const accountText = me.loggedIn
//     ? `Account: ${escapeHtml(me.username)}`
//     : "Account: Not logged in";

//   navDiv.innerHTML = `
//     <div class="card">
//       <div class="card-body">
//         <div class="row">
//           <div class="app-title">
//             Lost &amp; Found Tracker
//           </div>
//           <div class="spacer"></div>
//           <div class="row">
//             <span class="muted">${accountText}</span>
//             ${
//               me.loggedIn
//                 ? `<button id="navLogoutBtn" class="btn btn-danger" type="button">Logout</button>`
//                 : ""
//             }
//           </div>
//         </div>

//         <div style="margin-top: 10px;" class="row">
//           <a href="/register.html">Register</a>
//           <span class="muted">•</span>
//           <a href="/login.html">Login</a>
//           <span class="muted">•</span>
//           <a href="/found-browse.html">Browse Found</a>
//           <span class="muted">•</span>
//           <a href="/lost-new.html">Create Lost</a>
//           <span class="muted">•</span>
//           <a href="/found-new.html">Create Found</a>
//           <span class="muted">•</span>
//           <a href="/found-my.html">My Found</a>
//           <span class="muted">•</span> 
//           <a href="/lost-my.html">My Lost</a>
//           <span class="muted">•</span> 
//           <a href="/claims.html">My Claims</a>
//           ${me.role === "admin"
//             ? `<span class="muted">•</span>
//                <a href="/admin.html">Admin</a>`
//             : ""}
          
//         </div>
//       </div>
//     </div>
//   `;

//   const logoutBtn = document.getElementById("navLogoutBtn");
//   if (logoutBtn) {
//     // When the user clicks Logout in the navbar, log out on the server and reload the page.
//     logoutBtn.addEventListener("click", async () => {
//       try {
//         const resp = await fetch("/api/auth/logout", { method: "POST" });
//         const data = await resp.json();

//         if (resp.ok) {
//           playSuccess();
//           setTimeout(() => window.location.reload(), 120);
//         } else {
//           playError();
//           console.log(data.error || "Logout failed");
//         }
//       } catch {
//         playError();
//         console.log("Network error");
//       }
//     });
//   }
// }

// // Asks the server who the current user is (logged in or not) for showing account status.
// async function fetchMe() {
//   const resp = await fetch("/api/auth/me");
//   const data = await resp.json();
//   // if (!resp.ok) return { loggedIn: false, username: "" }; Commented out breifly to test admin role
//   if (!resp.ok) return { loggedIn: false, username: "", role: "" };
//   return data;
// }

// // Escapes text so it is safe to insert into HTML (prevents broken markup/injection).
// function escapeHtml(s) {
//   return String(s)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }
