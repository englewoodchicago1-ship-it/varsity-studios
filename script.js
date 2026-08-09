const VALID_USERNAME = "ykdrxc";
const VALID_PASSWORD = "JamalJackson21";

const STORAGE_KEYS = {
  tabs: "varsityDashboardTabs",
  activeView: "varsityDashboardActiveView"
};

const MAX_IMAGE_SIZE = 2.5 * 1024 * 1024;
const MAX_IMAGES_PER_FOLDER = 20;
const MAX_MODEL_SIZE = 4 * 1024 * 1024;
const MAX_MODELS_PER_FOLDER = 12;

const GLOBAL_LINKS = [
  {
    name: "MiaPrep",
    description: "Open your MiaPrep challenges.",
    url: "https://miaprep.com/challenges",
    icon: "M"
  },
  {
    name: "YouTube",
    description: "Open the saved YouTube music playlist.",
    url: "https://www.youtube.com/watch?v=h5u4dKq8C2w&list=RDh5u4dKq8C2w&start_radio=1",
    icon: "▶"
  },
  {
    name: "Roblox Dashboard",
    description: "Open Roblox Creator Dashboard creations.",
    url: "https://create.roblox.com/dashboard/creations",
    icon: "R"
  }
];

const defaultTabs = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Manage Varsity Studios files, assets, and development resources.",
    folders: []
  }
];

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");
const logoutButton = document.getElementById("logoutButton");

const sidebarTabs = document.getElementById("sidebarTabs");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const contentTitle = document.getElementById("contentTitle");
const tabContent = document.getElementById("tabContent");
const addTabButton = document.getElementById("addTabButton");
const deleteTabButton = document.getElementById("deleteTabButton");
const addFolderButton = document.getElementById("addFolderButton");

const tabDialog = document.getElementById("tabDialog");
const tabForm = document.getElementById("tabForm");
const tabName = document.getElementById("tabName");
const tabDescription = document.getElementById("tabDescription");
const closeDialogButton = document.getElementById("closeDialogButton");
const cancelDialogButton = document.getElementById("cancelDialogButton");

const folderDialog = document.getElementById("folderDialog");
const folderForm = document.getElementById("folderForm");
const folderName = document.getElementById("folderName");
const folderDescription = document.getElementById("folderDescription");
const closeFolderDialogButton = document.getElementById("closeFolderDialogButton");
const cancelFolderDialogButton = document.getElementById("cancelFolderDialogButton");

const animationDialog = document.getElementById("animationDialog");
const animationForm = document.getElementById("animationForm");
const animationName = document.getElementById("animationName");
const animationId = document.getElementById("animationId");
const animationError = document.getElementById("animationError");
const closeAnimationDialogButton = document.getElementById("closeAnimationDialogButton");
const cancelAnimationDialogButton = document.getElementById("cancelAnimationDialogButton");

const modelDialog = document.getElementById("modelDialog");
const modelForm = document.getElementById("modelForm");
const modelName = document.getElementById("modelName");
const modelDescription = document.getElementById("modelDescription");
const modelError = document.getElementById("modelError");
const selectedModelFileName = document.getElementById("selectedModelFileName");
const closeModelDialogButton = document.getElementById("closeModelDialogButton");
const cancelModelDialogButton = document.getElementById("cancelModelDialogButton");

const imageUploadInput = document.getElementById("imageUploadInput");
const modelUploadInput = document.getElementById("modelUploadInput");

let tabs = loadTabs();
let activeView = localStorage.getItem(STORAGE_KEYS.activeView) || "main";
let activeAnimationFolderId = null;
let activeImageFolderId = null;
let activeModelFolderId = null;
let pendingModelFiles = [];
let pendingModelFile = null;

function loadTabs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.tabs));

    if (!Array.isArray(saved) || !saved.length) {
      return structuredClone(defaultTabs);
    }

    return saved.map(tab => ({
      ...tab,
      folders: Array.isArray(tab.folders)
        ? tab.folders.map(folder => ({
            ...folder,
            isOpen: typeof folder.isOpen === "boolean" ? folder.isOpen : false,
            animations: Array.isArray(folder.animations) ? folder.animations : [],
            images: Array.isArray(folder.images) ? folder.images : [],
            models: Array.isArray(folder.models) ? folder.models : []
          }))
        : []
    }));
  } catch {
    return structuredClone(defaultTabs);
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEYS.tabs, JSON.stringify(tabs));
    localStorage.setItem(STORAGE_KEYS.activeView, activeView);
    return true;
  } catch {
    window.alert("Browser storage is full. Delete a large image or model file, then try again.");
    return false;
  }
}

function setLoggedIn(value) {
  loginView.classList.toggle("hidden", value);
  dashboardView.classList.toggle("hidden", !value);

  if (value) {
    dashboardView.classList.remove("dashboard-enter");
    void dashboardView.offsetWidth;
    dashboardView.classList.add("dashboard-enter");
    renderNavigation();
  } else {
    usernameInput.value = "";
    passwordInput.value = "";
    passwordInput.type = "password";
    togglePassword.textContent = "Show";
    loginError.textContent = "";
    usernameInput.focus();
  }
}

function makeId(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";

  return `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getActiveTab() {
  if (!activeView.startsWith("tab:")) return tabs[0];
  const id = activeView.slice(4);
  return tabs.find(tab => tab.id === id) || tabs[0];
}

function getFolder(folderId) {
  return getActiveTab().folders.find(folder => folder.id === folderId);
}

function normalizedFolderName(folder) {
  return folder.name.trim().toLowerCase().replace(/\s+/g, " ");
}

function isAnimationsFolder(folder) {
  return normalizedFolderName(folder) === "animations";
}

function isImageFolder(folder) {
  const name = normalizedFolderName(folder);
  return ["images", "icons", "images / icons", "images/icons"].includes(name);
}

function isModelsFolder(folder) {
  return normalizedFolderName(folder) === "models";
}

function renderNavigation() {
  sidebarTabs.innerHTML = "";

  sidebarTabs.appendChild(createNavigationButton({
    label: "Dashboard",
    mark: "⌂",
    active: activeView === "main",
    onClick: () => switchView("main")
  }));

  sidebarTabs.appendChild(createNavigationButton({
    label: "Global Websites",
    mark: "◎",
    active: activeView === "websites",
    onClick: () => switchView("websites")
  }));

  tabs.forEach((tab, index) => {
    sidebarTabs.appendChild(createNavigationButton({
      label: tab.name,
      mark: String(index + 1).padStart(2, "0"),
      active: activeView === `tab:${tab.id}`,
      onClick: () => switchView(`tab:${tab.id}`)
    }));
  });

  renderCurrentView();
  saveData();
}

function createNavigationButton({ label, mark, active, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `tab-button${active ? " active" : ""}`;
  button.innerHTML = `
    <span class="tab-mark">${escapeHtml(mark)}</span>
    <span class="tab-name">${escapeHtml(label)}</span>
    <span class="tab-arrow" aria-hidden="true">›</span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function switchView(nextView) {
  if (activeView === nextView) return;
  activeView = nextView;
  renderNavigation();
  animateContentRefresh();
}

function renderCurrentView() {
  const isCustomTab = activeView.startsWith("tab:");

  addFolderButton.classList.toggle("hidden", !isCustomTab);
  deleteTabButton.classList.toggle("hidden", !isCustomTab);

  if (activeView === "main") {
    renderMainDashboard();
    return;
  }

  if (activeView === "websites") {
    renderGlobalWebsites();
    return;
  }

  renderCustomTab();
}

function renderMainDashboard() {
  const allFolders = tabs.flatMap(tab => tab.folders);
  const imageCount = allFolders.reduce((total, folder) => total + folder.images.length, 0);
  const modelCount = allFolders.reduce((total, folder) => total + folder.models.length, 0);
  const animationCount = allFolders.reduce((total, folder) => total + folder.animations.length, 0);

  pageTitle.textContent = "Dashboard";
  pageSubtitle.textContent = "Your main Varsity Studios workspace.";
  contentTitle.textContent = "Overview";

  tabContent.innerHTML = `
    <div class="main-dashboard">
      <section class="welcome-panel">
        <div>
          <span class="dashboard-kicker">VARSITY STUDIOS OWNER</span>
          <h3>Welcome back, ykdrxc.</h3>
          <p>Keep your game assets, Roblox animations, model files, images, icons, and useful websites organized in one place.</p>
        </div>
        <img src="assets/varsity-logo.png" alt="Varsity Studios logo" />
      </section>

      <section class="dashboard-stat-grid">
        ${renderStatCard("Custom tabs", tabs.length, "Organized workspaces")}
        ${renderStatCard("Folders", allFolders.length, "Across every tab")}
        ${renderStatCard("Animations", animationCount, "Saved Roblox IDs")}
        ${renderStatCard("Media & models", imageCount + modelCount, `${imageCount} images • ${modelCount} models`)}
      </section>

      <section class="dashboard-section">
        <div class="dashboard-section-heading">
          <div>
            <span class="dashboard-kicker">QUICK ACCESS</span>
            <h3>Workspace shortcuts</h3>
          </div>
        </div>
        <div class="quick-action-grid">
          <button class="quick-action" type="button" data-go-view="websites">
            <span class="quick-action-icon">◎</span>
            <strong>Global Websites</strong>
            <small>Open MiaPrep, YouTube, and Roblox Dashboard.</small>
          </button>
          <button class="quick-action" type="button" data-create-tab="true">
            <span class="quick-action-icon">＋</span>
            <strong>Create a tab</strong>
            <small>Start another organized workspace.</small>
          </button>
          ${tabs.slice(0, 2).map(tab => `
            <button class="quick-action" type="button" data-go-view="tab:${tab.id}">
              <span class="quick-action-icon">V</span>
              <strong>${escapeHtml(tab.name)}</strong>
              <small>${escapeHtml(tab.description || "Open this workspace.")}</small>
            </button>
          `).join("")}
        </div>
      </section>
    </div>
  `;

  tabContent.querySelectorAll("[data-go-view]").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.goView));
  });

  const createTabShortcut = tabContent.querySelector("[data-create-tab]");
  createTabShortcut?.addEventListener("click", openTabDialog);
}

