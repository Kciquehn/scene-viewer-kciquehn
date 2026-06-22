Hooks.on("init", () => {
    game.settings.register("scene-viewer", "closePrevious", {
        name: game.i18n.localize("SCENE_VIEWER.Settings.ClosePrevious"),
        hint: game.i18n.localize("SCENE_VIEWER.Settings.Hints.ClosePrevious"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
});
