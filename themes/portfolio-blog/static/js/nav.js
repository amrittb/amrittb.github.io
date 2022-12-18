function openSpSideBar(sidebar) {
  sidebar.classList.add("opened");
  sidebar.classList.remove("closed");
}

function closeSpSideBar(sidebar) {
  sidebar.classList.remove("opened");
  sidebar.classList.add("closed");
}

function isSidebarOpen(sidebar) {
  return sidebar.classList.contains("opened");
}

(() => {
  const spSideBarNav = document.getElementById("sp-nav-sidebar");
  const hamburgerMenuOpen = document.getElementById("hamburger-menu-open");

  spSideBarNav.querySelectorAll("a").forEach((element) => {
    element.addEventListener("click", (e) => {
      closeSpSideBar(spSideBarNav);
      return true;
    });
  });

  hamburgerMenuOpen.addEventListener("click", (e) => {
    openSpSideBar(spSideBarNav);
    return false;
  });

  window.onresize = (e) => {
    if (window.innerWidth > 768) {
      if (isSidebarOpen(spSideBarNav)) {
        closeSpSideBar(spSideBarNav);
      }
    }
  };
})();
