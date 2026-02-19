// Create lost item page logic

const form = document.getElementById("lostForm");
const msg = document.getElementById("msg");

function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
    date: formData.get("date"),
    image: formData.get("image"),
  };

  const resp = await fetch("/api/lost-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (resp.ok) {
    showMsg("Created lost item.", true);
    form.reset();
  } else {
    showMsg(data.error || "Create failed", false);
  }
});
