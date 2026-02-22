// admin.js — manages lost + found items
import { playSuccess, playError } from "/js/sound.js";

const msg = document.getElementById("msg");
const lostListDiv = document.getElementById("lostList");
const foundListDiv = document.getElementById("foundList");

function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s) {
  return String(s).replaceAll('"', "&quot;");
}

async function checkAdmin() {
  const resp = await fetch("/api/auth/me");
  const data = await resp.json();
  if (!data.loggedIn || data.role !== "admin") {
    showMsg("Access denied. Admin only.", false);
    lostListDiv.innerHTML = "";
    foundListDiv.innerHTML = "";
    return false;
  }
  return true;
}

// Single fetch gets both lost + found
async function loadAllItems() {
  try {
    const resp = await fetch("/api/admin/items");
    const data = await resp.json();
    if (!resp.ok) {
      playError();
      showMsg(data.error || "Failed to load items", false);
      return;
    }
    renderItems(data.lost, lostListDiv, "lost");
    renderItems(data.found, foundListDiv, "found");
  } catch {
    playError();
    showMsg("Network error", false);
  }
}

function renderItems(items, container, type) {
  if (!items || !items.length) {
    container.innerHTML = `<div>No ${type} items yet.</div>`;
    return;
  }

  container.innerHTML = items
    .map((it) => {
      const statusText =
        type === "lost"
          ? it.resolved
            ? "RESOLVED"
            : "OPEN"
          : it.claimed
            ? "CLAIMED"
            : "UNCLAIMED";

      const imgUrl = (it.image || "").trim();
      const imageBlock = imgUrl
        ? `<div style="margin-top: 6px;">
             <img src="${escapeAttr(imgUrl)}" alt="Item image"
               style="max-width: 280px; max-height: 180px; border: 1px solid #e5e7eb; border-radius: 10px;"
               onerror="this.style.display='none';" />
           </div>`
        : "";

      return `
        <div class="card" style="margin-bottom:12px;" data-id="${it._id}" data-type="${type}">
          <div class="card-body">
            <div class="row">
              <div>
                <div style="font-weight:700; font-size:16px;">
                  ${escapeHtml(it.title)}
                  <span class="muted">(${statusText})</span>
                </div>
                <div class="muted" style="margin-top:4px;">
                  ${escapeHtml(it.category)} • ${escapeHtml(it.location)} • ${escapeHtml(it.date)}
                </div>
              </div>
              <div class="spacer"></div>
              <button class="btn btn-danger deleteBtn" type="button">Delete</button>
            </div>
            <div style="margin-top:10px;">
              <div><b>Description:</b> ${escapeHtml(it.description)}</div>
              ${imageBlock}
            </div>
          </div>
        </div>`;
    })
    .join("");

  container.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest("div[data-id]");
      const id = card.dataset.id;
      const itemType = card.dataset.type;

      try {
        const resp = await fetch(`/api/admin/${itemType}-items/${id}`, {
          method: "DELETE",
        });
        if (resp.ok) {
          playSuccess();
          card.remove(); // instantly removes from page, no reload needed
        } else {
          const data = await resp.json();
          playError();
          showMsg(data.error || "Delete failed", false);
        }
      } catch {
        playError();
        showMsg("Network error", false);
      }
    });
  });
}

async function init() {
  const ok = await checkAdmin();
  if (ok) loadAllItems();
}

init();
