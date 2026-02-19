// Register page logic

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

function showMsg(text, ok) {
  msg.style.display = "block";
  msg.textContent = text;
  msg.className = ok ? "alert alert-ok" : "alert alert-err";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const username = formData.get("username");
  const password = formData.get("password");

  const resp = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await resp.json();

  if (resp.ok) {
    showMsg("Registered. Go to login page.", true);
    form.reset();
  } else {
    showMsg(data.error || "Register failed", false);
  }
});