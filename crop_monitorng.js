document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-link");
  const iframe = document.getElementById("main-frame");

  navLinks.forEach(link => {
      link.addEventListener("click", function (event) {
          event.preventDefault();


          const page = link.getAttribute("data-page");
          iframe.setAttribute("src", page);


          navLinks.forEach(nav => nav.classList.remove("active", "bg-warning-dark", "text-white"));
          link.classList.add("active", "bg-warning-dark", "text-white");
          
      });
  });
});
