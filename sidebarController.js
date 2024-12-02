document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.getElementById("menu-icon");
  const sidebar = document.getElementById("sidebar");
  const content = document.querySelector(".content");

  menuIcon.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");

    const isExpanded = menuIcon.getAttribute("aria-expanded") === "true";
    menuIcon.setAttribute("aria-expanded", !isExpanded);

    menuIcon.classList.toggle("fa-bars");
    menuIcon.classList.toggle("fa-times");

    if (content) {
      if (sidebar.classList.contains("collapsed")) {
        content.style.marginLeft = "80px";
      } else {
        content.style.marginLeft = "250px";
      }
    }
  });
});

function loadSidebar() {
  fetch("/sidebar.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("sidebar-container").innerHTML = data;
      initializeSidebar();
    })
    .catch((error) => {
      console.error("Error loading sidebar:", error);
    });
}

function initializeSidebar() {
  const menuIcon = document.getElementById("menu-icon");
  const sidebar = document.getElementById("sidebar");
  const content = document.querySelector(".content");

  menuIcon.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    const isExpanded = menuIcon.getAttribute("aria-expanded") === "true";
    menuIcon.setAttribute("aria-expanded", !isExpanded);
    menuIcon.classList.toggle("fa-bars");
    menuIcon.classList.toggle("fa-times");

    if (content) {
      if (sidebar.classList.contains("collapsed")) {
        content.style.marginLeft = "80px";
      } else {
        content.style.marginLeft = "250px";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", loadSidebar);

function loadContent(section) {
  const url = `${section}.html`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("content").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error loading content:", error);
    });
}
