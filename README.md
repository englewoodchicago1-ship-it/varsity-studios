# Varsity Studios Dashboard

## Accounts

This build includes two dashboard roles:
- Owner account: `ykdrxc`
- Member account: `rundownbjay`

Passwords are intentionally not listed in this public README.

The static GitHub Pages build stores account data separately in browser storage. Secure cross-device account synchronization requires connecting the dashboard to a real authentication service and cloud database.

## Main dashboard
The fixed Dashboard page now shows:
- Total custom tabs
- Total folders
- Total animations
- Total images and models
- Quick links to Global Websites and custom workspaces

## Global Websites
The fixed Global Websites page contains:
- MiaPrep
- YouTube
- Roblox Dashboard

Each opens in a new browser tab.

## Special folders

### Animations
A folder named `Animations` supports animation names and Roblox animation IDs.

### Images / Icons
A folder named `Images`, `Icons`, `Images / Icons`, or `Images/Icons` supports:
- Upload
- Preview
- Download
- Delete

### Models
A folder named `Models` supports:
- Uploading files from the computer
- Naming every uploaded model
- Adding a required description
- Downloading model files
- Deleting model files

Local limits:
- Images: 2.5 MB each, 20 per folder
- Models: 4 MB each, 12 per folder

## Browser icon
The website now uses the Varsity Studios logo as its favicon/browser-tab icon.

## Storage warning
Files are stored in this browser using localStorage. They do not sync to other devices.
A hosted version with shared storage and secure authentication needs a backend and cloud file storage.


## Compact sidebar
Dashboard, Global Websites, and custom category buttons are now smaller and take up less sidebar space.


## Dedicated folder workspace
Clicking a folder now opens a full folder page instead of expanding a small card.

The folder page includes:
- A Back button to return to the category
- Folder name, description, type, and item count
- A complete list of everything inside
- Edit folder name and description
- Edit animation names and IDs
- Rename uploaded images
- Edit model names and descriptions
- Download and delete supported files
- Add/upload controls directly inside the folder page


## Settings and Developer Hub

### Settings
- Five colorways: Varsity Red, Stadium Blue, Night Purple, Field Green, and Game Day Orange
- Compact or comfortable interface density
- Rounded or sharper panel corners
- Full or reduced animations
- Toggle background glow
- Toggle folder descriptions
- Reset appearance settings
- Clear Developer Hub data separately

### Developer Hub
- Game project tracker with Roblox game/universe IDs and project status
- Development task checklist with priorities
- Roblox ID vault for place IDs, universe IDs, game passes, developer products, animations, images, audio, and groups
- Luau code snippet library
- Edit, delete, complete, and copy controls
- Main Dashboard statistics for projects, tasks, IDs, snippets, assets, and models


## Advanced studio management

### Workspace identity settings
- Change studio name
- Change owner display name
- Change browser tab/dashboard title
- Set default game name
- Save Roblox group ID and group URL
- Save a studio description

### Game Systems
- Game setting registry with setting names, values, categories, and notes
- RemoteEvent, RemoteFunction, BindableEvent, and BindableFunction registry
- Communication direction documentation
- DataStore name, scope, version, and purpose registry
- Edit and delete controls

### Release Manager
- Game/project version tracking
- Target release dates
- Planning, development, testing, ready, released, and delayed statuses
- Release notes
- Edit and delete controls

### Team Directory
- Roblox usernames and display names
- Studio roles
- Permission/access levels
- Responsibilities and notes
- Edit and delete controls


## Loading and confirmation update
- Very dark blue loading screen
- Varsity Studios logo centered during loading
- Smooth white progress line and loading messages
- Smooth fade from loading screen into login
- Large subtle `VARSITY STUDIOS LOG IN` background typography
- Styled `Are you sure?` confirmation window before delete actions
- Separate confirmation wording for categories, folders, images, models, animations, and Developer Hub data


## Full colorway fix
All non-destructive accent surfaces, outlines, glows, buttons, tabs, folders, cards, and asset panels now follow the selected colorway. Delete and warning controls intentionally remain red.


## Theme and navigation controls
- Full light and dark mode selector
- Vertical categories in the left sidebar
- Horizontal categories across the top
- Live tab-size slider from 32px to 68px
- Tab icon and text sizes scale with the slider
- Settings remain saved in the current browser

