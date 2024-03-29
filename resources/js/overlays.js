"use strict";
// handles all overlay models
class JoinClassOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "join-class-model");
        this._classCodeInput = null;
        this._joinErrorText = null;
        this._joinButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Join Classroom";
        titleDiv.appendChild(titleSpan);
    }
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
    onShow() {
        setTimeout(() => this._classCodeInput.focus(), 0);
    }
    _onCancelButtonClick() {
        this._classCodeInput.value = "";
        this._joinErrorText.textContent = "";
        this.overlay.hide();
    }
    async _onJoinButtonClick() {
        let code = this._classCodeInput.value.trim();
        if (code.length === 0) {
            this._joinErrorText.textContent = "A class code is required";
            return;
        }
        let data = await SongServerAPI().classrooms.find(code).students.join();
        if (data.success) {
            window.location.reload();
        }
        else {
            this._joinErrorText.textContent = data.message;
        }
    }
}
class DeleteSongFromPlaylistOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "are-you-sure-song");
        this._deleteButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Are You Sure?";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "This will remove this song from the playlist. This can't be undone.";
    }
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
    async _onDeleteButtonClicked() {
        this.overlay.show("loading");
        let req = await SongServerAPI().classrooms.find(classCode).playlist.songs.find(this.getData("song-index")).delete();
        let currentSongReq = await SongServerAPI().classrooms.find(classCode).playlist.songs.currentSong.get();
        if (req.success) {
            let valid = false;
            let songs;
            let songData;
            if (currentSongReq.success) {
                valid = true;
                songs = req.data.songs;
                songData = currentSongReq.data;
            }
            else if (!currentSongReq.success && currentSongReq.id === "api.classroom.playlist.current_song.none") {
                valid = true;
                songs = req.data.songs;
                songData = null;
            }
            if (valid && songs && songData) {
                window.playlistController.refresh(songs, songData);
            }
        }
        this.overlay.hide();
    }
    _onCancelButtonClicked() {
        this.overlay.hide();
    }
}
class DeleteAllStudentsOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "are-you-sure-students");
        this._deleteButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Are You Sure?";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "This will remove all students from your classroom! This can't be undone.";
    }
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
    async _onDeleteButtonClicked() {
        this.overlay.show("loading");
        let response = await SongServerAPI().classrooms.find(classCode).students.removeAll();
        if (!response.success) {
            throw new Error(response.message);
        }
        displayStudents([]);
        this.overlay.hide();
    }
    _onCancelButtonClicked() {
        this.overlay.hide();
    }
}
class DeleteStudentOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "are-you-sure-student");
        this._deleteButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Are You Sure?";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "This will remove all songs submitted by this student and remove them from your class.";
    }
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
    async _onDeleteButtonClicked() {
        this.overlay.show("loading");
        let response = await SongServerAPI().classrooms.find(classCode).students.find(this.getData("email")).remove();
        if (!response.success) {
            this.overlay.hide();
            throw new Error(response.message);
        }
        if (response.data) {
            await loadStudents();
        }
        else {
            window.alert("Failed to delete user!");
        }
        this.overlay.hide();
    }
    _onCancelButtonClicked() {
        this.overlay.hide();
    }
}
class LoadingOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "loading");
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Loading";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.innerHTML = `<i class="fa-solid fa-spinner"></i>`;
    }
    instantiateActions(actionsDiv) {
        //
    }
}
class SettingsSavedOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "settings-saved");
        this._closeButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Saved";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.innerHTML = `Your settings have been saved!`;
    }
    instantiateActions(actionsDiv) {
        this._closeButton = document.createElement("button");
        this._closeButton.classList.add("action");
        this._closeButton.classList.add("yes");
        this._closeButton.addEventListener("click", () => this._onCloseButtonClicked());
        this._closeButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        actionsDiv.appendChild(this._closeButton);
    }
    _onCloseButtonClicked() {
        this.overlay.hide();
    }
}
class CreateClassOverlayModel extends OverlayModelBase {
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
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Create Classroom";
        titleDiv.appendChild(titleSpan);
    }
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
    instantiateSettingCheckbox(container, title, id) {
        let settingsItemDiv = document.createElement("div");
        settingsItemDiv.classList.add("settings-item");
        let titleDiv = document.createElement("div");
        titleDiv.classList.add("settings-title");
        titleDiv.textContent = title;
        let checkbox = document.createElement("input");
        checkbox.classList.add("settings-value");
        checkbox.id = id;
        checkbox.type = "checkbox";
        settingsItemDiv.appendChild(titleDiv);
        settingsItemDiv.appendChild(checkbox);
        container.appendChild(settingsItemDiv);
        return checkbox;
    }
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
    onShow() {
        this._joinableCheckbox.checked = false;
        this._playlistVisibleCheckbox.checked = false;
        this._submissionsEnabledCheckbox.checked = true;
        this._submissionsRequireTokensCheckbox.checked = false;
        setTimeout(() => this._classNameInput.focus(), 0);
    }
    _onCancelButtonClick() {
        this._classNameInput.value = "";
        this._createErrorText.textContent = "";
        this.overlay.hide();
    }
    async _onCreateButtonClick() {
        let name = this._classNameInput.value.trim();
        if (name.length === 0) {
            this._createErrorText.textContent = "A class code is required";
            return;
        }
        let data = await SongServerAPI().classrooms.create({
            "name": name,
            "joinable": this._joinableCheckbox.checked,
            "allowSongSubmissions": this._submissionsEnabledCheckbox.checked,
            "submissionsRequireTokens": this._submissionsRequireTokensCheckbox.checked,
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
class SubmitSongStudentOverlay extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "submit-song-student-model");
        this._submitButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Submit Song";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        let bodyContent = document.createElement("span");
        bodyContent.textContent = "Please confirm this song is 100% CLEAN: The song must not include obsecene language or inappropriate themes.";
        bodyDiv.appendChild(bodyContent);
    }
    instantiateActions(actionsDiv) {
        this._submitButton = document.createElement("button");
        this._submitButton.classList.add("action");
        this._submitButton.classList.add("create");
        this._submitButton.addEventListener("click", async () => await this._onSubmitButtonClick());
        this._submitButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        this._cancelButton = document.createElement("button");
        this._cancelButton.classList.add("action");
        this._cancelButton.classList.add("cancel");
        this._cancelButton.addEventListener("click", () => this._onCancelButtonClick());
        this._cancelButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._submitButton);
        actionsDiv.appendChild(this._cancelButton);
    }
    async _onSubmitButtonClick() {
        this.overlay.hide();
        this.overlay.show("loading");
        let req = await SongServerAPI().classrooms.find(classCode).playlist.songs.add({
            "id": this.getData("id"),
            "source": this.getData("source")
        });
        if (!req.success) {
            this.overlay.show("submit-song-fail-model", { message: req.message });
        }
        else {
            this.overlay.show("submit-song-success-model");
            SongSearchManager.resetCurrent();
            refreshPlaylist();
            refreshStudentInfo();
        }
    }
    _onCancelButtonClick() {
        this.overlay.hide();
    }
}
class SubmitSongTeacherOverlay extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "submit-song-teacher-model");
        this._submitButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Submit Song";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        let bodyContent = document.createElement("span");
        bodyContent.textContent = "Add this song to the playlist?";
        bodyDiv.appendChild(bodyContent);
    }
    instantiateActions(actionsDiv) {
        this._submitButton = document.createElement("button");
        this._submitButton.classList.add("action");
        this._submitButton.classList.add("create");
        this._submitButton.addEventListener("click", async () => await this._onSubmitButtonClick());
        this._submitButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        this._cancelButton = document.createElement("button");
        this._cancelButton.classList.add("action");
        this._cancelButton.classList.add("cancel");
        this._cancelButton.addEventListener("click", () => this._onCancelButtonClick());
        this._cancelButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._submitButton);
        actionsDiv.appendChild(this._cancelButton);
    }
    async _onSubmitButtonClick() {
        this.overlay.hide();
        this.overlay.show("loading");
        let req = await SongServerAPI().classrooms.find(classCode).playlist.songs.add({
            "id": this.getData("id"),
            "source": this.getData("source")
        });
        if (!req.success) {
            this.overlay.show("submit-song-fail-model", { message: req.message });
        }
        else {
            this.overlay.show("submit-song-success-model");
            SongSearchManager.resetCurrent();
            let currentSongReq = await SongServerAPI().classrooms.find(classCode).playlist.songs.currentSong.get();
            if (!currentSongReq.success) {
                this.overlay.show("submit-song-fail-model", { message: currentSongReq.message });
                return;
            }
            window.playlistController.refresh(req.data, currentSongReq.data);
        }
    }
    _onCancelButtonClick() {
        this.overlay.hide();
    }
}
class SubmitSongFailOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "submit-song-fail-model");
        this._closeButton = null;
        this._text = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Submission Failed";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        this._text = document.createElement("span");
        bodyDiv.appendChild(this._text);
    }
    instantiateActions(actionsDiv) {
        this._closeButton = document.createElement("button");
        this._closeButton.classList.add("action");
        this._closeButton.classList.add("no");
        this._closeButton.addEventListener("click", () => this._onCloseButtonClicked());
        this._closeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        actionsDiv.appendChild(this._closeButton);
    }
    _onCloseButtonClicked() {
        this.overlay.hide();
    }
    onShow() {
        this._text.textContent = this.getData("message");
    }
}
class SubmitSongSuccessOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "submit-song-success-model");
        this._closeButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Submission Success";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "The song has been added to the playlist";
    }
    instantiateActions(actionsDiv) {
        this._closeButton = document.createElement("button");
        this._closeButton.classList.add("action");
        this._closeButton.classList.add("yes");
        this._closeButton.addEventListener("click", () => this._onCloseButtonClicked());
        this._closeButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        actionsDiv.appendChild(this._closeButton);
    }
    _onCloseButtonClicked() {
        this.overlay.hide();
    }
}
class ReloginOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "relogin-model");
        this._confirmButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Authorization Expired";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "You must login again to perform this action. Click the checkmark below to login again...";
    }
    instantiateActions(actionsDiv) {
        this._confirmButton = document.createElement("button");
        this._confirmButton.classList.add("action");
        this._confirmButton.classList.add("yes");
        this._confirmButton.addEventListener("click", async () => await this._onConfirmButtonClick());
        this._confirmButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        actionsDiv.appendChild(this._confirmButton);
    }
    _onCancelButtonClick() {
        this.overlay.hide();
    }
    _onConfirmButtonClick() {
        this.overlay.hide();
        window.location.reload();
    }
}
class DeleteClassOverlayModel extends OverlayModelBase {
    constructor(overlay) {
        super(overlay, "are-you-sure-class");
        this._deleteButton = null;
        this._cancelButton = null;
    }
    instantiateTitle(titleDiv) {
        let titleSpan = document.createElement("span");
        titleSpan.textContent = "Are You Sure?";
        titleDiv.appendChild(titleSpan);
    }
    instantiateBody(bodyDiv) {
        bodyDiv.textContent = "This will permanently delete the class. Are you sure you want to do this? This cannot be undone.";
    }
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
    async _onDeleteButtonClicked() {
        this.overlay.show("loading");
        let req = await SongServerAPI().classrooms.find(classCode).delete();
        let currentSongReq = await SongServerAPI().classrooms.find(classCode).playlist.songs.currentSong.get();
        if (req.success && currentSongReq.success) {
            window.playlistController.refresh([], currentSongReq.data);
        }
        this.overlay.hide();
    }
    _onCancelButtonClicked() {
        this.overlay.hide();
    }
}
var overlayManager = new OverlayManager();
overlayManager.addOverlay(JoinClassOverlayModel);
overlayManager.addOverlay(CreateClassOverlayModel);
overlayManager.addOverlay(DeleteSongFromPlaylistOverlayModel);
overlayManager.addOverlay(DeleteStudentOverlayModel);
overlayManager.addOverlay(DeleteAllStudentsOverlayModel);
overlayManager.addOverlay(LoadingOverlayModel);
overlayManager.addOverlay(SettingsSavedOverlayModel);
overlayManager.addOverlay(SubmitSongStudentOverlay);
overlayManager.addOverlay(SubmitSongTeacherOverlay);
overlayManager.addOverlay(SubmitSongFailOverlayModel);
overlayManager.addOverlay(SubmitSongSuccessOverlayModel);
overlayManager.addOverlay(ReloginOverlayModel);
