  
//   password field with show/unshow btn 

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("toggle-password")) return;

    const input = document.getElementById(e.target.dataset.target);
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    e.target.textContent = isHidden ? "Hide" : "Show";
  });
