// Login/logout logic

const form = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
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

  const resp = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await resp.json();

  if (resp.ok) {
    window.location.href = "/lost-my.html?login=success";
  } else {
    showMsg(data.error || "Login failed", false);
  }
});

logoutBtn.addEventListener("click", async () => {
  const resp = await fetch("/api/auth/logout", { method: "POST" });
  const data = await resp.json();

  if (resp.ok) {
    window.location.reload();
  } else {
    showMsg(data.error || "Logout failed", false);
  }
});
