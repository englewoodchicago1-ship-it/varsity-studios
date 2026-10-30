
/* =========================================================
   v0.15 — GAME HUB NAVIGATION / PROFILE SIDEBAR
   ========================================================= */

const V015_BUILTIN_VIEWS = [
  { id: "main", label: "Dashboard", mark: "⌂", group: "MAIN" },
  { id: "seasonpass", label: "Season Pass", mark: "★", group: "GAME CONTENT" },
  { id: "animations", label: "Animations", mark: "◈", group: "GAME CONTENT" },
  { id: "store", label: "Store", mark: "▣", group: "GAME CONTENT" },
  { id: "settings", label: "Settings", mark: "⚙", group: "PREFERENCES" }
];

function v015IsValidView(view) {
  if (V015_BUILTIN_VIEWS.some(item => item.id === view)) return true;
  if (view?.startsWith("tab:")) return tabs.some(tab => tab.id === view.slice(4));
  return false;
}

function v015RenderSidebarProfile() {
  const footer = document.querySelector(".sidebar-footer");
  if (!footer) return;

  const user = getSignedInUser();
  footer.innerHTML = `
    <div class="sidebar-profile-card">
      <img data-profile-avatar src="${escapeAttribute(getSavedProfilePicture())}" alt="${escapeAttribute(user.displayName)} profile picture" />
      <div class="sidebar-profile-copy">
        <strong>${escapeHtml(user.displayName)}</strong>
        <small>${escapeHtml(user.roleLabel)}</small>
      </div>
      <button class="sidebar-profile-settings" type="button" data-sidebar-view="settings" aria-label="Open settings" title="Settings">⚙</button>
    </div>
    <button class="sidebar-logout-button" type="button" id="sidebarLogoutButton">
      <span>↪</span> Log out
    </button>
  `;

  footer.querySelector("[data-sidebar-view='settings']")?.addEventListener("click", () => switchView("settings"));
  footer.querySelector("#sidebarLogoutButton")?.addEventListener("click", () => logoutButton.click());
}

function v015RenderNavigation() {
  if (!v015IsValidView(activeView)) activeView = "main";

  sidebarTabs.innerHTML = "";

  let currentGroup = "";
  const addGroup = (label) => {
    const heading = document.createElement("div");
    heading.className = "nav-section-label";
    heading.textContent = label;
    sidebarTabs.appendChild(heading);
  };

  V015_BUILTIN_VIEWS.forEach(item => {
    if (item.group !== currentGroup) {
      currentGroup = item.group;
      addGroup(currentGroup);
    }
    sidebarTabs.appendChild(createNavigationButton({
      label: item.label,
      mark: item.mark,
      active: activeView === item.id,
      onClick: () => switchView(item.id)
    }));
  });

  if (tabs.length) {
    addGroup("WORKSPACE TABS");
    tabs.forEach((tab, index) => {
      sidebarTabs.appendChild(createNavigationButton({
        label: tab.name,
        mark: String(index + 1).padStart(2, "0"),
        active: activeView === `tab:${tab.id}`,
        onClick: () => switchView(`tab:${tab.id}`)
      }));
    });
  }

  addTabButton.classList.toggle("hidden", !(activeView === "main" || activeView.startsWith("tab:")));
  addFolderButton.classList.toggle("hidden", !activeView.startsWith("tab:"));
  deleteTabButton.classList.toggle("hidden", !activeView.startsWith("tab:"));

  v015RenderSidebarProfile();
  renderCurrentView();
  updateSignedInIdentity();
  updateProfilePictureUI();
  applyRolePermissions();
  setupMobileDashboardControls();
  saveData();
}