function renderStatCard(label, value, detail) {
  return `
    <article class="dashboard-stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderGlobalWebsites() {
  pageTitle.textContent = "Global Websites";
  pageSubtitle.textContent = "Useful websites for school, media, and Roblox development.";
  contentTitle.textContent = "Website Links";

  tabContent.innerHTML = `
    <div class="global-websites-view">
      <div class="websites-intro">
        <span class="dashboard-kicker">GLOBAL SHORTCUTS</span>
        <h3>Open your important websites</h3>
        <p>Each link opens in a new browser tab.</p>
      </div>

      <div class="website-card-grid">
        ${GLOBAL_LINKS.map(link => `
          <a class="website-link-card" href="${escapeAttribute(link.url)}" target="_blank" rel="noopener noreferrer">
            <span class="website-link-icon">${escapeHtml(link.icon)}</span>
            <span class="website-link-copy">
              <strong>${escapeHtml(link.name)}</strong>
              <small>${escapeHtml(link.description)}</small>
              <em>${escapeHtml(link.url)}</em>
            </span>
            <span class="website-open-arrow">↗</span>
          </a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCustomTab() {
  const activeTab = getActiveTab();

  pageTitle.textContent = activeTab.name;
  pageSubtitle.textContent = activeTab.description || "Custom Varsity Studios dashboard tab.";
  contentTitle.textContent = activeTab.name;

  deleteTabButton.disabled = tabs.length === 1;
  deleteTabButton.classList.toggle("disabled-button", tabs.length === 1);
  deleteTabButton.title = tabs.length === 1 ? "You must keep at least one custom tab." : "";

  renderFolders(activeTab);
}

function renderAnimationsSection(folder) {
  return `
    <section class="animations-section">
      <div class="animations-heading">
        <div>
          <span class="animations-kicker">ROBLOX ASSETS</span>
          <h4>Saved animations</h4>
        </div>
        <button class="add-animation-button" type="button" data-folder-id="${folder.id}">
          <span>+</span> Add animation
        </button>
      </div>

      ${folder.animations.length ? `
        <div class="animation-list">
          ${folder.animations.map((animation, index) => `
            <article class="animation-item" style="--animation-index:${index}">
              <div class="animation-number">${String(index + 1).padStart(2, "0")}</div>
              <div class="animation-information">
                <strong>${escapeHtml(animation.name)}</strong>
                <span>rbxassetid://${escapeHtml(animation.animationId)}</span>
              </div>
              <button class="delete-animation-button" type="button"
                data-folder-id="${folder.id}" data-animation-id="${animation.id}">Delete</button>
            </article>
          `).join("")}
        </div>
      ` : `
        <div class="animations-empty">
          <span>No animations saved yet.</span>
          <small>Add an animation name and Roblox animation ID.</small>
        </div>
      `}
    </section>
  `;
}

function renderImagesSection(folder) {
  return `
    <section class="images-section">
      <div class="images-heading">
        <div>
          <span class="images-kicker">MEDIA LIBRARY</span>
          <h4>Saved images and icons</h4>
        </div>
        <button class="upload-image-button" type="button" data-folder-id="${folder.id}">
          <span>+</span> Upload images
        </button>
      </div>

      <p class="image-upload-note">PNG, JPG, WebP, GIF, or SVG. Maximum 2.5 MB per image.</p>

      ${folder.images.length ? `
        <div class="image-library-grid">
          ${folder.images.map((image, index) => `
            <article class="saved-image-card" style="--image-index:${index}">
              <button class="image-preview-button" type="button"
                data-image-src="${escapeAttribute(image.dataUrl)}"
                aria-label="Preview ${escapeAttribute(image.name)}">
                <img src="${escapeAttribute(image.dataUrl)}" alt="${escapeAttribute(image.name)}" />
              </button>

              <div class="saved-image-info">
                <strong title="${escapeAttribute(image.name)}">${escapeHtml(image.name)}</strong>
                <span>${formatFileSize(image.size)}</span>
              </div>

              <div class="saved-file-actions">
                <button class="download-image-button" type="button"
                  data-folder-id="${folder.id}" data-image-id="${image.id}">Download</button>
                <button class="delete-image-button" type="button"
                  data-folder-id="${folder.id}" data-image-id="${image.id}">Delete</button>
              </div>
            </article>
          `).join("")}
        </div>
      ` : `
        <div class="images-empty">
          <span>No images or icons uploaded yet.</span>
          <small>Upload files from your computer and they will save in this browser.</small>
        </div>
      `}
    </section>
  `;
}

function renderModelsSection(folder) {
  return `
    <section class="models-section">
      <div class="models-heading">
        <div>
          <span class="models-kicker">FILE STORAGE</span>
          <h4>Saved model files</h4>
        </div>
        <button class="upload-model-button" type="button" data-folder-id="${folder.id}">
          <span>+</span> Upload model
        </button>
      </div>

      <p class="model-upload-note">Upload RBXM, RBXL, OBJ, FBX, BLEND, ZIP, or another file type. Maximum 4 MB per file.</p>

      ${folder.models.length ? `
        <div class="model-list">
          ${folder.models.map((model, index) => `
            <article class="model-item" style="--model-index:${index}">
              <div class="model-file-icon">${escapeHtml(fileExtension(model.fileName))}</div>
              <div class="model-information">
                <strong>${escapeHtml(model.name)}</strong>
                <p>${escapeHtml(model.description)}</p>
                <span>${escapeHtml(model.fileName)} • ${formatFileSize(model.size)}</span>
              </div>
              <div class="model-actions">
                <button class="download-model-button" type="button"
                  data-folder-id="${folder.id}" data-model-id="${model.id}">Download</button>
                <button class="delete-model-button" type="button"
                  data-folder-id="${folder.id}" data-model-id="${model.id}">Delete</button>
              </div>
            </article>
          `).join("")}
        </div>
      ` : `
        <div class="models-empty">
          <span>No model files uploaded yet.</span>
          <small>Upload a file, give it a name, and write a description.</small>
        </div>
      `}
    </section>
  `;
}

function renderFolders(activeTab) {
  if (!activeTab.folders.length) {
    tabContent.innerHTML = `
      <div class="empty-state animated-empty">
        <div class="empty-icon">V</div>
        <h3>${escapeHtml(activeTab.name)}</h3>
        <p>${escapeHtml(activeTab.description || "This tab is ready for folders.")}</p>
        <p class="empty-hint">Select <strong>+ Add folder</strong> to start organizing this tab.</p>
      </div>
    `;
    return;
  }

  tabContent.innerHTML = `
    <div class="folder-grid">
      ${activeTab.folders.map((folder, index) => `
        <article class="folder-card ${folder.isOpen ? "open" : ""}" style="--folder-index:${index}">
          <button class="folder-main" type="button" data-folder-id="${folder.id}" aria-expanded="${folder.isOpen}">
            <span class="folder-visual" aria-hidden="true">
              <span class="folder-tab-shape"></span>
              <span class="folder-symbol">V</span>
            </span>
            <span class="folder-summary">
              <span class="folder-name">${escapeHtml(folder.name)}</span>
              <span class="folder-status">${folder.isOpen ? "Folder open" : "Click to open folder"}</span>
            </span>
            <span class="folder-chevron" aria-hidden="true">⌄</span>
          </button>

          <div class="folder-panel">
            <div class="folder-panel-inner">
              <div class="folder-description-label">DESCRIPTION</div>
              <p>${escapeHtml(folder.description)}</p>

              ${isAnimationsFolder(folder) ? renderAnimationsSection(folder) : ""}
              ${isImageFolder(folder) ? renderImagesSection(folder) : ""}
              ${isModelsFolder(folder) ? renderModelsSection(folder) : ""}

              <div class="folder-bottom-actions">
                <span class="folder-location">${escapeHtml(activeTab.name)} / ${escapeHtml(folder.name)}</span>
                <button class="folder-delete" type="button" data-folder-id="${folder.id}">Delete folder</button>
              </div>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  bindFolderEvents();
}

function bindFolderEvents() {
  tabContent.querySelectorAll(".folder-main").forEach(button => {
    button.addEventListener("click", () => toggleFolder(button.dataset.folderId));
  });

  tabContent.querySelectorAll(".folder-delete").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      deleteFolder(button.dataset.folderId);
    });
  });

  tabContent.querySelectorAll(".add-animation-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      openAnimationDialog(button.dataset.folderId);
    });
  });

  tabContent.querySelectorAll(".delete-animation-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      deleteAnimation(button.dataset.folderId, button.dataset.animationId);
    });
  });

  tabContent.querySelectorAll(".upload-image-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      activeImageFolderId = button.dataset.folderId;
      imageUploadInput.value = "";
      imageUploadInput.click();
    });
  });

  tabContent.querySelectorAll(".image-preview-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      window.open(button.dataset.imageSrc, "_blank", "noopener,noreferrer");
    });
  });

  tabContent.querySelectorAll(".download-image-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      downloadImage(button.dataset.folderId, button.dataset.imageId);
    });
  });

  tabContent.querySelectorAll(".delete-image-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      deleteImage(button.dataset.folderId, button.dataset.imageId);
    });
  });

  tabContent.querySelectorAll(".upload-model-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      activeModelFolderId = button.dataset.folderId;
      modelUploadInput.value = "";
      modelUploadInput.click();
    });
  });

  tabContent.querySelectorAll(".download-model-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      downloadModel(button.dataset.folderId, button.dataset.modelId);
    });
  });

  tabContent.querySelectorAll(".delete-model-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      deleteModel(button.dataset.folderId, button.dataset.modelId);
    });
  });
}

function toggleFolder(folderId) {
  const folder = getFolder(folderId);
  if (!folder) return;
  folder.isOpen = !folder.isOpen;
  saveData();
  renderFolders(getActiveTab());
}

function deleteFolder(folderId) {
  const tab = getActiveTab();
  const folder = tab.folders.find(item => item.id === folderId);
  if (!folder || !window.confirm(`Delete the "${folder.name}" folder?`)) return;
  tab.folders = tab.folders.filter(item => item.id !== folderId);
  saveData();
  renderFolders(tab);
}

function openAnimationDialog(folderId) {
  const folder = getFolder(folderId);
  if (!folder || !isAnimationsFolder(folder)) return;
  activeAnimationFolderId = folderId;
  animationName.value = "";
  animationId.value = "";
  animationError.textContent = "";
  animationDialog.showModal();
  setTimeout(() => animationName.focus(), 0);
}

function normalizeAnimationId(value) {
  return value.trim().replace(/^rbxassetid:\/\//i, "").replace(/\D/g, "");
}

function deleteAnimation(folderId, savedId) {
  const folder = getFolder(folderId);
  const animation = folder?.animations.find(item => item.id === savedId);
  if (!animation || !window.confirm(`Delete the "${animation.name}" animation?`)) return;
  folder.animations = folder.animations.filter(item => item.id !== savedId);
  saveData();
  renderFolders(getActiveTab());
}

async function handleImageUpload(files) {
  const folder = getFolder(activeImageFolderId);
  activeImageFolderId = null;
  if (!folder || !isImageFolder(folder) || !files.length) return;

  const remaining = MAX_IMAGES_PER_FOLDER - folder.images.length;
  if (remaining <= 0) {
    window.alert(`This folder already has ${MAX_IMAGES_PER_FOLDER} images.`);
    return;
  }

  const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
  const rejected = [];
  const additions = [];

  for (const file of Array.from(files).slice(0, remaining)) {
    if (!validTypes.includes(file.type)) {
      rejected.push(`${file.name} is not a supported image.`);
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      rejected.push(`${file.name} is larger than 2.5 MB.`);
      continue;
    }
    additions.push({
      id: makeId(file.name),
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: await readFileAsDataUrl(file)
    });
  }

  const before = [...folder.images];
  folder.images.push(...additions);
  folder.isOpen = true;
  if (!saveData()) folder.images = before;
  renderFolders(getActiveTab());

  if (rejected.length) window.alert(rejected.join("\n"));
}

function downloadImage(folderId, imageId) {
  const image = getFolder(folderId)?.images.find(item => item.id === imageId);
  if (!image) return;
  triggerDownload(image.dataUrl, image.name);
}

function deleteImage(folderId, imageId) {
  const folder = getFolder(folderId);
  const image = folder?.images.find(item => item.id === imageId);
  if (!image || !window.confirm(`Delete "${image.name}"?`)) return;
  folder.images = folder.images.filter(item => item.id !== imageId);
  saveData();
  renderFolders(getActiveTab());
}

function openNextModelDialog() {
  pendingModelFile = pendingModelFiles.shift() || null;

  if (!pendingModelFile) {
    activeModelFolderId = null;
    return;
  }

  selectedModelFileName.textContent = pendingModelFile.name;
  modelName.value = pendingModelFile.name.replace(/\.[^.]+$/, "");
  modelDescription.value = "";
  modelError.textContent = "";
  modelDialog.showModal();
  setTimeout(() => modelName.focus(), 0);
}

async function savePendingModel() {
  const folder = getFolder(activeModelFolderId);
  const name = modelName.value.trim();
  const description = modelDescription.value.trim();

  if (!folder || !pendingModelFile) {
    modelError.textContent = "The selected file could not be found.";
    return;
  }
  if (!name) {
    modelError.textContent = "Enter a model name.";
    modelName.focus();
    return;
  }
  if (!description) {
    modelError.textContent = "Enter a model description.";
    modelDescription.focus();
    return;
  }

  const dataUrl = await readFileAsDataUrl(pendingModelFile);
  const before = [...folder.models];

  folder.models.push({
    id: makeId(name),
    name,
    description,
    fileName: pendingModelFile.name,
    size: pendingModelFile.size,
    type: pendingModelFile.type || "application/octet-stream",
    dataUrl
  });
  folder.isOpen = true;

  if (!saveData()) {
    folder.models = before;
    return;
  }

  modelDialog.close();
  renderFolders(getActiveTab());
  openNextModelDialog();
}

function downloadModel(folderId, modelId) {
  const model = getFolder(folderId)?.models.find(item => item.id === modelId);
  if (!model) return;
  triggerDownload(model.dataUrl, model.fileName);
}

function deleteModel(folderId, modelId) {
  const folder = getFolder(folderId);
  const model = folder?.models.find(item => item.id === modelId);
  if (!model || !window.confirm(`Delete the "${model.name}" model?`)) return;
  folder.models = folder.models.filter(item => item.id !== modelId);
  saveData();
  renderFolders(getActiveTab());
}

function triggerDownload(dataUrl, fileName) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(fileName) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "FILE";
  return extension.slice(0, 5).toUpperCase();
}

function animateContentRefresh() {
  const shell = document.querySelector(".content-shell");
  shell.classList.remove("content-refresh");
  void shell.offsetWidth;
  shell.classList.add("content-refresh");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function openTabDialog() {
  tabName.value = "";
  tabDescription.value = "";
  tabDialog.showModal();
  setTimeout(() => tabName.focus(), 0);
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();

  if (usernameInput.value.trim() !== VALID_USERNAME || passwordInput.value !== VALID_PASSWORD) {
    loginError.textContent = "Incorrect username or password.";
    loginForm.classList.remove("login-shake");
    void loginForm.offsetWidth;
    loginForm.classList.add("login-shake");
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  loginError.textContent = "";
  setLoggedIn(true);
});

togglePassword.addEventListener("click", () => {
  const hidden = passwordInput.type === "password";
  passwordInput.type = hidden ? "text" : "password";
  togglePassword.textContent = hidden ? "Hide" : "Show";
});

logoutButton.addEventListener("click", () => setLoggedIn(false));
addTabButton.addEventListener("click", openTabDialog);

tabForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = tabName.value.trim();
  const description = tabDescription.value.trim();
  if (!name) return tabName.focus();

  const newTab = {
    id: makeId(name),
    name,
    description: description || `${name} workspace for Varsity Studios.`,
    folders: []
  };

  tabs.push(newTab);
  activeView = `tab:${newTab.id}`;
  saveData();
  tabDialog.close();
  renderNavigation();
  animateContentRefresh();
});

deleteTabButton.addEventListener("click", () => {
  if (tabs.length === 1) return;
  const tab = getActiveTab();
  if (!window.confirm(`Delete the "${tab.name}" tab and everything inside it?`)) return;
  tabs = tabs.filter(item => item.id !== tab.id);
  activeView = `tab:${tabs[0].id}`;
  saveData();
  renderNavigation();
});

addFolderButton.addEventListener("click", () => {
  folderName.value = "";
  folderDescription.value = "";
  folderDialog.showModal();
  setTimeout(() => folderName.focus(), 0);
});

folderForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = folderName.value.trim();
  const description = folderDescription.value.trim();
  if (!name) return folderName.focus();
  if (!description) return folderDescription.focus();

  getActiveTab().folders.push({
    id: makeId(name),
    name,
    description,
    isOpen: false,
    animations: [],
    images: [],
    models: []
  });

  saveData();
  folderDialog.close();
  renderFolders(getActiveTab());
});

animationForm.addEventListener("submit", event => {
  event.preventDefault();
  const folder = getFolder(activeAnimationFolderId);
  const name = animationName.value.trim();
  const id = normalizeAnimationId(animationId.value);

  if (!name) {
    animationError.textContent = "Enter an animation name.";
    return animationName.focus();
  }
  if (!id) {
    animationError.textContent = "Enter a valid numeric Roblox animation ID.";
    return animationId.focus();
  }
  if (!folder || !isAnimationsFolder(folder)) {
    animationError.textContent = "Animations folder not found.";
    return;
  }
  if (folder.animations.some(item => item.animationId === id)) {
    animationError.textContent = "That animation ID is already saved.";
    return;
  }

  folder.animations.push({ id: makeId(name), name, animationId: id });
  folder.isOpen = true;
  saveData();
  animationDialog.close();
  activeAnimationFolderId = null;
  renderFolders(getActiveTab());
});

imageUploadInput.addEventListener("change", async event => {
  try {
    await handleImageUpload(event.target.files);
  } catch {
    window.alert("One or more images could not be uploaded.");
  } finally {
    imageUploadInput.value = "";
  }
});

modelUploadInput.addEventListener("change", event => {
  const folder = getFolder(activeModelFolderId);
  if (!folder || !isModelsFolder(folder)) return;

  const remaining = MAX_MODELS_PER_FOLDER - folder.models.length;
  const files = Array.from(event.target.files).slice(0, remaining);
  const rejected = files.filter(file => file.size > MAX_MODEL_SIZE);
  pendingModelFiles = files.filter(file => file.size <= MAX_MODEL_SIZE);

  if (rejected.length) {
    window.alert(rejected.map(file => `${file.name} is larger than 4 MB.`).join("\n"));
  }

  modelUploadInput.value = "";
  openNextModelDialog();
});

modelForm.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await savePendingModel();
  } catch {
    modelError.textContent = "The model file could not be saved.";
  }
});

closeDialogButton.addEventListener("click", () => tabDialog.close());
cancelDialogButton.addEventListener("click", () => tabDialog.close());
closeFolderDialogButton.addEventListener("click", () => folderDialog.close());
cancelFolderDialogButton.addEventListener("click", () => folderDialog.close());

closeAnimationDialogButton.addEventListener("click", () => {
  activeAnimationFolderId = null;
  animationDialog.close();
});
cancelAnimationDialogButton.addEventListener("click", () => {
  activeAnimationFolderId = null;
  animationDialog.close();
});

function cancelModelUpload() {
  pendingModelFiles = [];
  pendingModelFile = null;
  activeModelFolderId = null;
  modelDialog.close();
}

closeModelDialogButton.addEventListener("click", cancelModelUpload);
cancelModelDialogButton.addEventListener("click", cancelModelUpload);

// Require login after every page open or refresh.
setLoggedIn(false);


/* Dedicated folder workspace upgrade */
const editItemDialog = document.getElementById("editItemDialog");
const editItemForm = document.getElementById("editItemForm");
const editItemKicker = document.getElementById("editItemKicker");
const editItemTitle = document.getElementById("editItemTitle");
const editPrimaryLabel = document.getElementById("editPrimaryLabel");
const editPrimaryInput = document.getElementById("editPrimaryInput");
const editSecondaryField = document.getElementById("editSecondaryField");
const editSecondaryLabel = document.getElementById("editSecondaryLabel");
const editSecondaryInput = document.getElementById("editSecondaryInput");
const editItemError = document.getElementById("editItemError");
const closeEditItemDialogButton = document.getElementById("closeEditItemDialogButton");
const cancelEditItemDialogButton = document.getElementById("cancelEditItemDialogButton");

let editContext = null;

function parseFolderView() {
  if (!activeView.startsWith("folder:")) return null;

  const parts = activeView.split(":");
  if (parts.length < 3) return null;

  return {
    tabId: parts[1],
    folderId: parts.slice(2).join(":")
  };
}

function getActiveTab() {
  const folderView = parseFolderView();

  if (folderView) {
    return tabs.find(tab => tab.id === folderView.tabId) || tabs[0];
  }

  if (activeView.startsWith("tab:")) {
    const id = activeView.slice(4);
    return tabs.find(tab => tab.id === id) || tabs[0];
  }

  return tabs[0];
}

function getFolder(folderId) {
  const tab = getActiveTab();
  return tab?.folders.find(folder => folder.id === folderId);
}

function getCurrentFolder() {
  const folderView = parseFolderView();
  if (!folderView) return null;

  const tab = tabs.find(item => item.id === folderView.tabId);
  return tab?.folders.find(folder => folder.id === folderView.folderId) || null;
}

function renderNavigation() {
  sidebarTabs.innerHTML = "";

  sidebarTabs.appendChild(createNavigationButton({
    label: "Dashboard",
    mark: "⌂",
    active: activeView === "main",
    onClick: () => switchView("main")
  }));

  sidebarTabs.appendChild(createNavigationButton({
    label: "Global Websites",
    mark: "◎",
    active: activeView === "websites",
    onClick: () => switchView("websites")
  }));

  const folderView = parseFolderView();

  tabs.forEach((tab, index) => {
    const tabIsActive =
      activeView === `tab:${tab.id}` ||
      folderView?.tabId === tab.id;

    sidebarTabs.appendChild(createNavigationButton({
      label: tab.name,
      mark: String(index + 1).padStart(2, "0"),
      active: tabIsActive,
      onClick: () => switchView(`tab:${tab.id}`)
    }));
  });

  renderCurrentView();
  saveData();
}

function renderCurrentView() {
  const isCustomTab = activeView.startsWith("tab:");
  const isFolderWorkspace = activeView.startsWith("folder:");

  addFolderButton.classList.toggle("hidden", !isCustomTab);
  deleteTabButton.classList.toggle("hidden", !isCustomTab);

  if (activeView === "main") {
    renderMainDashboard();
    return;
  }

  if (activeView === "websites") {
    renderGlobalWebsites();
    return;
  }

  if (isFolderWorkspace) {
    renderFolderWorkspace();
    return;
  }

  renderCustomTab();
}

function renderFolders(activeTab) {
  if (!activeTab.folders.length) {
    tabContent.innerHTML = `
      <div class="empty-state animated-empty">
        <div class="empty-icon">V</div>
        <h3>${escapeHtml(activeTab.name)}</h3>
        <p>${escapeHtml(activeTab.description || "This tab is ready for folders.")}</p>
        <p class="empty-hint">Select <strong>+ Add folder</strong> to start organizing this category.</p>
      </div>
    `;
    return;
  }

  tabContent.innerHTML = `
    <div class="folder-grid folder-category-grid">
      ${activeTab.folders.map((folder, index) => `
        <button
          class="folder-card folder-launch-card"
          type="button"
          data-open-folder="${folder.id}"
          style="--folder-index:${index}"
        >
          <span class="folder-launch-top">
            <span class="folder-visual" aria-hidden="true">
              <span class="folder-tab-shape"></span>
              <span class="folder-symbol">V</span>
            </span>
            <span class="folder-launch-arrow">→</span>
          </span>

          <span class="folder-launch-copy">
            <strong>${escapeHtml(folder.name)}</strong>
            <span>${escapeHtml(folder.description)}</span>
          </span>

          <span class="folder-item-count">
            ${getFolderItemCount(folder)} ${getFolderItemCount(folder) === 1 ? "item" : "items"}
          </span>
        </button>
      `).join("")}
    </div>
  `;

  tabContent.querySelectorAll("[data-open-folder]").forEach(button => {
    button.addEventListener("click", () => {
      activeView = `folder:${activeTab.id}:${button.dataset.openFolder}`;
      renderNavigation();
      animateContentRefresh();
    });
  });
}

function getFolderItemCount(folder) {
  if (isAnimationsFolder(folder)) return folder.animations.length;
  if (isImageFolder(folder)) return folder.images.length;
  if (isModelsFolder(folder)) return folder.models.length;
  return 0;
}

function renderFolderWorkspace() {
  const folderView = parseFolderView();
  const tab = tabs.find(item => item.id === folderView?.tabId);
  const folder = tab?.folders.find(item => item.id === folderView?.folderId);

  if (!tab || !folder) {
    activeView = tab ? `tab:${tab.id}` : "main";
    renderNavigation();
    return;
  }

  pageTitle.textContent = folder.name;
  pageSubtitle.textContent = folder.description;
  contentTitle.textContent = folder.name;

  tabContent.innerHTML = `
    <div class="folder-workspace">
      <div class="folder-workspace-toolbar">
        <button id="folderBackButton" class="workspace-back-button" type="button">
          <span>←</span> Back to ${escapeHtml(tab.name)}
        </button>

        <div class="workspace-toolbar-actions">
          <button id="editFolderButton" class="secondary-button" type="button">Edit folder</button>
          ${renderFolderAddButton(folder)}
          <button id="workspaceDeleteFolderButton" class="danger-button" type="button">Delete folder</button>
        </div>
      </div>

      <section class="folder-workspace-hero">
        <div class="workspace-folder-icon">
          <span class="workspace-folder-tab"></span>
          V
        </div>
        <div>
          <span class="dashboard-kicker">${escapeHtml(getFolderTypeLabel(folder))}</span>
          <h3>${escapeHtml(folder.name)}</h3>
          <p>${escapeHtml(folder.description)}</p>
        </div>
        <div class="workspace-count">
          <strong>${getFolderItemCount(folder)}</strong>
          <span>${getFolderItemCount(folder) === 1 ? "ITEM" : "ITEMS"}</span>
        </div>
      </section>

      <section class="workspace-list-section">
        <div class="workspace-list-heading">
          <div>
            <span class="dashboard-kicker">FOLDER CONTENTS</span>
            <h3>All items</h3>
          </div>
        </div>
        ${renderDedicatedFolderList(folder)}
      </section>
    </div>
  `;

  document.getElementById("folderBackButton").addEventListener("click", () => {
    activeView = `tab:${tab.id}`;
    renderNavigation();
    animateContentRefresh();
  });

  document.getElementById("editFolderButton").addEventListener("click", () => {
    openEditDialog({
      type: "folder",
      folderId: folder.id,
      kicker: "EDIT FOLDER",
      title: "Edit folder",
      primaryLabel: "Folder name",
      primaryValue: folder.name,
      secondaryLabel: "Folder description",
      secondaryValue: folder.description
    });
  });

  document.getElementById("workspaceDeleteFolderButton").addEventListener("click", () => {
    if (!window.confirm(`Delete the "${folder.name}" folder and everything inside it?`)) return;

    tab.folders = tab.folders.filter(item => item.id !== folder.id);
    activeView = `tab:${tab.id}`;
    saveData();
    renderNavigation();
  });

  bindDedicatedFolderEvents(folder);
}

function getFolderTypeLabel(folder) {
  if (isAnimationsFolder(folder)) return "ROBLOX ANIMATIONS";
  if (isImageFolder(folder)) return "IMAGES & ICONS";
  if (isModelsFolder(folder)) return "MODEL FILES";
  return "GENERAL FOLDER";
}

function renderFolderAddButton(folder) {
  if (isAnimationsFolder(folder)) {
    return `<button id="workspaceAddAnimationButton" class="primary-button compact" type="button">+ Add animation</button>`;
  }

  if (isImageFolder(folder)) {
    return `<button id="workspaceUploadImageButton" class="primary-button compact" type="button">+ Upload images</button>`;
  }

  if (isModelsFolder(folder)) {
    return `<button id="workspaceUploadModelButton" class="primary-button compact" type="button">+ Upload model</button>`;
  }

  return "";
}

function renderDedicatedFolderList(folder) {
  if (isAnimationsFolder(folder)) {
    if (!folder.animations.length) return renderWorkspaceEmpty("No animations saved yet.", "Add an animation name and Roblox animation ID.");

    return `
      <div class="workspace-item-list">
        ${folder.animations.map((animation, index) => `
          <article class="workspace-list-item">
            <div class="workspace-item-index">${String(index + 1).padStart(2, "0")}</div>
            <div class="workspace-item-main">
              <strong>${escapeHtml(animation.name)}</strong>
              <span class="workspace-code">rbxassetid://${escapeHtml(animation.animationId)}</span>
            </div>
            <div class="workspace-item-actions">
              <button class="workspace-edit-button" type="button" data-edit-animation="${animation.id}">Edit</button>
              <button class="workspace-delete-button" type="button" data-delete-animation="${animation.id}">Delete</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  if (isImageFolder(folder)) {
    if (!folder.images.length) return renderWorkspaceEmpty("No images or icons uploaded yet.", "Upload a file from your computer to add it here.");

    return `
      <div class="workspace-media-list">
        ${folder.images.map(image => `
          <article class="workspace-media-item">
            <button class="workspace-media-preview" type="button" data-preview-image="${escapeAttribute(image.dataUrl)}">
              <img src="${escapeAttribute(image.dataUrl)}" alt="${escapeAttribute(image.name)}" />
            </button>
            <div class="workspace-item-main">
              <strong>${escapeHtml(image.name)}</strong>
              <span>${formatFileSize(image.size)} • ${escapeHtml(image.type || "Image")}</span>
            </div>
            <div class="workspace-item-actions">
              <button class="workspace-edit-button" type="button" data-edit-image="${image.id}">Rename</button>
              <button class="workspace-download-button" type="button" data-download-image="${image.id}">Download</button>
              <button class="workspace-delete-button" type="button" data-delete-image="${image.id}">Delete</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  if (isModelsFolder(folder)) {
    if (!folder.models.length) return renderWorkspaceEmpty("No model files uploaded yet.", "Upload a model file, then give it a name and description.");

    return `
      <div class="workspace-item-list">
        ${folder.models.map(model => `
          <article class="workspace-list-item workspace-model-row">
            <div class="model-file-icon">${escapeHtml(fileExtension(model.fileName))}</div>
            <div class="workspace-item-main">
              <strong>${escapeHtml(model.name)}</strong>
              <p>${escapeHtml(model.description)}</p>
              <span>${escapeHtml(model.fileName)} • ${formatFileSize(model.size)}</span>
            </div>
            <div class="workspace-item-actions">
              <button class="workspace-edit-button" type="button" data-edit-model="${model.id}">Edit</button>
              <button class="workspace-download-button" type="button" data-download-model="${model.id}">Download</button>
              <button class="workspace-delete-button" type="button" data-delete-model="${model.id}">Delete</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  return renderWorkspaceEmpty(
    "This folder is empty.",
    "Rename it to Animations, Images / Icons, or Models to unlock special tools."
  );
}

function renderWorkspaceEmpty(title, description) {
  return `
    <div class="workspace-empty">
      <div class="workspace-empty-icon">V</div>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(description)}</span>
    </div>
  `;
}

function bindDedicatedFolderEvents(folder) {
  document.getElementById("workspaceAddAnimationButton")?.addEventListener("click", () => {
    openAnimationDialog(folder.id);
  });

  document.getElementById("workspaceUploadImageButton")?.addEventListener("click", () => {
    activeImageFolderId = folder.id;
    imageUploadInput.value = "";
    imageUploadInput.click();
  });

  document.getElementById("workspaceUploadModelButton")?.addEventListener("click", () => {
    activeModelFolderId = folder.id;
    modelUploadInput.value = "";
    modelUploadInput.click();
  });

  tabContent.querySelectorAll("[data-edit-animation]").forEach(button => {
    button.addEventListener("click", () => {
      const animation = folder.animations.find(item => item.id === button.dataset.editAnimation);
      if (!animation) return;

      openEditDialog({
        type: "animation",
        folderId: folder.id,
        itemId: animation.id,
        kicker: "EDIT ANIMATION",
        title: "Edit animation",
        primaryLabel: "Animation name",
        primaryValue: animation.name,
        secondaryLabel: "Roblox animation ID",
        secondaryValue: animation.animationId,
        secondaryMode: "input"
      });
    });
  });

  tabContent.querySelectorAll("[data-delete-animation]").forEach(button => {
    button.addEventListener("click", () => {
      deleteAnimation(folder.id, button.dataset.deleteAnimation);
      renderFolderWorkspace();
    });
  });

  tabContent.querySelectorAll("[data-edit-image]").forEach(button => {
    button.addEventListener("click", () => {
      const image = folder.images.find(item => item.id === button.dataset.editImage);
      if (!image) return;

      openEditDialog({
        type: "image",
        folderId: folder.id,
        itemId: image.id,
        kicker: "RENAME IMAGE",
        title: "Rename image",
        primaryLabel: "Image name",
        primaryValue: image.name,
        hideSecondary: true
      });
    });
  });

  tabContent.querySelectorAll("[data-preview-image]").forEach(button => {
    button.addEventListener("click", () => {
      window.open(button.dataset.previewImage, "_blank", "noopener,noreferrer");
    });
  });

  tabContent.querySelectorAll("[data-download-image]").forEach(button => {
    button.addEventListener("click", () => downloadImage(folder.id, button.dataset.downloadImage));
  });

  tabContent.querySelectorAll("[data-delete-image]").forEach(button => {
    button.addEventListener("click", () => {
      deleteImage(folder.id, button.dataset.deleteImage);
      renderFolderWorkspace();
    });
  });

  tabContent.querySelectorAll("[data-edit-model]").forEach(button => {
    button.addEventListener("click", () => {
      const model = folder.models.find(item => item.id === button.dataset.editModel);
      if (!model) return;

      openEditDialog({
        type: "model",
        folderId: folder.id,
        itemId: model.id,
        kicker: "EDIT MODEL",
        title: "Edit model details",
        primaryLabel: "Model name",
        primaryValue: model.name,
        secondaryLabel: "Model description",
        secondaryValue: model.description
      });
    });
  });

  tabContent.querySelectorAll("[data-download-model]").forEach(button => {
    button.addEventListener("click", () => downloadModel(folder.id, button.dataset.downloadModel));
  });

  tabContent.querySelectorAll("[data-delete-model]").forEach(button => {
    button.addEventListener("click", () => {
      deleteModel(folder.id, button.dataset.deleteModel);
      renderFolderWorkspace();
    });
  });
}

function openEditDialog(options) {
  editContext = options;
  editItemKicker.textContent = options.kicker;
  editItemTitle.textContent = options.title;
  editPrimaryLabel.textContent = options.primaryLabel;
  editPrimaryInput.value = options.primaryValue || "";
  editItemError.textContent = "";

  editSecondaryField.classList.toggle("hidden", Boolean(options.hideSecondary));

  if (!options.hideSecondary) {
    editSecondaryLabel.textContent = options.secondaryLabel || "Description";
    editSecondaryInput.value = options.secondaryValue || "";
  }

  editItemDialog.showModal();
  setTimeout(() => editPrimaryInput.focus(), 0);
}

function closeEditDialog() {
  editContext = null;
  editItemDialog.close();
}

editItemForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!editContext) return;

  const primary = editPrimaryInput.value.trim();
  const secondary = editSecondaryInput.value.trim();

  if (!primary) {
    editItemError.textContent = `${editContext.primaryLabel} is required.`;
    editPrimaryInput.focus();
    return;
  }

  const folder = getFolder(editContext.folderId);
  if (!folder) {
    editItemError.textContent = "The folder could not be found.";
    return;
  }

  if (editContext.type === "folder") {
    if (!secondary) {
      editItemError.textContent = "Folder description is required.";
      editSecondaryInput.focus();
      return;
    }

    folder.name = primary;
    folder.description = secondary;
  }

  if (editContext.type === "animation") {
    const cleanId = normalizeAnimationId(secondary);

    if (!cleanId) {
      editItemError.textContent = "Enter a valid numeric Roblox animation ID.";
      editSecondaryInput.focus();
      return;
    }

    const duplicate = folder.animations.some(item =>
      item.id !== editContext.itemId &&
      item.animationId === cleanId
    );

    if (duplicate) {
      editItemError.textContent = "That animation ID is already saved.";
      return;
    }

    const animation = folder.animations.find(item => item.id === editContext.itemId);
    if (animation) {
      animation.name = primary;
      animation.animationId = cleanId;
    }
  }

  if (editContext.type === "image") {
    const image = folder.images.find(item => item.id === editContext.itemId);
    if (image) image.name = primary;
  }

  if (editContext.type === "model") {
    if (!secondary) {
      editItemError.textContent = "Model description is required.";
      editSecondaryInput.focus();
      return;
    }

    const model = folder.models.find(item => item.id === editContext.itemId);
    if (model) {
      model.name = primary;
      model.description = secondary;
    }
  }

  saveData();
  closeEditDialog();
  renderNavigation();
});

closeEditItemDialogButton.addEventListener("click", closeEditDialog);
cancelEditItemDialogButton.addEventListener("click", closeEditDialog);


/* Settings and Developer Hub upgrade */
const SETTINGS_STORAGE_KEY = "varsityDashboardSettings";
const DEV_STORAGE_KEY = "varsityDashboardDeveloperData";

const COLORWAYS = {
  varsity: {
    name: "Varsity Red",
    red: "#e30613",
    bright: "#ff2635",
    dark: "#710008",
    glow: "rgba(189, 0, 13, 0.65)",
    top: "#5f0007",
    middle: "#1c0003"
  },
  blue: {
    name: "Stadium Blue",
    red: "#1769ff",
    bright: "#4b8cff",
    dark: "#0b347d",
    glow: "rgba(23, 105, 255, 0.55)",
    top: "#071f52",
    middle: "#061027"
  },
  purple: {
    name: "Night Purple",
    red: "#8d3dff",
    bright: "#ad72ff",
    dark: "#44117f",
    glow: "rgba(141, 61, 255, 0.52)",
    top: "#2b0a52",
    middle: "#130622"
  },
  green: {
    name: "Field Green",
    red: "#22a95a",
    bright: "#42d57d",
    dark: "#0b572b",
    glow: "rgba(34, 169, 90, 0.48)",
    top: "#07371c",
    middle: "#051a0e"
  },
  orange: {
    name: "Game Day Orange",
    red: "#ed6a18",
    bright: "#ff8b43",
    dark: "#7c3107",
    glow: "rgba(237, 106, 24, 0.50)",
    top: "#532005",
    middle: "#251003"
  }
};

const defaultSettings = {
  colorway: "varsity",
  density: "compact",
  motion: "full",
  corners: "rounded",
  backgroundGlow: true,
  showDescriptions: true
};

const defaultDeveloperData = {
  projects: [],
  tasks: [],
  ids: [],
  snippets: []
};

let dashboardSettings = loadDashboardSettings();
let developerData = loadDeveloperData();

function loadDashboardSettings() {
  try {
    return {
      ...defaultSettings,
      ...JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}")
    };
  } catch {
    return { ...defaultSettings };
  }
}

function saveDashboardSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(dashboardSettings));
}

function loadDeveloperData() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEV_STORAGE_KEY) || "{}");
    return {
      projects: Array.isArray(saved.projects) ? saved.projects : [],
      tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
      ids: Array.isArray(saved.ids) ? saved.ids : [],
      snippets: Array.isArray(saved.snippets) ? saved.snippets : []
    };
  } catch {
    return structuredClone(defaultDeveloperData);
  }
}

function saveDeveloperData() {
  localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(developerData));
}

function applyDashboardSettings() {
  const colorway = COLORWAYS[dashboardSettings.colorway] || COLORWAYS.varsity;
  const root = document.documentElement;

  root.style.setProperty("--red", colorway.red);
  root.style.setProperty("--red-bright", colorway.bright);
  root.style.setProperty("--red-dark", colorway.dark);
  root.style.setProperty("--theme-glow", colorway.glow);
  root.style.setProperty("--theme-top", colorway.top);
  root.style.setProperty("--theme-middle", colorway.middle);

  document.body.dataset.density = dashboardSettings.density;
  document.body.dataset.corners = dashboardSettings.corners;
  document.body.classList.toggle("reduced-dashboard-motion", dashboardSettings.motion === "reduced");
  document.body.classList.toggle("dashboard-glow-disabled", !dashboardSettings.backgroundGlow);
  document.body.classList.toggle("hide-folder-descriptions", !dashboardSettings.showDescriptions);
}

function renderNavigation() {
  sidebarTabs.innerHTML = "";

  sidebarTabs.appendChild(createNavigationButton({
    label: "Dashboard",
    mark: "⌂",
    active: activeView === "main",
    onClick: () => switchView("main")
  }));

  sidebarTabs.appendChild(createNavigationButton({
    label: "Global Websites",
    mark: "◎",
    active: activeView === "websites",
    onClick: () => switchView("websites")
  }));

  sidebarTabs.appendChild(createNavigationButton({
    label: "Developer Hub",
    mark: "</>",
    active: activeView === "developer",
    onClick: () => switchView("developer")
  }));

  sidebarTabs.appendChild(createNavigationButton({
    label: "Settings",
    mark: "⚙",
    active: activeView === "settings",
    onClick: () => switchView("settings")
  }));

  const folderView = parseFolderView();

  tabs.forEach((tab, index) => {
    const tabIsActive =
      activeView === `tab:${tab.id}` ||
      folderView?.tabId === tab.id;

    sidebarTabs.appendChild(createNavigationButton({
      label: tab.name,
      mark: String(index + 1).padStart(2, "0"),
      active: tabIsActive,
      onClick: () => switchView(`tab:${tab.id}`)
    }));
  });

  renderCurrentView();
  saveData();
}

function renderCurrentView() {
  const isCustomTab = activeView.startsWith("tab:");
  const isFolderWorkspace = activeView.startsWith("folder:");

  addFolderButton.classList.toggle("hidden", !isCustomTab);
  deleteTabButton.classList.toggle("hidden", !isCustomTab);

  if (activeView === "main") return renderMainDashboard();
  if (activeView === "websites") return renderGlobalWebsites();
  if (activeView === "developer") return renderDeveloperHub();
  if (activeView === "settings") return renderSettingsPage();
  if (isFolderWorkspace) return renderFolderWorkspace();

  renderCustomTab();
}

function renderMainDashboard() {
  const allFolders = tabs.flatMap(tab => tab.folders);
  const imageCount = allFolders.reduce((total, folder) => total + folder.images.length, 0);
  const modelCount = allFolders.reduce((total, folder) => total + folder.models.length, 0);
  const animationCount = allFolders.reduce((total, folder) => total + folder.animations.length, 0);
  const openTasks = developerData.tasks.filter(task => !task.completed).length;
  const activeProjects = developerData.projects.filter(project => project.status !== "Released").length;

  pageTitle.textContent = "Dashboard";
  pageSubtitle.textContent = "Your main Varsity Studios development workspace.";
  contentTitle.textContent = "Overview";

  tabContent.innerHTML = `
    <div class="main-dashboard">
      <section class="welcome-panel">
        <div>
          <span class="dashboard-kicker">VARSITY STUDIOS OWNER</span>
          <h3>Welcome back, ykdrxc.</h3>
          <p>Manage game projects, development tasks, Roblox IDs, code snippets, models, animations, images, and useful links.</p>
        </div>
        <img src="assets/varsity-logo.png" alt="Varsity Studios logo" />
      </section>

      <section class="dashboard-stat-grid developer-stat-grid">
        ${renderStatCard("Active projects", activeProjects, `${developerData.projects.length} total projects`)}
        ${renderStatCard("Open tasks", openTasks, `${developerData.tasks.length} total tasks`)}
        ${renderStatCard("Roblox IDs", developerData.ids.length, "Saved in the ID vault")}
        ${renderStatCard("Code snippets", developerData.snippets.length, "Reusable development code")}
        ${renderStatCard("Animations", animationCount, "Saved Roblox animation IDs")}
        ${renderStatCard("Media files", imageCount + modelCount, `${imageCount} images • ${modelCount} models`)}
      </section>

      <section class="dashboard-section">
        <div class="dashboard-section-heading">
          <div>
            <span class="dashboard-kicker">QUICK ACCESS</span>
            <h3>Development shortcuts</h3>
          </div>
        </div>

        <div class="quick-action-grid">
          <button class="quick-action" type="button" data-go-view="developer">
            <span class="quick-action-icon">&lt;/&gt;</span>
            <strong>Developer Hub</strong>
            <small>Projects, tasks, IDs, and code snippets.</small>
          </button>

          <button class="quick-action" type="button" data-go-view="settings">
            <span class="quick-action-icon">⚙</span>
            <strong>Dashboard Settings</strong>
            <small>Change colorways, spacing, motion, and appearance.</small>
          </button>

          <button class="quick-action" type="button" data-go-view="websites">
            <span class="quick-action-icon">◎</span>
            <strong>Global Websites</strong>
            <small>Open MiaPrep, YouTube, and Roblox Dashboard.</small>
          </button>

          <button class="quick-action" type="button" data-create-tab="true">
            <span class="quick-action-icon">＋</span>
            <strong>Create a category</strong>
            <small>Build another organized workspace.</small>
          </button>
        </div>
      </section>
    </div>
  `;

  tabContent.querySelectorAll("[data-go-view]").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.goView));
  });

  tabContent.querySelector("[data-create-tab]")?.addEventListener("click", openTabDialog);
}

function renderDeveloperHub() {
  pageTitle.textContent = "Developer Hub";
  pageSubtitle.textContent = "Tools for organizing Roblox game development.";
  contentTitle.textContent = "Developer Tools";

  tabContent.innerHTML = `
    <div class="developer-hub">
      <section class="developer-summary-grid">
        ${renderDeveloperSummary("Projects", developerData.projects.length, "Game development tracking")}
        ${renderDeveloperSummary("Tasks", developerData.tasks.length, "Production checklist")}
        ${renderDeveloperSummary("ID Vault", developerData.ids.length, "Places, products, passes, assets")}
        ${renderDeveloperSummary("Snippets", developerData.snippets.length, "Reusable Luau code")}
      </section>

      <section class="developer-tool-panel">
        <div class="developer-tool-heading">
          <div>
            <span class="dashboard-kicker">GAME PRODUCTION</span>
            <h3>Projects</h3>
          </div>
        </div>

        <form id="projectAddForm" class="developer-inline-form">
          <input id="projectNameInput" type="text" maxlength="60" placeholder="Project name" required />
          <input id="projectGameIdInput" type="text" maxlength="30" placeholder="Game or universe ID" />
          <select id="projectStatusInput" aria-label="Project status">
            <option>Planning</option>
            <option>In Development</option>
            <option>Testing</option>
            <option>Released</option>
            <option>On Hold</option>
          </select>
          <button class="primary-button compact" type="submit">Add project</button>
        </form>

        ${renderProjectList()}
      </section>

      <section class="developer-tool-panel">
        <div class="developer-tool-heading">
          <div>
            <span class="dashboard-kicker">PRODUCTION CHECKLIST</span>
            <h3>Development tasks</h3>
          </div>
        </div>

        <form id="taskAddForm" class="developer-inline-form task-form-layout">
          <input id="taskNameInput" type="text" maxlength="100" placeholder="Example: Finish player data saving" required />
          <select id="taskPriorityInput" aria-label="Task priority">
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
            <option>Low</option>
          </select>
          <button class="primary-button compact" type="submit">Add task</button>
        </form>

        ${renderTaskList()}
      </section>

      <section class="developer-tool-panel">
        <div class="developer-tool-heading">
          <div>
            <span class="dashboard-kicker">ROBLOX REFERENCE</span>
            <h3>ID Vault</h3>
          </div>
        </div>

        <form id="idAddForm" class="developer-inline-form">
          <input id="idLabelInput" type="text" maxlength="60" placeholder="Name or label" required />
          <input id="idValueInput" type="text" maxlength="40" placeholder="Numeric Roblox ID" required />
          <select id="idTypeInput" aria-label="ID type">
            <option>Place ID</option>
            <option>Universe ID</option>
            <option>Game Pass ID</option>
            <option>Developer Product ID</option>
            <option>Animation ID</option>
            <option>Image ID</option>
            <option>Audio ID</option>
            <option>Group ID</option>
            <option>Other</option>
          </select>
          <button class="primary-button compact" type="submit">Save ID</button>
        </form>

        ${renderIdVault()}
      </section>

      <section class="developer-tool-panel">
        <div class="developer-tool-heading">
          <div>
            <span class="dashboard-kicker">CODE LIBRARY</span>
            <h3>Luau snippets</h3>
          </div>
        </div>

        <form id="snippetAddForm" class="snippet-add-form">
          <input id="snippetTitleInput" type="text" maxlength="70" placeholder="Snippet title" required />
          <textarea id="snippetCodeInput" maxlength="8000" placeholder="Paste Luau code here..." required></textarea>
          <button class="primary-button compact" type="submit">Save snippet</button>
        </form>

        ${renderSnippetList()}
      </section>
    </div>
  `;

  bindDeveloperHubEvents();
}

function renderDeveloperSummary(label, value, detail) {
  return `
    <article class="developer-summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderProjectList() {
  if (!developerData.projects.length) {
    return renderDeveloperEmpty("No projects added yet.", "Add a Roblox game project above.");
  }

  return `
    <div class="developer-data-list">
      ${developerData.projects.map(project => `
        <article class="developer-data-row">
          <div class="developer-row-icon">G</div>
          <div class="developer-row-copy">
            <strong>${escapeHtml(project.name)}</strong>
            <span>${escapeHtml(project.status)}${project.gameId ? ` • ID: ${escapeHtml(project.gameId)}` : ""}</span>
          </div>
          <div class="developer-row-actions">
            <button type="button" data-edit-project="${project.id}">Edit</button>
            <button type="button" class="developer-danger-action" data-delete-project="${project.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTaskList() {
  if (!developerData.tasks.length) {
    return renderDeveloperEmpty("No development tasks yet.", "Add your next development task above.");
  }

  return `
    <div class="developer-data-list">
      ${developerData.tasks.map(task => `
        <article class="developer-data-row task-data-row ${task.completed ? "completed-task" : ""}">
          <label class="developer-task-check">
            <input type="checkbox" data-toggle-task="${task.id}" ${task.completed ? "checked" : ""} />
            <span></span>
          </label>
          <div class="developer-row-copy">
            <strong>${escapeHtml(task.name)}</strong>
            <span class="priority-${task.priority.toLowerCase()}">${escapeHtml(task.priority)} priority</span>
          </div>
          <div class="developer-row-actions">
            <button type="button" data-edit-task="${task.id}">Edit</button>
            <button type="button" class="developer-danger-action" data-delete-task="${task.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderIdVault() {
  if (!developerData.ids.length) {
    return renderDeveloperEmpty("The ID vault is empty.", "Save important Roblox IDs so you do not lose them.");
  }

  return `
    <div class="developer-data-list">
      ${developerData.ids.map(item => `
        <article class="developer-data-row">
          <div class="developer-row-icon">#</div>
          <div class="developer-row-copy">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.type)} • ${escapeHtml(item.value)}</span>
          </div>
          <div class="developer-row-actions">
            <button type="button" data-copy-id="${item.id}">Copy</button>
            <button type="button" data-edit-id="${item.id}">Edit</button>
            <button type="button" class="developer-danger-action" data-delete-id="${item.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderSnippetList() {
  if (!developerData.snippets.length) {
    return renderDeveloperEmpty("No code snippets saved.", "Save reusable Luau code for your games.");
  }

  return `
    <div class="snippet-list">
      ${developerData.snippets.map(snippet => `
        <article class="snippet-card">
          <div class="snippet-heading">
            <strong>${escapeHtml(snippet.title)}</strong>
            <div class="developer-row-actions">
              <button type="button" data-copy-snippet="${snippet.id}">Copy</button>
              <button type="button" data-edit-snippet="${snippet.id}">Edit</button>
              <button type="button" class="developer-danger-action" data-delete-snippet="${snippet.id}">Delete</button>
            </div>
          </div>
          <pre><code>${escapeHtml(snippet.code)}</code></pre>
        </article>
      `).join("")}
    </div>
  `;
}

function renderDeveloperEmpty(title, detail) {
  return `
    <div class="developer-empty-state">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>
  `;
}

function bindDeveloperHubEvents() {
  document.getElementById("projectAddForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("projectNameInput").value.trim();
    if (!name) return;

    developerData.projects.push({
      id: makeId(name),
      name,
      gameId: document.getElementById("projectGameIdInput").value.trim(),
      status: document.getElementById("projectStatusInput").value
    });

    saveDeveloperData();
    renderDeveloperHub();
  });

  document.getElementById("taskAddForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("taskNameInput").value.trim();
    if (!name) return;

    developerData.tasks.push({
      id: makeId(name),
      name,
      priority: document.getElementById("taskPriorityInput").value,
      completed: false
    });

    saveDeveloperData();
    renderDeveloperHub();
  });

  document.getElementById("idAddForm").addEventListener("submit", event => {
    event.preventDefault();

    const label = document.getElementById("idLabelInput").value.trim();
    const value = document.getElementById("idValueInput").value.trim();

    if (!label || !value) return;

    developerData.ids.push({
      id: makeId(label),
      label,
      value,
      type: document.getElementById("idTypeInput").value
    });

    saveDeveloperData();
    renderDeveloperHub();
  });

  document.getElementById("snippetAddForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("snippetTitleInput").value.trim();
    const code = document.getElementById("snippetCodeInput").value;

    if (!title || !code.trim()) return;

    developerData.snippets.push({
      id: makeId(title),
      title,
      code
    });

    saveDeveloperData();
    renderDeveloperHub();
  });

  tabContent.querySelectorAll("[data-toggle-task]").forEach(input => {
    input.addEventListener("change", () => {
      const task = developerData.tasks.find(item => item.id === input.dataset.toggleTask);
      if (!task) return;
      task.completed = input.checked;
      saveDeveloperData();
      renderDeveloperHub();
    });
  });

  bindSimpleDeveloperActions("project");
  bindSimpleDeveloperActions("task");
  bindSimpleDeveloperActions("id");
  bindSimpleDeveloperActions("snippet");

  tabContent.querySelectorAll("[data-copy-id]").forEach(button => {
    button.addEventListener("click", async () => {
      const item = developerData.ids.find(entry => entry.id === button.dataset.copyId);
      if (!item) return;
      await copyText(item.value);
      button.textContent = "Copied";
      setTimeout(() => button.textContent = "Copy", 900);
    });
  });

  tabContent.querySelectorAll("[data-copy-snippet]").forEach(button => {
    button.addEventListener("click", async () => {
      const snippet = developerData.snippets.find(entry => entry.id === button.dataset.copySnippet);
      if (!snippet) return;
      await copyText(snippet.code);
      button.textContent = "Copied";
      setTimeout(() => button.textContent = "Copy", 900);
    });
  });
}

function bindSimpleDeveloperActions(type) {
  const collectionName = type === "id" ? "ids" : `${type}s`;
  const collection = developerData[collectionName];

  tabContent.querySelectorAll(`[data-delete-${type}]`).forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset[`delete${capitalize(type)}`];
      const item = collection.find(entry => entry.id === id);
      if (!item || !window.confirm(`Delete "${item.name || item.label || item.title}"?`)) return;

      developerData[collectionName] = collection.filter(entry => entry.id !== id);
      saveDeveloperData();
      renderDeveloperHub();
    });
  });

  tabContent.querySelectorAll(`[data-edit-${type}]`).forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset[`edit${capitalize(type)}`];
      const item = collection.find(entry => entry.id === id);
      if (!item) return;

      editDeveloperItem(type, item);
    });
  });
}

