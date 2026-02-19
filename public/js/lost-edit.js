// Edit lost item

const msg = document.getElementById("msg");
const form = document.getElementById("editForm");

function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  showMsg("Missing id in URL.", false);
} else {
  loadItem();
}

async function loadItem() {
  const resp = await fetch(`/api/lost-items/${id}`);
  const data = await resp.json();

  if (!resp.ok) {
    showMsg(data.error || "Failed to load item", false);
    return;
  }

  const item = data.item;

  form.elements.title.value = item.title || "";
  form.elements.description.value = item.description || "";
  form.elements.image.value = item.image || "";
  form.elements.date.value = item.date || "";

  setSelectValueOrAddOption(form.elements.category, item.category || "");
  setSelectValueOrAddOption(form.elements.location, item.location || "");
}

function setSelectValueOrAddOption(selectEl, value) {
  if (!value) return;

  const has = Array.from(selectEl.options).some((opt) => opt.value === value);
  if (has) {
    selectEl.value = value;
    return;
  }

  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = `Other: ${value}`;
  selectEl.appendChild(opt);
  selectEl.value = value;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: form.elements.title.value,
    description: form.elements.description.value,
    category: form.elements.category.value,
    location: form.elements.location.value,
    date: form.elements.date.value,
    image: form.elements.image.value,
  };

  const resp = await fetch(`/api/lost-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (resp.ok) {
    showMsg("Saved.", true);
  } else {
    showMsg(data.error || "Save failed", false);
  }
});
