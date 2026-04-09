# MicroLearn PWA — Deploy to iPhone (No Mac Required)

Follow these steps exactly. Takes about 10 minutes.

---

## STEP 1 — Create a free GitHub account

1. Go to **github.com**
2. Click **Sign up**
3. Enter an email, password, and username
4. Verify your email

---

## STEP 2 — Create a new repository

1. Once logged in, click the **+** icon (top-right) → **New repository**
2. Fill in:
   - **Repository name:** `microlearn`  ← exactly this, lowercase
   - **Description:** (optional)
   - Select **Public**
   - Do NOT check any of the "Initialize" boxes
3. Click **Create repository**

---

## STEP 3 — Upload the files

1. On the new empty repo page, click **uploading an existing file**
2. Open File Explorer on your Windows PC
3. Navigate to: `C:\Users\shamsi\Coding Projects\MicroLearnPWA\`
4. Select ALL files and folders:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `style.css`
   - `icon.svg`
   - The `js` folder (drag the whole folder)
5. **Drag everything** into the GitHub upload area in your browser
6. At the bottom, leave the commit message as-is → click **Commit changes**

---

## STEP 4 — Enable GitHub Pages

1. In your repository, click **Settings** (top tab bar)
2. In the left sidebar, click **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Under **Branch**, choose **main** and **/ (root)**
5. Click **Save**
6. Wait **1–2 minutes** then refresh the page
7. A green banner will appear: **"Your site is live at https://[username].github.io/microlearn/"**

> Your URL will be: `https://YOUR-GITHUB-USERNAME.github.io/microlearn/`

---

## STEP 5 — Test in your browser first

1. Open that URL in Chrome or Edge on your Windows PC
2. You should see the MicroLearn app load
3. Test a session to make sure everything works

---

## STEP 6 — Install on iPhone

1. On the iPhone, open **Safari** (must be Safari — Chrome won't allow install)
2. Go to your URL: `https://YOUR-GITHUB-USERNAME.github.io/microlearn/`
3. Tap the **Share button** (the box with an arrow pointing up, at the bottom)
4. Scroll down in the share sheet and tap **"Add to Home Screen"**
5. Change the name to **MicroLearn** if needed → tap **Add**
6. The app icon appears on the home screen ⚡

**That's it!** The app:
- Runs fullscreen (no browser chrome)
- Works offline after first load
- Saves all progress and streaks on the device
- Feels like a native app

---

## Updating the app later

If you want to add questions or change anything:
1. Edit the files on your PC
2. Go to your GitHub repo
3. Click the file you want to update → click the pencil ✏️ icon → paste new content → Commit
4. GitHub Pages updates automatically within 1–2 minutes
5. On iPhone, open the app and pull-to-refresh once to get the update

---

## File Overview

| File | Purpose |
|------|---------|
| `index.html` | App shell and tab bar |
| `style.css` | All styles (iOS design) |
| `js/data.js` | 150 questions + 28 resource links |
| `js/app.js` | All game logic, navigation, scoring |
| `manifest.json` | Makes it installable as a PWA |
| `sw.js` | Offline caching (service worker) |
| `icon.svg` | App icon |

## Adding Your Own Questions

Open `js/data.js` and add to any subject array:

```javascript
{id:'a31', topic:'Your Topic', diff:'medium',
 q:'Your question here?',
 opts:['Correct answer', 'Wrong answer 1', 'Wrong answer 2', 'Wrong answer 3'],
 exp:'Explanation shown after answering.'},
```

> `opts[0]` is always the correct answer. The app shuffles them automatically.