function v015RenderSeasonPass() {
  pageTitle.textContent = "Season Pass";
  pageSubtitle.textContent = "Build and manage your game's seasonal reward track.";
  contentTitle.textContent = "Season Pass Manager";

  tabContent.innerHTML = `
    <div class="hub-page">
      <section class="hub-hero season-hero">
        <div class="hub-hero-copy">
          <span class="hub-eyebrow">VARSITY GAME CONTENT / SEASONAL</span>
          <h3>Season Pass</h3>
          <p>Organize progression, rewards, and seasonal unlocks for your players.</p>
          <div class="hub-hero-meta"><span class="hub-live-dot"></span> SEASON NOT CONFIGURED</div>
        </div>
        <div class="season-hero-mark" aria-hidden="true">01</div>
      </section>

      <div class="hub-metric-grid">
        <article class="hub-metric"><span>SEASON STATUS</span><strong>Not set up</strong><small>Waiting for configuration</small></article>
        <article class="hub-metric"><span>REWARD TIERS</span><strong>100</strong><small>Available tier slots</small></article>
        <article class="hub-metric"><span>REWARDS ADDED</span><strong>0</strong><small>No rewards configured</small></article>
      </div>

      <section class="hub-panel">
        <div class="hub-panel-heading">
          <div><span class="hub-eyebrow">REWARD TRACK</span><h3>Tier preview</h3><p>Reward slots are ready for your season's items and unlocks.</p></div>
          <span class="hub-status-pill">SETUP REQUIRED</span>
        </div>
        <div class="season-tier-preview">
          ${[1, 2, 3, 4, 5].map((tier, index) => `
            <div class="season-tier-slot">
              <div class="season-tier-number">${String(tier).padStart(2, "0")}</div>
              <div class="season-tier-placeholder"><span>＋</span><small>Reward slot</small></div>
              <span class="season-tier-type">${index % 2 === 0 ? "FREE TIER" : "PREMIUM TIER"}</span>
            </div>
          `).join("")}
        </div>
        <div class="hub-empty-note">Your season pass rewards and player progression will appear here once the system is connected.</div>
      </section>
    </div>
  `;
}

function v015CollectAnimations() {
  return tabs.flatMap(tab => (tab.folders || []).flatMap(folder =>
    (folder.animations || []).map(animation => ({
      ...animation,
      folderName: folder.name,
      tabName: tab.name,
      tabId: tab.id
    }))
  ));
}

function v015RenderAnimationRows(items) {
  if (!items.length) {
    return `<div class="hub-empty-note">No saved animations match this search.</div>`;
  }

  return `
    <div class="animation-library-table">
      <div class="animation-library-head"><span>ANIMATION</span><span>ASSET ID</span><span>FOLDER</span><span>WORKSPACE</span><span></span></div>
      ${items.map(item => `
        <div class="animation-library-row">
          <div class="animation-library-name"><span class="animation-library-icon">▶</span><strong>${escapeHtml(item.name || "Untitled animation")}</strong></div>
          <code>${escapeHtml(item.animationId || "—")}</code>
          <span>${escapeHtml(item.folderName)}</span>
          <span>${escapeHtml(item.tabName)}</span>
          <button type="button" class="hub-row-link" data-open-animation-tab="${escapeAttribute(item.tabId)}">Open ›</button>
        </div>
      `).join("")}
    </div>
  `;
}

