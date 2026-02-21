// Shared navbar and login status
import { playSuccess, playError } from "/js/sound.js";
const navDiv = document.getElementById("nav");
if (navDiv) {
  renderNav();
}

async function renderNav() {
  const me = await fetchMe();
  const accountText = me.loggedIn
    ? `Account: ${escapeHtml(me.username)}`
    : "Account: Not logged in";

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
          <a href="/found-browse.html">Browse Found</a>
          <span class="muted">•</span>
          <a href="/lost-new.html">Create Lost</a>
          <span class="muted">•</span>
          <a href="/found-new.html">Create Found</a>
          <span class="muted">•</span>
          <a href="/found-my.html">My Found</a>
          <span class="muted">•</span>
          <a href="/lost-my.html">My Lost</a>
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
        font-size:13px;
        font-weight:600;
        color:#1d4ed8;
        white-space:nowrap;
        text-decoration:none;
        padding: 5px 12px;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        background: #fff;
      ">Review →</a>
    </div>` : ""}
  `;

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
