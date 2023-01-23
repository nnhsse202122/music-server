"use strict";
var PlaylistSongState;
(function (PlaylistSongState) {
    PlaylistSongState["NOT_STARTED"] = "not-started";
    PlaylistSongState["BUFFERING"] = "buffering";
    PlaylistSongState["PLAYING"] = "playing";
    PlaylistSongState["PAUSED"] = "paused";
})(PlaylistSongState || (PlaylistSongState = {}));
class PlaylistControllerBase {
    constructor(container) {
        this.songIndex = -1;
        this.container = container;
    }
    /** @virtual */
    getCurrentSong() {
        return null;
    }
    setCurrentSong(song) {
        throw new Error("Not im");
    }
    togglePlayback() {
        if (!this.canTogglePlayback())
            return;
        this._togglePlayback();
    }
    async changeSong(song) {
        let currentSong = this.getCurrentSong();
        if (song != null && currentSong === song && song.state !== PlaylistSongState.NOT_STARTED)
            return this.togglePlayback();
        if (!this.canChangeToSong(song))
            return;
        if (song == null)
            return;
        currentSong?.onSongChange();
        let res = await SongServerAPI().classrooms.find(classCode).playlist.songs.currentSong.set(song.songIndex);
        if (res.success) {
            this.setCurrentSong(res.data);
        }
        currentSong?.setSelected();
        currentSong?.play();
        this._playSong(song);
    }
}
/** */
class PlaylistSongBase {
    get deleted() {
        return false;
    }
    get songIndex() {
        return this.index;
    }
    get songID() {
        return this.song.id;
    }
    get title() {
        return this.song.title;
    }
    get songSource() {
        return this.song.source;
    }
    constructor(song, index, controller) {
        this.song = song;
        this.index = index;
        this.controller = controller;
        this._state = PlaylistSongState.NOT_STARTED;
        if (controller.isTeacher) {
            this.itemElement = createTeacherPlaylistItem(controller.container, index + 1, song.title, { email: song.requested_by.email, name: song.requested_by.name }, song.likes);
        }
        else {
            //@ts-ignore
            this.itemElement = createStudentPlaylistItem(controller.container, index + 1, song.title);
        }
        let iconContainer = this.itemElement.getElementsByClassName("icon")[0];
        if (song.source === "youtube") {
            iconContainer.children[0].remove();
            let icon = document.createElement("img");
            icon.src = `https://i.ytimg.com/vi/${song.id}/default.jpg`;
            iconContainer.appendChild(icon);
        }
        this.playbackButton = this.itemElement.getElementsByClassName("song-playback")[0];
        this.playbackButton.addEventListener("click", () => this.onPlaybackButtonClicked());
        this.detailsButton = this.itemElement.getElementsByClassName("song-details")[0];
        this.detailsButton.addEventListener("click", () => this.onDetailsButtonClicked());
        //this.addButton = this.itemElement.getElementsByClassName("song-add")[0];
        //this.addButton.addEventListener("click", () => this.onAddButtonClicked());
        this.removeButton = this.itemElement.getElementsByClassName("song-remove")[0];
        this.removeButton.addEventListener("click", () => this.onRemoveButtonClicked());
        // this.updatePlaylistButton = this.itemElement.getElementsByClassName("song-update")[0];
        //this.updatePlaylistButton.addEventListener("click", () => this.onUpdatePlaylistButtonClicked());
    }
    get state() {
        return this._state;
    }
    set state(value) {
        if (this._state !== value) {
            let oldState = this._state;
            this._state = value;
            this.onStateChange(oldState, value);
        }
    }
    /**
     * @virtual
     */
    onStateChange(oldState, newState) {
        this.itemElement.setAttribute("data-playback", newState.toString());
        if (newState === PlaylistSongState.BUFFERING)
            return this.onBuffering();
        if (newState === PlaylistSongState.PLAYING) {
            if (oldState === PlaylistSongState.PAUSED)
                return this.onResume();
            return this.onPlay();
        }
        if (newState === PlaylistSongState.PAUSED)
            return this.onPause();
    }
    play() {
        this.state = PlaylistSongState.PLAYING;
    }
    pause() {
        this.state = PlaylistSongState.PAUSED;
    }
    buffer() {
        this.state = PlaylistSongState.BUFFERING;
    }
    /** @virtual */
    setSelected() {
    }
    onPlay() { }
    /** @virtual
     */
    onResume() { }
    /** @virtual
     */
    onPause() { }
    /** @virtual
     */
    onBuffering() { }
    /** @virtual
     */
    onSongChange() {
        this.state = PlaylistSongState.NOT_STARTED;
    }
    /** @virtual
     */
    onPlaybackButtonClicked() { }
    /** @virtual
     */
    onAddButtonClicked() { }
    /** @virtual
     */
    onRemoveButtonClicked() { }
    /** @virtual
     */
    onDetailsButtonClicked() { }
    /** @virtual
     */
    onUpdatePlaylistButtonClicked() { }
}
function createTeacherPlaylistItem(container, position, title, submittedBy, likes = 0) {
    let item = createPlaylistItem(container, position, title, likes);
    item.getElementsByClassName("submit-by-name")[0].textContent = submittedBy.name;
    item.getElementsByClassName("submit-by-email")[0].textContent = submittedBy.email;
    return item;
}
// @ts-ignore
function createPlaylistItem(container, position, title, likes = 0) {
    let playlistItem = document.createElement("div");
    playlistItem.classList.add("playlist-item");
    playlistItem.setAttribute("data-playback", "not-started");
    playlistItem.innerHTML = `
<div class="position">
    ${position}
</div>
<div class="icon">
    <i class="fa-solid fa-music"></i>
</div>
<div class="playlist-item-content">
    <div class="song-info">
        <div class="song-title"></div>
        <div class="song-actions">
            <button class="song-likes">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>${likes} Like${(likes === 1 ? "" : "s")}</span>
            </button>
            <button class="song-playback">
                <div class="play">
                    <i class="fa-solid fa-pause"></i>
                    <span>Pause</span>
                </div>
                <div class="paused">
                    <i class="fa-solid fa-play"></i>
                    <span>Play</span>
                </div>
                <div class="buffering">
                    <i class="fa-solid fa-clock"></i>
                    <span>Buffering</span>
                </div>
                <div class="not-started">
                    <i class="fa-solid fa-play"></i>
                    <span>Play</span>
                </div>
            </button>
            <button class="song-details">
                <i class="fa-solid fa-circle-info"></i>
                <span>Details</span>
            </button>
            <button class="song-remove">
                <i class="fa-solid fa-trash"></i>
                <span>Remove</span>
            </button>
        </div>
    </div>
    <div class="song-details-container">
        <div class="submit-by">
            <h3>Submitted By</h3>
            <div>
                <div>
                    <i class="fa-solid fa-user"></i>
                    <span class="submit-by-name"></span>
                </div>
                <div>
                    <i class="fa-solid fa-envelope"></i>
                    <span class="submit-by-email"></span>
                </div>
            </div>
        </div>
    </div>
</div>
<button class="drag">
    <i class="fa-solid fa-ellipsis-vertical"></i>
</button>`;
    container.appendChild(playlistItem);
    playlistItem.getElementsByClassName("song-title")[0].textContent = title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'").replace(/\&amp;/gi, "&");
    return playlistItem;
}
