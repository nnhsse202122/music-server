
/** */
class SidebarButton {
    /** @public */
    button = undefined;
    /** @public */
    model = undefined;
    /** @public */
    id = undefined;
    /** @private */
    _callback = undefined;
    /** @private */
    _controller = undefined;
    /** @private */
    _active = undefined;
    /**
     * Initializes a new sidebar button
     * @param {string} id The ID of the element for the button
     * @param {SidebarController} controller The controller for this button
     * @param {() => any} callback A function called whenever this sidebar button is enabled.
     */
    constructor(id, controller, callback) {
        /** @type {HTMLButtonElement} */
        this.button = document.getElementById(id);
        /** @type {HTMLDivElement} */
        this.model = document.getElementById(id + "-model");
        /** @type {string} */
        this.id = id;
        /**
         * @private
         * @type {() => any}
         */
        this._callback = callback;
        /**
         * @private
         * @type {SidebarController}
         */
        this._controller = controller;
        /**
         * @private
         * @type {boolean}
         */
        this._active = false;
        this.button.addEventListener("click", () => this._controller.toggle(this.id));
    }
    /** @returns {void} */
    enable() {
        if (this._active)
            return;
        this._active = true;
        this.button.classList.add("active");
        this.model.classList.add("active");
        this._callback();
    }
    /** @returns {void} */
    disable() {
        if (!this._active)
            return;
        this._active = false;
        this.button.classList.remove("active");
        this.model.classList.remove("active");
    }
    /** @returns {void} */
    toggle() {
        if (this._active) {
            this.disable();
        }
        else {
            this.enable();
        }
    }
}
/** */
class SidebarController {
    /** @private */
    _buttons = undefined;
    constructor() {
        /**
         * @private
         * @type {SidebarButton[]}
         */
        this._buttons = [];
    }
    /**
     * Adds a button to the controller.
     * @param {string} id  The ID of the button
     * @param {() => any} callback  The callback to be called.
     * @returns {void}
     */
    addButton(id, callback) {
        this._buttons.push(new SidebarButton(id, this, callback));
    }
    /**
     * Toggles a specific sidebar button.
     * @param {string} id  The ID of the button to toggle
     * @returns {void}
     */
    toggle(id) {
        for (let index = 0, length = this._buttons.length; index < length; index++) {
            let btn = this._buttons[index];
            if (btn.id === id) {
                btn.enable();
            }
            else {
                btn.disable();
            }
        }
    }
}
let deleteYesButton = document.getElementById("delete-class-yes");
let deleteNoButton = document.getElementById("delete-class-no");
let backButton = document.getElementById("back");
let removeAllStudentsButton = document.getElementById("remove-all-students-button");
let classNameInput = document.getElementById("class-name");
let classSubmitEnabledCheckbox = document.getElementById("class-submit-enabled");
let classSubmitTokensContainer = document.getElementById("class-submit-tokens-container");
let classSubmitTokensCheckbox = document.getElementById("class-submit-tokens");
let classJoinsCheckbox = document.getElementById("class-joins");
let classPlaylistVisibleCheckbox = document.getElementById("class-playlist-visible");
let removeAllStudentsYesButton = document.getElementById("remove-all-students-yes");
let removeAllStudentsNoButton = document.getElementById("remove-all-students-no");
let revertSettingsButton = document.getElementById("revert-settings");
let saveSettingsButton = document.getElementById("save-settings");
let playlistContainer = document.getElementById("playlist-container");
classSubmitEnabledCheckbox.addEventListener("change", () => {
    updateSettings();
});
/** @returns {void} */
function updateSettings() {
    if (classSubmitEnabledCheckbox.checked) {
        classSubmitTokensContainer.classList.remove("disabled");
    }
    else {
        classSubmitTokensContainer.classList.add("disabled");
    }
    classSubmitTokensCheckbox.disabled = !classSubmitEnabledCheckbox.checked;
}
let controller = new SidebarController();
controller.addButton("overview", () => {
});
controller.addButton("students", async () => {
    await loadStudents();
});
controller.addButton("settings", () => {
});
controller.addButton("delete", () => {
});
/** @returns {Promise<void>} */
async function revertSettings() {
    window.overlayManager.show("loading");
    let response = await SongServerAPI(2).classroom(classCode).settings.get();
    if (!response.success) {
        window.overlayManager.hide();
        window.alert("Error whilst fetching settings: " + response.message);
        throw new Error(response.message);
    }
    classNameInput.value = response.data.name;
    classSubmitEnabledCheckbox.checked = response.data.allowSongSubmissions;
    classSubmitTokensCheckbox.checked = response.data.submissionsRequireTokens;
    classJoinsCheckbox.checked = response.data.joinable;
    classPlaylistVisibleCheckbox.checked = response.data.playlistVisible;
    updateSettings();
    window.overlayManager.hide();
}
/** @returns {Promise<void>} */
async function saveSettings() {
    window.overlayManager.show("loading");
    let response = await SongServerAPI(2).classroom(classCode).settings.set({
        "name": classNameInput.value,
        "allowSongSubmissions": classSubmitEnabledCheckbox.checked,
        "submissionsRequireTokens": classSubmitTokensCheckbox.checked,
        "joinable": classJoinsCheckbox.checked,
        "playlistVisible": classPlaylistVisibleCheckbox.checked
    });
    if (!response.success) {
        window.overlayManager.hide();
        window.alert("Error whilst updating settings: " + response.message);
        throw new Error(response.message);
    }
    window.overlayManager.show("settings-saved");
}
/** @returns {void} */
function goBack() {
    window.location.pathname = "/teacher/classes.html";
}
backButton.addEventListener("click", goBack);
deleteNoButton.addEventListener("click", () => {
    controller.toggle("overview");
});
deleteYesButton.addEventListener("click", async () => {
    let result = await SongServerAPI(2).classroom(classCode).delete();
    if (result.success) {
        goBack();
    }
});




