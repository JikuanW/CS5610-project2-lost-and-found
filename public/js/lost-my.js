// My lost items list

import { playSuccess, playError } from "/js/sound.js";

const msg = document.getElementById("msg");
const listDiv = document.getElementById("list");

// Show a message box with success/error styling.
function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

// Hide the message box.
function hideMsg() {
  msg.style.display = "none";
}

// Show login success message
const params = new URLSearchParams(window.location.search);
if (params.get("login") === "success") {
  playSuccess();
  showMsg("Logged in successfully.", true);
  window.history.replaceState({}, "", "/lost-my.html");
}

// Fetch the current user's items and render the list UI.
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

    const items = data.items;

    if (items.length === 0) {
      if (!params.get("login")) {
        showMsg("No items yet.", true);
      }
      listDiv.innerHTML = "";
      return;
    }

    hideMsg();

    listDiv.innerHTML = items
      .map((it) => {
        const statusText = it.resolved ? "RESOLVED" : "OPEN";
        const imgUrl = (it.image || "").trim();

        const imageBlock = imgUrl
          ? `
          <div class="muted" style="margin-top: 6px;">
            <div><b>Image Link:</b> <a href="${escapeAttr(imgUrl)}" target="_blank">${escapeHtml(imgUrl)}</a></div>
            <div style="margin-top: 8px;">
              <img
                src="${escapeAttr(imgUrl)}"
                alt="Lost item image"
                style="max-width: 280px; max-height: 180px; border: 1px solid #e5e7eb; border-radius: 10px; display: block;"
                onerror="this.style.display='none'; this.parentElement.querySelector('.imgError').style.display='block';"
              />
              <div class="imgError alert alert-err" style="display:none; margin-top: 8px;">
                Image link cannot be opened.
              </div>
            </div>
          </div>
        `
          : `
          <div class="muted" style="margin-top: 6px;">
            <b>Image:</b> No image
          </div>
        `;

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
                <button class="btn btn-primary resolveBtn" type="button" ${
                  it.resolved ? "disabled" : ""
                }>Mark Resolved</button>
              </div>
            </div>

            <div style="margin-top: 10px;">
              <div><b>Description:</b> ${escapeHtml(it.description)}</div>
              ${imageBlock}
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    document.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("div[data-id]").dataset.id;
        window.location.href = `/lost-edit.html?id=${encodeURIComponent(id)}`;
      });
    });

    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("div[data-id]").dataset.id;
        const ok = await deleteItem(id);
        if (ok) {
          playSuccess();
          await loadMyItems();
        }
      });
    });

    document.querySelectorAll(".resolveBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("div[data-id]").dataset.id;
        const ok = await resolveItem(id);
        if (ok) {
          playSuccess();
          await loadMyItems();
        }
      });
    });
  } catch {
    playError();
    showMsg("Network error", false);
    listDiv.innerHTML = "";
  }
}

// Request deletion of an item by id and report errors.
async function deleteItem(id) {
  try {
    const resp = await fetch(`/api/lost-items/${id}`, { method: "DELETE" });
    const data = await resp.json();

    if (resp.ok) return true;

    playError();
    showMsg(data.error || "Delete failed", false);
    return false;
  } catch {
    playError();
    showMsg("Network error", false);
    return false;
  }
}

// Request marking an item as resolved and report errors.
async function resolveItem(id) {
  try {
    const resp = await fetch(`/api/lost-items/${id}/resolve`, {
      method: "PATCH",
    });
    const data = await resp.json();

    if (resp.ok) return true;

    playError();
    showMsg(data.error || "Resolve failed", false);
    return false;
  } catch {
    playError();
    showMsg("Network error", false);
    return false;
  }
}

// Escape a string for safe HTML text rendering.
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Escape a string for safe HTML attribute usage.
function escapeAttr(s) {
  return String(s).replaceAll('"', "&quot;");
}

loadMyItems();
