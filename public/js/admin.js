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

function hideMsg() {
  msg.style.display = "none";
}

// escape functions
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

// load lost items
async function loadLostItems() {
  try {
    const resp = await fetch("/api/lost-items");
    const data = await resp.json();
    if (!resp.ok) {
      playError();
      showMsg(data.error || "Failed to load lost items", false);
      lostListDiv.innerHTML = "";
      return;
    }
    renderItems(data.items, lostListDiv, "lost");
  } catch {
    playError();
    showMsg("Network error loading lost items", false);
    lostListDiv.innerHTML = "";
  }
}

// load found items
async function loadFoundItems() {
  try {
    const resp = await fetch("/api/found-items");
    const data = await resp.json();
    if (!resp.ok) {
      playError();
      showMsg(data.error || "Failed to load found items", false);
      foundListDiv.innerHTML = "";
      return;
    }
    renderItems(data.items, foundListDiv, "found");
  } catch {
    playError();
    showMsg("Network error loading found items", false);
    foundListDiv.innerHTML = "";
  }
}

// render items (lost or found)
function renderItems(items, container, type) {
  if (!items.length) {
    container.innerHTML = `<div>No ${type} items yet.</div>`;
    return;
  }

  container.innerHTML = items
    .map((it) => {
      const statusText = it.resolved ? "RESOLVED" : "OPEN";
      const claimedText = type === "found" ? (it.claimed ? "CLAIMED" : "UNCLAIMED") : "";
      const imgUrl = (it.image || "").trim();

      const imageBlock = imgUrl
        ? `<div style="margin-top: 6px;">
             <div><b>Image Link:</b> <a href="${escapeAttr(imgUrl)}" target="_blank">${escapeHtml(imgUrl)}</a></div>
             <img src="${escapeAttr(imgUrl)}" alt="Item image" style="max-width: 280px; max-height: 180px; border: 1px solid #e5e7eb; border-radius: 10px;" onerror="this.style.display='none';"/>
           </div>`
        : `<div style="margin-top:6px;"><b>Image:</b> None</div>`;

      return `
      <div class="card" style="margin-bottom:12px;" data-id="${it._id}">
        <div class="card-body">
          <div class="row">
            <div>
              <div style="font-weight:700; font-size:16px;">
                ${escapeHtml(it.title)}
                <span class="muted">(${statusText} ${claimedText})</span>
              </div>
              <div class="muted" style="margin-top:4px;">
                ${escapeHtml(it.category)} • ${escapeHtml(it.location)} • ${escapeHtml(it.date)}
              </div>
            </div>
            <div class="spacer"></div>
            <div class="row">
              <button class="btn editBtn" type="button">Edit</button>
              <button class="btn btn-danger deleteBtn" type="button">Delete</button>
              ${
                type === "lost"
                  ? `<button class="btn btn-primary resolveBtn" type="button" ${it.resolved ? "disabled" : ""}>Mark Resolved</button>`
                  : `<button class="btn btn-primary claimBtn" type="button" ${it.claimed ? "disabled" : ""}>Mark Claimed</button>`
              }
            </div>
          </div>
          <div style="margin-top:10px;">
            <div><b>Description:</b> ${escapeHtml(it.description)}</div>
            ${imageBlock}
          </div>
        </div>
      </div>`;
    })
    .join("");

  container.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest("div[data-id]").dataset.id;
      window.location.href = `/${type}-edit.html?id=${encodeURIComponent(id)}`;
    });
  });

  container.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("div[data-id]").dataset.id;
      const ok = await fetch(`/api/${type}-items/${id}`, { method: "DELETE" })
        .then((r) => r.ok)
        .catch(() => false);
      if (ok) {
        playSuccess();
        type === "lost" ? loadLostItems() : loadFoundItems();
      } else {
        playError();
        showMsg("Delete failed", false);
      }
    });
  });

  if (type === "lost") {
    container.querySelectorAll(".resolveBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("div[data-id]").dataset.id;
        const ok = await fetch(`/api/lost-items/${id}/resolve`, { method: "PATCH" })
          .then((r) => r.ok)
          .catch(() => false);
        if (ok) {
          playSuccess();
          loadLostItems();
        } else {
          playError();
          showMsg("Resolve failed", false);
        }
      });
    });
  } else {
    container.querySelectorAll(".claimBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("div[data-id]").dataset.id;
        const ok = await fetch(`/api/found-items/${id}/claim`, { method: "PATCH" })
          .then((r) => r.ok)
          .catch(() => false);
        if (ok) {
          playSuccess();
          loadFoundItems();
        } else {
          playError();
          showMsg("Claim failed", false);
        }
      });
    });
  }
}

// initial load
loadLostItems();
loadFoundItems();