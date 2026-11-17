/* Varsity Studios v1.0 — Public Games, details, and Studio navigation */
(() => {
  const publicView = document.getElementById("publicGamesView");
  const gamesHome = document.getElementById("gamesHomePage");
  const footballDetail = document.getElementById("footballDetailPage");
  const loginView = document.getElementById("loginView");
  const studioButton = document.getElementById("openStudioButton");
  const gamesButton = document.getElementById("backToGamesButton");
  const footballButton = document.getElementById("openFootballDetail");
  const backButton = document.getElementById("backToGamesDetail");
  const topBackButton = document.getElementById("allGamesTopButton");

  if (![publicView, gamesHome, footballDetail, loginView, studioButton, gamesButton,
    footballButton, backButton, topBackButton].every(Boolean)) return;

  function resetScroll() {
    window.scrollTo(0, 0);
  }

  function displayGamesPage() {
    gamesHome.hidden = false;
    footballDetail.hidden = true;
    topBackButton.hidden = true;
    document.title = "Varsity Studios | Games";
    resetScroll();
  }

  function displayFootballPage() {
    gamesHome.hidden = true;
    footballDetail.hidden = false;
    topBackButton.hidden = false;
    document.title = "Varsity Football | Varsity Studios";
    resetScroll();
    document.getElementById("vfDetailTitle")?.focus({ preventScroll: true });
  }

  function showGames() {
    if (!document.body.classList.contains("auth-locked")) return;
    document.body.classList.add("public-home");
    publicView.removeAttribute("aria-hidden");
    loginView.setAttribute("aria-hidden", "true");
    displayGamesPage();
  }

  function showStudio() {
    if (!document.body.classList.contains("auth-locked")) return;
    document.body.classList.remove("public-home");
    publicView.setAttribute("aria-hidden", "true");
    loginView.setAttribute("aria-hidden", "false");
    document.title = "Varsity Studios | Studio";
    resetScroll();
    document.getElementById("username")?.focus({ preventScroll: true });
  }

  studioButton.addEventListener("click", showStudio);
  gamesButton.addEventListener("click", showGames);
  footballButton.addEventListener("click", displayFootballPage);
  backButton.addEventListener("click", displayGamesPage);
  topBackButton.addEventListener("click", displayGamesPage);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("public-home") &&
        !footballDetail.hidden) displayGamesPage();
  });

  if (document.body.classList.contains("public-home")) {
    publicView.removeAttribute("aria-hidden");
    loginView.setAttribute("aria-hidden", "true");
    displayGamesPage();
  }
})();
