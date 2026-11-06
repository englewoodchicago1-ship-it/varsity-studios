# Varsity Studios Dashboard — AI Handoff

Use this file when continuing the website with another coding assistant or developer.

## Project
- Website: https://varsitystudios.net
- Hosting: GitHub Pages (static website)
- Stack: HTML, CSS, vanilla JavaScript, Supabase JavaScript client.
- The GitHub repository is the source of truth. Inspect the current files before editing.

## Current version and numbering
- Current build: **v0.18**.
- Continue with v0.18, then restart major numbering at v1.0, continue v1.1 through v1.18, then v2.1 and onward.
- Update `APP_VERSION`, visible version labels, and cache-busting query strings together when making a release.

## Navigation
The signed-in sidebar must show exactly these 14 items, in this order:
1. Overview
2. Audit Log
3. Moderation
4. Player Editor
5. Anti-Cheat
6. Servers
7. Queue
8. Ranked
9. Live Config
10. Music
11. Season Pass
12. Animations
13. Item Lookup
14. User Management

These 14 pages are intentionally blank placeholders until requested. Do not add sample cards, fake data, or extra navigation items. There is no Create a tab feature and no top-right Search control.

Settings is a separate utility action in the bottom account area beside Log out; it is not one of the 14 sidebar tabs. Keep it available as a hidden route from that bottom action.

## Account and branding
- The top-left brand must always use `assets/varsity-logo.png` (Varsity Studios logo), never the owner's personal profile picture.
- The owner's profile picture belongs only in the bottom account card.
- The owner display name shown in the UI is **Zay (Zumbles)**. This is a front-end display label only; do not change Supabase credentials, auth username, or database identity to implement it.
- Preserve the current owner profile picture URL and user profile-picture settings.

## Visual direction
- Match the supplied Practical's Games control-panel reference: compact, simple left sidebar; straightforward page header; minimal borders and effects; restrained selected-row highlight.
- Use charcoal/dark gray, black, and muted Varsity red. Avoid blue accents, bright glows, oversized cards, or decorative gradients.
- Keep the interface responsive.

## Main files
- `index.html` — login, dashboard structure, dialogs, and script/style references.
- `styles.css` — all dashboard styling.
- `script.js` — authentication, account state, navigation, UI behavior, and Supabase reads/writes.
- `assets/` — logo and static images.
- `v015-hub.js` — legacy/unused file; the active code is in `script.js`.

## Supabase safety
- The frontend uses the Supabase publishable key.
- Never commit a Supabase secret key, service-role key, database password, or private token.
- Do not delete or recreate Supabase users, profiles, or dashboard data when making UI changes.
- Do not change login routing or authentication behavior unless explicitly requested.

## Deploying changes
1. Edit files in the repository root.
2. Preserve `CNAME` and other repository configuration files.
3. Commit and push to the branch used by GitHub Pages.
4. Test login, sidebar navigation, Settings, logout, and mobile layout after deployment.

## Working rules
- Inspect the existing implementation before changing it.
- Make only requested changes; do not replace the application with a new template.
- Do not claim live browser testing unless it was actually performed.