function editDeveloperItem(type, item) {
  if (type === "project") {
    const name = window.prompt("Project name:", item.name);
    if (name === null || !name.trim()) return;
    const gameId = window.prompt("Game or universe ID:", item.gameId || "");
    if (gameId === null) return;
    const status = window.prompt("Status: Planning, In Development, Testing, Released, or On Hold", item.status);
    if (status === null || !status.trim()) return;

    item.name = name.trim();
    item.gameId = gameId.trim();
    item.status = status.trim();
  }

  if (type === "task") {
    const name = window.prompt("Task:", item.name);
    if (name === null || !name.trim()) return;
    const priority = window.prompt("Priority: Low, Normal, High, or Urgent", item.priority);
    if (priority === null || !priority.trim()) return;

    item.name = name.trim();
    item.priority = priority.trim();
  }

  if (type === "id") {
    const label = window.prompt("Label:", item.label);
    if (label === null || !label.trim()) return;
    const value = window.prompt("Roblox ID:", item.value);
    if (value === null || !value.trim()) return;
    const idType = window.prompt("ID type:", item.type);
    if (idType === null || !idType.trim()) return;

    item.label = label.trim();
    item.value = value.trim();
    item.type = idType.trim();
  }

  if (type === "snippet") {
    const title = window.prompt("Snippet title:", item.title);
    if (title === null || !title.trim()) return;
    const code = window.prompt("Luau code:", item.code);
    if (code === null || !code.trim()) return;

    item.title = title.trim();
    item.code = code;
  }

  saveDeveloperData();
  renderDeveloperHub();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

function renderSettingsPage() {
  const currentColorway = COLORWAYS[dashboardSettings.colorway] || COLORWAYS.varsity;

  pageTitle.textContent = "Settings";
  pageSubtitle.textContent = "Personalize the Varsity Studios dashboard.";
  contentTitle.textContent = "Dashboard Settings";

  tabContent.innerHTML = `
    <div class="settings-page">
      <section class="settings-panel">
        <div class="settings-heading">
          <div>
            <span class="dashboard-kicker">APPEARANCE</span>
            <h3>Colorway</h3>
            <p>Choose the main color used throughout the dashboard.</p>
          </div>
        </div>

        <div class="colorway-grid">
          ${Object.entries(COLORWAYS).map(([key, colorway]) => `
            <button
              class="colorway-option ${dashboardSettings.colorway === key ? "selected" : ""}"
              type="button"
              data-colorway="${key}"
            >
              <span class="colorway-preview" style="--preview-primary:${colorway.red};--preview-bright:${colorway.bright};--preview-dark:${colorway.dark};"></span>
              <span>
                <strong>${escapeHtml(colorway.name)}</strong>
                <small>${dashboardSettings.colorway === key ? "Currently selected" : "Select colorway"}</small>
              </span>
              <span class="colorway-check">✓</span>
            </button>
          `).join("")}
        </div>
      </section>

      <section class="settings-panel">
        <div class="settings-heading">
          <div>
            <span class="dashboard-kicker">LAYOUT</span>
            <h3>Interface preferences</h3>
            <p>Control spacing, corners, descriptions, and visual motion.</p>
          </div>
        </div>

        <div class="settings-control-list">
          ${renderSettingsSelect(
            "Interface density",
            "Choose how much space buttons and panels use.",
            "settingDensity",
            dashboardSettings.density,
            [["compact", "Compact"], ["comfortable", "Comfortable"]]
          )}

          ${renderSettingsSelect(
            "Panel corners",
            "Choose between round or sharper dashboard panels.",
            "settingCorners",
            dashboardSettings.corners,
            [["rounded", "Rounded"], ["sharp", "Sharper"]]
          )}

          ${renderSettingsSelect(
            "Animations",
            "Reduce dashboard transitions when you prefer less movement.",
            "settingMotion",
            dashboardSettings.motion,
            [["full", "Full animations"], ["reduced", "Reduced animations"]]
          )}

          ${renderSettingsToggle(
            "Background glow",
            "Show the colored glow behind the dashboard.",
            "settingBackgroundGlow",
            dashboardSettings.backgroundGlow
          )}

          ${renderSettingsToggle(
            "Folder descriptions",
            "Show folder descriptions on category cards.",
            "settingDescriptions",
            dashboardSettings.showDescriptions
          )}
        </div>
      </section>

      <section class="settings-panel danger-settings-panel">
        <div class="settings-heading">
          <div>
            <span class="dashboard-kicker">DATA MANAGEMENT</span>
            <h3>Reset options</h3>
            <p>Reset only appearance settings or erase the locally saved developer tools.</p>
          </div>
        </div>

        <div class="settings-danger-actions">
          <button id="resetAppearanceButton" class="secondary-button" type="button">Reset appearance</button>
          <button id="clearDeveloperDataButton" class="danger-button" type="button">Clear Developer Hub</button>
        </div>
      </section>
    </div>
  `;

  tabContent.querySelectorAll("[data-colorway]").forEach(button => {
    button.addEventListener("click", () => {
      dashboardSettings.colorway = button.dataset.colorway;
      saveDashboardSettings();
      applyDashboardSettings();
      renderSettingsPage();
    });
  });

  document.getElementById("settingDensity").addEventListener("change", event => {
    dashboardSettings.density = event.target.value;
    saveAndRefreshSettings();
  });

  document.getElementById("settingCorners").addEventListener("change", event => {
    dashboardSettings.corners = event.target.value;
    saveAndRefreshSettings();
  });

  document.getElementById("settingMotion").addEventListener("change", event => {
    dashboardSettings.motion = event.target.value;
    saveAndRefreshSettings();
  });

  document.getElementById("settingBackgroundGlow").addEventListener("change", event => {
    dashboardSettings.backgroundGlow = event.target.checked;
    saveAndRefreshSettings();
  });

  document.getElementById("settingDescriptions").addEventListener("change", event => {
    dashboardSettings.showDescriptions = event.target.checked;
    saveAndRefreshSettings();
  });

  document.getElementById("resetAppearanceButton").addEventListener("click", () => {
    dashboardSettings = { ...defaultSettings };
    saveDashboardSettings();
    applyDashboardSettings();
    renderSettingsPage();
  });

  document.getElementById("clearDeveloperDataButton").addEventListener("click", () => {
    if (!window.confirm("Clear all projects, tasks, saved IDs, and code snippets?")) return;
    developerData = structuredClone(defaultDeveloperData);
    saveDeveloperData();
    renderSettingsPage();
  });
}

function renderSettingsSelect(title, detail, id, value, options) {
  return `
    <label class="settings-control-row" for="${id}">
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(detail)}</small>
      </span>
      <select id="${id}">
        ${options.map(([optionValue, label]) => `
          <option value="${optionValue}" ${value === optionValue ? "selected" : ""}>${escapeHtml(label)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderSettingsToggle(title, detail, id, checked) {
  return `
    <label class="settings-control-row settings-toggle-row" for="${id}">
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(detail)}</small>
      </span>
      <input id="${id}" class="settings-toggle" type="checkbox" ${checked ? "checked" : ""} />
    </label>
  `;
}

function saveAndRefreshSettings() {
  saveDashboardSettings();
  applyDashboardSettings();
  renderSettingsPage();
}

applyDashboardSettings();


/* Advanced studio management upgrade */
const ADVANCED_STORAGE_KEY = "varsityDashboardAdvancedData";
const WORKSPACE_PROFILE_KEY = "varsityDashboardWorkspaceProfile";

const defaultWorkspaceProfile = {
  studioName: "Varsity Studios",
  ownerName: "ykdrxc",
  dashboardName: "Varsity Studios Dashboard",
  defaultGame: "",
  groupId: "",
  groupUrl: "",
  studioDescription: "Roblox sports game development and production workspace."
};

const defaultAdvancedData = {
  gameSettings: [],
  remotes: [],
  dataStores: [],
  releases: [],
  team: []
};

let workspaceProfile = loadWorkspaceProfile();
let advancedData = loadAdvancedData();

function loadWorkspaceProfile() {
  try {
    return {
      ...defaultWorkspaceProfile,
      ...JSON.parse(localStorage.getItem(WORKSPACE_PROFILE_KEY) || "{}")
    };
  } catch {
    return { ...defaultWorkspaceProfile };
  }
}

function saveWorkspaceProfile() {
  localStorage.setItem(WORKSPACE_PROFILE_KEY, JSON.stringify(workspaceProfile));
  applyWorkspaceProfile();
}

function loadAdvancedData() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADVANCED_STORAGE_KEY) || "{}");

    return {
      gameSettings: Array.isArray(saved.gameSettings) ? saved.gameSettings : [],
      remotes: Array.isArray(saved.remotes) ? saved.remotes : [],
      dataStores: Array.isArray(saved.dataStores) ? saved.dataStores : [],
      releases: Array.isArray(saved.releases) ? saved.releases : [],
      team: Array.isArray(saved.team) ? saved.team : []
    };
  } catch {
    return structuredClone(defaultAdvancedData);
  }
}

function saveAdvancedData() {
  localStorage.setItem(ADVANCED_STORAGE_KEY, JSON.stringify(advancedData));
}

