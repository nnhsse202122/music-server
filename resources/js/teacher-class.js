
/**
 *
 * @param {SongServer.API.StudentInfo[]} students  Students
 * @returns {void}
 */
 function displayStudents(students) {
    /** @type {HTMLTableElement} */
    let table = document.getElementById("student-table");
    /** @type {HTMLDivElement} */
    let noStudentsFound = document.getElementById("no-student-text");
    noStudentsFound.style.display = "none";
    table.style.display = "none";
    removeAllStudentsButton.style.display = "none";
    /** @type {HTMLTableSectionElement} */
    let tableBody = document.getElementById("student-table-body");
    tableBody.innerHTML = "";
    let noStudents = true;
    for (let index = 0; index < students.length; index++) {
        let student = students[index];
        noStudents = false;
        let tr = document.createElement("tr");
        let tdName = document.createElement("td");
        let tdTokens = document.createElement("td");
        let tdRemove = document.createElement("td");
        let removeButton = document.createElement("button");
        let removeIcon = document.createElement("i");
        removeIcon.classList.add("fa-solid", "fa-user-xmark");
        removeButton.appendChild(removeIcon);
        removeButton.addEventListener("click", async () => {
            let response = await SongServerAPI(2).classroom(classCode).students.find(student.email).remove();
            if (!response.success) {
                throw new Error(response.message);
            }
            if (response.data) {
                await loadStudents();
            }
            else {
                window.alert("Failed to delete user!");
            }
        });
        tdRemove.appendChild(removeButton);
        tdName.textContent = student.name;
        let tokenCountText = document.createElement("input");
        tokenCountText.classList.add("token-count");
        tokenCountText.type = "number";
        tokenCountText.value = new String(student.tokens);
        tokenCountText.addEventListener("change", async () => {
            let response = await SongServerAPI(2).classroom(classCode).students.find(student.email).tokens.set(Math.max(parseInt(tokenCountText.value), 0));
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            tokenCountText.value = new String(response.data);
        });
        let decrementTokenButtonIcon = document.createElement("i");
        decrementTokenButtonIcon.classList.add("fa-solid", "fa-minus");
        let decrementTokenButton = document.createElement("button");
        decrementTokenButton.appendChild(decrementTokenButtonIcon);
        decrementTokenButton.classList.add("decrement-token");
        decrementTokenButton.addEventListener("click", async () => {
            let response = await SongServerAPI(2).classroom(classCode).students.find(student.email).tokens.set(Math.max(parseInt(tokenCountText.value) - 1, 0));
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            tokenCountText.value = new String(response.data);
        });
        let incrementTokenButtonIcon = document.createElement("i");
        incrementTokenButtonIcon.classList.add("fa-solid", "fa-plus");
        let incrementTokenButton = document.createElement("button");
        incrementTokenButton.appendChild(incrementTokenButtonIcon);
        incrementTokenButton.classList.add("increment-token");
        incrementTokenButton.addEventListener("click", async () => {
            let response = await SongServerAPI(2).classroom(classCode).students.find(student.email).tokens.set(parseInt(tokenCountText.value) + 1);
            if (!response.success) {
                window.alert("Failed to set tokens from user: " + response.message);
                throw new Error(response.message);
            }
            tokenCountText.value = new String(response.data);
        });
        tdTokens.appendChild(decrementTokenButton);
        tdTokens.appendChild(tokenCountText);
        tdTokens.appendChild(incrementTokenButton);
        tdRemove.classList.add("student-remove");
        tdName.classList.add("student-name");
        tdTokens.classList.add("student-tokens");
        tr.appendChild(tdName);
        tr.appendChild(tdTokens);
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
    let response = await SongServerAPI(2).classroom(classCode).students.list();
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
function onSongDragStart(ev) {
    document.getElementById("top-playlist-item").style.display = "block";
    let evTarget = ev.target;
    let playlistItem = evTarget.parentElement.parentElement;
    let songID = playlistItem.getAttribute("song-id");
    ev.dataTransfer.setData("text/plain", songID ?? "");
}
/** @param {DragEvent} ev
 * @returns {void}
 */
function onSongDragEnd(ev) {
    document.getElementById("top-playlist-item").style.display = "none";
}
/** @param {DragEvent} ev
 * @param {number} index
 * @returns {void}
 */
function onSongDragOver(ev, index) {
    ev.preventDefault();
}
/** @param {DragEvent} ev
 * @param {number} index
 * @returns {void}
 */
function onSongDrop(ev, index) {
    ev.preventDefault();
    let songID = ev.dataTransfer.getData("text/plain");
    let songElement = document.getElementById("song-" + songID);
    let songElementParent = songElement.parentElement;
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
    songElementParent.appendChild(previous);
}
/** @extends PlaylistControllerBase */
class TeacherPlaylistController extends PlaylistControllerBase {
    /** @private */
    _currentSong = undefined;
    /** @private */
    playlistSongs = undefined;
    /** @private */
    _playing = undefined;
    /** @public */
    constructor() {
        super(playlistContainer);
        this._playing = false;
        this.playlistSongs = [];
        document.getElementById("volume-slider").addEventListener("change", (ev) => {
            // @ts-ignore
            let vol = parseInt(ev.target.value);
            this._updateVolumeLabel(vol);
            window.player.setVolume(vol);
        });
        document.getElementById("next-song-btn").addEventListener("click", () => {
            this.nextSong();
        });
        document.getElementById("previous-song-btn").addEventListener("click", () => {
            this.previousSong();
        });
        document.getElementById("shuffle-song-btn").addEventListener("click", () => {
            this.shuffle();
        });
        document.getElementById("playback-btn").addEventListener("click", () => {
            if (this.currentSong?.state === PlaylistSongState.NOT_STARTED) {
                this.changeSong(this.currentSong);
            }
            else {
                this.togglePlayback();
            }
        });
    }
    /** @public
     * @param {SongServer.API.ClassSongInfo[]} songs
     * @param {SongServer.API.CurrentSong} currentSong
     * @returns {Promise<void>}
     */
    async refresh(songs, currentSong) {
        let curSong = this.currentSong;
        console.groupCollapsed("Song Refresh");
        console.log(currentSong);
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
            document.getElementById("playlist-container-empty").style.display = "block";
        }
        this.setCurrentSong(currentSong);
        curSong = this.currentSong;
        if (this._playing && curSong?.state === PlaylistSongState.PLAYING && (currentSongID !== (curSong?.songID) || (currentSongSource !== (curSong?.songSource)))) {
            curSong?.play();
        }
        ;
        console.log(this.currentSong);
        document.getElementById("now-playing-text").textContent = this.currentSong?.title ?? "";
        this.currentSong?.setSelected();
        console.groupEnd();
    }
    /** @public */
    get currentSong() {
        if (this._currentSong == null) return null;

        if (!this._currentSong.from_priority) {
            return this.playlistSongs[this._currentSong.position - 1];
        }
        return new PriorityPlaylistSong(this._currentSong, this);
    }
    /** 
     * @public
     * @param {SongServer.API.CurrentSong} song
     */
    setCurrentSong(song) {
        console.log(song);
        this._currentSong = song;
    }

    /** @protected
     * @returns {void}
     */
    _togglePlayback() {
        window.player.togglePause();
    }
    /** @public */
    get isStudent() { return false; }
    /** @public */
    get isTeacher() { return true; }
    /** @protected
     * @returns {boolean}
     */
    canTogglePlayback() {
        return true;
    }
    /** @protected
     * @param {PlaylistSongBase} song
     * @returns {boolean}
     */
    canChangeToSong(song) {
        return true;
    }
    /** @protected
     * @param {PlaylistSongBase} song
     * @returns {void}
     */
    async _playSong(song) {
        let newSong = this.currentSong;
        console.log(newSong);
        if (newSong != null) {
            document.getElementById("now-playing-text").textContent = newSong.title;
        }
        window.player.loadVideo(song.songID);
        newSong?.setSelected();
    }
    /** @public */
    get playable() {
        let playable = false;
        for (let index = 0; index < this.playlistSongs.length; index++) {
            if (!this.playlistSongs[index].deleted) {
                playable = true;
                break;
            }
        }
        return playable;
    }
    /** @public
     * @returns {void}
     */
    refreshVolume() {
        let vol = window.player.getVolume();
        document.getElementById("volume-slider").value = vol.toString();
        this._updateVolumeLabel(vol);
    }
    /** @private
     * @param {number} value
     * @returns {void}
     */
    _updateVolumeLabel(value) {
        document.getElementById("volume-slider-label").textContent = value + "%";
    }
    /** @public
     * @returns {void}
     */
    onPaused() {
        this.currentSong?.pause();
        let iElement = document.getElementById("playback-btn").children[0];
        iElement.classList.remove("fa-pause");
        iElement.classList.add("fa-play");
    }
    /** @public
     * @returns {void}
     */
    onResume() {
        this.currentSong?.play();
        let iElement = document.getElementById("playback-btn").children[0];
        iElement.classList.remove("fa-play");
        iElement.classList.add("fa-pause");
    }
    /** @public
     * @returns {void}
     */
    onBuffering() {
        this.currentSong?.buffer();
    }
    /** @public
     * @param {number} volume
     * @returns {void}
     */
    setVolume(volume) {
        window.player.setVolume(volume);
    }
    /** @public
     * @returns {void}
     */
    togglePlayback() {
        window.player.togglePause();
    }
    /** @public
     * @returns {void}
     */
    async nextSong() {
        this.currentSong?.onSongChange();
        let nextSongResponse = await SongServerAPI(2).classroom(classCode).playlist.nextSong();
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
    /** @public
     * @returns {void}
     */
    async previousSong() {
        this.currentSong?.onSongChange();
        let previousSongResponse = await SongServerAPI(2).classroom(classCode).playlist.previousSong();
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
        let res = await SongServerAPI(2).classroom(classCode).playlist.shuffle();
        if (res.success) {
            refreshPlaylist();
        }
    }
}
/** @extends PlaylistSongBase */
class TeacherPlaylistSong extends PlaylistSongBase {
    /** @public */
    constructor(song, index, controller) {
        super(song, index, controller);
    }
    /** @protected
     * @returns {void}
     */
    onDetailsButtonClicked() {
        this.itemElement.toggleAttribute("data-show-details");
    }
    /** @protected
     * @returns {Promise<void>}
     */
    async onPlaybackButtonClicked() {
        if (this.controller.songIndex != this.index || this.state === PlaylistSongState.NOT_STARTED) {
            this.controller.changeSong(this);
        }
        else {
            this.controller.togglePlayback();
        }
    }

    setSelected() {
        this.itemElement.setAttribute("data-selected", "");
    }
    
    onSongChange() {
        super.onSongChange();
        this.itemElement.removeAttribute("data-selected");
    }
    /** @protected
     * @returns {Promise<void>}
     */
    async onRemoveButtonClicked() {
        window.overlayManager.show("are-you-sure-song", { "song-index": this.index });
    }
}
var playlistController = new TeacherPlaylistController();
/** @returns {Promise<void>} */
async function refreshPlaylist() {
    let songs = await SongServerAPI(2).classroom(classCode).playlist.songs.get();
    let currentSong = await SongServerAPI(2).classroom(classCode).playlist.currentSong.get();
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

document.getElementById("player-visibility-button").addEventListener("click", () => {
    document.getElementsByClassName("player-container")[0].classList.toggle("hidden");
});



var songSearchManager = new SongSearchManager(true);