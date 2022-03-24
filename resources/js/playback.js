
var PlaylistSongState;
(function (PlaylistSongState) {
    PlaylistSongState["NOT_STARTED"] = "not-started";
    PlaylistSongState["BUFFERING"] = "buffering";
    PlaylistSongState["PLAYING"] = "playing";
    PlaylistSongState["PAUSED"] = "paused";
})(PlaylistSongState || (PlaylistSongState = {}));
;
/** */
class PlaylistControllerBase {
    /** @public */
    songIndex = undefined;
    /** @public
     * @readonly
     */
    container = undefined;
    /** @public */
    constructor(container) {
        this.songIndex = -1;
        this.container = container;
    }
    /** @public
     * @returns {void}
     */
    togglePlayback() {
        if (!this.canTogglePlayback())
            return;
        this._togglePlayback();
    }
    /** @public
     * @param {PlaylistSongBase | null} song
     * @returns {void}
     */
    changeSong(song) {
        if (song != null && this.songIndex === song.songIndex && song.state !== PlaylistSongState.NOT_STARTED)
            return this.togglePlayback();
        if (!this.canChangeToSong(song))
            return;
        if (song == null)
            return;
        this.currentSong?.onSongChange();
        this.songIndex = song.songIndex;
        this.currentSong?.play();
        this._playSong(song);
    }
}
/** */
class PlaylistSongBase {
    /** @protected
     * @readonly
     */
    song = undefined;
    /** @protected
     * @readonly
     */
    controller = undefined;
    /** @protected
     * @readonly
     */
    index = undefined;
    /** @private */
    _state = undefined;
    /** @protected
     * @readonly
     */
    itemElement = undefined;
    /** @protected
     * @readonly
     */
    playbackButton = undefined;
    /** @protected
     * @readonly
     */
    removeButton = undefined;
    /** @protected
     * @readonly
     */
    addButton = undefined;
    /** @protected
     * @readonly
     */
    updatePlaylistButton = undefined;
    /** @protected
     * @readonly
     */
    detailsButton = undefined;
    /** @public */
    get deleted() {
        return this.song.modification?.type == SongServer.API.SongModificationType.DELETED;
    }
    /** @public */
    get songIndex() {
        return this.index;
    }
    /** @public */
    get songID() {
        return this.song.id;
    }
    /** @public */
    get title() {
        return this.song.title;
    }
    /** @public */
    get songSource() {
        return this.song.source;
    }
    /** @public */
    constructor(song, index, controller) {
        this.song = song;
        this.index = index;
        this.controller = controller;
        this._state = PlaylistSongState.NOT_STARTED;
        if (controller.isTeacher) {
            let type = null;
            if (song.modification != null) {
                if (song.modification.type === SongServer.API.SongModificationType.ADDED) {
                    type = "added";
                }
                else if (song.modification.type === SongServer.API.SongModificationType.MOVED) {
                    type = "moved";
                }
                else if (song.modification.type === SongServer.API.SongModificationType.DELETED) {
                    type = "removed";
                }
            }
            this.itemElement = createTeacherPlaylistItem(controller.container, index + 1, song.title, { email: song.requested_by.email, name: song.requested_by.name }, type);
        }
        else {
            this.itemElement = createStudentPlaylistItem(controller.container, index + 1, song.title);
        }
        this.playbackButton = this.itemElement.getElementsByClassName("song-playback")[0];
        this.playbackButton.addEventListener("click", () => this.onPlaybackButtonClicked());
        this.detailsButton = this.itemElement.getElementsByClassName("song-details")[0];
        this.detailsButton.addEventListener("click", () => this.onDetailsButtonClicked());
        this.addButton = this.itemElement.getElementsByClassName("song-add")[0];
        this.addButton.addEventListener("click", () => this.onAddButtonClicked());
        this.removeButton = this.itemElement.getElementsByClassName("song-remove")[0];
        this.removeButton.addEventListener("click", () => this.onRemoveButtonClicked());
       // this.updatePlaylistButton = this.itemElement.getElementsByClassName("song-update")[0];
        //this.updatePlaylistButton.addEventListener("click", () => this.onUpdatePlaylistButtonClicked());
    }
    /** @public */
    get state() {
        return this._state;
    }
    /** @public */
    set state(value) {
        if (this._state !== value) {
            let oldState = this._state;
            this._state = value;
            this.onStateChange(oldState, value);
        }
    }
    /** @virtual
     * @protected
     * @param {PlaylistSongState} oldState
     * @param {PlaylistSongState} newState
     * @returns {void}
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
    /** @public
     * @returns {void}
     */
    play() {
        this.state = PlaylistSongState.PLAYING;
    }
    /** @public
     * @returns {void}
     */
    pause() {
        this.state = PlaylistSongState.PAUSED;
    }
    /** @public
     * @returns {void}
     */
    buffer() {
        this.state = PlaylistSongState.BUFFERING;
    }
    /** @virtual
     * @public
     * @returns {void}
     */
    onPlay() { }
    /** @virtual
     * @public
     * @returns {void}
     */
    onResume() { }
    /** @virtual
     * @public
     * @returns {void}
     */
    onPause() { }
    /** @virtual
     * @public
     * @returns {void}
     */
    onBuffering() { }
    /** @virtual
     * @public
     * @returns {void}
     */
    onSongChange() {
        this.state = PlaylistSongState.NOT_STARTED;
    }
    /** @virtual
     * @protected
     * @returns {any}
     */
    onPlaybackButtonClicked() { }
    /** @virtual
     * @protected
     * @returns {any}
     */
    onAddButtonClicked() { }
    /** @virtual
     * @protected
     * @returns {any}
     */
    onRemoveButtonClicked() { }
    /** @virtual
     * @protected
     * @returns {any}
     */
    onDetailsButtonClicked() { }
    /** @virtual
     * @protected
     * @returns {any}
     */
    onUpdatePlaylistButtonClicked() { }
}
/** @param {HTMLElement} container
 * @param {number} position
 * @param {string} title
 * @param {{ name: string, email: string }} submittedBy
 * @param {"added" | "removed" | "moved" | null} type
 * @returns {HTMLDivElement}
 */
function createTeacherPlaylistItem(container, position, title, submittedBy, type = null) {
    let item = createPlaylistItem(container, position, title, type);
    item.getElementsByClassName("submit-by-name")[0].textContent = submittedBy.name;
    item.getElementsByClassName("submit-by-email")[0].textContent = submittedBy.email;
    return item;
}
/** @param {HTMLElement} container
 * @param {number} position
 * @param {string} title
 * @returns {HTMLDivElement}
 */
function createStudentPlaylistItem(container, position, title) {
    let item = createPlaylistItem(container, position, title, "student");
    return item;
}
/** @param {HTMLElement} container
 * @param {number} position
 * @param {string} title
 * @param {"added" | "removed" | "moved" | "student" | null} type
 * @returns {HTMLDivElement}
 */
function createPlaylistItem(container, position, title, type = null) {
    let playlistItem = document.createElement("div");
    playlistItem.classList.add("playlist-item");
    if (type != null) {
        if (type !== "student") {
            playlistItem.setAttribute("data-type", type);
        }
        else {
            playlistItem.setAttribute("data-student", "");
        }
    }
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
            <button class="song-add">
                <i class="fa-solid fa-circle-plus"></i>
                <span>Add</span>
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
    playlistItem.getElementsByClassName("song-title")[0].textContent = title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'");
    return playlistItem;
}