function v015RenderAnimations() {
  pageTitle.textContent = "Animations";
  pageSubtitle.textContent = "Browse your saved Roblox animation assets.";
  contentTitle.textContent = "Animation Library";

  const allAnimations = v015CollectAnimations();
  tabContent.innerHTML = `
    <div class="hub-page">
      <section class="hub-section-intro">
        <div><span class="hub-eyebrow">ASSET LIBRARY</span><h3>Animations</h3><p>All animations saved in your workspace folders, collected in one place.</p></div>
        <div class="hub-count-chip"><strong>${allAnimations.length}</strong><span>SAVED ANIMATIONS</span></div>
      </section>
      <section class="hub-panel animation-library-panel">
        <div class="hub-panel-heading animation-library-toolbar">
          <div><h3>All animations</h3><p>Search by animation name, ID, folder, or workspace.</p></div>
          <label class="hub-search"><span>⌕</span><input id="hubAnimationSearch" type="search" placeholder="Search animations..." autocomplete="off" /></label>
        </div>
        <div id="hubAnimationResults">${v015RenderAnimationRows(allAnimations)}</div>
      </section>
      ${allAnimations.length ? "" : `<section class="hub-empty-panel"><div class="hub-empty-icon">▶</div><h3>Your animation library is empty</h3><p>Add an <strong>Animations</strong> folder to any workspace tab and save Roblox animation IDs there. They'll automatically appear in this library.</p><button type="button" class="secondary-button" data-go-workspace>Open workspace</button></section>`}
    </div>
  `;

  const search = document.getElementById("hubAnimationSearch");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    const filtered = allAnimations.filter(item =>
      [item.name, item.animationId, item.folderName, item.tabName].some(value => String(value || "").toLowerCase().includes(query))
    );
    document.getElementById("hubAnimationResults").innerHTML = v015RenderAnimationRows(filtered);
    attachOpenButtons();
  });

  function attachOpenButtons() {
    tabContent.querySelectorAll("[data-open-animation-tab]").forEach(button => {
      button.addEventListener("click", () => switchView(`tab:${button.dataset.openAnimationTab}`));
    });
  }
  attachOpenButtons();
  tabContent.querySelector("[data-go-workspace]")?.addEventListener("click", () => switchView("main"));
}

function v015RenderStore() {
  pageTitle.textContent = "Store";
  pageSubtitle.textContent = "Organize featured items and in-game purchases.";
  contentTitle.textContent = "Store Catalog";

  const categories = [
    ["FEATURED", "Featured items", "Spotlight your most important releases."],
    ["GAMEPASSES", "Gamepasses", "Permanent perks and upgrades."],
    ["BUNDLES", "Bundles", "Group items into themed collections."],
    ["COSMETICS", "Cosmetics", "Appearance items and customization."],
    ["CURRENCY", "Currency", "In-game currency products and packs."]
  ];

  tabContent.innerHTML = `
    <div class="hub-page">
      <section class="hub-hero store-hero">
        <div class="hub-hero-copy"><span class="hub-eyebrow">GAME CONTENT / COMMERCE</span><h3>Store</h3><p>Manage the catalog players see when they browse your game's items and offers.</p><div class="hub-hero-meta"><span class="hub-live-dot"></span> CATALOG WORKSPACE</div></div>
        <div class="store-hero-mark" aria-hidden="true">V<span>+</span></div>
      </section>
      <section class="hub-panel">
        <div class="hub-panel-heading"><div><span class="hub-eyebrow">CATALOG CATEGORIES</span><h3>Store sections</h3><p>Choose a category to plan the items that belong in your game store.</p></div></div>
        <div class="store-category-grid">
          ${categories.map(([tag, title, description], index) => `
            <article class="store-category-card"><div class="store-category-top"><span>${tag}</span><span class="store-category-index">0${index + 1}</span></div><h4>${title}</h4><p>${description}</p><div class="store-category-bottom"><span>NO ITEMS YET</span><span>—</span></div></article>
          `).join("")}
        </div>
      </section>
      <div class="hub-empty-note">This is the catalog workspace layout. Store items and purchase data have not been connected yet.</div>
    </div>
  `;
}

function v015RenderCurrentView() {
  const isCustomTab = activeView.startsWith("tab:");
  addFolderButton.classList.toggle("hidden", !isCustomTab);
  deleteTabButton.classList.toggle("hidden", !isCustomTab);
  addTabButton.classList.toggle("hidden", !(activeView === "main" || isCustomTab));

  if (activeView === "main") return renderMainDashboard();
  if (activeView === "seasonpass") return v015RenderSeasonPass();
  if (activeView === "animations") return v015RenderAnimations();
  if (activeView === "store") return v015RenderStore();
  if (activeView === "settings") return renderSettingsPage();
  return renderCustomTab();
}

renderCurrentView = v015RenderCurrentView;
renderNavigation = v015RenderNavigation;
switchView = function switchViewV015(nextView) {
  if (!v015IsValidView(nextView)) nextView = "main";
  if (isRestrictedNonOwner() && NON_OWNER_HIDDEN_VIEWS.has(nextView)) nextView = "main";
  if (activeView === nextView) return;
  activeView = nextView;
  renderNavigation();
  animateContentRefresh();
};

try {
  if (!v015IsValidView(activeView)) activeView = "main";
  document.querySelector("#signedInBrandLogo")?.removeAttribute("data-profile-avatar");
  document.querySelector(".sidebar-label")?.classList.add("hidden");
  document.querySelector(".topbar-account")?.classList.add("hidden");
  if (typeof syncVisibleBuildVersion === "function") syncVisibleBuildVersion();
} catch (error) {
  console.error("[v0.15] Hub initialization issue:", error);
}