function applyWorkspaceProfile() {
  document.title = workspaceProfile.dashboardName || "Varsity Studios Dashboard";

  document.querySelectorAll(".sidebar-brand .eyebrow").forEach(element => {
    element.textContent = (workspaceProfile.studioName || "Varsity Studios").toUpperCase();
  });

  const signedInName = document.querySelector(".signed-in strong");
  const signedInRole = document.querySelector(".signed-in small");

  if (signedInName) signedInName.textContent = workspaceProfile.ownerName || "ykdrxc";
  if (signedInRole) signedInRole.textContent = `Owner of ${workspaceProfile.studioName || "Varsity Studios"}`;
}

const baseAdvancedRenderNavigation = renderNavigation;
renderNavigation = function renderNavigationWithAdvancedTools() {
  baseAdvancedRenderNavigation();

  const customTabButtons = Array.from(sidebarTabs.querySelectorAll(".tab-button")).slice(4);
  const firstCustomTab = customTabButtons[0] || null;

  const advancedButtons = [
    createNavigationButton({
      label: "Game Systems",
      mark: "SYS",
      active: activeView === "systems",
      onClick: () => switchView("systems")
    }),
    createNavigationButton({
      label: "Releases",
      mark: "VER",
      active: activeView === "releases",
      onClick: () => switchView("releases")
    }),
    createNavigationButton({
      label: "Team",
      mark: "USR",
      active: activeView === "team",
      onClick: () => switchView("team")
    })
  ];

  advancedButtons.reverse().forEach(button => {
    sidebarTabs.insertBefore(button, firstCustomTab);
  });
};

const baseAdvancedRenderCurrentView = renderCurrentView;
renderCurrentView = function renderCurrentViewWithAdvancedTools() {
  if (["systems", "releases", "team"].includes(activeView)) {
    addFolderButton.classList.add("hidden");
    deleteTabButton.classList.add("hidden");

    if (activeView === "systems") {
      renderGameSystemsPage();
      return;
    }

    if (activeView === "releases") {
      renderReleasesPage();
      return;
    }

    renderTeamPage();
    return;
  }

  baseAdvancedRenderCurrentView();
};

const baseAdvancedRenderMainDashboard = renderMainDashboard;
renderMainDashboard = function renderAdvancedMainDashboard() {
  baseAdvancedRenderMainDashboard();

  const welcomeHeading = tabContent.querySelector(".welcome-panel h3");
  const welcomeText = tabContent.querySelector(".welcome-panel p");

  if (welcomeHeading) {
    welcomeHeading.textContent = `Welcome back, ${workspaceProfile.ownerName || "ykdrxc"}.`;
  }

  if (welcomeText) {
    welcomeText.textContent =
      `Manage ${workspaceProfile.studioName || "Varsity Studios"} projects, systems, releases, team access, assets, IDs, code, and production work.`;
  }

  const shortcutGrid = tabContent.querySelector(".quick-action-grid");

  if (shortcutGrid) {
    shortcutGrid.insertAdjacentHTML("beforeend", `
      <button class="quick-action" type="button" data-go-view="systems">
        <span class="quick-action-icon">SYS</span>
        <strong>Game Systems</strong>
        <small>Settings, remotes, and DataStore documentation.</small>
      </button>

      <button class="quick-action" type="button" data-go-view="releases">
        <span class="quick-action-icon">VER</span>
        <strong>Release Manager</strong>
        <small>Versions, target dates, status, and release notes.</small>
      </button>

      <button class="quick-action" type="button" data-go-view="team">
        <span class="quick-action-icon">USR</span>
        <strong>Team Directory</strong>
        <small>Roles, usernames, permissions, and responsibilities.</small>
      </button>
    `);

    shortcutGrid.querySelectorAll("[data-go-view]").forEach(button => {
      button.addEventListener("click", () => switchView(button.dataset.goView));
    });
  }
};

const baseAdvancedRenderSettingsPage = renderSettingsPage;
renderSettingsPage = function renderAdvancedSettingsPage() {
  baseAdvancedRenderSettingsPage();

  const settingsPage = tabContent.querySelector(".settings-page");
  if (!settingsPage) return;

  settingsPage.insertAdjacentHTML("afterbegin", `
    <section class="settings-panel workspace-profile-panel">
      <div class="settings-heading">
        <div>
          <span class="dashboard-kicker">WORKSPACE IDENTITY</span>
          <h3>Names and studio information</h3>
          <p>Control the names and information shown throughout your dashboard.</p>
        </div>
      </div>

      <form id="workspaceProfileForm" class="workspace-profile-form">
        <label>
          <span>Studio name</span>
          <input id="workspaceStudioName" type="text" maxlength="70" value="${escapeAttribute(workspaceProfile.studioName)}" required />
        </label>

        <label>
          <span>Owner display name</span>
          <input id="workspaceOwnerName" type="text" maxlength="50" value="${escapeAttribute(workspaceProfile.ownerName)}" required />
        </label>

        <label>
          <span>Browser and dashboard title</span>
          <input id="workspaceDashboardName" type="text" maxlength="90" value="${escapeAttribute(workspaceProfile.dashboardName)}" required />
        </label>

        <label>
          <span>Default game name</span>
          <input id="workspaceDefaultGame" type="text" maxlength="80" value="${escapeAttribute(workspaceProfile.defaultGame)}" placeholder="Example: Varsity Football" />
        </label>

        <label>
          <span>Roblox group ID</span>
          <input id="workspaceGroupId" type="text" maxlength="30" value="${escapeAttribute(workspaceProfile.groupId)}" placeholder="Numeric group ID" />
        </label>

        <label>
          <span>Roblox group URL</span>
          <input id="workspaceGroupUrl" type="url" maxlength="250" value="${escapeAttribute(workspaceProfile.groupUrl)}" placeholder="https://www.roblox.com/communities/..." />
        </label>

        <label class="workspace-profile-wide">
          <span>Studio description</span>
          <textarea id="workspaceStudioDescription" maxlength="300">${escapeHtml(workspaceProfile.studioDescription)}</textarea>
        </label>

        <div class="workspace-profile-actions">
          <button class="primary-button compact" type="submit">Save workspace identity</button>
        </div>
      </form>
    </section>
  `);

  document.getElementById("workspaceProfileForm").addEventListener("submit", event => {
    event.preventDefault();

    workspaceProfile = {
      studioName: document.getElementById("workspaceStudioName").value.trim(),
      ownerName: document.getElementById("workspaceOwnerName").value.trim(),
      dashboardName: document.getElementById("workspaceDashboardName").value.trim(),
      defaultGame: document.getElementById("workspaceDefaultGame").value.trim(),
      groupId: document.getElementById("workspaceGroupId").value.trim(),
      groupUrl: document.getElementById("workspaceGroupUrl").value.trim(),
      studioDescription: document.getElementById("workspaceStudioDescription").value.trim()
    };

    saveWorkspaceProfile();
    renderNavigation();
  });
};

function renderGameSystemsPage() {
  pageTitle.textContent = "Game Systems";
  pageSubtitle.textContent = "Document important gameplay configuration and backend systems.";
  contentTitle.textContent = "Systems Registry";

  tabContent.innerHTML = `
    <div class="advanced-manager-page">
      <section class="advanced-summary-grid">
        ${renderAdvancedSummary("Settings", advancedData.gameSettings.length, "Gameplay and configuration values")}
        ${renderAdvancedSummary("Remotes", advancedData.remotes.length, "RemoteEvents and RemoteFunctions")}
        ${renderAdvancedSummary("DataStores", advancedData.dataStores.length, "Persistent data documentation")}
      </section>

      <section class="advanced-manager-panel">
        <div class="advanced-panel-heading">
          <div>
            <span class="dashboard-kicker">CONFIGURATION REGISTRY</span>
            <h3>Game settings</h3>
            <p>Save setting names, values, categories, and notes so your systems stay documented.</p>
          </div>
        </div>

        <form id="gameSettingForm" class="advanced-inline-form">
          <input id="gameSettingName" type="text" maxlength="80" placeholder="Setting name" required />
          <input id="gameSettingValue" type="text" maxlength="160" placeholder="Default value" required />
          <select id="gameSettingCategory">
            <option>Gameplay</option>
            <option>Economy</option>
            <option>Vehicles</option>
            <option>Jobs</option>
            <option>UI</option>
            <option>Data</option>
            <option>Security</option>
            <option>World</option>
            <option>Other</option>
          </select>
          <input id="gameSettingNotes" type="text" maxlength="220" placeholder="Notes or purpose" />
          <button class="primary-button compact" type="submit">Add setting</button>
        </form>

        ${renderGameSettingsList()}
      </section>

      <section class="advanced-manager-panel">
        <div class="advanced-panel-heading">
          <div>
            <span class="dashboard-kicker">NETWORKING REGISTRY</span>
            <h3>Remote events and functions</h3>
            <p>Track remote names, types, communication direction, and purpose.</p>
          </div>
        </div>

        <form id="remoteRegistryForm" class="advanced-inline-form">
          <input id="remoteName" type="text" maxlength="90" placeholder="Remote name" required />
          <select id="remoteType">
            <option>RemoteEvent</option>
            <option>RemoteFunction</option>
            <option>BindableEvent</option>
            <option>BindableFunction</option>
          </select>
          <select id="remoteDirection">
            <option>Client → Server</option>
            <option>Server → Client</option>
            <option>Both Directions</option>
            <option>Server Only</option>
            <option>Client Only</option>
          </select>
          <input id="remoteDescription" type="text" maxlength="240" placeholder="What this remote does" required />
          <button class="primary-button compact" type="submit">Add remote</button>
        </form>

        ${renderRemoteRegistry()}
      </section>

      <section class="advanced-manager-panel">
        <div class="advanced-panel-heading">
          <div>
            <span class="dashboard-kicker">PERSISTENT DATA</span>
            <h3>DataStore registry</h3>
            <p>Keep the exact DataStore names, scopes, versions, and saved data documented.</p>
          </div>
        </div>

        <form id="dataStoreRegistryForm" class="advanced-inline-form">
          <input id="dataStoreName" type="text" maxlength="100" placeholder="DataStore name" required />
          <input id="dataStoreScope" type="text" maxlength="80" placeholder="Scope or key pattern" />
          <input id="dataStoreVersion" type="text" maxlength="30" placeholder="Version, e.g. v2" />
          <input id="dataStorePurpose" type="text" maxlength="240" placeholder="What data it saves" required />
          <button class="primary-button compact" type="submit">Add DataStore</button>
        </form>

        ${renderDataStoreRegistry()}
      </section>
    </div>
  `;

  bindGameSystemsEvents();
}

function renderAdvancedSummary(label, value, detail) {
  return `
    <article class="advanced-summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderGameSettingsList() {
  if (!advancedData.gameSettings.length) {
    return renderAdvancedEmpty("No game settings documented.", "Add important configuration names and values above.");
  }

  return `
    <div class="advanced-data-list">
      ${advancedData.gameSettings.map(item => `
        <article class="advanced-data-row">
          <div class="advanced-type-badge">${escapeHtml(item.category.slice(0, 3).toUpperCase())}</div>
          <div class="advanced-row-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>Value: ${escapeHtml(item.value)} • ${escapeHtml(item.category)}</span>
            ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
          </div>
          ${renderAdvancedRowActions("setting", item.id)}
        </article>
      `).join("")}
    </div>
  `;
}

function renderRemoteRegistry() {
  if (!advancedData.remotes.length) {
    return renderAdvancedEmpty("No remotes documented.", "Add RemoteEvents, RemoteFunctions, and bindables above.");
  }

  return `
    <div class="advanced-data-list">
      ${advancedData.remotes.map(item => `
        <article class="advanced-data-row">
          <div class="advanced-type-badge">REM</div>
          <div class="advanced-row-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.type)} • ${escapeHtml(item.direction)}</span>
            <p>${escapeHtml(item.description)}</p>
          </div>
          ${renderAdvancedRowActions("remote", item.id)}
        </article>
      `).join("")}
    </div>
  `;
}

function renderDataStoreRegistry() {
  if (!advancedData.dataStores.length) {
    return renderAdvancedEmpty("No DataStores documented.", "Add persistent storage names and purposes above.");
  }

  return `
    <div class="advanced-data-list">
      ${advancedData.dataStores.map(item => `
        <article class="advanced-data-row">
          <div class="advanced-type-badge">DS</div>
          <div class="advanced-row-copy">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.scope || "Default scope")} • ${escapeHtml(item.version || "No version")}</span>
            <p>${escapeHtml(item.purpose)}</p>
          </div>
          ${renderAdvancedRowActions("datastore", item.id)}
        </article>
      `).join("")}
    </div>
  `;
}

function renderAdvancedRowActions(type, id) {
  return `
    <div class="advanced-row-actions">
      <button type="button" data-edit-advanced="${type}:${id}">Edit</button>
      <button type="button" class="advanced-delete-action" data-delete-advanced="${type}:${id}">Delete</button>
    </div>
  `;
}

function renderAdvancedEmpty(title, description) {
  return `
    <div class="advanced-empty">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(description)}</span>
    </div>
  `;
}

function bindGameSystemsEvents() {
  document.getElementById("gameSettingForm").addEventListener("submit", event => {
    event.preventDefault();

    advancedData.gameSettings.push({
      id: makeId(document.getElementById("gameSettingName").value),
      name: document.getElementById("gameSettingName").value.trim(),
      value: document.getElementById("gameSettingValue").value.trim(),
      category: document.getElementById("gameSettingCategory").value,
      notes: document.getElementById("gameSettingNotes").value.trim()
    });

    saveAdvancedData();
    renderGameSystemsPage();
  });

  document.getElementById("remoteRegistryForm").addEventListener("submit", event => {
    event.preventDefault();

    advancedData.remotes.push({
      id: makeId(document.getElementById("remoteName").value),
      name: document.getElementById("remoteName").value.trim(),
      type: document.getElementById("remoteType").value,
      direction: document.getElementById("remoteDirection").value,
      description: document.getElementById("remoteDescription").value.trim()
    });

    saveAdvancedData();
    renderGameSystemsPage();
  });

  document.getElementById("dataStoreRegistryForm").addEventListener("submit", event => {
    event.preventDefault();

    advancedData.dataStores.push({
      id: makeId(document.getElementById("dataStoreName").value),
      name: document.getElementById("dataStoreName").value.trim(),
      scope: document.getElementById("dataStoreScope").value.trim(),
      version: document.getElementById("dataStoreVersion").value.trim(),
      purpose: document.getElementById("dataStorePurpose").value.trim()
    });

    saveAdvancedData();
    renderGameSystemsPage();
  });

  bindAdvancedEditDeleteEvents();
}

function bindAdvancedEditDeleteEvents() {
  tabContent.querySelectorAll("[data-delete-advanced]").forEach(button => {
    button.addEventListener("click", () => {
      const [type, id] = button.dataset.deleteAdvanced.split(":");
      const collection = getAdvancedCollection(type);
      const item = collection.find(entry => entry.id === id);

      if (!item || !window.confirm(`Delete "${item.name || item.version || item.username}"?`)) return;

      const key = getAdvancedCollectionKey(type);
      advancedData[key] = collection.filter(entry => entry.id !== id);
      saveAdvancedData();

      if (activeView === "systems") renderGameSystemsPage();
      if (activeView === "releases") renderReleasesPage();
      if (activeView === "team") renderTeamPage();
    });
  });

  tabContent.querySelectorAll("[data-edit-advanced]").forEach(button => {
    button.addEventListener("click", () => {
      const [type, id] = button.dataset.editAdvanced.split(":");
      editAdvancedItem(type, id);
    });
  });
}

function getAdvancedCollectionKey(type) {
  if (type === "setting") return "gameSettings";
  if (type === "remote") return "remotes";
  if (type === "datastore") return "dataStores";
  if (type === "release") return "releases";
  return "team";
}

function getAdvancedCollection(type) {
  return advancedData[getAdvancedCollectionKey(type)];
}

function editAdvancedItem(type, id) {
  const item = getAdvancedCollection(type).find(entry => entry.id === id);
  if (!item) return;

  if (type === "setting") {
    const name = window.prompt("Setting name:", item.name);
    if (name === null || !name.trim()) return;
    const value = window.prompt("Default value:", item.value);
    if (value === null || !value.trim()) return;
    const category = window.prompt("Category:", item.category);
    if (category === null || !category.trim()) return;
    const notes = window.prompt("Notes:", item.notes || "");
    if (notes === null) return;

    Object.assign(item, {
      name: name.trim(),
      value: value.trim(),
      category: category.trim(),
      notes: notes.trim()
    });
  }

  if (type === "remote") {
    const name = window.prompt("Remote name:", item.name);
    if (name === null || !name.trim()) return;
    const remoteType = window.prompt("Remote type:", item.type);
    if (remoteType === null || !remoteType.trim()) return;
    const direction = window.prompt("Direction:", item.direction);
    if (direction === null || !direction.trim()) return;
    const description = window.prompt("Description:", item.description);
    if (description === null || !description.trim()) return;

    Object.assign(item, {
      name: name.trim(),
      type: remoteType.trim(),
      direction: direction.trim(),
      description: description.trim()
    });
  }

  if (type === "datastore") {
    const name = window.prompt("DataStore name:", item.name);
    if (name === null || !name.trim()) return;
    const scope = window.prompt("Scope or key pattern:", item.scope || "");
    if (scope === null) return;
    const version = window.prompt("Version:", item.version || "");
    if (version === null) return;
    const purpose = window.prompt("Saved data / purpose:", item.purpose);
    if (purpose === null || !purpose.trim()) return;

    Object.assign(item, {
      name: name.trim(),
      scope: scope.trim(),
      version: version.trim(),
      purpose: purpose.trim()
    });
  }

  if (type === "release") {
    const version = window.prompt("Release version:", item.version);
    if (version === null || !version.trim()) return;
    const project = window.prompt("Project / game:", item.project);
    if (project === null || !project.trim()) return;
    const targetDate = window.prompt("Target date (YYYY-MM-DD):", item.targetDate || "");
    if (targetDate === null) return;
    const status = window.prompt("Status:", item.status);
    if (status === null || !status.trim()) return;
    const notes = window.prompt("Release notes:", item.notes || "");
    if (notes === null) return;

    Object.assign(item, {
      version: version.trim(),
      project: project.trim(),
      targetDate: targetDate.trim(),
      status: status.trim(),
      notes: notes.trim()
    });
  }

  if (type === "team") {
    const username = window.prompt("Roblox username:", item.username);
    if (username === null || !username.trim()) return;
    const displayName = window.prompt("Display name:", item.displayName || "");
    if (displayName === null) return;
    const role = window.prompt("Role:", item.role);
    if (role === null || !role.trim()) return;
    const access = window.prompt("Access level:", item.access);
    if (access === null || !access.trim()) return;
    const responsibilities = window.prompt("Responsibilities:", item.responsibilities || "");
    if (responsibilities === null) return;

    Object.assign(item, {
      username: username.trim(),
      displayName: displayName.trim(),
      role: role.trim(),
      access: access.trim(),
      responsibilities: responsibilities.trim()
    });
  }

  saveAdvancedData();

  if (activeView === "systems") renderGameSystemsPage();
  if (activeView === "releases") renderReleasesPage();
  if (activeView === "team") renderTeamPage();
}

function renderReleasesPage() {
  pageTitle.textContent = "Release Manager";
  pageSubtitle.textContent = "Plan and track Roblox game updates and production releases.";
  contentTitle.textContent = "Releases";

  tabContent.innerHTML = `
    <div class="advanced-manager-page">
      <section class="release-overview-panel">
        <div>
          <span class="dashboard-kicker">PRODUCTION PIPELINE</span>
          <h3>${escapeHtml(workspaceProfile.defaultGame || workspaceProfile.studioName || "Varsity Studios")}</h3>
          <p>Track versions from planning through testing and release.</p>
        </div>
        <strong>${advancedData.releases.length}</strong>
      </section>

      <section class="advanced-manager-panel">
        <div class="advanced-panel-heading">
          <div>
            <span class="dashboard-kicker">NEW RELEASE</span>
            <h3>Add a version</h3>
          </div>
        </div>

        <form id="releaseForm" class="advanced-release-form">
          <input id="releaseVersion" type="text" maxlength="30" placeholder="Version, e.g. v1.4.0" required />
          <input id="releaseProject" type="text" maxlength="80" value="${escapeAttribute(workspaceProfile.defaultGame)}" placeholder="Game or project" required />
          <input id="releaseTargetDate" type="date" />
          <select id="releaseStatus">
            <option>Planning</option>
            <option>In Development</option>
            <option>Internal Testing</option>
            <option>Public Testing</option>
            <option>Ready to Release</option>
            <option>Released</option>
            <option>Delayed</option>
          </select>
          <textarea id="releaseNotes" maxlength="1000" placeholder="Release notes, major features, fixes, or known issues"></textarea>
          <button class="primary-button compact" type="submit">Add release</button>
        </form>

        ${renderReleaseList()}
      </section>
    </div>
  `;

  document.getElementById("releaseForm").addEventListener("submit", event => {
    event.preventDefault();

    advancedData.releases.unshift({
      id: makeId(document.getElementById("releaseVersion").value),
      version: document.getElementById("releaseVersion").value.trim(),
      project: document.getElementById("releaseProject").value.trim(),
      targetDate: document.getElementById("releaseTargetDate").value,
      status: document.getElementById("releaseStatus").value,
      notes: document.getElementById("releaseNotes").value.trim()
    });

    saveAdvancedData();
    renderReleasesPage();
  });

  bindAdvancedEditDeleteEvents();
}

function renderReleaseList() {
  if (!advancedData.releases.length) {
    return renderAdvancedEmpty("No releases planned.", "Add your first game version above.");
  }

  return `
    <div class="release-list">
      ${advancedData.releases.map(item => `
        <article class="release-card">
          <div class="release-version">${escapeHtml(item.version)}</div>
          <div class="release-copy">
            <div class="release-title-line">
              <strong>${escapeHtml(item.project)}</strong>
              <span>${escapeHtml(item.status)}</span>
            </div>
            <small>${item.targetDate ? `Target: ${escapeHtml(item.targetDate)}` : "No target date"}</small>
            <p>${escapeHtml(item.notes || "No release notes yet.")}</p>
          </div>
          ${renderAdvancedRowActions("release", item.id)}
        </article>
      `).join("")}
    </div>
  `;
}

function renderTeamPage() {
  pageTitle.textContent = "Team Directory";
  pageSubtitle.textContent = "Track developers, roles, access, and responsibilities.";
  contentTitle.textContent = "Team";

  tabContent.innerHTML = `
    <div class="advanced-manager-page">
      <section class="advanced-summary-grid">
        ${renderAdvancedSummary("Team members", advancedData.team.length, "Saved Roblox developers")}
        ${renderAdvancedSummary("Full access", advancedData.team.filter(member => member.access === "Full Access").length, "High-level permissions")}
        ${renderAdvancedSummary("Owners", advancedData.team.filter(member => member.role.toLowerCase().includes("owner")).length, "Studio ownership roles")}
      </section>

      <section class="advanced-manager-panel">
        <div class="advanced-panel-heading">
          <div>
            <span class="dashboard-kicker">TEAM MANAGEMENT</span>
            <h3>Add a developer</h3>
            <p>Document who works on the game and what access they should have.</p>
          </div>
        </div>

        <form id="teamMemberForm" class="advanced-inline-form">
          <input id="teamUsername" type="text" maxlength="50" placeholder="Roblox username" required />
          <input id="teamDisplayName" type="text" maxlength="70" placeholder="Display name" />
          <select id="teamRole">
            <option>Owner</option>
            <option>Co-Owner</option>
            <option>Lead Developer</option>
            <option>Scripter</option>
            <option>Builder</option>
            <option>UI Designer</option>
            <option>Animator</option>
            <option>Modeler</option>
            <option>QA Tester</option>
            <option>Community Manager</option>
            <option>Contributor</option>
          </select>
          <select id="teamAccess">
            <option>Full Access</option>
            <option>Edit Games</option>
            <option>Edit Assets</option>
            <option>Testing Only</option>
            <option>View Only</option>
          </select>
          <input id="teamResponsibilities" type="text" maxlength="260" placeholder="Responsibilities or notes" />
          <button class="primary-button compact" type="submit">Add member</button>
        </form>

        ${renderTeamList()}
      </section>
    </div>
  `;

  document.getElementById("teamMemberForm").addEventListener("submit", event => {
    event.preventDefault();

    advancedData.team.push({
      id: makeId(document.getElementById("teamUsername").value),
      username: document.getElementById("teamUsername").value.trim(),
      displayName: document.getElementById("teamDisplayName").value.trim(),
      role: document.getElementById("teamRole").value,
      access: document.getElementById("teamAccess").value,
      responsibilities: document.getElementById("teamResponsibilities").value.trim()
    });

    saveAdvancedData();
    renderTeamPage();
  });

  bindAdvancedEditDeleteEvents();
}

function renderTeamList() {
  if (!advancedData.team.length) {
    return renderAdvancedEmpty("No team members saved.", "Add owners, developers, builders, testers, and contributors above.");
  }

  return `
    <div class="team-member-grid">
      ${advancedData.team.map(member => `
        <article class="team-member-card">
          <div class="team-avatar">${escapeHtml((member.displayName || member.username).charAt(0).toUpperCase())}</div>
          <div class="team-member-copy">
            <strong>${escapeHtml(member.displayName || member.username)}</strong>
            <span>@${escapeHtml(member.username)}</span>
            <em>${escapeHtml(member.role)} • ${escapeHtml(member.access)}</em>
            <p>${escapeHtml(member.responsibilities || "No responsibilities added.")}</p>
          </div>
          ${renderAdvancedRowActions("team", member.id)}
        </article>
      `).join("")}
    </div>
  `;
}

applyWorkspaceProfile();


/* Loading screen and styled delete confirmations */
const siteLoadingScreen = document.getElementById("siteLoadingScreen");
const siteLoadingProgress = document.getElementById("siteLoadingProgress");
const siteLoadingStatus = document.getElementById("siteLoadingStatus");

document.body.classList.add("site-loading-active");

function runSiteLoadingSequence() {
  const stages = [
    { progress: 18, message: "Preparing workspace...", delay: 180 },
    { progress: 43, message: "Loading studio systems...", delay: 520 },
    { progress: 68, message: "Organizing development data...", delay: 880 },
    { progress: 88, message: "Finalizing dashboard...", delay: 1260 },
    { progress: 100, message: "Ready.", delay: 1640 }
  ];

  stages.forEach(stage => {
    setTimeout(() => {
      siteLoadingProgress.style.width = `${stage.progress}%`;
      siteLoadingStatus.textContent = stage.message;
    }, stage.delay);
  });

  setTimeout(() => {
    siteLoadingScreen.classList.add("finished");
    document.body.classList.remove("site-loading-active");
    document.body.classList.add("site-loading-complete");
  }, 2050);

  setTimeout(() => {
    siteLoadingScreen.remove();
  }, 3000);
}

if (document.readyState === "complete") {
  runSiteLoadingSequence();
} else {
  window.addEventListener("load", runSiteLoadingSequence, { once: true });
}

const confirmationDialog = document.getElementById("confirmationDialog");
const confirmationTitle = document.getElementById("confirmationTitle");
const confirmationMessage = document.getElementById("confirmationMessage");
const confirmationCancelButton = document.getElementById("confirmationCancelButton");
const confirmationContinueButton = document.getElementById("confirmationContinueButton");

let pendingConfirmedButton = null;
const confirmationBypass = new WeakSet();

const deleteSelectors = [
  "#deleteTabButton",
  "#workspaceDeleteFolderButton",
  "#clearDeveloperDataButton",
  ".folder-delete",
  ".delete-animation-button",
  ".delete-image-button",
  ".delete-model-button",
  ".workspace-delete-button",
  ".developer-danger-action",
  ".advanced-delete-action",
  "[data-delete-project]",
  "[data-delete-task]",
  "[data-delete-id]",
  "[data-delete-snippet]",
  "[data-delete-animation]",
  "[data-delete-image]",
  "[data-delete-model]",
  "[data-delete-advanced]"
].join(",");

function getConfirmationCopy(button) {
  const text = button.textContent.trim().toLowerCase();

  if (button.id === "deleteTabButton") {
    return {
      title: "Delete this category?",
      message: "The category, its folders, and everything stored inside will be permanently removed.",
      action: "Yes, delete category"
    };
  }

  if (button.id === "workspaceDeleteFolderButton" || button.classList.contains("folder-delete")) {
    return {
      title: "Delete this folder?",
      message: "Everything saved inside this folder will also be permanently removed.",
      action: "Yes, delete folder"
    };
  }

  if (button.id === "clearDeveloperDataButton") {
    return {
      title: "Clear Developer Hub?",
      message: "All saved projects, tasks, Roblox IDs, and code snippets will be erased.",
      action: "Yes, clear data"
    };
  }

  if (text.includes("animation")) {
    return {
      title: "Delete this animation?",
      message: "The saved animation name and Roblox animation ID will be removed.",
      action: "Yes, delete animation"
    };
  }

  if (text.includes("model")) {
    return {
      title: "Delete this model?",
      message: "The uploaded model file, name, and description will be removed.",
      action: "Yes, delete model"
    };
  }

  if (text.includes("image")) {
    return {
      title: "Delete this image?",
      message: "The uploaded image will be permanently removed from this browser.",
      action: "Yes, delete image"
    };
  }

  return {
    title: "Are you sure?",
    message: "This item will be permanently deleted. This action cannot be undone.",
    action: "Yes, delete"
  };
}

document.addEventListener("click", event => {
  const button = event.target.closest(deleteSelectors);
  if (!button || button.disabled) return;

  if (confirmationBypass.has(button)) {
    confirmationBypass.delete(button);
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  pendingConfirmedButton = button;
  const copy = getConfirmationCopy(button);

  confirmationTitle.textContent = copy.title;
  confirmationMessage.textContent = copy.message;
  confirmationContinueButton.textContent = copy.action;
  confirmationDialog.showModal();
}, true);

confirmationCancelButton.addEventListener("click", () => {
  pendingConfirmedButton = null;
  confirmationDialog.close();
});

confirmationContinueButton.addEventListener("click", () => {
  const button = pendingConfirmedButton;
  pendingConfirmedButton = null;
  confirmationDialog.close();

  if (!button || !button.isConnected) return;

  confirmationBypass.add(button);

  const originalConfirm = window.confirm;
  window.confirm = () => true;

  try {
    button.click();
  } finally {
    window.confirm = originalConfirm;
  }
});

confirmationDialog.addEventListener("cancel", event => {
  event.preventDefault();
  pendingConfirmedButton = null;
  confirmationDialog.close();
});

/* Theme mode, tab direction, and tab-size settings */
const NAV_DISPLAY_KEY = "varsityNavigationDisplaySettings";
let navDisplaySettings = (() => {
  try {
    return {
      theme: "dark",
      orientation: "vertical",
      tabSize: 39,
      ...JSON.parse(localStorage.getItem(NAV_DISPLAY_KEY) || "{}")
    };
  } catch {
    return { theme: "dark", orientation: "vertical", tabSize: 39 };
  }
})();

function saveNavDisplaySettings() {
  localStorage.setItem(NAV_DISPLAY_KEY, JSON.stringify(navDisplaySettings));
}

function applyNavDisplaySettings() {
  const size = Math.max(32, Math.min(68, Number(navDisplaySettings.tabSize) || 39));
  navDisplaySettings.tabSize = size;

  document.body.dataset.themeMode = navDisplaySettings.theme;
  document.body.dataset.tabOrientation = navDisplaySettings.orientation;

  document.documentElement.style.setProperty("--custom-tab-height", `${size}px`);
  document.documentElement.style.setProperty(
    "--custom-tab-font-size",
    `${Math.max(0.7, Math.min(1.02, 0.7 + (size - 32) * 0.009))}rem`
  );
  document.documentElement.style.setProperty(
    "--custom-tab-icon-size",
    `${Math.max(20, Math.min(32, size - 17))}px`
  );

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = navDisplaySettings.theme === "light" ? "#f3f4f7" : (navDisplaySettings.theme === "extra-dark" ? "#020305" : "#08090d");
  }
}

const originalRenderSettingsForNavDisplay = renderSettingsPage;
renderSettingsPage = function renderSettingsPageWithNavDisplay() {
  originalRenderSettingsForNavDisplay();

  const settingsPage = tabContent.querySelector(".settings-page");
  if (!settingsPage) return;

  const panel = document.createElement("section");
  panel.className = "settings-panel nav-display-settings";
  panel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">DISPLAY & NAVIGATION</span>
        <h3>Theme and category tabs</h3>
        <p>Choose light or dark mode, switch the category direction, and resize every tab.</p>
      </div>
    </div>

    <div class="nav-setting-list">
      <div class="nav-setting-row">
        <div>
          <strong>Appearance mode</strong>
          <small>Change the full dashboard between dark and light mode.</small>
        </div>
        <div class="nav-segmented-control theme-mode-control">
          <button type="button" data-theme-choice="dark" class="${navDisplaySettings.theme === "dark" ? "selected" : ""}">Dark</button>
          <button type="button" data-theme-choice="extra-dark" class="${navDisplaySettings.theme === "extra-dark" ? "selected" : ""}">Extra Dark</button>
          <button type="button" data-theme-choice="light" class="${navDisplaySettings.theme === "light" ? "selected" : ""}">Light</button>
        </div>
      </div>

      <div class="nav-setting-row">
        <div>
          <strong>Tab direction</strong>
          <small>Keep categories vertically on the left or place them horizontally across the top.</small>
        </div>
        <div class="tab-orientation-options">
          <button type="button" data-orientation-choice="vertical" class="${navDisplaySettings.orientation === "vertical" ? "selected" : ""}">
            <span class="orientation-mini vertical-mini"><i></i><i></i><i></i></span>
            <span><strong>Vertical</strong><small>Left sidebar</small></span>
          </button>
          <button type="button" data-orientation-choice="horizontal" class="${navDisplaySettings.orientation === "horizontal" ? "selected" : ""}">
            <span class="orientation-mini horizontal-mini"><i></i><i></i><i></i></span>
            <span><strong>Horizontal</strong><small>Top navigation</small></span>
          </button>
        </div>
      </div>

      <div class="nav-setting-row tab-size-row">
        <div>
          <strong>Tab size</strong>
          <small>Resize Dashboard, Settings, Global Websites, developer tools, and custom categories.</small>
        </div>
        <div class="tab-size-settings">
          <div class="tab-size-labels">
            <span>Small</span>
            <output id="tabSizeValue">${navDisplaySettings.tabSize}px</output>
            <span>Large</span>
          </div>
          <input id="tabSizeSlider" type="range" min="32" max="68" step="1" value="${navDisplaySettings.tabSize}" />
          <div class="live-tab-preview">
            <span class="tab-preview-mark">01</span>
            <span>Category preview</span>
            <span>›</span>
          </div>
        </div>
      </div>
    </div>
  `;

  settingsPage.insertBefore(panel, settingsPage.firstChild);

  panel.querySelectorAll("[data-theme-choice]").forEach(button => {
    button.addEventListener("click", () => {
      navDisplaySettings.theme = button.dataset.themeChoice;
      saveNavDisplaySettings();
      applyNavDisplaySettings();
      renderSettingsPage();
    });
  });

  panel.querySelectorAll("[data-orientation-choice]").forEach(button => {
    button.addEventListener("click", () => {
      navDisplaySettings.orientation = button.dataset.orientationChoice;
      saveNavDisplaySettings();
      applyNavDisplaySettings();
      renderSettingsPage();
    });
  });

  const slider = document.getElementById("tabSizeSlider");
  const output = document.getElementById("tabSizeValue");

  slider.addEventListener("input", () => {
    navDisplaySettings.tabSize = Number(slider.value);
    output.textContent = `${slider.value}px`;
    saveNavDisplaySettings();
    applyNavDisplaySettings();
  });
};

