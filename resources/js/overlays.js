
// handles all overlay models
/** @extends OverlayModelBase */
class JoinClassOverlayModel extends OverlayModelBase {
    /** @private */
    _classCodeInput = undefined;
    /** @private */
    _joinErrorText = undefined;
    /** @private */
    _joinButton = undefined;
    /** @private */
    _cancelButton = undefined;
    /** @public */
    constructor(overlay) {
        super(overlay, "join-class-model");
        this._classCodeInput = null;
        this._joinErrorText = null;
        this._joinButton = null;
        this._cancelButton = null;
    }
    /** @protected
     * @param {HTMLDivElement} titleDiv
     * @returns {void}
     */
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Join Classroom";
        titleDiv.appendChild(titleSpan);
    }
    /** @protected
     * @param {HTMLDivElement} bodyDiv
     * @returns {void}
     */
    instantiateBody(bodyDiv) {
        let bodyContent = document.createElement("div");
        this._classCodeInput = document.createElement("input");
        let classCodeLabel = document.createElement("label");
        classCodeLabel.htmlFor = "class-code";
        classCodeLabel.textContent = "Class Code";
        this._classCodeInput.name = "class-code";
        this._classCodeInput.type = "text";
        this._classCodeInput.placeholder = "Class Code";
        bodyContent.classList.add("body-content");
        bodyContent.appendChild(classCodeLabel);
        bodyContent.appendChild(this._classCodeInput);
        this._joinErrorText = document.createElement("div");
        this._joinErrorText.classList.add("join-error");
        bodyDiv.appendChild(bodyContent);
        bodyDiv.appendChild(this._joinErrorText);
    }
    /** @protected
     * @param {HTMLDivElement} actionsDiv
     * @returns {void}
     */
    instantiateActions(actionsDiv) {
        this._joinButton = document.createElement("button");
        this._joinButton.classList.add("action");
        this._joinButton.classList.add("join");
        this._joinButton.addEventListener("click", async () => await this._onJoinButtonClick());
        this._joinButton.innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
        this._cancelButton = document.createElement("button");
        this._cancelButton.classList.add("action");
        this._cancelButton.classList.add("cancel");
        this._cancelButton.addEventListener("click", () => this._onCancelButtonClick());
        this._cancelButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._joinButton);
        actionsDiv.appendChild(this._cancelButton);
    }
    /** @public
     * @returns {void}
     */
    onShow() {
        setTimeout(() => this._classCodeInput.focus(), 0);
    }
    /** @private
     * @returns {void}
     */
    _onCancelButtonClick() {
        this._classCodeInput.value = "";
        this._joinErrorText.textContent = "";
        this.overlay.hide();
    }
    /** @private
     * @returns {Promise<void>}
     */
    async _onJoinButtonClick() {
        let code = this._classCodeInput.value.trim();
        if (code.length === 0) {
            this._joinErrorText.textContent = "A class code is required";
            return;
        }
        let data = await SongServerAPI().classroom(code).students.join();
        if (data.success) {
            window.location.reload();
        }
        else {
            this._joinErrorText.textContent = data.message;
        }
    }
}
/** @extends OverlayModelBase */
class DeleteSongFromPlaylistOverlayModel extends OverlayModelBase {
    /** @private */
    _deleteButton = undefined;
    /** @private */
    _cancelButton = undefined;
    /** @public */
    constructor(overlay) {
        super(overlay, "are-you-sure-song");
        this._deleteButton = null;
        this._cancelButton = null;
    }
    /** @protected
     * @param {HTMLDivElement} titleDiv
     * @returns {void}
     */
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Are You Sure?";
        titleDiv.appendChild(titleSpan);
    }
    /** @protected
     * @param {HTMLDivElement} bodyDiv
     * @returns {void}
     */
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "This will remove this song from the playlist. This can't be undone.";
    }
    /** @protected
     * @param {HTMLDivElement} actionsDiv
     * @returns {void}
     */
    instantiateActions(actionsDiv) {
        this._deleteButton = document.createElement("button");
        this._deleteButton.classList.add("action");
        this._deleteButton.classList.add("yes");
        this._deleteButton.addEventListener("click", () => this._onDeleteButtonClicked());
        this._deleteButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        this._cancelButton = document.createElement("button");
        this._cancelButton.classList.add("action");
        this._cancelButton.classList.add("no");
        this._cancelButton.addEventListener("click", () => this._onCancelButtonClicked());
        this._cancelButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._cancelButton);
        actionsDiv.appendChild(this._deleteButton);
    }
    /** @private
     * @returns {Promise<void>}
     */
    async _onDeleteButtonClicked() {
        this.overlay.show("loading");
        let req = await SongServerAPI().classroom(classCode).playlist.songs.delete(this.getData("song-index"));
        if (req.success) {
            window.playlistController.refresh(req.data.songs, req.data.songPosition);
        }
        this.overlay.hide();
    }
    /** @private
     * @returns {void}
     */
    _onCancelButtonClicked() {
        this.overlay.hide();
    }
}
/** @extends OverlayModelBase */
class DeleteAllStudentsOverlayModel extends OverlayModelBase {
    /** @private */
    _deleteButton = undefined;
    /** @private */
    _cancelButton = undefined;
    /** @public */
    constructor(overlay) {
        super(overlay, "are-you-sure-students");
        this._deleteButton = null;
        this._cancelButton = null;
    }
    /** @protected
     * @param {HTMLDivElement} titleDiv
     * @returns {void}
     */
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Are You Sure?";
        titleDiv.appendChild(titleSpan);
    }
    /** @protected
     * @param {HTMLDivElement} bodyDiv
     * @returns {void}
     */
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "This will remove all students from your classroom! This can't be undone.";
    }
    /** @protected
     * @param {HTMLDivElement} actionsDiv
     * @returns {void}
     */
    instantiateActions(actionsDiv) {
        this._deleteButton = document.createElement("button");
        this._deleteButton.classList.add("action");
        this._deleteButton.classList.add("yes");
        this._deleteButton.addEventListener("click", () => this._onDeleteButtonClicked());
        this._deleteButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        this._cancelButton = document.createElement("button");
        this._cancelButton.classList.add("action");
        this._cancelButton.classList.add("no");
        this._cancelButton.addEventListener("click", () => this._onCancelButtonClicked());
        this._cancelButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._cancelButton);
        actionsDiv.appendChild(this._deleteButton);
    }
    /** @private
     * @returns {Promise<void>}
     */
    async _onDeleteButtonClicked() {
        this.overlay.show("loading");
        let response = await SongServerAPI().classroom(classCode).students.removeAll();
        if (!response.success) {
            throw new Error(response.message);
        }
        displayStudents([]);
        this.overlay.hide();
    }
    /** @private
     * @returns {void}
     */
    _onCancelButtonClicked() {
        this.overlay.hide();
    }
}
/** @extends OverlayModelBase */
class LoadingOverlayModel extends OverlayModelBase {
    /** @public */
    constructor(overlay) {
        super(overlay, "loading");
    }
    /** @protected
     * @param {HTMLDivElement} titleDiv
     * @returns {void}
     */
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Loading";
        titleDiv.appendChild(titleSpan);
    }
    /** @protected
     * @param {HTMLDivElement} bodyDiv
     * @returns {void}
     */
    instantiateBody(bodyDiv) {
        bodyDiv.innerHTML = `<i class="fa-solid fa-spinner"></i>`;
    }
    /** @protected
     * @param {HTMLDivElement} actionsDiv
     * @returns {void}
     */
    instantiateActions(actionsDiv) {
        //
    }
}
/** @extends OverlayModelBase */
class CreateClassOverlayModel extends OverlayModelBase {
    /** @private */
    _submissionsEnabledCheckbox = undefined;
    /** @private */
    _submissionsRequireTokensCheckbox = undefined;
    /** @private */
    _joinableCheckbox = undefined;
    /** @private */
    _playlistVisibleCheckbox = undefined;
    /** @private */
    _classNameInput = undefined;
    /** @private */
    _createErrorText = undefined;
    /** @private */
    _createButton = undefined;
    /** @private */
    _cancelButton = undefined;
    /** @public */
    constructor(overlay) {
        super(overlay, "create-class-model");
        this._classNameInput = null;
        this._createErrorText = null;
        this._createButton = null;
        this._cancelButton = null;
        this._submissionsEnabledCheckbox = null;
        this._submissionsRequireTokensCheckbox = null;
        this._joinableCheckbox = null;
        this._playlistVisibleCheckbox = null;
    }
    /** @protected
     * @param {HTMLDivElement} titleDiv
     * @returns {void}
     */
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Create Classroom";
        titleDiv.appendChild(titleSpan);
    }
    /** @protected
     * @param {HTMLDivElement} bodyDiv
     * @returns {void}
     */
    instantiateBody(bodyDiv) {
        let bodyContent = document.createElement("div");
        this._classNameInput = document.createElement("input");
        let classNameLabel = document.createElement("label");
        classNameLabel.htmlFor = "class-name";
        classNameLabel.textContent = "Class Name";
        this._classNameInput.name = "class-name";
        this._classNameInput.type = "text";
        this._classNameInput.placeholder = "Class Name";
        let settingsContainer = document.createElement("div");
        settingsContainer.classList.add("class-settings-container");
        this._submissionsEnabledCheckbox = this.instantiateSettingCheckbox(settingsContainer, "Allow Song Submissions", "new-class-submit-enabled");
        this._submissionsRequireTokensCheckbox = this.instantiateSettingCheckbox(settingsContainer, "Lock Submissions to Tokens", "new-class-submit-tokens");
        this._joinableCheckbox = this.instantiateSettingCheckbox(settingsContainer, "Enable Joining", "new-class-joins");
        this._playlistVisibleCheckbox = this.instantiateSettingCheckbox(settingsContainer, "Students Can See Playlist", "new-class-playlist-visible");
        bodyContent.classList.add("body-content");
        bodyContent.appendChild(classNameLabel);
        bodyContent.appendChild(this._classNameInput);
        bodyContent.appendChild(settingsContainer);
        this._createErrorText = document.createElement("div");
        this._createErrorText.classList.add("join-error");
        bodyDiv.appendChild(bodyContent);
        bodyDiv.appendChild(this._createErrorText);
    }
    /** @private
     * @param {HTMLDivElement} container
     * @param {string} title
     * @param {string} id
     * @returns {HTMLInputElement}
     */
    instantiateSettingCheckbox(container, title, id) {
        let settingsItemDiv = document.createElement("div");
        settingsItemDiv.classList.add("settings-item");
        let titleDiv = document.createElement("div");
        titleDiv.classList.add("settings-title");
        titleDiv.textContent = title;
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("settings-value");
        checkbox.id = id;
        settingsItemDiv.appendChild(titleDiv);
        settingsItemDiv.appendChild(checkbox);
        container.appendChild(settingsItemDiv);
        return checkbox;
    }
    /** @protected
     * @param {HTMLDivElement} actionsDiv
     * @returns {void}
     */
    instantiateActions(actionsDiv) {
        this._createButton = document.createElement("button");
        this._createButton.classList.add("action");
        this._createButton.classList.add("create");
        this._createButton.addEventListener("click", async () => await this._onCreateButtonClick());
        this._createButton.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        this._cancelButton = document.createElement("button");
        this._cancelButton.classList.add("action");
        this._cancelButton.classList.add("cancel");
        this._cancelButton.addEventListener("click", () => this._onCancelButtonClick());
        this._cancelButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._createButton);
        actionsDiv.appendChild(this._cancelButton);
    }
    /** @public
     * @returns {void}
     */
    onShow() {
        this._joinableCheckbox.checked = false;
        this._playlistVisibleCheckbox.checked = false;
        this._submissionsEnabledCheckbox.checked = true;
        this._submissionsRequireTokensCheckbox.checked = false;
        setTimeout(() => this._classNameInput.focus(), 0);
    }
    /** @private
     * @returns {void}
     */
    _onCancelButtonClick() {
        this._classNameInput.value = "";
        this._createErrorText.textContent = "";
        this.overlay.hide();
    }
    /** @private
     * @returns {Promise<void>}
     */
    async _onCreateButtonClick() {
        let name = this._classNameInput.value.trim();
        if (name.length === 0) {
            this._createErrorText.textContent = "A class code is required";
            return;
        }
        let data = await SongServerAPI().createClassroom({
            "name": name,
            "joinable": this._joinableCheckbox.checked,
            "allowSongSubmissions": this._submissionsEnabledCheckbox.checked,
            "submissionsRequireTokens": this._submissionsEnabledCheckbox.checked,
            "playlistVisible": this._playlistVisibleCheckbox.checked
        });
        if (data.success) {
            window.location.reload();
        }
        else {
            this._createErrorText.textContent = data.message;
        }
    }
}
var overlayManager = new Overlay();
overlayManager.addOverlay(JoinClassOverlayModel);
overlayManager.addOverlay(CreateClassOverlayModel);
overlayManager.addOverlay(DeleteSongFromPlaylistOverlayModel);
overlayManager.addOverlay(DeleteAllStudentsOverlayModel);
overlayManager.addOverlay(LoadingOverlayModel);