- Extra Dark mode option for an even darker black UI theme


## Advanced animation and interface settings
- Global animation speed slider
- Smooth, Snappy, Cinematic, and Soft easing styles
- Page transition toggle
- Modal animation toggle
- Hover animation toggle
- Staggered-list toggle
- Blur-transition toggle
- Hover lift slider
- Loading-screen duration slider
- Sidebar-width slider
- Content-scale slider
- Font-scale slider
- Card-spacing slider
- Panel-opacity slider
- Glow-strength slider
- Editable loading title and subtitle
- Editable login background text
- Reset button for all advanced interface settings


## Advanced tabs and folders

### Horizontal navigation
- Horizontal tabs can be placed at the top
- Horizontal tabs can be placed at the bottom
- The selected position is saved in the browser

### Advanced tabs
- Edit tab name and description
- Set a custom short icon
- Set an individual accent color
- Pin or unpin tabs
- Move tabs left or right
- Duplicate complete tabs and their folders

### Advanced folders
- Grid and compact list views
- Folder search
- Sort by manual order, name, recently updated, status, or priority
- Favorite folders
- Status values
- Priority values
- Custom tags
- Individual folder accent colors
- Move folders up or down
- Duplicate complete folders and their contents
- Folder status, priority, and tags appear inside the full folder page


## Deep folder management
- Folder owner field
- Private, Team, or Public visibility
- Due dates
- Folder templates
- Archive and restore
- Progress slider and completion tracking
- Internal notes
- Advanced checklist with completion, editing, and deletion
- Quick resource links with open, edit, and delete controls
- Custom name/value fields
- Copy custom-field values
- Folder activity history
- Export complete folder data as JSON
- All new data is stored in the current browser


## Interactive tutorial
- Tutorial button in the dashboard navigation/footer
- Guided step-by-step walkthrough
- Continue, Back, Skip tutorial, and Close controls
- Progress bar and step counter
- Automatically opens the correct dashboard page for each lesson
- Highlights the feature currently being explained
- Covers navigation, dashboard shortcuts, Developer Hub, Game Systems, Releases, Team, Global Websites, Settings, custom tabs, and folders
- Keyboard controls: Enter or Right Arrow continues, Left Arrow goes back, Escape closes
- Tutorial completion is remembered in the current browser
- Tutorial can be restarted at any time


## Pro Motion Studio
- Cinematic, Sports Broadcast, Futuristic, and Minimal presets
- Six page-transition styles
- Five card-interaction styles
- Five navigation-indicator styles
- Five modal entrance styles
- Five background-motion styles
- Cursor glow and cursor trail
- Magnetic buttons
- Click ripples
- 3D card tilt
- Glow-following card highlights
- Animated borders
- Pointer parallax
- Animated dashboard counters
- Animated progress shimmer
- Individual sliders for tilt, parallax, glow, trail length, transition distance, and spring amount


## UI style versions and side background V logos
- New UI style versions:
  - Default
  - Glass
  - Basic
  - Studio 3D
  - Neon
  - Slate
- Full dashboard style switching through Settings
- Side background Varsity V logos on the left and right
- The side V logos automatically use the currently selected accent color
- Side V logo toggle
- Side V logo depth: Soft, Medium, or Strong
- Side V logo opacity slider


## Account roles, tutorial, and mobile upgrade
- Owner and Member sign-in roles
- Per-account browser-storage namespace
- Previous dashboard local data is reset once during this upgrade
- New accounts begin with default Varsity red styling
- Owner-only Settings access
- Dynamic signed-in username and role
- Expanded guided tutorial with Why It Matters and What To Do Here sections
- Role-aware tutorial steps
- Automatic first-time tutorial per account
- Rebuilt password Show / Hide control sizing
- Mobile slide-out navigation
- Mobile overlay/backdrop
- Responsive dashboard cards, folder lists, dialogs, settings, and tutorial
- Better phone-safe spacing and native input sizing


## Login hotfix
- Fixed account storage initialization after successful login.
- Fixed an incorrect browser-storage helper call that prevented the dashboard from loading after valid credentials.


## Strict pre-login access gate
- Dashboard starts fully locked on every page load.
- No dashboard tabs, folders, create buttons, settings, sidebar, or mobile navigation are available before authentication.
- Mobile responsive rules can no longer accidentally reveal the dashboard.
- Protected dashboard controls are blocked at the event level until a valid account is signed in.
- Login is still required again after a refresh or reopening the page.


