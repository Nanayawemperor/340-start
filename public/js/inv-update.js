const form = document.querySelector("#updateForm");
const updateBtn = document.querySelector("#updateBtn");

// Enable button only when form changes
form.addEventListener("change", () => {
  updateBtn.removeAttribute("disabled");
});
