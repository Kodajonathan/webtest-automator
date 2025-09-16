$(document).ready(function () {
  // Initialize tab switching
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      const tabId = this.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Initialize sidebar toggle for mobile
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      document.querySelector(".sidebar").classList.toggle("show");
    });
  }

  // Tab switching functionality
  function switchTab(tabId) {
    // Remove active class from all tabs and content
    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove("active"));
    document
      .querySelectorAll(".tab-pane")
      .forEach((pane) => pane.classList.remove("active"));

    // Add active class to clicked tab and corresponding content
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
  }
});