applyNavDisplaySettings();


/* Advanced animation and interface customization */
const ADVANCED_INTERFACE_KEY = "varsityAdvancedInterfaceSettings";

const defaultAdvancedInterfaceSettings = {
  motionSpeed: 1,
  easingStyle: "smooth",
  pageTransitions: true,
  modalAnimations: true,
  hoverAnimations: true,
  staggerAnimations: true,
  blurTransitions: true,
  loadingDuration: 2050,
  hoverLift: 3,
  sidebarWidth: 225,
  contentScale: 100,
  fontScale: 100,
  cardSpacing: 14,
  panelOpacity: 96,
  glowStrength: 65,
  loadingTitle: "VARSITY STUDIOS",
  loadingSubtitle: "Loading Dashboard",
  loginBackgroundLineOne: "VARSITY STUDIOS",
  loginBackgroundLineTwo: "LOG IN"
};

let advancedInterfaceSettings = loadAdvancedInterfaceSettings();

function loadAdvancedInterfaceSettings() {
  try {
    return {
      ...defaultAdvancedInterfaceSettings,
      ...JSON.parse(localStorage.getItem(ADVANCED_INTERFACE_KEY) || "{}")
    };
  } catch {
    return { ...defaultAdvancedInterfaceSettings };
  }
}

function saveAdvancedInterfaceSettings() {
  localStorage.setItem(
    ADVANCED_INTERFACE_KEY,
    JSON.stringify(advancedInterfaceSettings)
  );
}

function applyAdvancedInterfaceSettings() {
  const root = document.documentElement;

  const speed = Math.max(0.45, Math.min(1.8, Number(advancedInterfaceSettings.motionSpeed) || 1));
  const sidebarWidth = Math.max(185, Math.min(340, Number(advancedInterfaceSettings.sidebarWidth) || 225));
  const contentScale = Math.max(85, Math.min(115, Number(advancedInterfaceSettings.contentScale) || 100));
  const fontScale = Math.max(85, Math.min(120, Number(advancedInterfaceSettings.fontScale) || 100));
  const cardSpacing = Math.max(6, Math.min(28, Number(advancedInterfaceSettings.cardSpacing) || 14));
  const panelOpacity = Math.max(72, Math.min(100, Number(advancedInterfaceSettings.panelOpacity) || 96));
  const glowStrength = Math.max(0, Math.min(100, Number(advancedInterfaceSettings.glowStrength) || 65));
  const hoverLift = Math.max(0, Math.min(10, Number(advancedInterfaceSettings.hoverLift) || 3));

  root.style.setProperty("--motion-speed", speed);
  root.style.setProperty("--sidebar-custom-width", `${sidebarWidth}px`);
  root.style.setProperty("--content-custom-scale", contentScale / 100);
  root.style.setProperty("--font-custom-scale", fontScale / 100);
  root.style.setProperty("--card-custom-spacing", `${cardSpacing}px`);
  root.style.setProperty("--panel-custom-opacity", panelOpacity / 100);
  root.style.setProperty("--glow-custom-strength", glowStrength / 100);
  root.style.setProperty("--hover-custom-lift", `${hoverLift}px`);

  document.body.dataset.motionEasing = advancedInterfaceSettings.easingStyle;
  document.body.classList.toggle("disable-page-transitions", !advancedInterfaceSettings.pageTransitions);
  document.body.classList.toggle("disable-modal-animations", !advancedInterfaceSettings.modalAnimations);
  document.body.classList.toggle("disable-hover-animations", !advancedInterfaceSettings.hoverAnimations);
  document.body.classList.toggle("disable-stagger-animations", !advancedInterfaceSettings.staggerAnimations);
  document.body.classList.toggle("disable-blur-transitions", !advancedInterfaceSettings.blurTransitions);

  const loadingTitle = document.querySelector(".site-loading-title");
  const loadingSubtitle = document.querySelector(".site-loading-subtitle");
  const loginBackgroundLines = document.querySelectorAll(".login-background-title span, .login-background-title strong");

  if (loadingTitle) {
    loadingTitle.textContent = advancedInterfaceSettings.loadingTitle || "VARSITY STUDIOS";
  }

  if (loadingSubtitle) {
    loadingSubtitle.textContent = advancedInterfaceSettings.loadingSubtitle || "Loading Dashboard";
  }

  if (loginBackgroundLines[0]) {
    loginBackgroundLines[0].textContent = advancedInterfaceSettings.loginBackgroundLineOne || "VARSITY STUDIOS";
  }

  if (loginBackgroundLines[1]) {
    loginBackgroundLines[1].textContent = advancedInterfaceSettings.loginBackgroundLineTwo || "LOG IN";
  }
}

const previousRenderSettingsPageForAdvancedInterface = renderSettingsPage;
renderSettingsPage = function renderSettingsWithAdvancedInterface() {
  previousRenderSettingsPageForAdvancedInterface();

  const settingsPage = tabContent.querySelector(".settings-page");
  if (!settingsPage) return;

  const animationPanel = document.createElement("section");
  animationPanel.className = "settings-panel advanced-animation-settings";
  animationPanel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">ADVANCED ANIMATIONS</span>
        <h3>Motion controls</h3>
        <p>Fine-tune how fast, smooth, and animated the dashboard feels.</p>
      </div>
    </div>

    <div class="advanced-control-stack">
      ${renderAdvancedRangeSetting(
        "Animation speed",
        "Control the overall speed of page, card, modal, and hover animations.",
        "advancedMotionSpeed",
        advancedInterfaceSettings.motionSpeed,
        0.45,
        1.8,
        0.05,
        `${advancedInterfaceSettings.motionSpeed.toFixed(2)}×`
      )}

      <div class="advanced-control-row">
        <div>
          <strong>Easing style</strong>
          <small>Choose how movement accelerates and slows down.</small>
        </div>
        <select id="advancedEasingStyle">
          <option value="smooth" ${advancedInterfaceSettings.easingStyle === "smooth" ? "selected" : ""}>Smooth</option>
          <option value="snappy" ${advancedInterfaceSettings.easingStyle === "snappy" ? "selected" : ""}>Snappy</option>
          <option value="cinematic" ${advancedInterfaceSettings.easingStyle === "cinematic" ? "selected" : ""}>Cinematic</option>
          <option value="soft" ${advancedInterfaceSettings.easingStyle === "soft" ? "selected" : ""}>Soft</option>
        </select>
      </div>

      ${renderAdvancedToggleSetting(
        "Page transitions",
        "Animate when switching Dashboard, Settings, folders, and developer pages.",
        "advancedPageTransitions",
        advancedInterfaceSettings.pageTransitions
      )}

      ${renderAdvancedToggleSetting(
        "Modal animations",
        "Animate dialogs such as Add Folder, Edit, and delete confirmations.",
        "advancedModalAnimations",
        advancedInterfaceSettings.modalAnimations
      )}

      ${renderAdvancedToggleSetting(
        "Hover animations",
        "Animate cards, buttons, navigation tabs, and folder rows on hover.",
        "advancedHoverAnimations",
        advancedInterfaceSettings.hoverAnimations
      )}

      ${renderAdvancedToggleSetting(
        "Staggered lists",
        "Make rows and cards enter one after another instead of all at once.",
        "advancedStaggerAnimations",
        advancedInterfaceSettings.staggerAnimations
      )}

      ${renderAdvancedToggleSetting(
        "Blur transitions",
        "Use subtle blur while loading and switching major views.",
        "advancedBlurTransitions",
        advancedInterfaceSettings.blurTransitions
      )}

      ${renderAdvancedRangeSetting(
        "Hover lift",
        "Control how far cards and buttons move upward while hovering.",
        "advancedHoverLift",
        advancedInterfaceSettings.hoverLift,
        0,
        10,
        1,
        `${advancedInterfaceSettings.hoverLift}px`
      )}

      ${renderAdvancedRangeSetting(
        "Loading screen duration",
        "Change how long the loading screen remains before the login appears.",
        "advancedLoadingDuration",
        advancedInterfaceSettings.loadingDuration,
        900,
        5000,
        50,
        `${advancedInterfaceSettings.loadingDuration}ms`
      )}
    </div>
  `;

  const layoutPanel = document.createElement("section");
  layoutPanel.className = "settings-panel advanced-layout-settings";
  layoutPanel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">ADVANCED LAYOUT</span>
        <h3>Size and spacing controls</h3>
        <p>Adjust the dashboard proportions without editing CSS manually.</p>
      </div>
    </div>

    <div class="advanced-control-stack">
      ${renderAdvancedRangeSetting(
        "Sidebar width",
        "Resize the vertical category sidebar.",
        "advancedSidebarWidth",
        advancedInterfaceSettings.sidebarWidth,
        185,
        340,
        1,
        `${advancedInterfaceSettings.sidebarWidth}px`
      )}

      ${renderAdvancedRangeSetting(
        "Content scale",
        "Scale the main dashboard content area.",
        "advancedContentScale",
        advancedInterfaceSettings.contentScale,
        85,
        115,
        1,
        `${advancedInterfaceSettings.contentScale}%`
      )}

      ${renderAdvancedRangeSetting(
        "Font scale",
        "Change the size of text throughout the dashboard.",
        "advancedFontScale",
        advancedInterfaceSettings.fontScale,
        85,
        120,
        1,
        `${advancedInterfaceSettings.fontScale}%`
      )}

      ${renderAdvancedRangeSetting(
        "Card spacing",
        "Control spacing between dashboard cards, folders, and lists.",
        "advancedCardSpacing",
        advancedInterfaceSettings.cardSpacing,
        6,
        28,
        1,
        `${advancedInterfaceSettings.cardSpacing}px`
      )}

      ${renderAdvancedRangeSetting(
        "Panel opacity",
        "Make panels more solid or more transparent.",
        "advancedPanelOpacity",
        advancedInterfaceSettings.panelOpacity,
        72,
        100,
        1,
        `${advancedInterfaceSettings.panelOpacity}%`
      )}

      ${renderAdvancedRangeSetting(
        "Glow strength",
        "Control how visible the selected colorway glow appears.",
        "advancedGlowStrength",
        advancedInterfaceSettings.glowStrength,
        0,
        100,
        1,
        `${advancedInterfaceSettings.glowStrength}%`
      )}
    </div>
  `;

  const textPanel = document.createElement("section");
  textPanel.className = "settings-panel advanced-text-settings";
  textPanel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">CUSTOM TEXT</span>
        <h3>Loading and login wording</h3>
        <p>Edit the text shown during loading and behind the login card.</p>
      </div>
    </div>

    <form id="advancedInterfaceTextForm" class="advanced-text-form">
      <label>
        <span>Loading title</span>
        <input id="advancedLoadingTitle" type="text" maxlength="60" value="${escapeAttribute(advancedInterfaceSettings.loadingTitle)}" />
      </label>

      <label>
        <span>Loading subtitle</span>
        <input id="advancedLoadingSubtitle" type="text" maxlength="80" value="${escapeAttribute(advancedInterfaceSettings.loadingSubtitle)}" />
      </label>

      <label>
        <span>Login background line one</span>
        <input id="advancedLoginLineOne" type="text" maxlength="60" value="${escapeAttribute(advancedInterfaceSettings.loginBackgroundLineOne)}" />
      </label>

      <label>
        <span>Login background line two</span>
        <input id="advancedLoginLineTwo" type="text" maxlength="60" value="${escapeAttribute(advancedInterfaceSettings.loginBackgroundLineTwo)}" />
      </label>

      <div class="advanced-text-actions">
        <button class="primary-button compact" type="submit">Save custom text</button>
        <button id="resetAdvancedInterfaceButton" class="secondary-button" type="button">Reset advanced settings</button>
      </div>
    </form>
  `;

  const firstSettingsPanel = settingsPage.firstElementChild;
  settingsPage.insertBefore(animationPanel, firstSettingsPanel);
  settingsPage.insertBefore(layoutPanel, firstSettingsPanel);
  settingsPage.insertBefore(textPanel, firstSettingsPanel);

  bindAdvancedInterfaceSettings();
};

function renderAdvancedRangeSetting(title, description, id, value, min, max, step, outputText) {
  return `
    <div class="advanced-control-row advanced-range-row">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(description)}</small>
      </div>

      <div class="advanced-range-control">
        <output id="${id}Output">${escapeHtml(outputText)}</output>
        <input
          id="${id}"
          type="range"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
        />
      </div>
    </div>
  `;
}

function renderAdvancedToggleSetting(title, description, id, checked) {
  return `
    <label class="advanced-control-row advanced-toggle-row" for="${id}">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(description)}</small>
      </div>
      <input id="${id}" class="settings-toggle" type="checkbox" ${checked ? "checked" : ""} />
    </label>
  `;
}

function bindAdvancedInterfaceSettings() {
  const rangeSettings = [
    ["advancedMotionSpeed", "motionSpeed", value => `${Number(value).toFixed(2)}×`],
    ["advancedHoverLift", "hoverLift", value => `${value}px`],
    ["advancedLoadingDuration", "loadingDuration", value => `${value}ms`],
    ["advancedSidebarWidth", "sidebarWidth", value => `${value}px`],
    ["advancedContentScale", "contentScale", value => `${value}%`],
    ["advancedFontScale", "fontScale", value => `${value}%`],
    ["advancedCardSpacing", "cardSpacing", value => `${value}px`],
    ["advancedPanelOpacity", "panelOpacity", value => `${value}%`],
    ["advancedGlowStrength", "glowStrength", value => `${value}%`]
  ];

  rangeSettings.forEach(([inputId, key, formatter]) => {
    const input = document.getElementById(inputId);
    const output = document.getElementById(`${inputId}Output`);

    input.addEventListener("input", () => {
      advancedInterfaceSettings[key] = Number(input.value);
      output.textContent = formatter(input.value);
      saveAdvancedInterfaceSettings();
      applyAdvancedInterfaceSettings();
    });
  });

  const toggleSettings = [
    ["advancedPageTransitions", "pageTransitions"],
    ["advancedModalAnimations", "modalAnimations"],
    ["advancedHoverAnimations", "hoverAnimations"],
    ["advancedStaggerAnimations", "staggerAnimations"],
    ["advancedBlurTransitions", "blurTransitions"]
  ];

  toggleSettings.forEach(([inputId, key]) => {
    document.getElementById(inputId).addEventListener("change", event => {
      advancedInterfaceSettings[key] = event.target.checked;
      saveAdvancedInterfaceSettings();
      applyAdvancedInterfaceSettings();
    });
  });

  document.getElementById("advancedEasingStyle").addEventListener("change", event => {
    advancedInterfaceSettings.easingStyle = event.target.value;
    saveAdvancedInterfaceSettings();
    applyAdvancedInterfaceSettings();
  });

  document.getElementById("advancedInterfaceTextForm").addEventListener("submit", event => {
    event.preventDefault();

    advancedInterfaceSettings.loadingTitle =
      document.getElementById("advancedLoadingTitle").value.trim() || "VARSITY STUDIOS";
    advancedInterfaceSettings.loadingSubtitle =
      document.getElementById("advancedLoadingSubtitle").value.trim() || "Loading Dashboard";
    advancedInterfaceSettings.loginBackgroundLineOne =
      document.getElementById("advancedLoginLineOne").value.trim() || "VARSITY STUDIOS";
    advancedInterfaceSettings.loginBackgroundLineTwo =
      document.getElementById("advancedLoginLineTwo").value.trim() || "LOG IN";

    saveAdvancedInterfaceSettings();
    applyAdvancedInterfaceSettings();
  });

  document.getElementById("resetAdvancedInterfaceButton").addEventListener("click", () => {
    if (!window.confirm("Reset all advanced animation, layout, and text settings?")) return;

    advancedInterfaceSettings = { ...defaultAdvancedInterfaceSettings };
    saveAdvancedInterfaceSettings();
    applyAdvancedInterfaceSettings();
    renderSettingsPage();
  });
}

applyAdvancedInterfaceSettings();


/* Advanced tabs, folders, and horizontal navigation placement */
const ADVANCED_ORGANIZER_KEY = "varsityAdvancedOrganizerSettings";

let advancedOrganizerSettings = (() => {
  try {
    return {
      horizontalPosition: "top",
      folderView: "grid",
      folderSort: "manual",
      ...JSON.parse(localStorage.getItem(ADVANCED_ORGANIZER_KEY) || "{}")
    };
  } catch {
    return {
      horizontalPosition: "top",
      folderView: "grid",
      folderSort: "manual"
    };
  }
})();

let folderSearchQuery = "";

function saveAdvancedOrganizerSettings() {
  localStorage.setItem(
    ADVANCED_ORGANIZER_KEY,
    JSON.stringify(advancedOrganizerSettings)
  );
}

function applyAdvancedOrganizerSettings() {
  document.body.dataset.horizontalPosition =
    advancedOrganizerSettings.horizontalPosition;
  document.body.dataset.folderView = advancedOrganizerSettings.folderView;
}

function normalizeAdvancedOrganizerData() {
  tabs.forEach((tab, tabIndex) => {
    tab.icon ||= String(tabIndex + 1).padStart(2, "0");
    tab.accent ||= "default";
    tab.pinned = Boolean(tab.pinned);

    tab.folders.forEach(folder => {
      folder.status ||= "Active";
      folder.priority ||= "Normal";
      folder.tags = Array.isArray(folder.tags) ? folder.tags : [];
      folder.favorite = Boolean(folder.favorite);
      folder.accent ||= "default";
      folder.createdAt ||= Date.now();
      folder.updatedAt ||= folder.createdAt;
    });
  });
}

function getOrganizerAccentStyle(accent) {
  const accents = {
    default: "var(--red-bright)",
    blue: "#4b8cff",
    purple: "#a66cff",
    green: "#42d57d",
    orange: "#ff8b43",
    pink: "#ff65ad",
    yellow: "#e6ba3d"
  };

  return accents[accent] || accents.default;
}

function organizerEscape(value) {
  return escapeHtml(String(value ?? ""));
}

const organizerBaseRenderNavigation = renderNavigation;
renderNavigation = function renderNavigationWithTabMetadata() {
  normalizeAdvancedOrganizerData();

  tabs.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  organizerBaseRenderNavigation();

  const fixedButtonCount = Array.from(sidebarTabs.children)
    .findIndex(button => tabs.some(tab => button.textContent.includes(tab.name)));

  const tabButtons = Array.from(sidebarTabs.querySelectorAll(".tab-button"));

  tabs.forEach(tab => {
    const button = tabButtons.find(item =>
      item.textContent.trim().includes(tab.name)
    );

    if (!button) return;

    const mark = button.querySelector(".tab-mark");
    if (mark) {
      mark.textContent = tab.icon || "TAB";
      mark.style.setProperty("--tab-accent", getOrganizerAccentStyle(tab.accent));
      mark.classList.add("custom-tab-mark");
    }

    if (tab.pinned) {
      button.classList.add("pinned-tab-button");
      button.title = `${tab.name} • Pinned`;
    }
  });

  applyAdvancedOrganizerSettings();
};

const organizerBaseRenderSettingsPage = renderSettingsPage;
renderSettingsPage = function renderSettingsPageWithOrganizerControls() {
  organizerBaseRenderSettingsPage();

  const settingsPage = tabContent.querySelector(".settings-page");
  if (!settingsPage) return;

  const panel = document.createElement("section");
  panel.className = "settings-panel organizer-settings-panel";
  panel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">TAB & FOLDER LAYOUT</span>
        <h3>Advanced organizer controls</h3>
        <p>Choose whether horizontal tabs appear above or below the dashboard and set the default folder layout.</p>
      </div>
    </div>

    <div class="organizer-setting-list">
      <div class="organizer-setting-row">
        <div>
          <strong>Horizontal tab position</strong>
          <small>This applies whenever Tab direction is set to Horizontal.</small>
        </div>

        <div class="organizer-choice-control">
          <button
            type="button"
            data-horizontal-position="top"
            class="${advancedOrganizerSettings.horizontalPosition === "top" ? "selected" : ""}"
          >
            Top
          </button>
          <button
            type="button"
            data-horizontal-position="bottom"
            class="${advancedOrganizerSettings.horizontalPosition === "bottom" ? "selected" : ""}"
          >
            Bottom
          </button>
        </div>
      </div>

      <div class="organizer-setting-row">
        <div>
          <strong>Default folder appearance</strong>
          <small>Switch categories between larger cards and a compact information list.</small>
        </div>

        <div class="organizer-choice-control">
          <button
            type="button"
            data-folder-view="grid"
            class="${advancedOrganizerSettings.folderView === "grid" ? "selected" : ""}"
          >
            Grid
          </button>
          <button
            type="button"
            data-folder-view="list"
            class="${advancedOrganizerSettings.folderView === "list" ? "selected" : ""}"
          >
            List
          </button>
        </div>
      </div>

      <div class="organizer-setting-row">
        <div>
          <strong>Default folder sorting</strong>
          <small>Choose how folders are arranged when opening a category.</small>
        </div>

        <select id="organizerFolderSort">
          <option value="manual" ${advancedOrganizerSettings.folderSort === "manual" ? "selected" : ""}>Manual order</option>
          <option value="name" ${advancedOrganizerSettings.folderSort === "name" ? "selected" : ""}>Name</option>
          <option value="updated" ${advancedOrganizerSettings.folderSort === "updated" ? "selected" : ""}>Recently updated</option>
          <option value="status" ${advancedOrganizerSettings.folderSort === "status" ? "selected" : ""}>Status</option>
          <option value="priority" ${advancedOrganizerSettings.folderSort === "priority" ? "selected" : ""}>Priority</option>
        </select>
      </div>
    </div>
  `;

  settingsPage.insertBefore(panel, settingsPage.firstElementChild);

  panel.querySelectorAll("[data-horizontal-position]").forEach(button => {
    button.addEventListener("click", () => {
      advancedOrganizerSettings.horizontalPosition =
        button.dataset.horizontalPosition;
      saveAdvancedOrganizerSettings();
      applyAdvancedOrganizerSettings();
      renderSettingsPage();
    });
  });

  panel.querySelectorAll("[data-folder-view]").forEach(button => {
    button.addEventListener("click", () => {
      advancedOrganizerSettings.folderView = button.dataset.folderView;
      saveAdvancedOrganizerSettings();
      applyAdvancedOrganizerSettings();
      renderSettingsPage();
    });
  });

  document.getElementById("organizerFolderSort").addEventListener("change", event => {
    advancedOrganizerSettings.folderSort = event.target.value;
    saveAdvancedOrganizerSettings();
  });
};

