// My lost items list
import { playSuccess, playError } from "/js/sound.js";

const msg     = document.getElementById("msg");
const listDiv = document.getElementById("list");

function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

function hideMsg() {
  msg.style.display = "none";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s) {
  return String(s).replaceAll('"', "&quot;");
}

// Show login success message
const params = new URLSearchParams(window.location.search);
if (params.get("login") === "success") {
  playSuccess();
  showMsg("Logged in successfully.", true);
  window.history.replaceState({}, "", "/lost-my.html");
}

let allLostItems = [];

async function loadMyItems() {
  try {
    const resp = await fetch("/api/lost-items/mine");
    const data = await resp.json();

    if (!resp.ok) {
      playError();
      showMsg(data.error || "Failed to load", false);
      listDiv.innerHTML = "";
      return;
    }

    allLostItems = data.items;
    applyFilters();
  } catch {
    playError();
    showMsg("Network error", false);
    listDiv.innerHTML = "";
  }
}

function applyFilters() {
  const term = (document.getElementById("lostSearch")?.value || "").toLowerCase();
  const cat  = document.getElementById("filterCategory")?.value || "";
  const loc  = document.getElementById("filterLocation")?.value || "";
  const date = document.getElementById("filterDate")?.value || "";

  const filtered = allLostItems.filter(item => {
    const matchSearch = !term ||
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term);
    const matchCat = !cat || item.category === cat;
    const matchLoc = !loc || item.location === loc;
    let matchDate = true;
    if (date) {
      const [y, m, d] = date.split("-");
      matchDate = item.date === `${m}/${d}/${y}`;
    }
    return matchSearch && matchCat && matchLoc && matchDate;
  });

  renderItems(filtered);
}

function renderItems(items) {
  if (!items.length) {
    listDiv.innerHTML = `<div class="muted">No lost items match.</div>`;
    return;
  }

  hideMsg();

  listDiv.innerHTML = items.map((it) => {
    const statusText = it.resolved ? "RESOLVED" : "OPEN";
    const imgUrl = (it.image || "").trim();

    const imageBlock = imgUrl
      ? `<div class="muted" style="margin-top: 6px;">
           <div><b>Image Link:</b> <a href="${escapeAttr(imgUrl)}" target="_blank">${escapeHtml(imgUrl)}</a></div>
           <div style="margin-top: 8px;">
             <img src="${escapeAttr(imgUrl)}" alt="Lost item image"
               style="max-width: 280px; max-height: 180px; border: 1px solid #e5e7eb; border-radius: 10px; display: block;"
               onerror="this.style.display='none'; this.parentElement.querySelector('.imgError').style.display='block';" />
             <div class="imgError alert alert-err" style="display:none; margin-top: 8px;">
               Image link cannot be opened.
             </div>
           </div>
         </div>`
      : `<div class="muted" style="margin-top: 6px;"><b>Image:</b> No image</div>`;

    return `
      <div class="card" style="margin-bottom: 12px;" data-id="${it._id}">
        <div class="card-body">
          <div class="row">
            <div>
              <div style="font-weight: 700; font-size: 16px;">
                ${escapeHtml(it.title)}
                <span class="muted">(${statusText})</span>
              </div>
              <div class="muted" style="margin-top: 4px;">
                ${escapeHtml(it.category)} • ${escapeHtml(it.location)} • ${escapeHtml(it.date)}
              </div>
            </div>
            <div class="spacer"></div>
            <div class="row">
              <button class="btn editBtn" type="button">Edit</button>
              <button class="btn btn-danger deleteBtn" type="button">Delete</button>
              <button class="btn btn-primary resolveBtn" type="button" ${it.resolved ? "disabled" : ""}>Mark Resolved</button>
            </div>
          </div>
          <div style="margin-top: 10px;">
            <div><b>Description:</b> ${escapeHtml(it.description)}</div>
            ${imageBlock}
          </div>
        </div>
      </div>`;
  }).join("");

  listDiv.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest("div[data-id]").dataset.id;
      window.location.href = `/lost-edit.html?id=${encodeURIComponent(id)}`;
    });
  });

  listDiv.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("div[data-id]").dataset.id;
      const ok = await deleteItem(id);
      if (ok) { playSuccess(); await loadMyItems(); }
    });
  });

  listDiv.querySelectorAll(".resolveBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest("div[data-id]").dataset.id;
      const ok = await resolveItem(id);
      if (ok) { playSuccess(); await loadMyItems(); }
    });
  });
}

async function deleteItem(id) {
  try {
    const resp = await fetch(`/api/lost-items/${id}`, { method: "DELETE" });
    const data = await resp.json();
    if (resp.ok) return true;
    playError(); showMsg(data.error || "Delete failed", false); return false;
  } catch {
    playError(); showMsg("Network error", false); return false;
  }
}

async function resolveItem(id) {
  try {
    const resp = await fetch(`/api/lost-items/${id}/resolve`, { method: "PATCH" });
    const data = await resp.json();
    if (resp.ok) return true;
    playError(); showMsg(data.error || "Resolve failed", false); return false;
  } catch {
    playError(); showMsg("Network error", false); return false;
  }
}

// Filter listeners
document.getElementById("lostSearch")?.addEventListener("input", applyFilters);
document.getElementById("filterCategory")?.addEventListener("change", applyFilters);
document.getElementById("filterLocation")?.addEventListener("change", applyFilters);
document.getElementById("filterDate")?.addEventListener("change", applyFilters);
document.getElementById("clearFilters")?.addEventListener("click", () => {
  document.getElementById("lostSearch").value = "";
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterLocation").value = "";
  document.getElementById("filterDate").value = "";
  applyFilters();
});

loadMyItems();
