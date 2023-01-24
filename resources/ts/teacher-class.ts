
/** */
class SidebarButton {
    public button: HTMLButtonElement;
    public model: HTMLDivElement;
    public id: string;
    private _callback: () => any;
    private _controller: SidebarController;
    private  _active: boolean;
    /**
     * Initializes a new sidebar button
     * @param id The ID of the element for the button
     * @param controller The controller for this button
     * @param callback A function called whenever this sidebar button is enabled.
     */
    constructor(id: string, controller: SidebarController, callback: () => any) {
        this.button = document.getElementById(id) as HTMLButtonElement;
        this.model = document.getElementById(id + "-model") as HTMLDivElement;
       
        this.id = id;
        this._callback = callback;
        this._controller = controller;
        this._active = false;
        this.button.addEventListener("click", () => this._controller.toggle(this.id));
    }
    public enable() {
        if (this._active)
            return;
        this._active = true;
        this.button.classList.add("active");
        this.model.classList.add("active");
        this._callback();
    }
    public disable() {
        if (!this._active)
            return;
        this._active = false;
        this.button.classList.remove("active");
        this.model.classList.remove("active");
    }
    public toggle() {
        if (this._active) {
            this.disable();
        }
        else {
            this.enable();
        }
    }
}
class SidebarController {
    private _buttons: SidebarButton[];
    public constructor() {
        this._buttons = [];
    }
    /**
     * Adds a button to the controller.
     * @param id  The ID of the button
     * @param callback  The callback to be called.
     */
    public addButton(id: string, callback: () => any) {
        this._buttons.push(new SidebarButton(id, this, callback));
    }
    /**
     * Toggles a specific sidebar button.
     * @param id  The ID of the button to toggle
     */
    public toggle(id: string) {
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
let deleteYesButton = document.getElementById("delete-class-yes")!;
let deleteNoButton = document.getElementById("delete-class-no")!;
let backButton = document.getElementById("back")!;
let removeAllStudentsButton = document.getElementById("remove-all-students-button")!;
let classNameInput = document.getElementById("class-name")! as HTMLInputElement;
let classSubmitEnabledCheckbox = document.getElementById("class-submit-enabled")! as HTMLInputElement;
let classSubmitTokensContainer = document.getElementById("class-submit-tokens-container")!;
let classSubmitTokensCheckbox = document.getElementById("class-submit-tokens")! as HTMLInputElement;
let classLikeCountVisibilityCheckbox = document.getElementById("class-like-count")! as HTMLInputElement;
let classLikeCountVisibilityContainer = document.getElementById("class-like-count-container")!;
let classPriorityCostContainer = document.getElementById("class-priority-cost-container")!;
let classLikesEnabledCheckbox = document.getElementById("class-likes")! as HTMLInputElement;
let classPriorityEnabledCheckbox = document.getElementById("class-priority")! as HTMLInputElement;
let classPriorityCostInput = document.getElementById("class-priority-cost")! as HTMLInputElement;
let classJoinsCheckbox = document.getElementById("class-joins")! as HTMLInputElement;
let classPlaylistVisibleCheckbox = document.getElementById("class-playlist-visible")! as HTMLInputElement;
let removeAllStudentsYesButton = document.getElementById("remove-all-students-yes")!;
let removeAllStudentsNoButton = document.getElementById("remove-all-students-no")!;
let revertSettingsButton = document.getElementById("revert-settings")!;
let saveSettingsButton = document.getElementById("save-settings")!;
// @ts-ignore
let playlistContainer = document.getElementById("playlist-container")! as HTMLDivElement;
classSubmitEnabledCheckbox.addEventListener("change", () => {
    updateSettings();
});
classPriorityEnabledCheckbox.addEventListener("change", () => {
    updateSettings();
});
classLikesEnabledCheckbox.addEventListener("change", () => {
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
    if (classPriorityEnabledCheckbox.checked) {
        classPriorityCostContainer.classList.remove("disabled");
    }
    else {
        classPriorityCostContainer.classList.add("disabled");
    }
    if (classLikesEnabledCheckbox.checked) {
        classLikeCountVisibilityContainer.classList.remove("disabled");
    }
    else {
        classLikeCountVisibilityContainer.classList.add("disabled");
    }
    classPriorityCostInput.disabled = !classPriorityEnabledCheckbox.checked;
    classSubmitTokensCheckbox.disabled = !classSubmitEnabledCheckbox.checked;
    classLikeCountVisibilityCheckbox.disabled = !classLikesEnabledCheckbox.checked;
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
    let response = await SongServerAPI().classrooms.find(classCode).settings.get();
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
    classLikesEnabledCheckbox.checked = response.data.likesEnabled;
    classPriorityEnabledCheckbox.checked = response.data.priorityEnabled;
    classPriorityCostInput.value = response.data.priorityCost.toString();
    classLikeCountVisibilityCheckbox.checked = response.data.likesVisible;
    updateSettings();
    window.overlayManager.hide();
}
/** @returns {Promise<void>} */
async function saveSettings() {
    window.overlayManager.show("loading");
    let response = await SongServerAPI().classrooms.find(classCode).settings.set({
        "name": classNameInput.value,
        "allowSongSubmissions": classSubmitEnabledCheckbox.checked,
        "submissionsRequireTokens": classSubmitTokensCheckbox.checked,
        "joinable": classJoinsCheckbox.checked,
        "playlistVisible": classPlaylistVisibleCheckbox.checked,
        "likesEnabled": classLikesEnabledCheckbox.checked,
        "priorityEnabled": classPriorityEnabledCheckbox.checked,
        "priorityCost": parseInt("" + classPriorityCostInput.value),
        "likesVisible": classLikeCountVisibilityCheckbox.checked
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
    window.location.pathname = "/classes";
}
backButton.addEventListener("click", goBack);
deleteNoButton.addEventListener("click", () => {
    controller.toggle("overview");
});
deleteYesButton.addEventListener("click", async () => {
    let result = await SongServerAPI().classrooms.find(classCode).delete();
    if (result.success) {
        goBack();
    }
});


/**
 * @param students  Students
 */
function displayStudents(students: SongServer.API.Data.StudentInClass[]) {
    let table = document.getElementById("student-table")! as HTMLTableElement;
    /** @type {HTMLDivElement} */
    let noStudentsFound = document.getElementById("no-student-text")!;
    noStudentsFound.style.display = "none";
    table.style.display = "none";
    removeAllStudentsButton.style.display = "none";
    /** @type {HTMLTableSectionElement} */
    let tableBody = document.getElementById("student-table-body")!;
    tableBody.innerHTML = "";
    let noStudents = true;
    for (let index = 0; index < students.length; index++) {
        let student = students[index];
        noStudents = false;
        let tr = document.createElement("tr");
        let tdName = document.createElement("td");
        let tdTokens = document.createElement("td");
        let tdLikes = document.createElement("td");
        let tdRemove = document.createElement("td");
        let removeButton = document.createElement("button");
        let removeIcon = document.createElement("i");
        removeIcon.classList.add("fa-solid", "fa-user-xmark");
        removeButton.appendChild(removeIcon);
        removeButton.addEventListener("click", () => {
            window.overlayManager.show("are-you-sure-student", { "email": student.email});
        });
        tdRemove.appendChild(removeButton);
        tdName.textContent = student.name;
        let tokensContainer = document.createElement("div");
        let tokenCountText = document.createElement("input");
        tokenCountText.classList.add("token-count");
        tokenCountText.type = "number";
        tokenCountText.value = String(student.tokens);
        tokenCountText.addEventListener("change", async () => {
            let response = await SongServerAPI().classrooms.find(classCode).students.find(student.email).tokens.set(Math.max(parseInt(tokenCountText.value), 0));
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            tokenCountText.value = String(response.data);
        });
        let decrementTokenButtonIcon = document.createElement("i");
        decrementTokenButtonIcon.classList.add("fa-solid", "fa-minus");
        let decrementTokenButton = document.createElement("button");
        decrementTokenButton.appendChild(decrementTokenButtonIcon);
        decrementTokenButton.classList.add("decrement-token");
        decrementTokenButton.addEventListener("click", async () => {
            let response = await SongServerAPI().classrooms.find(classCode).students.find(student.email).tokens.set(Math.max(parseInt(tokenCountText.value) - 1, 0));
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            tokenCountText.value = String(response.data);
        });
        let incrementTokenButtonIcon = document.createElement("i");
        incrementTokenButtonIcon.classList.add("fa-solid", "fa-plus");
        let incrementTokenButton = document.createElement("button");
        incrementTokenButton.appendChild(incrementTokenButtonIcon);
        incrementTokenButton.classList.add("increment-token");
        incrementTokenButton.addEventListener("click", async () => {
            let response = await SongServerAPI().classrooms.find(classCode).students.find(student.email).tokens.set(parseInt(tokenCountText.value) + 1);
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            tokenCountText.value = String(response.data);
        });
        tokensContainer.appendChild(decrementTokenButton);
        tokensContainer.appendChild(tokenCountText);
        tokensContainer.appendChild(incrementTokenButton);
        tdTokens.appendChild(tokensContainer);
        
        let likesContainer = document.createElement("div");
        let likeCountText = document.createElement("input");
        likeCountText.classList.add("like-count");
        likeCountText.type = "number";
        likeCountText.value = String(student.likes);
        likeCountText.addEventListener("change", async () => {
            let response = await SongServerAPI().classrooms.find(classCode).students.find(student.email).likes.set(Math.max(parseInt(likeCountText.value), 0));
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            likeCountText.value = String(response.data);
        });
        let decrementLikeButtonIcon = document.createElement("i");
        decrementLikeButtonIcon.classList.add("fa-solid", "fa-minus");
        let decrementLikeButton = document.createElement("button");
        decrementLikeButton.appendChild(decrementLikeButtonIcon);
        decrementLikeButton.classList.add("decrement-token");
        decrementLikeButton.addEventListener("click", async () => {
            let response = await SongServerAPI().classrooms.find(classCode).students.find(student.email).likes.set(Math.max(parseInt(likeCountText.value) - 1, 0));
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            likeCountText.value = String(response.data);
        });
        let incrementLikeButtonIcon = document.createElement("i");
        incrementLikeButtonIcon.classList.add("fa-solid", "fa-plus");
        let incrementLikeButton = document.createElement("button");
        incrementLikeButton.appendChild(incrementLikeButtonIcon);
        incrementLikeButton.classList.add("increment-token");
        incrementLikeButton.addEventListener("click", async () => {
            let response = await SongServerAPI().classrooms.find(classCode).students.find(student.email).likes.set(parseInt(likeCountText.value) + 1);
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            likeCountText.value = String(response.data);
        });
        likesContainer.appendChild(decrementLikeButton);
        likesContainer.appendChild(likeCountText);
        likesContainer.appendChild(incrementLikeButton);
        tdLikes.appendChild(likesContainer);
        tdRemove.classList.add("student-remove");
        tdName.classList.add("student-name");
        tdTokens.classList.add("student-tokens");
        tdLikes.classList.add("student-likes");
        tr.appendChild(tdName);
        tr.appendChild(tdTokens);
        tr.appendChild(tdLikes);
        tr.appendChild(tdRemove);
        tableBody.appendChild(tr);
    }
    table.style.display = noStudents ? "none" : "block";
    noStudentsFound.style.display = noStudents ? "block" : "none";
    removeAllStudentsButton.style.display = noStudents ? "none" : "block";
}
removeAllStudentsButton.addEventListener("click", () => {
    window.overlayManager.show("are-you-sure-students");
});
/** @returns {Promise<void>} */
async function loadStudents() {
    window.overlayManager.show("loading");
    let response = await SongServerAPI().classrooms.find(classCode).students.list();
    if (!response.success) {
        window.overlayManager.hide();
        throw new Error(response.message);
    }
    displayStudents(response.data);
    window.overlayManager.hide();
}
revertSettingsButton.addEventListener("click", async () => {
    await revertSettings();
});
saveSettingsButton.addEventListener("click", async () => {
    await saveSettings();
});
/** @param {DragEvent} ev
 * @returns {void}
 */
function onSongDragStart(ev: DragEvent) {
    document.getElementById("top-playlist-item")!.style.display = "block";
    let evTarget = ev.target!;
    let playlistItem = (evTarget as HTMLElement).parentElement!.parentElement!;
    let songID = playlistItem.getAttribute("song-id");
    ev.dataTransfer!.setData("text/plain", songID ?? "");
}
/** @param {DragEvent} ev
 * @returns {void}
 */
function onSongDragEnd(ev: DragEvent) {
    document.getElementById("top-playlist-item")!.style.display = "none";
}
/** @param {DragEvent} ev
 * @param {number} index
 * @returns {void}
 */
function onSongDragOver(ev: DragEvent, index: number) {
    ev.preventDefault();
}
/** @param {DragEvent} ev
 * @param {number} index
 * @returns {void}
 */
function onSongDrop(ev: DragEvent, index: number) {
    ev.preventDefault();
    let songID = ev.dataTransfer!.getData("text/plain");
    let songElement = document.getElementById("song-" + songID);
    let songElementParent = songElement!.parentElement;
    // [_, 1, 2, 3, 4, 5] | move 3 to _
    // [_, 3, 1, 2, 4, 5]
    // [_, 1, 2, 3, 4, 5] | move 3 to 1
    // [_, 1, 3, 2, 4, 5]
    // [_, 1, 2, 3, 4, 5] | move 3 to 5
    // [_, 1, 2, 4, 5, 3]
    let previous = null;
    let songElementIndex = -1;
    let containerIndex = index + 1;
    for (let i = playlistContainer.children.length - 1; i > 1; i--) {
        let c = playlistContainer.children[i];
        if (c.children.length > 0 && c.children[0] === songElement) {
            songElementIndex = i;
            previous = songElement;
            break;
        }
    }
    if (containerIndex === songElementIndex || previous === null)
        return;
    let pushElementBack = false;
    if (containerIndex < songElementIndex) {
        pushElementBack = false;
        containerIndex++;
    }
    else {
        pushElementBack = true;
    }
    if (pushElementBack) {
        for (let index = containerIndex; index > songElementIndex; index--) {
            let c = playlistContainer.children[index];
            c.appendChild(previous);
            previous = c.children[0];
        }
    }
    else {
        for (let index = containerIndex; index < songElementIndex; index++) {
            let c = playlistContainer.children[index];
            c.appendChild(previous);
            previous = c.children[0];
        }
    }
    // add previous to parent of starting song element parent
    songElementParent!.appendChild(previous);
}
/** @extends PlaylistControllerBase */
class TeacherPlaylistController extends PlaylistControllerBase {
    private _currentSong: SongServer.API.Data.ClassroomSong | null = null;
    private playlistSongs: TeacherPlaylistSong[];
    private _playing: boolean;
    /** @public */
    constructor() {
        super(playlistContainer);
        this._playing = false;
        this.playlistSongs = [];
        document.getElementById("volume-slider")!.addEventListener("change", (ev) => {
            // @ts-ignore
            let vol = parseInt(ev.target.value);
            this._updateVolumeLabel(vol);
            window.player.setVolume(vol);
        });
        document.getElementById("next-song-btn")!.addEventListener("click", () => {
            this.nextSong();
        });
        document.getElementById("previous-song-btn")!.addEventListener("click", () => {
            this.previousSong();
        });
        document.getElementById("shuffle-song-btn")!.addEventListener("click", () => {
            this.shuffle();
        });
        document.getElementById("playback-btn")!.addEventListener("click", () => {
            if (this.currentSong?.state === PlaylistSongState.NOT_STARTED) {
                this.changeSong(this.currentSong);
            }
            else {
                this.togglePlayback();
            }
        });
    }
    public async refresh(songs: SongServer.API.Data.ClassroomSong[], currentSong: SongServer.API.Data.ClassroomSong | null) {
        let curSong = this.currentSong;
        console.groupCollapsed("Song Refresh");
        console.log(currentSong);
        let oldState = curSong?.state ?? PlaylistSongState.NOT_STARTED;
        curSong?.onSongChange();
        let currentSongID = curSong?.songID;
        let currentSongSource = curSong?.songSource;
        this.playlistSongs = [];
        playlistContainer.innerHTML = `<div id="playlist-container-empty" style="display: none">
    Your playlist is empty!
</div>`;
        for (let index = 0; index < songs.length; index++) {
            let song = songs[index];
            this.playlistSongs.push(new TeacherPlaylistSong(song, index, this));
        }
        console.log(songs);
        if (songs.length === 0) {
            console.log("No songs found :(");
            document.getElementById("playlist-container-empty")!.style.display = "block";
        }
        this.setCurrentSong(currentSong);
        curSong = this.currentSong;
        if (this._playing && curSong?.state === PlaylistSongState.PLAYING && (currentSongID !== (curSong?.songID) || (currentSongSource !== (curSong?.songSource)))) {
            curSong?.play();
        }
        ;
        console.log(this.currentSong);
        document.getElementById("now-playing-text")!.textContent = this.currentSong?.title?.replace(/\&quot;/gi, '"')?.replace(/\&#39;/gi, "'")?.replace(/\&amp;/gi, "&") ?? "";
        this.currentSong?.setSelected();
        if (this.currentSong?.songID === currentSongID && this.currentSong?.songSource === currentSongSource) {
            this.currentSong.state = oldState;
        }
        console.groupEnd();
    }
    public get currentSong() {
        if (this._currentSong == null) return null;

        if (!this._currentSong.from_priority) {
            return this.playlistSongs[this._currentSong.position - 1];
        }
        // @ts-ignore
        return new PriorityPlaylistSong(this._currentSong, this);
    }
    /** 
     * @public
     * @param {SongServer.API.CurrentSong} song
     */
    public setCurrentSong(song: SongServer.API.Data.ClassroomSong | null) {
        console.log(song);
        this._currentSong = song;
    }

    protected _togglePlayback() {
        window.player.togglePause();
    }
    /** @public */
    public get isStudent() { return false; }
    /** @public */
    public get isTeacher() { return true; }
    
    public canTogglePlayback() {
        return true;
    }
    public canChangeToSong(song: PlaylistSongBase) {
        return true;
    }
    protected async _playSong(song: PlaylistSongBase) {
        let newSong = this.currentSong;
        console.log(newSong);
        if (newSong != null) {
            document.getElementById("now-playing-text")!.textContent = newSong.title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'").replace(/\&amp;/gi, "&");
        }
        window.player.loadVideo(song.songID);
        newSong?.setSelected();
    }
    public get playable() {
        let playable = false;
        for (let index = 0; index < this.playlistSongs.length; index++) {
            if (!this.playlistSongs[index].deleted) {
                playable = true;
                break;
            }
        }
        return playable;
    }
    public refreshVolume() {
        let vol = window.player.getVolume();
        (document.getElementById("volume-slider")! as HTMLInputElement).value = vol.toString();
        this._updateVolumeLabel(vol);
    }
    private _updateVolumeLabel(value: number) {
        document.getElementById("volume-slider-label")!.textContent = value + "%";
    }
    public onPaused() {
        this.currentSong?.pause();
        let iElement = document.getElementById("playback-btn")!.children[0];
        iElement.classList.remove("fa-pause");
        iElement.classList.add("fa-play");
    }
    public onResume() {
        this.currentSong?.play();
        let iElement = document.getElementById("playback-btn")!.children[0];
        iElement.classList.remove("fa-play");
        iElement.classList.add("fa-pause");
    }
    public onBuffering() {
        this.currentSong?.buffer();
    }
    public setVolume(volume: number) {
        window.player.setVolume(volume);
    }
    public togglePlayback() {
        window.player.togglePause();
    }
    public async nextSong() {
        this.currentSong?.onSongChange();
        let nextSongResponse = await SongServerAPI().classrooms.find(classCode).playlist.nextSong();
        if (!nextSongResponse.success) {
            console.log(nextSongResponse);
            throw new Error(nextSongResponse.message);
        }

        this.setCurrentSong(nextSongResponse.data);
        
        let nextSong = this.currentSong;
        if (!this.playable)
            return;
        
        this.currentSong?.play();
        if (nextSong != null)
            this._playSong(nextSong);
    }
    public async previousSong() {
        this.currentSong?.onSongChange();
        let previousSongResponse = await SongServerAPI().classrooms.find(classCode).playlist.previousSong();
        if (!previousSongResponse.success) {
            console.log(previousSongResponse);
            throw new Error(previousSongResponse.message);
        }

        this.setCurrentSong(previousSongResponse.data);
        
        let previousSong = this.currentSong;
        if (!this.playable)
            return;
        
        this.currentSong?.play();
        if (previousSong != null)
            this._playSong(previousSong);
    }

    async shuffle() {
        let res = await SongServerAPI().classrooms.find(classCode).playlist.shuffle();
        if (res.success) {
            refreshPlaylist();
        }
    }
}
/** @extends PlaylistSongBase */
class TeacherPlaylistSong extends PlaylistSongBase {
    /** @public */
    constructor(song: SongServer.API.Data.ClassroomSong, index: number, controller: PlaylistControllerBase) {
        super(song, index, controller);
    }
    protected onDetailsButtonClicked() {
        this.itemElement.toggleAttribute("data-show-details");
    }
    protected  async onPlaybackButtonClicked() {
        if (this.controller.songIndex != this.index || this.state === PlaylistSongState.NOT_STARTED) {
            this.controller.changeSong(this);
        }
        else {
            this.controller.togglePlayback();
        }
    }

    public setSelected() {
        this.itemElement.setAttribute("data-selected", "");
    }
    
    public override onSongChange() {
        super.onSongChange();
        this.itemElement.removeAttribute("data-selected");
    }
    protected async onRemoveButtonClicked() {
        window.overlayManager.show("are-you-sure-song", { "song-index": this.index });
    }
}
var playlistController = new TeacherPlaylistController();
// @ts-ignore
async function refreshPlaylist() {
    let songs = await SongServerAPI().classrooms.find(classCode).playlist.songs.list();
    let currentSong = await SongServerAPI().classrooms.find(classCode).playlist.songs.currentSong.get();
    if (songs.success && currentSong.success) {
        console.log(currentSong);
        window.playlistController?.refresh(songs.data, currentSong.data);
    }
    console.log(songs);
}
console.log(window.location.search);
if (window.location.search === "?manage") {
    controller.toggle("settings");
}
else if (window.location.search === "?students") {
    controller.toggle("students");
}
else if (window.location.search === "?delete") {
    controller.toggle("delete");
}
else {
    controller.toggle("overview");
}
revertSettings();
refreshPlaylist();

document.getElementById("player-visibility-button")!.addEventListener("click", () => {
    document.getElementsByClassName("player-container")[0].classList.toggle("hidden");
});



// @ts-ignore
var songSearchManager = new SongSearchManager(true);