function getSortedAdvancedFolders(tab) {
  const query = folderSearchQuery.trim().toLowerCase();

  let folders = tab.folders.filter(folder => {
    if (!query) return true;

    return [
      folder.name,
      folder.description,
      folder.status,
      folder.priority,
      ...(folder.tags || [])
    ].some(value => String(value).toLowerCase().includes(query));
  });

  if (advancedOrganizerSettings.folderSort === "name") {
    folders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (advancedOrganizerSettings.folderSort === "updated") {
    folders = [...folders].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  if (advancedOrganizerSettings.folderSort === "status") {
    folders = [...folders].sort((a, b) => a.status.localeCompare(b.status));
  }

  if (advancedOrganizerSettings.folderSort === "priority") {
    const order = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
    folders = [...folders].sort(
      (a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
    );
  }

  return folders.sort(
    (a, b) => Number(b.favorite) - Number(a.favorite)
  );
}

function getAdvancedFolderItemCount(folder) {
  return (
    (folder.animations?.length || 0) +
    (folder.images?.length || 0) +
    (folder.models?.length || 0)
  );
}

function renderCustomTab() {
  normalizeAdvancedOrganizerData();

  const activeTab = getActiveTab();

  pageTitle.textContent = activeTab.name;
  pageSubtitle.textContent =
    activeTab.description || "Custom Varsity Studios dashboard category.";
  contentTitle.textContent = activeTab.name;

  deleteTabButton.disabled = tabs.length === 1;
  deleteTabButton.classList.toggle("disabled-button", tabs.length === 1);
  deleteTabButton.title =
    tabs.length === 1 ? "You must keep at least one custom tab." : "";

  tabContent.innerHTML = `
    <div class="advanced-tab-page">
      <section class="advanced-tab-toolbar">
        <div class="advanced-tab-identity">
          <span
            class="advanced-tab-icon"
            style="--organizer-accent:${getOrganizerAccentStyle(activeTab.accent)}"
          >
            ${organizerEscape(activeTab.icon)}
          </span>
          <div>
            <span class="dashboard-kicker">CATEGORY</span>
            <h3>${organizerEscape(activeTab.name)}</h3>
            <p>${organizerEscape(activeTab.description)}</p>
          </div>
        </div>

        <div class="advanced-tab-actions">
          <button id="advancedEditTab" class="secondary-button" type="button">Edit tab</button>
          <button id="advancedPinTab" class="secondary-button" type="button">
            ${activeTab.pinned ? "Unpin" : "Pin"}
          </button>
          <button id="advancedMoveTabLeft" class="secondary-button" type="button">←</button>
          <button id="advancedMoveTabRight" class="secondary-button" type="button">→</button>
          <button id="advancedDuplicateTab" class="secondary-button" type="button">Duplicate</button>
        </div>
      </section>

      <section class="folder-organizer-toolbar">
        <div class="folder-search-control">
          <span>⌕</span>
          <input
            id="advancedFolderSearch"
            type="search"
            value="${organizerEscape(folderSearchQuery)}"
            placeholder="Search folders, tags, status, or priority..."
          />
        </div>

        <select id="advancedFolderSort">
          <option value="manual" ${advancedOrganizerSettings.folderSort === "manual" ? "selected" : ""}>Manual order</option>
          <option value="name" ${advancedOrganizerSettings.folderSort === "name" ? "selected" : ""}>Name</option>
          <option value="updated" ${advancedOrganizerSettings.folderSort === "updated" ? "selected" : ""}>Recently updated</option>
          <option value="status" ${advancedOrganizerSettings.folderSort === "status" ? "selected" : ""}>Status</option>
          <option value="priority" ${advancedOrganizerSettings.folderSort === "priority" ? "selected" : ""}>Priority</option>
        </select>

        <div class="folder-view-switch">
          <button
            type="button"
            data-set-folder-view="grid"
            class="${advancedOrganizerSettings.folderView === "grid" ? "selected" : ""}"
          >
            Grid
          </button>
          <button
            type="button"
            data-set-folder-view="list"
            class="${advancedOrganizerSettings.folderView === "list" ? "selected" : ""}"
          >
            List
          </button>
        </div>
      </section>

      <div id="advancedFoldersContainer"></div>
    </div>
  `;

  renderAdvancedFolders(activeTab);
  bindAdvancedTabEvents(activeTab);
}

function renderAdvancedFolders(activeTab) {
  const container = document.getElementById("advancedFoldersContainer");
  if (!container) return;

  const folders = getSortedAdvancedFolders(activeTab);

  if (!activeTab.folders.length) {
    container.innerHTML = `
      <div class="empty-state animated-empty">
        <div class="empty-icon">V</div>
        <h3>${organizerEscape(activeTab.name)}</h3>
        <p>This category is ready for folders.</p>
        <p class="empty-hint">Select <strong>+ Add folder</strong> to start organizing it.</p>
      </div>
    `;
    return;
  }

  if (!folders.length) {
    container.innerHTML = `
      <div class="advanced-folder-no-results">
        <strong>No folders matched your search.</strong>
        <span>Try a folder name, tag, status, or priority.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="advanced-folder-collection ${advancedOrganizerSettings.folderView === "list" ? "list-view" : "grid-view"}">
      ${folders.map((folder, visibleIndex) => `
        <article
          class="advanced-folder-card ${folder.favorite ? "favorite-folder" : ""}"
          style="--folder-accent:${getOrganizerAccentStyle(folder.accent)};--folder-index:${visibleIndex}"
        >
          <button
            class="advanced-folder-open"
            type="button"
            data-open-advanced-folder="${folder.id}"
          >
            <span class="advanced-folder-top">
              <span class="advanced-folder-icon">
                <span></span>
                ${folder.favorite ? "★" : "V"}
              </span>

              <span class="advanced-folder-status status-${folder.status.toLowerCase().replaceAll(" ", "-")}">
                ${organizerEscape(folder.status)}
              </span>
            </span>

            <span class="advanced-folder-copy">
              <strong>${organizerEscape(folder.name)}</strong>
              <span>${organizerEscape(folder.description)}</span>
            </span>

            <span class="advanced-folder-metadata">
              <span>${getAdvancedFolderItemCount(folder)} items</span>
              <span>${organizerEscape(folder.priority)} priority</span>
            </span>

            <span class="advanced-folder-tags">
              ${(folder.tags || []).slice(0, 4).map(tag => `<i>${organizerEscape(tag)}</i>`).join("")}
            </span>
          </button>

          <div class="advanced-folder-actions">
            <button type="button" data-favorite-folder="${folder.id}" title="Favorite folder">
              ${folder.favorite ? "★" : "☆"}
            </button>
            <button type="button" data-edit-folder-meta="${folder.id}">Edit</button>
            <button type="button" data-move-folder-up="${folder.id}">↑</button>
            <button type="button" data-move-folder-down="${folder.id}">↓</button>
            <button type="button" data-duplicate-folder="${folder.id}">Duplicate</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  bindAdvancedFolderEvents(activeTab);
}

function bindAdvancedTabEvents(activeTab) {
  document.getElementById("advancedFolderSearch").addEventListener("input", event => {
    folderSearchQuery = event.target.value;
    renderAdvancedFolders(activeTab);
  });

  document.getElementById("advancedFolderSort").addEventListener("change", event => {
    advancedOrganizerSettings.folderSort = event.target.value;
    saveAdvancedOrganizerSettings();
    renderAdvancedFolders(activeTab);
  });

  tabContent.querySelectorAll("[data-set-folder-view]").forEach(button => {
    button.addEventListener("click", () => {
      advancedOrganizerSettings.folderView = button.dataset.setFolderView;
      saveAdvancedOrganizerSettings();
      applyAdvancedOrganizerSettings();
      renderCustomTab();
    });
  });

  document.getElementById("advancedEditTab").addEventListener("click", () => {
    const name = window.prompt("Tab name:", activeTab.name);
    if (name === null || !name.trim()) return;

    const description = window.prompt("Tab description:", activeTab.description || "");
    if (description === null) return;

    const icon = window.prompt("Short tab icon or letters:", activeTab.icon || "TAB");
    if (icon === null) return;

    const accent = window.prompt(
      "Accent: default, blue, purple, green, orange, pink, or yellow",
      activeTab.accent || "default"
    );
    if (accent === null) return;

    activeTab.name = name.trim();
    activeTab.description = description.trim();
    activeTab.icon = icon.trim().slice(0, 4) || "TAB";
    activeTab.accent = accent.trim().toLowerCase() || "default";

    saveData();
    renderNavigation();
  });

  document.getElementById("advancedPinTab").addEventListener("click", () => {
    activeTab.pinned = !activeTab.pinned;
    saveData();
    renderNavigation();
  });

  document.getElementById("advancedDuplicateTab").addEventListener("click", () => {
    const clone = JSON.parse(JSON.stringify(activeTab));
    clone.id = makeId(`${activeTab.name}-copy`);
    clone.name = `${activeTab.name} Copy`;
    clone.pinned = false;

    clone.folders.forEach(folder => {
      folder.id = makeId(`${folder.name}-copy`);
      folder.name = `${folder.name} Copy`;
      folder.createdAt = Date.now();
      folder.updatedAt = Date.now();

      folder.animations?.forEach(item => item.id = makeId(item.name));
      folder.images?.forEach(item => item.id = makeId(item.name));
      folder.models?.forEach(item => item.id = makeId(item.name));
    });

    tabs.push(clone);
    activeView = `tab:${clone.id}`;
    saveData();
    renderNavigation();
  });

  document.getElementById("advancedMoveTabLeft").addEventListener("click", () => {
    moveAdvancedArrayItem(tabs, activeTab.id, -1);
    saveData();
    renderNavigation();
  });

  document.getElementById("advancedMoveTabRight").addEventListener("click", () => {
    moveAdvancedArrayItem(tabs, activeTab.id, 1);
    saveData();
    renderNavigation();
  });
}

function bindAdvancedFolderEvents(activeTab) {
  tabContent.querySelectorAll("[data-open-advanced-folder]").forEach(button => {
    button.addEventListener("click", () => {
      activeView = `folder:${activeTab.id}:${button.dataset.openAdvancedFolder}`;
      renderNavigation();
      animateContentRefresh();
    });
  });

  tabContent.querySelectorAll("[data-favorite-folder]").forEach(button => {
    button.addEventListener("click", () => {
      const folder = activeTab.folders.find(item => item.id === button.dataset.favoriteFolder);
      if (!folder) return;

      folder.favorite = !folder.favorite;
      folder.updatedAt = Date.now();
      saveData();
      renderAdvancedFolders(activeTab);
    });
  });

  tabContent.querySelectorAll("[data-edit-folder-meta]").forEach(button => {
    button.addEventListener("click", () => {
      const folder = activeTab.folders.find(item => item.id === button.dataset.editFolderMeta);
      if (!folder) return;

      const name = window.prompt("Folder name:", folder.name);
      if (name === null || !name.trim()) return;

      const description = window.prompt("Folder description:", folder.description);
      if (description === null || !description.trim()) return;

      const status = window.prompt(
        "Status: Active, Planning, Paused, Completed, or Archived",
        folder.status
      );
      if (status === null || !status.trim()) return;

      const priority = window.prompt(
        "Priority: Urgent, High, Normal, or Low",
        folder.priority
      );
      if (priority === null || !priority.trim()) return;

      const tags = window.prompt(
        "Tags separated by commas:",
        (folder.tags || []).join(", ")
      );
      if (tags === null) return;

      const accent = window.prompt(
        "Accent: default, blue, purple, green, orange, pink, or yellow",
        folder.accent
      );
      if (accent === null) return;

      folder.name = name.trim();
      folder.description = description.trim();
      folder.status = status.trim();
      folder.priority = priority.trim();
      folder.tags = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 8);
      folder.accent = accent.trim().toLowerCase() || "default";
      folder.updatedAt = Date.now();

      saveData();
      renderCustomTab();
    });
  });

  tabContent.querySelectorAll("[data-duplicate-folder]").forEach(button => {
    button.addEventListener("click", () => {
      const folder = activeTab.folders.find(item => item.id === button.dataset.duplicateFolder);
      if (!folder) return;

      const clone = JSON.parse(JSON.stringify(folder));
      clone.id = makeId(`${folder.name}-copy`);
      clone.name = `${folder.name} Copy`;
      clone.favorite = false;
      clone.createdAt = Date.now();
      clone.updatedAt = Date.now();

      clone.animations?.forEach(item => item.id = makeId(item.name));
      clone.images?.forEach(item => item.id = makeId(item.name));
      clone.models?.forEach(item => item.id = makeId(item.name));

      activeTab.folders.push(clone);
      saveData();
      renderAdvancedFolders(activeTab);
    });
  });

  tabContent.querySelectorAll("[data-move-folder-up]").forEach(button => {
    button.addEventListener("click", () => {
      moveAdvancedArrayItem(activeTab.folders, button.dataset.moveFolderUp, -1);
      advancedOrganizerSettings.folderSort = "manual";
      saveAdvancedOrganizerSettings();
      saveData();
      renderCustomTab();
    });
  });

  tabContent.querySelectorAll("[data-move-folder-down]").forEach(button => {
    button.addEventListener("click", () => {
      moveAdvancedArrayItem(activeTab.folders, button.dataset.moveFolderDown, 1);
      advancedOrganizerSettings.folderSort = "manual";
      saveAdvancedOrganizerSettings();
      saveData();
      renderCustomTab();
    });
  });
}

function moveAdvancedArrayItem(collection, itemId, direction) {
  const currentIndex = collection.findIndex(item => item.id === itemId);
  const targetIndex = currentIndex + direction;

  if (
    currentIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= collection.length
  ) return;

  [collection[currentIndex], collection[targetIndex]] =
    [collection[targetIndex], collection[currentIndex]];
}

const organizerBaseRenderFolderWorkspace = renderFolderWorkspace;
renderFolderWorkspace = function renderFolderWorkspaceWithMetadata() {
  organizerBaseRenderFolderWorkspace();

  const folder = getCurrentFolder();
  if (!folder) return;

  const hero = tabContent.querySelector(".folder-workspace-hero");
  if (!hero) return;

  hero.style.setProperty("--folder-accent", getOrganizerAccentStyle(folder.accent));

  hero.insertAdjacentHTML("beforeend", `
    <div class="workspace-folder-metadata-panel">
      <span class="workspace-folder-meta-status">${organizerEscape(folder.status)}</span>
      <span>${organizerEscape(folder.priority)} priority</span>
      ${(folder.tags || []).map(tag => `<i>${organizerEscape(tag)}</i>`).join("")}
    </div>
  `);
};

applyAdvancedOrganizerSettings();
normalizeAdvancedOrganizerData();


/* Deep folder management upgrade */
function normalizeDeepFolderData() {
  tabs.forEach(tab => {
    tab.folders.forEach(folder => {
      folder.notes ||= "";
      folder.dueDate ||= "";
      folder.owner ||= "";
      folder.visibility ||= "Private";
      folder.progress = Number.isFinite(Number(folder.progress))
        ? Math.max(0, Math.min(100, Number(folder.progress)))
        : 0;
      folder.checklist = Array.isArray(folder.checklist) ? folder.checklist : [];
      folder.links = Array.isArray(folder.links) ? folder.links : [];
      folder.customFields = Array.isArray(folder.customFields) ? folder.customFields : [];
      folder.activity = Array.isArray(folder.activity) ? folder.activity : [];
      folder.archived = Boolean(folder.archived);
      folder.template ||= "None";
      folder.updatedAt ||= Date.now();
    });
  });
}

function addFolderActivity(folder, message) {
  normalizeDeepFolderData();

  folder.activity.unshift({
    id: makeId(message),
    message,
    at: Date.now()
  });

  folder.activity = folder.activity.slice(0, 30);
  folder.updatedAt = Date.now();
}

function formatFolderActivityTime(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function sanitizeFolderUrl(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

const deepFolderBaseRenderFolderWorkspace = renderFolderWorkspace;
renderFolderWorkspace = function renderFolderWorkspaceWithAdvancedManagement() {
  normalizeDeepFolderData();
  deepFolderBaseRenderFolderWorkspace();

  const folder = getCurrentFolder();
  if (!folder) return;

  const workspace = tabContent.querySelector(".folder-workspace");
  if (!workspace) return;

  workspace.insertAdjacentHTML("beforeend", `
    <section class="folder-management-dashboard">
      <div class="folder-management-heading">
        <div>
          <span class="dashboard-kicker">FOLDER MANAGEMENT</span>
          <h3>Advanced folder controls</h3>
        </div>

        <div class="folder-management-heading-actions">
          <button id="folderArchiveToggle" class="secondary-button" type="button">
            ${folder.archived ? "Restore folder" : "Archive folder"}
          </button>
          <button id="folderExportButton" class="secondary-button" type="button">
            Export folder data
          </button>
        </div>
      </div>

      <div class="folder-management-grid">
        <article class="folder-management-card folder-overview-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">OVERVIEW</span>
              <h4>Folder details</h4>
            </div>
            <button id="editFolderOverviewButton" class="folder-mini-button" type="button">Edit</button>
          </div>

          <dl class="folder-detail-list">
            <div>
              <dt>Owner</dt>
              <dd>${escapeHtml(folder.owner || "Not assigned")}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>${escapeHtml(folder.visibility)}</dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>${folder.dueDate ? escapeHtml(folder.dueDate) : "No due date"}</dd>
            </div>
            <div>
              <dt>Template</dt>
              <dd>${escapeHtml(folder.template)}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>${folder.archived ? "Archived" : "Active"}</dd>
            </div>
          </dl>
        </article>

        <article class="folder-management-card folder-progress-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">PROGRESS</span>
              <h4>Completion</h4>
            </div>
            <output id="folderProgressOutput">${folder.progress}%</output>
          </div>

          <input
            id="folderProgressSlider"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${folder.progress}"
          />

          <div class="folder-progress-track">
            <span style="width:${folder.progress}%"></span>
          </div>

          <p>${folder.progress >= 100 ? "Folder marked complete." : `${100 - folder.progress}% remaining.`}</p>
        </article>

        <article class="folder-management-card folder-notes-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">NOTES</span>
              <h4>Internal notes</h4>
            </div>
          </div>

          <textarea
            id="folderNotesInput"
            maxlength="3000"
            placeholder="Add production notes, requirements, reminders, or technical information..."
          >${escapeHtml(folder.notes)}</textarea>

          <button id="saveFolderNotesButton" class="primary-button compact" type="button">
            Save notes
          </button>
        </article>
      </div>

      <div class="folder-management-grid folder-management-grid-wide">
        <article class="folder-management-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">CHECKLIST</span>
              <h4>Folder tasks</h4>
            </div>
            <span class="folder-card-counter">
              ${folder.checklist.filter(item => item.completed).length}/${folder.checklist.length}
            </span>
          </div>

          <form id="folderChecklistForm" class="folder-inline-form">
            <input
              id="folderChecklistInput"
              type="text"
              maxlength="140"
              placeholder="Add a folder task..."
              required
            />
            <button class="primary-button compact" type="submit">Add</button>
          </form>

          ${renderFolderChecklist(folder)}
        </article>

        <article class="folder-management-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">QUICK LINKS</span>
              <h4>Folder resources</h4>
            </div>
            <span class="folder-card-counter">${folder.links.length}</span>
          </div>

          <form id="folderLinkForm" class="folder-link-form">
            <input
              id="folderLinkName"
              type="text"
              maxlength="80"
              placeholder="Link name"
              required
            />
            <input
              id="folderLinkUrl"
              type="url"
              maxlength="350"
              placeholder="https://..."
              required
            />
            <button class="primary-button compact" type="submit">Add link</button>
          </form>

          ${renderFolderLinks(folder)}
        </article>
      </div>

      <div class="folder-management-grid folder-management-grid-wide">
        <article class="folder-management-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">CUSTOM FIELDS</span>
              <h4>Extra information</h4>
            </div>
            <span class="folder-card-counter">${folder.customFields.length}</span>
          </div>

          <form id="folderCustomFieldForm" class="folder-custom-field-form">
            <input
              id="folderCustomFieldName"
              type="text"
              maxlength="70"
              placeholder="Field name"
              required
            />
            <input
              id="folderCustomFieldValue"
              type="text"
              maxlength="250"
              placeholder="Field value"
              required
            />
            <button class="primary-button compact" type="submit">Add field</button>
          </form>

          ${renderFolderCustomFields(folder)}
        </article>

        <article class="folder-management-card">
          <div class="folder-card-heading">
            <div>
              <span class="dashboard-kicker">ACTIVITY</span>
              <h4>Recent changes</h4>
            </div>
            <button id="clearFolderActivityButton" class="folder-mini-button" type="button">Clear</button>
          </div>

          ${renderFolderActivity(folder)}
        </article>
      </div>
    </section>
  `);

  bindDeepFolderManagement(folder);
};

function renderFolderChecklist(folder) {
  if (!folder.checklist.length) {
    return `
      <div class="folder-management-empty">
        <strong>No folder tasks yet.</strong>
        <span>Add production steps, required assets, testing tasks, or reminders.</span>
      </div>
    `;
  }

  return `
    <div class="folder-checklist-list">
      ${folder.checklist.map(item => `
        <article class="folder-checklist-item ${item.completed ? "completed" : ""}">
          <label>
            <input
              type="checkbox"
              data-toggle-folder-task="${item.id}"
              ${item.completed ? "checked" : ""}
            />
            <span>${escapeHtml(item.text)}</span>
          </label>

          <div>
            <button type="button" data-edit-folder-task="${item.id}">Edit</button>
            <button type="button" data-delete-folder-task="${item.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderFolderLinks(folder) {
  if (!folder.links.length) {
    return `
      <div class="folder-management-empty">
        <strong>No resources saved.</strong>
        <span>Add Roblox pages, documents, Trello boards, references, or development links.</span>
      </div>
    `;
  }

  return `
    <div class="folder-link-list">
      ${folder.links.map(item => `
        <article class="folder-link-item">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.url)}</span>
          </div>

          <div>
            <button type="button" data-open-folder-link="${item.id}">Open</button>
            <button type="button" data-edit-folder-link="${item.id}">Edit</button>
            <button type="button" data-delete-folder-link="${item.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderFolderCustomFields(folder) {
  if (!folder.customFields.length) {
    return `
      <div class="folder-management-empty">
        <strong>No custom fields.</strong>
        <span>Create fields such as Place ID, build number, system owner, budget, or testing server.</span>
      </div>
    `;
  }

  return `
    <div class="folder-custom-field-list">
      ${folder.customFields.map(item => `
        <article class="folder-custom-field-item">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.value)}</span>
          </div>

          <div>
            <button type="button" data-copy-folder-field="${item.id}">Copy</button>
            <button type="button" data-edit-folder-field="${item.id}">Edit</button>
            <button type="button" data-delete-folder-field="${item.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderFolderActivity(folder) {
  if (!folder.activity.length) {
    return `
      <div class="folder-management-empty">
        <strong>No activity recorded.</strong>
        <span>Edits made through the advanced folder controls will appear here.</span>
      </div>
    `;
  }

  return `
    <div class="folder-activity-list">
      ${folder.activity.slice(0, 12).map(item => `
        <article class="folder-activity-item">
          <span></span>
          <div>
            <strong>${escapeHtml(item.message)}</strong>
            <small>${escapeHtml(formatFolderActivityTime(item.at))}</small>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function bindDeepFolderManagement(folder) {
  document.getElementById("editFolderOverviewButton").addEventListener("click", () => {
    const owner = window.prompt("Folder owner:", folder.owner || "");
    if (owner === null) return;

    const visibility = window.prompt(
      "Visibility: Private, Team, or Public",
      folder.visibility
    );
    if (visibility === null || !visibility.trim()) return;

    const dueDate = window.prompt(
      "Due date (YYYY-MM-DD) or leave blank:",
      folder.dueDate || ""
    );
    if (dueDate === null) return;

    const template = window.prompt(
      "Template name:",
      folder.template || "None"
    );
    if (template === null) return;

    folder.owner = owner.trim();
    folder.visibility = visibility.trim();
    folder.dueDate = dueDate.trim();
    folder.template = template.trim() || "None";

    addFolderActivity(folder, "Updated folder overview details");
    saveData();
    renderFolderWorkspace();
  });

  document.getElementById("folderProgressSlider").addEventListener("input", event => {
    folder.progress = Number(event.target.value);
    saveData();

    document.getElementById("folderProgressOutput").textContent =
      `${folder.progress}%`;

    const track = tabContent.querySelector(".folder-progress-track span");
    if (track) track.style.width = `${folder.progress}%`;
  });

  document.getElementById("folderProgressSlider").addEventListener("change", () => {
    addFolderActivity(folder, `Changed progress to ${folder.progress}%`);
    saveData();
    renderFolderWorkspace();
  });

  document.getElementById("saveFolderNotesButton").addEventListener("click", () => {
    folder.notes = document.getElementById("folderNotesInput").value.trim();
    addFolderActivity(folder, "Updated internal notes");
    saveData();
    renderFolderWorkspace();
  });

  document.getElementById("folderArchiveToggle").addEventListener("click", () => {
    folder.archived = !folder.archived;
    folder.status = folder.archived ? "Archived" : "Active";

    addFolderActivity(
      folder,
      folder.archived ? "Archived the folder" : "Restored the folder"
    );

    saveData();
    renderFolderWorkspace();
  });

  document.getElementById("folderExportButton").addEventListener("click", () => {
    const exportData = JSON.stringify(folder, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${folder.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-folder.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addFolderActivity(folder, "Exported folder data");
    saveData();
  });

  document.getElementById("folderChecklistForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("folderChecklistInput");
    const text = input.value.trim();
    if (!text) return;

    folder.checklist.push({
      id: makeId(text),
      text,
      completed: false
    });

    addFolderActivity(folder, `Added checklist task: ${text}`);
    saveData();
    renderFolderWorkspace();
  });

  tabContent.querySelectorAll("[data-toggle-folder-task]").forEach(input => {
    input.addEventListener("change", () => {
      const item = folder.checklist.find(entry => entry.id === input.dataset.toggleFolderTask);
      if (!item) return;

      item.completed = input.checked;
      addFolderActivity(
        folder,
        `${item.completed ? "Completed" : "Reopened"} checklist task: ${item.text}`
      );

      saveData();
      renderFolderWorkspace();
    });
  });

  tabContent.querySelectorAll("[data-edit-folder-task]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.checklist.find(entry => entry.id === button.dataset.editFolderTask);
      if (!item) return;

      const next = window.prompt("Task text:", item.text);
      if (next === null || !next.trim()) return;

      const previous = item.text;
      item.text = next.trim();

      addFolderActivity(folder, `Renamed checklist task: ${previous}`);
      saveData();
      renderFolderWorkspace();
    });
  });

  tabContent.querySelectorAll("[data-delete-folder-task]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.checklist.find(entry => entry.id === button.dataset.deleteFolderTask);
      if (!item || !window.confirm(`Delete "${item.text}"?`)) return;

      folder.checklist = folder.checklist.filter(entry => entry.id !== item.id);
      addFolderActivity(folder, `Deleted checklist task: ${item.text}`);
      saveData();
      renderFolderWorkspace();
    });
  });

  document.getElementById("folderLinkForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("folderLinkName").value.trim();
    const url = sanitizeFolderUrl(
      document.getElementById("folderLinkUrl").value
    );

    if (!name || !url) {
      window.alert("Enter a valid link name and an http or https URL.");
      return;
    }

    folder.links.push({
      id: makeId(name),
      name,
      url
    });

    addFolderActivity(folder, `Added resource link: ${name}`);
    saveData();
    renderFolderWorkspace();
  });

  tabContent.querySelectorAll("[data-open-folder-link]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.links.find(entry => entry.id === button.dataset.openFolderLink);
      if (!item) return;

      window.open(item.url, "_blank", "noopener,noreferrer");
    });
  });

  tabContent.querySelectorAll("[data-edit-folder-link]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.links.find(entry => entry.id === button.dataset.editFolderLink);
      if (!item) return;

      const name = window.prompt("Link name:", item.name);
      if (name === null || !name.trim()) return;

      const value = window.prompt("Link URL:", item.url);
      if (value === null) return;

      const url = sanitizeFolderUrl(value);
      if (!url) {
        window.alert("Enter a valid http or https URL.");
        return;
      }

      item.name = name.trim();
      item.url = url;

      addFolderActivity(folder, `Updated resource link: ${item.name}`);
      saveData();
      renderFolderWorkspace();
    });
  });

  tabContent.querySelectorAll("[data-delete-folder-link]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.links.find(entry => entry.id === button.dataset.deleteFolderLink);
      if (!item || !window.confirm(`Delete link "${item.name}"?`)) return;

      folder.links = folder.links.filter(entry => entry.id !== item.id);
      addFolderActivity(folder, `Deleted resource link: ${item.name}`);
      saveData();
      renderFolderWorkspace();
    });
  });

  document.getElementById("folderCustomFieldForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("folderCustomFieldName").value.trim();
    const value = document.getElementById("folderCustomFieldValue").value.trim();

    if (!name || !value) return;

    folder.customFields.push({
      id: makeId(name),
      name,
      value
    });

    addFolderActivity(folder, `Added custom field: ${name}`);
    saveData();
    renderFolderWorkspace();
  });

  tabContent.querySelectorAll("[data-copy-folder-field]").forEach(button => {
    button.addEventListener("click", async () => {
      const item = folder.customFields.find(entry => entry.id === button.dataset.copyFolderField);
      if (!item) return;

      await copyText(item.value);
      button.textContent = "Copied";
      setTimeout(() => button.textContent = "Copy", 900);
    });
  });

  tabContent.querySelectorAll("[data-edit-folder-field]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.customFields.find(entry => entry.id === button.dataset.editFolderField);
      if (!item) return;

      const name = window.prompt("Field name:", item.name);
      if (name === null || !name.trim()) return;

      const value = window.prompt("Field value:", item.value);
      if (value === null || !value.trim()) return;

      item.name = name.trim();
      item.value = value.trim();

      addFolderActivity(folder, `Updated custom field: ${item.name}`);
      saveData();
      renderFolderWorkspace();
    });
  });

  tabContent.querySelectorAll("[data-delete-folder-field]").forEach(button => {
    button.addEventListener("click", () => {
      const item = folder.customFields.find(entry => entry.id === button.dataset.deleteFolderField);
      if (!item || !window.confirm(`Delete custom field "${item.name}"?`)) return;

      folder.customFields = folder.customFields.filter(entry => entry.id !== item.id);
      addFolderActivity(folder, `Deleted custom field: ${item.name}`);
      saveData();
      renderFolderWorkspace();
    });
  });

  document.getElementById("clearFolderActivityButton").addEventListener("click", () => {
    if (!folder.activity.length) return;
    if (!window.confirm("Clear this folder's activity history?")) return;

    folder.activity = [];
    saveData();
    renderFolderWorkspace();
  });
}

