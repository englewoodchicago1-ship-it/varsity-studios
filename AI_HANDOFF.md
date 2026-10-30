# Varsity Studios Dashboard — AI Handoff

Use this file when continuing the website with another coding assistant or developer.

## Project
- Website: https://varsitystudios.net
- Hosting: GitHub Pages (static website)
- Main stack: HTML, CSS, vanilla JavaScript, Supabase JavaScript client.
- This repository is the source of truth. Do not rely on a previous chat to understand the project.

## Main files
- `index.html` — page structure, login screen, dialogs, and script/style references.
- `styles.css` — all dashboard styling and responsive layouts.
- `script.js` — authentication, account state, navigation, UI behavior, and Supabase reads/writes.
- `assets/` — logos and static images.
- `v015-hub.js` — legacy/unused v0.15 hub file; the active v0.15 code is already included in `script.js`.

## Current v0.16 navigation requirement
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

These are currently navigation placeholders. Each page is intentionally blank. Do not add sample cards, fake data, settings pages, store pages, or other sections unless explicitly requested. There is no visible Create a tab feature. Do not restore custom workspace tabs to the sidebar.

The owner profile image is set to the image URL in the v0.16 profile-picture constant in `script.js`. Keep it as the default for the owner unless the owner explicitly asks to change it.

## Supabase
- Supabase project URL and the frontend publishable key are configured at the top of `script.js`.
- The site uses Supabase Auth for sign-in.
- The `profiles` table provides the signed-in user's username, display name, and role.
- The `dashboard_data` table stores account-scoped dashboard data as JSON.
- The frontend uses a publishable key. Never put a Supabase secret key, service-role key, database password, or private token in `index.html`, `script.js`, `styles.css`, or any committed file.
- Do not delete or recreate Supabase users, profiles, or dashboard data when making UI changes.
- Do not change login routing or authentication behavior unless explicitly requested.

## Design and implementation preferences
- Keep the existing dark charcoal/black UI with Varsity red accents (`#e61328`).
- Keep changes limited to what was requested. Do not redesign unrelated areas or add features without asking.
- Preserve existing login, Supabase cloud sync, account roles, and mobile navigation.
- This is a static GitHub Pages site; do not assume there is a Node build process or backend server.
- Bump the cache-busting query version in `index.html` when updating `script.js` or `styles.css`, and keep the visible `APP_VERSION` in sync.

## Deploying changes
1. Edit the files in the repository root.
2. Preserve the existing `CNAME` file and other repository configuration files.
3. Commit and push the changed files to the branch used by GitHub Pages.
4. Test the live site after deployment, including login, sidebar navigation, logout, and mobile layout.

## Safe working rule
Before changing a feature, inspect the existing implementation and make the smallest safe change. Do not replace the whole application with a new template. Do not claim a change was tested in a live browser unless it actually was.
