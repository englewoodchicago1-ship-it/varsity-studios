/* Varsity Studios v0.19 — Public Games / Studio entry navigation */
(() => {
  const games = document.getElementById("publicGamesView");
  const login = document.getElementById("loginView");
  const studioButton = document.getElementById("openStudioButton");
  const gamesButton = document.getElementById("backToGamesButton");

  if (!games || !login || !studioButton || !gamesButton) return;

  function showGames() {
    if (!document.body.classList.contains("auth-locked")) return;
    document.body.classList.add("public-home");
    games.removeAttribute("aria-hidden");
    login.setAttribute("aria-hidden", "true");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function showStudio() {
    document.body.classList.remove("public-home");
    games.setAttribute("aria-hidden", "true");
    login.setAttribute("aria-hidden", "false");
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("username")?.focus({ preventScroll: true });
  }

  studioButton.addEventListener("click", showStudio);
  gamesButton.addEventListener("click", showGames);
  if (document.body.classList.contains("public-home")) {
    games.removeAttribute("aria-hidden");
    login.setAttribute("aria-hidden", "true");
  }
})();