normalizeDeepFolderData();


/* Interactive dashboard tutorial */
const TUTORIAL_STORAGE_KEY = "varsityDashboardTutorialCompleted";

const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialSpotlight = document.getElementById("tutorialSpotlight");
const tutorialCard = document.getElementById("tutorialCard");
const tutorialStepLabel = document.getElementById("tutorialStepLabel");
const tutorialIcon = document.getElementById("tutorialIcon");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialDescription = document.getElementById("tutorialDescription");
const tutorialProgressBar = document.getElementById("tutorialProgressBar");
const tutorialCloseButton = document.getElementById("tutorialCloseButton");
const tutorialSkipButton = document.getElementById("tutorialSkipButton");
const tutorialBackButton = document.getElementById("tutorialBackButton");
const tutorialContinueButton = document.getElementById("tutorialContinueButton");

let tutorialStepIndex = 0;
let tutorialActive = false;
let tutorialResizeTimer = null;

const tutorialSteps = [
  {
    view: "main",
    selector: ".sidebar-brand",
    icon: "V",
    title: "Welcome to Varsity Studios",
    description: "This dashboard keeps your games, development systems, files, tasks, releases, team information, and custom categories organized."
  },
  {
    view: "main",
    selector: ".sidebar-tabs",
    icon: "01",
    title: "Main navigation",
    description: "Use these categories to move between the Dashboard, websites, developer tools, settings, releases, team pages, and your own custom tabs."
  },
  {
    view: "main",
    selector: ".quick-action-grid",
    icon: "⌁",
    title: "Dashboard shortcuts",
    description: "The main Dashboard gives you quick access to important development areas and shows useful totals for your projects and saved resources."
  },
  {
    view: "developer",
    selector: ".developer-hub",
    icon: "</>",
    title: "Developer Hub",
    description: "Track game projects, production tasks, Roblox IDs, and reusable Luau code snippets. Every item can be edited or deleted later."
  },
  {
    view: "systems",
    selector: ".advanced-manager-page",
    icon: "SYS",
    title: "Game Systems",
    description: "Document game settings, RemoteEvents, RemoteFunctions, Bindables, and DataStores so important technical information is never lost."
  },
  {
    view: "releases",
    selector: ".advanced-manager-page",
    icon: "VER",
    title: "Release Manager",
    description: "Plan versions, target dates, testing stages, release status, update notes, fixes, and upcoming features."
  },
  {
    view: "team",
    selector: ".advanced-manager-page",
    icon: "USR",
    title: "Team Directory",
    description: "Save Roblox usernames, roles, access levels, and responsibilities for owners, developers, builders, designers, animators, and testers."
  },
  {
    view: "websites",
    selector: ".website-card-grid, .global-websites",
    icon: "◎",
    title: "Global Websites",
    description: "Keep useful external websites together so you can quickly open Roblox Dashboard, MiaPrep, YouTube, and other important resources."
  },
  {
    view: "settings",
    selector: ".settings-page",
    icon: "⚙",
    title: "Settings and customization",
    description: "Change colorways, light or dark mode, tab direction, top or bottom horizontal navigation, animation speed, sizes, spacing, text, and other advanced appearance controls."
  },
  {
    view: "first-custom-tab",
    selector: ".advanced-tab-page, #tabContent",
    icon: "TAB",
    title: "Custom tabs and folders",
    description: "Create categories for each game or development area. Inside them, folders can store models, images, animations, notes, checklists, links, custom fields, priorities, progress, and activity history."
  },
  {
    view: "first-custom-tab",
    selector: "#addFolderButton",
    icon: "+",
    title: "Create your first folder",
    description: "Use Add folder to start organizing a category. Special folder names such as Models, Animations, and Images / Icons unlock file-specific tools."
  },
  {
    view: "main",
    selector: ".sidebar-footer",
    icon: "✓",
    title: "You are ready",
    description: "Your dashboard saves information in this browser. Use the Tutorial button at any time to restart this guide."
  }
];

function getTutorialTargetView(step) {
  if (step.view === "first-custom-tab") {
    const firstTab = tabs[0];
    return firstTab ? `tab:${firstTab.id}` : "main";
  }

  return step.view;
}

function startDashboardTutorial() {
  tutorialActive = true;
  tutorialStepIndex = 0;
  tutorialOverlay.classList.remove("hidden");
  tutorialOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("tutorial-running");
  showTutorialStep();
}

function closeDashboardTutorial(markComplete = false) {
  tutorialActive = false;
  tutorialOverlay.classList.add("hidden");
  tutorialOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("tutorial-running");
  clearTutorialHighlight();

  if (markComplete) {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  }
}

function showTutorialStep() {
  const step = tutorialSteps[tutorialStepIndex];
  if (!step) {
    closeDashboardTutorial(true);
    return;
  }

  const destination = getTutorialTargetView(step);

  if (activeView !== destination) {
    switchView(destination);
  }

  tutorialStepLabel.textContent =
    `STEP ${tutorialStepIndex + 1} OF ${tutorialSteps.length}`;
  tutorialIcon.textContent = step.icon;
  tutorialTitle.textContent = step.title;
  tutorialDescription.textContent = step.description;
  tutorialProgressBar.style.width =
    `${((tutorialStepIndex + 1) / tutorialSteps.length) * 100}%`;

  tutorialBackButton.disabled = tutorialStepIndex === 0;
  tutorialContinueButton.textContent =
    tutorialStepIndex === tutorialSteps.length - 1
      ? "Finish"
      : "Continue";

  requestAnimationFrame(() => {
    setTimeout(() => positionTutorialForStep(step), 80);
  });
}

function positionTutorialForStep(step) {
  clearTutorialHighlight();

  const target = document.querySelector(step.selector);

  if (!target) {
    positionTutorialCardCentered();
    return;
  }

  target.classList.add("tutorial-highlighted-element");

  const rect = target.getBoundingClientRect();
  const padding = 9;

  tutorialSpotlight.style.left = `${Math.max(8, rect.left - padding)}px`;
  tutorialSpotlight.style.top = `${Math.max(8, rect.top - padding)}px`;
  tutorialSpotlight.style.width =
    `${Math.min(window.innerWidth - 16, rect.width + padding * 2)}px`;
  tutorialSpotlight.style.height =
    `${Math.min(window.innerHeight - 16, rect.height + padding * 2)}px`;
  tutorialSpotlight.classList.add("visible");

  target.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest"
  });

  const cardWidth = Math.min(410, window.innerWidth - 28);
  const cardHeight = tutorialCard.offsetHeight || 330;
  const gap = 18;

  let left = rect.right + gap;
  let top = rect.top;

  if (left + cardWidth > window.innerWidth - 14) {
    left = rect.left - cardWidth - gap;
  }

  if (left < 14) {
    left = Math.max(14, (window.innerWidth - cardWidth) / 2);
    top = rect.bottom + gap;

    if (top + cardHeight > window.innerHeight - 14) {
      top = rect.top - cardHeight - gap;
    }
  }

  if (top + cardHeight > window.innerHeight - 14) {
    top = window.innerHeight - cardHeight - 14;
  }

  if (top < 14) {
    top = 14;
  }

  tutorialCard.style.width = `${cardWidth}px`;
  tutorialCard.style.left = `${left}px`;
  tutorialCard.style.top = `${top}px`;
  tutorialCard.classList.remove("centered");
}

function positionTutorialCardCentered() {
  tutorialSpotlight.classList.remove("visible");
  tutorialCard.style.left = "50%";
  tutorialCard.style.top = "50%";
  tutorialCard.style.width = `${Math.min(410, window.innerWidth - 28)}px`;
  tutorialCard.classList.add("centered");
}

function clearTutorialHighlight() {
  document
    .querySelectorAll(".tutorial-highlighted-element")
    .forEach(element => element.classList.remove("tutorial-highlighted-element"));

  tutorialSpotlight.classList.remove("visible");
}

function addTutorialButton() {
  if (document.getElementById("dashboardTutorialButton")) return;

  const footer = document.querySelector(".sidebar-footer");
  if (!footer) return;

  const button = document.createElement("button");
  button.id = "dashboardTutorialButton";
  button.className = "secondary-button tutorial-launch-button";
  button.type = "button";
  button.innerHTML = `<span>?</span><span>Tutorial</span>`;
  button.addEventListener("click", startDashboardTutorial);

  footer.insertBefore(button, footer.firstChild);
}

const tutorialBaseRenderNavigation = renderNavigation;
renderNavigation = function renderNavigationWithTutorial() {
  tutorialBaseRenderNavigation();
  addTutorialButton();

  if (tutorialActive) {
    const step = tutorialSteps[tutorialStepIndex];
    requestAnimationFrame(() => {
      setTimeout(() => positionTutorialForStep(step), 100);
    });
  }
};

tutorialContinueButton.addEventListener("click", () => {
  if (tutorialStepIndex >= tutorialSteps.length - 1) {
    closeDashboardTutorial(true);
    return;
  }

  tutorialStepIndex += 1;
  showTutorialStep();
});

tutorialBackButton.addEventListener("click", () => {
  if (tutorialStepIndex <= 0) return;

  tutorialStepIndex -= 1;
  showTutorialStep();
});

tutorialSkipButton.addEventListener("click", () => {
  closeDashboardTutorial(true);
});

tutorialCloseButton.addEventListener("click", () => {
  closeDashboardTutorial(false);
});

window.addEventListener("resize", () => {
  if (!tutorialActive) return;

  clearTimeout(tutorialResizeTimer);
  tutorialResizeTimer = setTimeout(() => {
    positionTutorialForStep(tutorialSteps[tutorialStepIndex]);
  }, 100);
});

document.addEventListener("keydown", event => {
  if (!tutorialActive) return;

  if (event.key === "Escape") {
    closeDashboardTutorial(false);
  }

  if (event.key === "ArrowRight" || event.key === "Enter") {
    event.preventDefault();
    tutorialContinueButton.click();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    tutorialBackButton.click();
  }
});

addTutorialButton();

setTimeout(() => {
  const hasCompletedTutorial =
    localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";

  if (!hasCompletedTutorial && !loginView.classList.contains("hidden")) {
    return;
  }

  if (!hasCompletedTutorial) {
    startDashboardTutorial();
  }
}, 1200);


/* Pro motion studio */
const PRO_MOTION_KEY = "varsityProMotionSettings";

const defaultProMotionSettings = {
  preset: "cinematic",
  pageTransition: "slide-fade",
  cardEffect: "tilt",
  navIndicator: "glide",
  modalStyle: "scale-blur",
  backgroundMotion: "aurora",
  cursorGlow: true,
  magneticButtons: true,
  rippleClicks: true,
  depthParallax: true,
  numberCounters: true,
  animatedProgress: true,
  tiltStrength: 6,
  parallaxStrength: 12,
  glowRadius: 220,
  trailLength: 5,
  transitionDistance: 22,
  springAmount: 1.08
};

let proMotionSettings = loadProMotionSettings();
let cursorGlowElement = null;
let cursorTrailElements = [];
let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let motionFrameRequested = false;

function loadProMotionSettings() {
  try {
    return {
      ...defaultProMotionSettings,
      ...JSON.parse(localStorage.getItem(PRO_MOTION_KEY) || "{}")
    };
  } catch {
    return { ...defaultProMotionSettings };
  }
}

function saveProMotionSettings() {
  localStorage.setItem(PRO_MOTION_KEY, JSON.stringify(proMotionSettings));
}

