// ──────────────────────────────────────────────────────────────────────────────
// Initialisation – listen for socket events from other clients
// ──────────────────────────────────────────────────────────────────────────────
Hooks.once("init", () => {
    game.socket.on("module.scene-viewer", (data) => SceneViewerPopout._handleShareMedia(data));
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag("scene-viewer");
});

function log(...args) {
    try {
        const isDebugging = window.DEV?.getPackageDebugValue("scene-viewer");
        if (isDebugging) console.log("scene-viewer", "|", ...args);
    } catch (e) {}
}

// ──────────────────────────────────────────────────────────────────────────────
// Patch _getEntryContextOptions on the Compendium prototype after ready
// ──────────────────────────────────────────────────────────────────────────────
Hooks.once("ready", () => {
    let Target = null;
    for (const [, app] of foundry.applications.instances) {
        if (app.constructor.name === "Compendium"
            && typeof app._getEntryContextOptions === "function") {
            Target = app.constructor;
            break;
        }
    }

    // Fallback v13: usa o namespace correto em vez do global deprecado
    if (!Target) {
        Target = foundry.applications.sidebar.apps.Compendium ?? null;
    }

    if (!Target) {
        console.warn("scene-viewer | Could not find Compendium class to patch.");
        return;
    }

    const _orig = Target.prototype._getEntryContextOptions;
    Target.prototype._getEntryContextOptions = function (...args) {
        const options = _orig.call(this, ...args);
        if (this.collection?.documentName !== "Scene") return options;
        if (options.some(o => o.name === game.i18n.localize("SCENES.View"))) return options;
        options.push({
            name: game.i18n.localize("SCENES.View"),
            icon: '<i class="fas fa-images"></i>',
            callback: async (li) => {
                const element = li instanceof HTMLElement ? li : li[0];
                const entryId = element.dataset.entryId ?? element.dataset.documentId;
                const document = await this.collection.getDocument(entryId);
                log("Loading Scene:", document);
                loadSceneImage(document);
            }
        });
        return options;
    };

    log("Patched Compendium._getEntryContextOptions on", Target.name);
});

Hooks.on("renderCompendium", (app) => {
    if (app.collection?.documentName !== "Scene") return;
    if (app._sceneViewerPatched) return;
    app._sceneViewerPatched = true;

    const _orig = app._getEntryContextOptions.bind(app);
    app._getEntryContextOptions = function (...args) {
        const options = _orig(...args);
        if (!options.some(o => o.name === game.i18n.localize("SCENES.View"))) {
            options.push({
                name: game.i18n.localize("SCENES.View"),
                icon: '<i class="fas fa-images"></i>',
                callback: async (li) => {
                    const element = li instanceof HTMLElement ? li : li[0];
                    const entryId = element.dataset.entryId ?? element.dataset.documentId;
                    const document = await this.collection.getDocument(entryId);
                    loadSceneImage(document);
                }
            });
        }
        return options;
    };
});

// ──────────────────────────────────────────────────────────────────────────────
// Load and display the background image of a compendium Scene
// ──────────────────────────────────────────────────────────────────────────────
async function loadSceneImage(scene) {
    const image = scene.background?.src;
    if (!image) {
        ui.notifications.warn(game.i18n.localize("SCENE_VIEWER.NoImage"));
        return;
    }

    if (game.settings.get("scene-viewer", "closePrevious")) {
        for (const w of Object.values(ui.windows)) {
            if (w instanceof SceneViewerPopout) await w.close();
        }
        for (const app of foundry.applications.instances.values()) {
            if (app instanceof SceneViewerPopout) await app.close();
        }
    }

    ui.notifications.info(game.i18n.localize("SCENE_VIEWER.Loading.Content"));

    new SceneViewerPopout(image, { title: scene.name, uuid: scene.uuid }).render(true);
}

// ──────────────────────────────────────────────────────────────────────────────
// SceneViewerPopout
// v13: ImagePopout is now ApplicationV2. The image path goes in options.src.
//      options object is frozen, so we cannot add properties after super().
//      Template is declared via static DEFAULT_OPTIONS.
// ──────────────────────────────────────────────────────────────────────────────
class SceneViewerPopout extends ImagePopout {
    constructor(src, options = {}) {
        // v13 requires src inside options; passing as first arg still works but warns
        super(foundry.utils.mergeObject({ src }, options, { inplace: false }));
        this._src = src;
        this._isVideo = !!CONST.VIDEO_FILE_EXTENSIONS[src.split(".").pop().toLowerCase()];
    }

    // v13 ApplicationV2 template declaration
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(
        ImagePopout.DEFAULT_OPTIONS ?? {},
        { window: { contentTemplate: "modules/scene-viewer/templates/media-popout.html" } },
        { inplace: false }
    );

    // v13 context preparation
    async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.isVideo = this._isVideo;
        context.src = this._src;
        return context;
    }

    // v10–v12 fallback
    async getData(options = {}) {
        const data = await super.getData(options);
        data.isVideo = this._isVideo;
        data.src = this._src ?? data.src ?? data.image;
        return data;
    }

    shareImage() {
        game.socket.emit("module.scene-viewer", {
            image: this._src,
            title: this.options?.title ?? this.window?.title,
            uuid: this.options?.uuid
        });
    }

    static _handleShareMedia({ image, title, uuid } = {}) {
        return new SceneViewerPopout(image, {
            title, uuid, shareable: false, editable: false
        }).render(true);
    }
}