## Login compatibility fix
- Login no longer depends entirely on the browser Web Crypto API.
- Added a built-in SHA-256 compatibility fallback for browsers/contexts where Web Crypto is unavailable.
- Added visible login initialization errors instead of silent failures.


## Display names and account placement
- `ykdrxc` displays as **Drxco** inside the dashboard.
- `rundownbjay` displays as **Bj** inside the dashboard.
- Signed-in account information now appears on the right side of the top bar instead of the left sidebar.
- Member dashboard headings no longer inherit the owner's display name.
- Website / studio description is editable from Owner Settings → Workspace Identity.
- The editable studio description also updates the site's HTML meta description.


## Supabase cloud authentication update
- Authentication now uses Supabase Auth.
- Plain-text passwords and password hashes are no longer stored in `script.js`.
- Dashboard settings/tabs/folders and other browser-backed dashboard state are mirrored to `dashboard_data`.
- Cloud data is tied to each authenticated Supabase user ID and protected by the RLS policies configured in Supabase.
- The publishable key in frontend code is expected; never place a secret/service-role key in this repository.
- Login sessions intentionally do not persist through a full page refresh, preserving the dashboard's re-login-on-refresh behavior.
- Current username-to-auth-email routing still exists in frontend code. Hiding account identifiers as well requires moving username resolution to a server-side Supabase Edge Function.


## Member permission update
- Members can run and restart the guided tutorial.
- Members can open Settings and change their own dashboard appearance, layout, motion, navigation, and personal preferences.
- Members can delete their own tabs, folders, and other content stored under their own Supabase account.
- Owner-only account-management controls remain restricted to the Owner.
- The same personal permissions also apply to normal User accounts such as Neco.


## Folder file uploads and renaming
- Users can upload one or multiple files directly into any custom folder.
- Uploaded files are stored with that account's dashboard data and sync through the existing Supabase dashboard cloud save.
- Folder names can be changed from inside the folder workspace.
- Uploaded files can be renamed, downloaded, or deleted.
- File metadata shows type, size, and upload time.
- Mobile folder file management uses a responsive stacked layout.


## Member navigation + profile pictures
- Non-owner accounts no longer see Global Websites, Developer Hub, Releases, or Team.
- Members/Users keep Dashboard, Settings, Game Systems, and their custom tabs/folders.
- Every account can upload or change a profile picture from a local image file.
- Profile pictures are cropped to a square and optimized before cloud saving.
- The Varsity Studios logo is the fallback/template picture when no custom profile picture is set.
- Users can return to the Varsity Studios logo from Settings at any time.
- Profile-picture state is stored in the account cloud snapshot and follows the same Supabase user across devices.


## Profile picture cleanup
- Removed the large/clickable profile image from the top-right header.
- Profile picture upload/change now lives only in Settings → Your Profile → Profile picture.
- The Varsity Studios logo remains only as the fallback/default picture when no custom image is set.


## Login alignment update
- Username/password login card is centered horizontally and vertically.
- Removed left-side positioning overrides.
- Centered layout also applies on mobile.


## True login centering fix
- The login view now uses a full-screen grid and centers the actual login card directly.
- Previous parent grid/flex positioning can no longer keep the card stuck on the left.
- Desktop and mobile use the same centered login behavior.


## Your Profile visibility fix
- Ensures the Your Profile section is always injected into Settings after all other settings render wrappers.
- Keeps Upload profile picture / Change profile picture available for Owner, Member, and User accounts.


## Profile section root-cause fix
- Removed a stale Settings panel that still referenced the old hardcoded `DASHBOARD_ACCOUNTS` object after Supabase migration.
- That stale reference could throw an error for the Owner and stop Settings before the Your Profile section rendered.
- Your Profile now renders defensively even if another Settings extension fails.


## Profile picture upload reliability fix
- Profile preview now changes immediately after selecting an image.
- Removed the full Settings-page rerender after choosing a picture.
- Added Uploading / Preparing / Saved feedback.
- Added explicit save verification and visible errors.
- Reduced avatar size to 256×256 before saving to keep account/cloud storage lightweight.
- Cloud snapshot is pushed immediately after a successful profile-picture change.
