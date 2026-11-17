/* Varsity Studios v0.18 — UI refinements and account settings */
(() => {
  const style = document.createElement("style");
  style.textContent = `
    .sidebar .tab-button,
    .sidebar .sidebar-settings-button,
    .sidebar .sidebar-logout-button,
    .sidebar .sidebar-profile-card,
    .sidebar .sidebar-account-actions,
    .dashboard-main button,
    .dashboard-main input,
    .dashboard-main textarea,
    .dashboard-main select,
    .dashboard-main .content-shell,
    .dashboard-main .settings-panel {
      border-radius: 3px !important;
    }
    .sidebar .tab-button { border-radius: 3px !important; }
    .sidebar .tab-mark { border-radius: 2px !important; }
    .sidebar .sidebar-account-actions button { border-radius: 3px !important; }
    .v018-password-wrap { width: min(100%, 540px); margin-top: 22px; }
    .v018-password-card { padding: 26px; border: 1px solid #34343b; background: #15151a; border-radius: 3px; }
    .v018-password-card h3 { margin: 0 0 8px; font-size: 20px; color: #f6f6f8; }
    .v018-password-card p { margin: 0 0 24px; color: #999ba6; font-size: 13px; }
    .v018-password-card label { display: block; margin: 16px 0 7px; color: #e3e3e6; font-size: 13px; font-weight: 600; }
    .v018-password-card input { box-sizing: border-box; display: block; width: 100%; padding: 12px 13px; border: 1px solid #414149; background: #0c0d10; color: #fff; border-radius: 3px; outline: none; }
    .v018-password-card input:focus { border-color: #a91d31; }
    .v018-password-card button { margin-top: 22px; padding: 12px 18px; border: 1px solid #af293d; background: #941b30; color: #fff; cursor: pointer; border-radius: 3px; font-weight: 700; }
    .v018-password-card button:disabled { opacity: .6; cursor: wait; }
    #v018PasswordStatus { min-height: 22px; margin-top: 12px; font-size: 13px; }
    #v018PasswordStatus.error { color: #ff7b89; }
    #v018PasswordStatus.success { color: #a6e5bd; }
  `;
  document.head.appendChild(style);

  v017RenderCurrentView = function v018RenderCurrentView() {
    if (activeView !== "settings") {
      v016RenderCurrentView();
      return;
    }
    pageTitle.textContent = "Settings";
    pageSubtitle.textContent = "";
    contentTitle.textContent = "Settings";
    document.querySelector(".content-kicker")?.classList.add("hidden");
    document.querySelector(".content-header")?.classList.add("hidden");
    document.querySelector(".content-actions")?.classList.add("hidden");
    addFolderButton?.classList.add("hidden");
    deleteTabButton?.classList.add("hidden");
    tabContent.innerHTML = `
      <div class="v018-password-wrap">
        <form id="v018PasswordForm" class="v018-password-card" autocomplete="off">
          <h3>Change Password</h3>
          <p>Enter your current password to update your account password.</p>
          <label for="v018CurrentPassword">Old Password</label>
          <input id="v018CurrentPassword" type="password" autocomplete="current-password" required />
          <label for="v018NewPassword">New Password</label>
          <input id="v018NewPassword" type="password" autocomplete="new-password" minlength="6" required />
          <label for="v018ConfirmPassword">Confirm New Password</label>
          <input id="v018ConfirmPassword" type="password" autocomplete="new-password" minlength="6" required />
          <div id="v018PasswordStatus" role="status" aria-live="polite"></div>
          <button type="submit">Update Password</button>
        </form>
      </div>
    `;
    const form = document.getElementById("v018PasswordForm");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const oldPassword = document.getElementById("v018CurrentPassword").value;
      const newPassword = document.getElementById("v018NewPassword").value;
      const confirmPassword = document.getElementById("v018ConfirmPassword").value;
      const status = document.getElementById("v018PasswordStatus");
      const submit = form.querySelector('button[type="submit"]');
      const report = (message, type = "") => {
        status.textContent = message;
        status.className = type;
      };
      if (!oldPassword || !newPassword || !confirmPassword) return report("Fill in all three fields.", "error");
      if (newPassword !== confirmPassword) return report("New passwords do not match.", "error");
      if (newPassword.length < 6) return report("Password must be at least 6 characters.", "error");
      if (oldPassword === newPassword) return report("Choose a new password that is different from the old one.", "error");
      submit.disabled = true;
      try {
        report("Verifying old password...");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !userData?.user?.email) throw userError || new Error("Could not verify your account.");
        const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
          email: userData.user.email, password: oldPassword
        });
        if (verifyError) return report("Old password is incorrect.", "error");
        report("Updating password...");
        const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;
        form.reset();
        report("Password updated successfully.", "success");
      } catch (error) {
        report(error?.message || "Unable to update password.", "error");
      } finally {
        submit.disabled = false;
      }
    });
  };

  renderCurrentView = v017RenderCurrentView;
  if (typeof activeView !== "undefined" && activeView === "settings") renderCurrentView();
})();