function applyProMotionPreset(name) {
  const presets = {
    cinematic: {
      pageTransition: "slide-fade",
      cardEffect: "tilt",
      navIndicator: "glide",
      modalStyle: "scale-blur",
      backgroundMotion: "aurora",
      cursorGlow: true,
      magneticButtons: true,
      rippleClicks: true,
      depthParallax: true,
      numberCounters: true,
      animatedProgress: true,
      tiltStrength: 6,
      parallaxStrength: 12,
      glowRadius: 220,
      trailLength: 5,
      transitionDistance: 22,
      springAmount: 1.08
    },
    sports: {
      pageTransition: "snap-slide",
      cardEffect: "lift",
      navIndicator: "pulse",
      modalStyle: "pop",
      backgroundMotion: "stadium",
      cursorGlow: false,
      magneticButtons: true,
      rippleClicks: true,
      depthParallax: false,
      numberCounters: true,
      animatedProgress: true,
      tiltStrength: 3,
      parallaxStrength: 6,
      glowRadius: 140,
      trailLength: 0,
      transitionDistance: 30,
      springAmount: 1.18
    },
    minimal: {
      pageTransition: "fade",
      cardEffect: "none",
      navIndicator: "line",
      modalStyle: "fade",
      backgroundMotion: "none",
      cursorGlow: false,
      magneticButtons: false,
      rippleClicks: false,
      depthParallax: false,
      numberCounters: false,
      animatedProgress: true,
      tiltStrength: 0,
      parallaxStrength: 0,
      glowRadius: 0,
      trailLength: 0,
      transitionDistance: 10,
      springAmount: 1
    },
    futuristic: {
      pageTransition: "zoom-blur",
      cardEffect: "glow-tilt",
      navIndicator: "beam",
      modalStyle: "hologram",
      backgroundMotion: "grid",
      cursorGlow: true,
      magneticButtons: true,
      rippleClicks: true,
      depthParallax: true,
      numberCounters: true,
      animatedProgress: true,
      tiltStrength: 9,
      parallaxStrength: 18,
      glowRadius: 280,
      trailLength: 8,
      transitionDistance: 18,
      springAmount: 1.12
    }
  };

  proMotionSettings = {
    ...proMotionSettings,
    preset: name,
    ...(presets[name] || presets.cinematic)
  };

  saveProMotionSettings();
  applyProMotionSettings();
}

function applyProMotionSettings() {
  const root = document.documentElement;

  document.body.dataset.proPreset = proMotionSettings.preset;
  document.body.dataset.pageTransition = proMotionSettings.pageTransition;
  document.body.dataset.cardEffect = proMotionSettings.cardEffect;
  document.body.dataset.navIndicator = proMotionSettings.navIndicator;
  document.body.dataset.modalStyle = proMotionSettings.modalStyle;
  document.body.dataset.backgroundMotion = proMotionSettings.backgroundMotion;

  document.body.classList.toggle("pro-cursor-glow", proMotionSettings.cursorGlow);
  document.body.classList.toggle("pro-magnetic-buttons", proMotionSettings.magneticButtons);
  document.body.classList.toggle("pro-ripple-clicks", proMotionSettings.rippleClicks);
  document.body.classList.toggle("pro-depth-parallax", proMotionSettings.depthParallax);
  document.body.classList.toggle("pro-number-counters", proMotionSettings.numberCounters);
  document.body.classList.toggle("pro-animated-progress", proMotionSettings.animatedProgress);

  root.style.setProperty("--pro-tilt-strength", `${proMotionSettings.tiltStrength}deg`);
  root.style.setProperty("--pro-parallax-strength", `${proMotionSettings.parallaxStrength}px`);
  root.style.setProperty("--pro-glow-radius", `${proMotionSettings.glowRadius}px`);
  root.style.setProperty("--pro-transition-distance", `${proMotionSettings.transitionDistance}px`);
  root.style.setProperty("--pro-spring-amount", proMotionSettings.springAmount);

  ensureCursorEffects();
  refreshProMotionBindings();
}

function ensureCursorEffects() {
  if (!cursorGlowElement) {
    cursorGlowElement = document.createElement("div");
    cursorGlowElement.className = "pro-cursor-glow-element";
    document.body.appendChild(cursorGlowElement);
  }

  const wantedTrail = Math.max(0, Math.min(12, Number(proMotionSettings.trailLength) || 0));

  while (cursorTrailElements.length < wantedTrail) {
    const trail = document.createElement("div");
    trail.className = "pro-cursor-trail-dot";
    document.body.appendChild(trail);
    cursorTrailElements.push(trail);
  }

  while (cursorTrailElements.length > wantedTrail) {
    cursorTrailElements.pop()?.remove();
  }
}

function refreshProMotionBindings() {
  bindCardTiltEffects();
  bindMagneticButtons();
  animateVisibleCounters();
}

function bindCardTiltEffects() {
  const cards = document.querySelectorAll(`
    .folder-card,
    .advanced-folder-card,
    .quick-action,
    .website-link-card,
    .dashboard-stat-card,
    .developer-summary-card,
    .advanced-summary-card,
    .folder-management-card,
    .team-member-card,
    .release-card
  `);

  cards.forEach(card => {
    if (card.dataset.proTiltBound === "true") return;
    card.dataset.proTiltBound = "true";

    card.addEventListener("pointermove", event => {
      if (!["tilt", "glow-tilt"].includes(proMotionSettings.cardEffect)) return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const strength = Number(proMotionSettings.tiltStrength) || 0;

      const rotateY = (x - 0.5) * strength * 2;
      const rotateX = (0.5 - y) * strength * 2;

      card.style.setProperty("--card-rotate-x", `${rotateX}deg`);
      card.style.setProperty("--card-rotate-y", `${rotateY}deg`);
      card.style.setProperty("--card-light-x", `${x * 100}%`);
      card.style.setProperty("--card-light-y", `${y * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--card-rotate-x", "0deg");
      card.style.setProperty("--card-rotate-y", "0deg");
      card.style.setProperty("--card-light-x", "50%");
      card.style.setProperty("--card-light-y", "50%");
    });
  });
}

function bindMagneticButtons() {
  document.querySelectorAll(`
    .primary-button,
    .secondary-button,
    .tab-button,
    .folder-mini-button,
    .tutorial-launch-button
  `).forEach(button => {
    if (button.dataset.proMagneticBound === "true") return;
    button.dataset.proMagneticBound = "true";

    button.addEventListener("pointermove", event => {
      if (!proMotionSettings.magneticButtons) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);

      button.style.setProperty("--magnetic-x", `${x * 0.12}px`);
      button.style.setProperty("--magnetic-y", `${y * 0.12}px`);
    });

    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--magnetic-x", "0px");
      button.style.setProperty("--magnetic-y", "0px");
    });
  });
}

function animateVisibleCounters() {
  if (!proMotionSettings.numberCounters) return;

  document.querySelectorAll(`
    .dashboard-stat-card strong,
    .developer-summary-card strong,
    .advanced-summary-card strong,
    .workspace-count strong,
    .release-overview-panel > strong
  `).forEach(element => {
    if (element.dataset.counterAnimated === "true") return;

    const raw = element.textContent.trim().replace(/,/g, "");
    const target = Number(raw);
    if (!Number.isFinite(target)) return;

    element.dataset.counterAnimated = "true";

    const duration = 650;
    const started = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toLocaleString();

      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  });
}

function animateCurrentViewPro() {
  const shell = document.querySelector(".content-shell");
  const content = document.querySelector("#tabContent");

  if (!shell || !content) return;

  content.classList.remove("pro-view-enter");
  void content.offsetWidth;
  content.classList.add("pro-view-enter");

  setTimeout(() => content.classList.remove("pro-view-enter"), 850);
  refreshProMotionBindings();
}

const proMotionBaseRenderNavigation = renderNavigation;
renderNavigation = function renderNavigationWithProMotion() {
  proMotionBaseRenderNavigation();

  requestAnimationFrame(() => {
    refreshProMotionBindings();
    animateCurrentViewPro();
  });
};

const proMotionBaseRenderSettingsPage = renderSettingsPage;
renderSettingsPage = function renderSettingsWithProMotionStudio() {
  proMotionBaseRenderSettingsPage();

  const settingsPage = tabContent.querySelector(".settings-page");
  if (!settingsPage) return;

  const panel = document.createElement("section");
  panel.className = "settings-panel pro-motion-settings-panel";
  panel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">PRO MOTION STUDIO</span>
        <h3>Advanced visual effects</h3>
        <p>Use professional motion presets or individually control transitions, tilt, parallax, cursor effects, and navigation animation.</p>
      </div>
    </div>

    <div class="motion-preset-grid">
      ${renderMotionPreset("cinematic", "Cinematic", "Smooth depth, soft blur, and premium movement.")}
      ${renderMotionPreset("sports", "Sports Broadcast", "Fast, energetic, and responsive motion.")}
      ${renderMotionPreset("futuristic", "Futuristic", "Glow, grid motion, cursor trails, and stronger depth.")}
      ${renderMotionPreset("minimal", "Minimal", "Simple transitions with almost no visual effects.")}
    </div>

    <div class="pro-motion-control-list">
      ${renderProMotionSelect(
        "Page transition",
        "Choose how content enters when changing pages.",
        "proPageTransition",
        proMotionSettings.pageTransition,
        [
          ["slide-fade", "Slide + Fade"],
          ["snap-slide", "Snap Slide"],
          ["zoom-blur", "Zoom + Blur"],
          ["fade", "Clean Fade"],
          ["flip", "3D Flip"],
          ["reveal", "Mask Reveal"]
        ]
      )}

      ${renderProMotionSelect(
        "Card interaction",
        "Choose what cards do when the pointer moves across them.",
        "proCardEffect",
        proMotionSettings.cardEffect,
        [
          ["tilt", "3D Tilt"],
          ["glow-tilt", "Glow + 3D Tilt"],
          ["lift", "Clean Lift"],
          ["border-flow", "Animated Border"],
          ["none", "None"]
        ]
      )}

      ${renderProMotionSelect(
        "Navigation indicator",
        "Change the active-tab motion style.",
        "proNavIndicator",
        proMotionSettings.navIndicator,
        [
          ["glide", "Gliding Indicator"],
          ["pulse", "Pulse"],
          ["beam", "Light Beam"],
          ["line", "Simple Line"],
          ["fill", "Animated Fill"]
        ]
      )}

      ${renderProMotionSelect(
        "Modal entrance",
        "Change how dialogs and confirmation windows appear.",
        "proModalStyle",
        proMotionSettings.modalStyle,
        [
          ["scale-blur", "Scale + Blur"],
          ["pop", "Spring Pop"],
          ["hologram", "Hologram Reveal"],
          ["slide-up", "Slide Up"],
          ["fade", "Fade"]
        ]
      )}

      ${renderProMotionSelect(
        "Background motion",
        "Add subtle movement behind the dashboard.",
        "proBackgroundMotion",
        proMotionSettings.backgroundMotion,
        [
          ["aurora", "Aurora Drift"],
          ["stadium", "Stadium Sweep"],
          ["grid", "Moving Grid"],
          ["particles", "Soft Particles"],
          ["none", "None"]
        ]
      )}

      ${renderProMotionToggle("Cursor glow", "A soft color glow follows the pointer.", "proCursorGlow", proMotionSettings.cursorGlow)}
      ${renderProMotionToggle("Magnetic buttons", "Buttons subtly move toward the pointer.", "proMagneticButtons", proMotionSettings.magneticButtons)}
      ${renderProMotionToggle("Click ripples", "Buttons create a ripple from the exact click position.", "proRippleClicks", proMotionSettings.rippleClicks)}
      ${renderProMotionToggle("Depth parallax", "Background layers move at different speeds with the pointer.", "proDepthParallax", proMotionSettings.depthParallax)}
      ${renderProMotionToggle("Animated counters", "Dashboard numbers count upward when shown.", "proNumberCounters", proMotionSettings.numberCounters)}
      ${renderProMotionToggle("Animated progress", "Progress bars animate with a moving highlight.", "proAnimatedProgress", proMotionSettings.animatedProgress)}

      ${renderProMotionRange("Card tilt strength", "Control how much cards rotate in 3D.", "proTiltStrength", proMotionSettings.tiltStrength, 0, 14, 1, `${proMotionSettings.tiltStrength}°`)}
      ${renderProMotionRange("Parallax strength", "Control the amount of background depth movement.", "proParallaxStrength", proMotionSettings.parallaxStrength, 0, 30, 1, `${proMotionSettings.parallaxStrength}px`)}
      ${renderProMotionRange("Cursor glow size", "Resize the glow around the pointer.", "proGlowRadius", proMotionSettings.glowRadius, 80, 420, 10, `${proMotionSettings.glowRadius}px`)}
      ${renderProMotionRange("Cursor trail length", "Choose how many fading trail points follow the cursor.", "proTrailLength", proMotionSettings.trailLength, 0, 12, 1, `${proMotionSettings.trailLength}`)}
      ${renderProMotionRange("Transition distance", "Control how far pages travel while entering.", "proTransitionDistance", proMotionSettings.transitionDistance, 4, 50, 1, `${proMotionSettings.transitionDistance}px`)}
      ${renderProMotionRange("Spring amount", "Control overshoot on spring-based effects.", "proSpringAmount", proMotionSettings.springAmount, 1, 1.3, 0.01, `${proMotionSettings.springAmount.toFixed(2)}×`)}
    </div>
  `;

  settingsPage.insertBefore(panel, settingsPage.firstElementChild);
  bindProMotionSettingsPanel();
};

function renderMotionPreset(id, title, description) {
  return `
    <button
      class="motion-preset-card ${proMotionSettings.preset === id ? "selected" : ""}"
      type="button"
      data-motion-preset="${id}"
    >
      <span class="motion-preset-visual preset-${id}">
        <i></i><i></i><i></i>
      </span>
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(description)}</small>
      </span>
      <em>${proMotionSettings.preset === id ? "ACTIVE" : "USE PRESET"}</em>
    </button>
  `;
}

function renderProMotionSelect(title, description, id, value, options) {
  return `
    <label class="pro-motion-control-row" for="${id}">
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(description)}</small>
      </span>

      <select id="${id}">
        ${options.map(([optionValue, label]) => `
          <option value="${optionValue}" ${value === optionValue ? "selected" : ""}>
            ${escapeHtml(label)}
          </option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderProMotionToggle(title, description, id, checked) {
  return `
    <label class="pro-motion-control-row" for="${id}">
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(description)}</small>
      </span>
      <input id="${id}" class="settings-toggle" type="checkbox" ${checked ? "checked" : ""} />
    </label>
  `;
}

function renderProMotionRange(title, description, id, value, min, max, step, output) {
  return `
    <div class="pro-motion-control-row">
      <span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(description)}</small>
      </span>

      <div class="pro-motion-range">
        <output id="${id}Output">${escapeHtml(output)}</output>
        <input
          id="${id}"
          type="range"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
        />
      </div>
    </div>
  `;
}

function bindProMotionSettingsPanel() {
  tabContent.querySelectorAll("[data-motion-preset]").forEach(button => {
    button.addEventListener("click", () => {
      applyProMotionPreset(button.dataset.motionPreset);
      renderSettingsPage();
    });
  });

  const selectSettings = [
    ["proPageTransition", "pageTransition"],
    ["proCardEffect", "cardEffect"],
    ["proNavIndicator", "navIndicator"],
    ["proModalStyle", "modalStyle"],
    ["proBackgroundMotion", "backgroundMotion"]
  ];

  selectSettings.forEach(([id, key]) => {
    document.getElementById(id).addEventListener("change", event => {
      proMotionSettings[key] = event.target.value;
      proMotionSettings.preset = "custom";
      saveProMotionSettings();
      applyProMotionSettings();
    });
  });

  const toggleSettings = [
    ["proCursorGlow", "cursorGlow"],
    ["proMagneticButtons", "magneticButtons"],
    ["proRippleClicks", "rippleClicks"],
    ["proDepthParallax", "depthParallax"],
    ["proNumberCounters", "numberCounters"],
    ["proAnimatedProgress", "animatedProgress"]
  ];

  toggleSettings.forEach(([id, key]) => {
    document.getElementById(id).addEventListener("change", event => {
      proMotionSettings[key] = event.target.checked;
      proMotionSettings.preset = "custom";
      saveProMotionSettings();
      applyProMotionSettings();
    });
  });

  const rangeSettings = [
    ["proTiltStrength", "tiltStrength", value => `${value}°`],
    ["proParallaxStrength", "parallaxStrength", value => `${value}px`],
    ["proGlowRadius", "glowRadius", value => `${value}px`],
    ["proTrailLength", "trailLength", value => value],
    ["proTransitionDistance", "transitionDistance", value => `${value}px`],
    ["proSpringAmount", "springAmount", value => `${Number(value).toFixed(2)}×`]
  ];

  rangeSettings.forEach(([id, key, formatter]) => {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}Output`);

    input.addEventListener("input", () => {
      proMotionSettings[key] = Number(input.value);
      proMotionSettings.preset = "custom";
      output.textContent = formatter(input.value);
      saveProMotionSettings();
      applyProMotionSettings();
    });
  });
}

document.addEventListener("pointermove", event => {
  lastPointer = { x: event.clientX, y: event.clientY };

  if (!motionFrameRequested) {
    motionFrameRequested = true;

    requestAnimationFrame(() => {
      motionFrameRequested = false;

      if (cursorGlowElement) {
        cursorGlowElement.style.transform =
          `translate3d(${lastPointer.x}px, ${lastPointer.y}px, 0) translate(-50%, -50%)`;
        cursorGlowElement.style.width = `${proMotionSettings.glowRadius}px`;
        cursorGlowElement.style.height = `${proMotionSettings.glowRadius}px`;
      }

      cursorTrailElements.forEach((dot, index) => {
        setTimeout(() => {
          dot.style.transform =
            `translate3d(${lastPointer.x}px, ${lastPointer.y}px, 0) translate(-50%, -50%)`;
          dot.style.opacity = `${Math.max(0.04, 0.24 - index * 0.018)}`;
        }, index * 24);
      });

      if (proMotionSettings.depthParallax) {
        const normalizedX = lastPointer.x / window.innerWidth - 0.5;
        const normalizedY = lastPointer.y / window.innerHeight - 0.5;
        const strength = proMotionSettings.parallaxStrength;

        document.documentElement.style.setProperty("--parallax-x", `${normalizedX * strength}px`);
        document.documentElement.style.setProperty("--parallax-y", `${normalizedY * strength}px`);
      }
    });
  }
});

document.addEventListener("click", event => {
  if (!proMotionSettings.rippleClicks) return;

  const button = event.target.closest("button");
  if (!button) return;

  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "pro-click-ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

applyProMotionSettings();


/* UI style versions and side V background scene */
const UI_STYLE_VERSION_KEY = "varsityUiStyleVersionSettings";

const defaultUiStyleVersionSettings = {
  style: "default",
  showSideLogos: true,
  sideLogoIntensity: "medium",
  sideLogoOpacity: 38
};

let uiStyleVersionSettings = loadUiStyleVersionSettings();

function loadUiStyleVersionSettings() {
  try {
    return {
      ...defaultUiStyleVersionSettings,
      ...JSON.parse(localStorage.getItem(UI_STYLE_VERSION_KEY) || "{}")
    };
  } catch {
    return { ...defaultUiStyleVersionSettings };
  }
}

function saveUiStyleVersionSettings() {
  localStorage.setItem(
    UI_STYLE_VERSION_KEY,
    JSON.stringify(uiStyleVersionSettings)
  );
}

function ensureSideVBackgroundScene() {
  if (document.getElementById("sideVBackgroundScene")) return;

  const scene = document.createElement("div");
  scene.id = "sideVBackgroundScene";
  scene.className = "side-v-background-scene";
  scene.innerHTML = `
    <div class="side-v-background-inner">
      <div class="side-v-logo left-logo" aria-hidden="true">
        <span>V</span>
      </div>
      <div class="side-v-logo right-logo" aria-hidden="true">
        <span>V</span>
      </div>
    </div>
  `;

  document.body.appendChild(scene);
}

function applyUiStyleVersionSettings() {
  ensureSideVBackgroundScene();

  document.body.dataset.uiStyleVersion = uiStyleVersionSettings.style;
  document.body.dataset.sideLogoIntensity = uiStyleVersionSettings.sideLogoIntensity;
  document.body.classList.toggle("hide-side-v-logos", !uiStyleVersionSettings.showSideLogos);

  document.documentElement.style.setProperty(
    "--side-logo-opacity",
    String(Math.max(0, Math.min(70, Number(uiStyleVersionSettings.sideLogoOpacity) || 38)) / 100)
  );
}

const uiStyles = [
  ["default", "Default", "Keeps the current premium dashboard look."],
  ["glass", "Glass", "Transparent blurred panels and glossy UI layers."],
  ["basic", "Basic", "Flatter and simpler UI with less visual noise."],
  ["studio-3d", "Studio 3D", "More depth, heavier shadows, and stronger layered surfaces."],
  ["neon", "Neon", "Bright accent edges and glowy futuristic panels."],
  ["slate", "Slate", "Muted solid UI with darker structured surfaces."]
];

const uiVersionBaseRenderSettingsPage = renderSettingsPage;
renderSettingsPage = function renderSettingsPageWithUiVersions() {
  uiVersionBaseRenderSettingsPage();

  const settingsPage = tabContent.querySelector(".settings-page");
  if (!settingsPage) return;

  const panel = document.createElement("section");
  panel.className = "settings-panel ui-style-version-panel";
  panel.innerHTML = `
    <div class="settings-heading">
      <div>
        <span class="dashboard-kicker">UI STYLE VERSIONS</span>
        <h3>Visual themes and 3D background scene</h3>
        <p>Switch between different full dashboard UI looks and control the side 3D Varsity V background scene.</p>
      </div>
    </div>

    <div class="ui-style-grid">
      ${uiStyles.map(([id, title, description]) => `
        <button
          class="ui-style-card ${uiStyleVersionSettings.style === id ? "selected" : ""}"
          type="button"
          data-ui-style="${id}"
        >
          <span class="ui-style-preview preview-${id}">
            <i></i><i></i><i></i>
          </span>
          <span class="ui-style-copy">
            <strong>${escapeHtml(title)}</strong>
            <small>${escapeHtml(description)}</small>
          </span>
          <em>${uiStyleVersionSettings.style === id ? "ACTIVE" : "USE STYLE"}</em>
        </button>
      `).join("")}
    </div>

    <div class="ui-style-control-list">
      <label class="ui-style-control-row" for="sideLogoToggle">
        <span>
          <strong>Side 3D V logos</strong>
          <small>Show large Varsity V logos fading from the left and right sides of the background.</small>
        </span>
        <input
          id="sideLogoToggle"
          class="settings-toggle"
          type="checkbox"
          ${uiStyleVersionSettings.showSideLogos ? "checked" : ""}
        />
      </label>

      <label class="ui-style-control-row" for="sideLogoIntensity">
        <span>
          <strong>3D V logo depth</strong>
          <small>Change how dramatic the side logos look in the background.</small>
        </span>
        <select id="sideLogoIntensity">
          <option value="soft" ${uiStyleVersionSettings.sideLogoIntensity === "soft" ? "selected" : ""}>Soft</option>
          <option value="medium" ${uiStyleVersionSettings.sideLogoIntensity === "medium" ? "selected" : ""}>Medium</option>
          <option value="strong" ${uiStyleVersionSettings.sideLogoIntensity === "strong" ? "selected" : ""}>Strong</option>
        </select>
      </label>

      <div class="ui-style-control-row">
        <span>
          <strong>3D V logo opacity</strong>
          <small>Raise or lower the visibility of the background Varsity logos.</small>
        </span>
        <div class="ui-style-range-control">
          <output id="sideLogoOpacityOutput">${uiStyleVersionSettings.sideLogoOpacity}%</output>
          <input
            id="sideLogoOpacity"
            type="range"
            min="0"
            max="70"
            step="1"
            value="${uiStyleVersionSettings.sideLogoOpacity}"
          />
        </div>
      </div>
    </div>
  `;

  settingsPage.insertBefore(panel, settingsPage.firstElementChild);
  bindUiStyleVersionPanel();
};

function bindUiStyleVersionPanel() {
  tabContent.querySelectorAll("[data-ui-style]").forEach(button => {
    button.addEventListener("click", () => {
      uiStyleVersionSettings.style = button.dataset.uiStyle;
      saveUiStyleVersionSettings();
      applyUiStyleVersionSettings();
      renderSettingsPage();
    });
  });

  document.getElementById("sideLogoToggle").addEventListener("change", event => {
    uiStyleVersionSettings.showSideLogos = event.target.checked;
    saveUiStyleVersionSettings();
    applyUiStyleVersionSettings();
  });

  document.getElementById("sideLogoIntensity").addEventListener("change", event => {
    uiStyleVersionSettings.sideLogoIntensity = event.target.value;
    saveUiStyleVersionSettings();
    applyUiStyleVersionSettings();
  });

  const opacityInput = document.getElementById("sideLogoOpacity");
  const opacityOutput = document.getElementById("sideLogoOpacityOutput");

  opacityInput.addEventListener("input", () => {
    uiStyleVersionSettings.sideLogoOpacity = Number(opacityInput.value);
    opacityOutput.textContent = `${opacityInput.value}%`;
    saveUiStyleVersionSettings();
    applyUiStyleVersionSettings();
  });
}

applyUiStyleVersionSettings();
