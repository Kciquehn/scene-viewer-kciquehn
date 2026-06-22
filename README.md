# Compendium Scene Viewer

**Foundry VTT Module** | Compatible with **v13+**

---

## What is it?

Have you ever browsed a map pack like *Angela Maps* and wanted to quickly check what a scene looks like before importing it into your world? Normally, you'd have to import the scene, load the map, check it out, then delete it — just to preview it.

**Compendium Scene Viewer** removes that friction entirely. Right-click any scene inside a compendium and hit **View** — the map opens instantly in a popout window, no import needed.

---

## Features

- 🗺️ **Instant preview** — view any compendium scene without importing it into your world
- 🎬 **Video map support** — works with animated maps in `.mp4` and `.webm` formats
- 📡 **Share with players** — GMs can share the scene preview with all connected players via the share button
- 🔧 **Close previous popouts** — optional setting to automatically close older previews when opening a new one

---

## How to Use

1. Open any **Scene compendium** from the sidebar (e.g. Angela Maps Free 2023)
2. **Right-click** on any scene entry in the list
3. Click **View** (🖼️ icon) in the context menu
4. The scene's background image opens in a popout window — pan and zoom freely!

To **share the preview with your players**, click the share button (📤) inside the popout window.

![Context menu showing the View option](https://raw.githubusercontent.com/Kciquehn/scene-viewer/main/assets/preview.png)

---

## Settings

| Setting | Description | Default |
|---|---|---|
| Close Other Popouts | Automatically closes previous Scene Viewer popouts when opening a new one | Off |

Found under **Game Settings → Module Settings → Compendium Scene Viewer**.

---

## Installation

### Via Foundry Module Browser (recommended)
Search for **Compendium Scene Viewer** in the Foundry VTT module browser and click Install.

### Manual Installation
Paste the manifest URL below into Foundry's **Install Module** dialog:

```
https://raw.githubusercontent.com/Kciquehn/scene-viewer/main/module.json
```

---

## Compatibility

| Foundry Version | Status |
|---|---|
| v13 | ✅ Verified |
| v10 – v12 | ⚠️ Use the [original module](https://github.com/BadIdeasBureau/scene-viewer) by BadIdeasBureau |

---

## Credits

Originally created by [BadIdeasBureau](https://github.com/BadIdeasBureau).  
Updated for Foundry v13 by [Kciquehn](https://github.com/Kciquehn).

Licensed under the [MIT License](LICENSE).

---

## Changelog

### 2.0.0
- Full rewrite for Foundry v13 (ApplicationV2 API)
- Fixed context menu injection using `_getEntryContextOptions` patch
- Fixed `ImagePopout` instantiation for the new v13 API (`options.src`)
- Replaced frozen `options` mutation with `static DEFAULT_OPTIONS`
- Added support for both `data-entry-id` and `data-document-id` attributes

### 1.x
- Original release by BadIdeasBureau for Foundry v10
