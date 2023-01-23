enum PlaylistSongState {
    NOT_STARTED = "not-started",
    BUFFERING = "buffering",
    PLAYING = "playing",
    PAUSED = "paused",
}

abstract class PlaylistControllerBase {
    public songIndex: number;
    public readonly container: HTMLDivElement;
    public constructor(container: HTMLDivElement) {
        this.songIndex = -1;
        this.container = container;
    }

    public abstract get isTeacher(): boolean;
    public abstract canTogglePlayback(): boolean;

    protected abstract _togglePlayback(): void;

    public abstract canChangeToSong(song: PlaylistSongBase | null): boolean;

    /** @virtual */
    protected getCurrentSong(): PlaylistSongBase | null {
        return null;
    }


    protected abstract _playSong(song: PlaylistSongBase): void;

    public setCurrentSong(song: SongServer.API.Data.ClassroomSong) {
        throw new Error("Not im")
    }

    public togglePlayback() {
        if (!this.canTogglePlayback())
            return;
        this._togglePlayback();
    }

    public async changeSong(song: PlaylistSongBase | null) {
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
    protected readonly song: SongServer.API.Data.ClassroomSong;
    protected readonly controller: PlaylistControllerBase;
    public readonly index: number;
    private _state: PlaylistSongState;
    protected readonly itemElement: HTMLDivElement;
    protected readonly playbackButton: HTMLButtonElement;
    protected readonly removeButton: HTMLButtonElement;
    protected readonly detailsButton: HTMLButtonElement;
    public get deleted(): boolean {
        return false;
    }
    public get songIndex() {
        return this.index;
    }
    public get songID() {
        return this.song.id;
    }
    public get title() {
        return this.song.title;
    }
    public get songSource() {
        return this.song.source;
    }
    public constructor(song: SongServer.API.Data.ClassroomSong, index: number, controller: PlaylistControllerBase) {
        this.song = song;
        this.index = index;
        this.controller = controller;
        this._state = PlaylistSongState.NOT_STARTED;
        if (controller.isTeacher) {
            this.itemElement = createTeacherPlaylistItem(controller.container, index + 1, song.title, { email: song.requested_by!.email, name: song.requested_by!.name }, song.likes);
        }
        else {
            //@ts-ignore
            this.itemElement = createStudentPlaylistItem(controller.container, index + 1, song.title);
        }
        let iconContainer = this.itemElement.getElementsByClassName("icon")[0] as HTMLDivElement;
        if (song.source === "youtube") {
            iconContainer.children[0].remove();
            let icon = document.createElement("img");
            icon.src = `https://i.ytimg.com/vi/${song.id}/default.jpg`;
            iconContainer.appendChild(icon);
        }
        this.playbackButton = this.itemElement.getElementsByClassName("song-playback")[0] as HTMLButtonElement;
        this.playbackButton.addEventListener("click", () => this.onPlaybackButtonClicked());
        this.detailsButton = this.itemElement.getElementsByClassName("song-details")[0] as HTMLButtonElement;
        this.detailsButton.addEventListener("click", () => this.onDetailsButtonClicked());
        //this.addButton = this.itemElement.getElementsByClassName("song-add")[0];
        //this.addButton.addEventListener("click", () => this.onAddButtonClicked());
        this.removeButton = this.itemElement.getElementsByClassName("song-remove")[0] as HTMLButtonElement;
        this.removeButton.addEventListener("click", () => this.onRemoveButtonClicked());
       // this.updatePlaylistButton = this.itemElement.getElementsByClassName("song-update")[0];
        //this.updatePlaylistButton.addEventListener("click", () => this.onUpdatePlaylistButtonClicked());
    }
    public get state() {
        return this._state;
    }
    public set state(value) {
        if (this._state !== value) {
            let oldState = this._state;
            this._state = value;
            this.onStateChange(oldState, value);
        }
    }
    /** 
     * @virtual
     */
    protected onStateChange(oldState: PlaylistSongState, newState: PlaylistSongState) {
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
    public play() {
        this.state = PlaylistSongState.PLAYING;
    }
    public pause() {
        this.state = PlaylistSongState.PAUSED;
    }
    public buffer() {
        this.state = PlaylistSongState.BUFFERING;
    }

    /** @virtual */
    public setSelected() {

    }

    public onPlay() { }
    /** @virtual
     */
    public onResume() { }
    /** @virtual
     */
    public onPause() { }
    /** @virtual
     */
    public onBuffering() { }
    /** @virtual
     */
    public onSongChange() {
        this.state = PlaylistSongState.NOT_STARTED;
    }
    /** @virtual
     */
    protected onPlaybackButtonClicked() { }
    /** @virtual
     */
    protected onAddButtonClicked() { }
    /** @virtual
     */
    protected onRemoveButtonClicked() { }
    /** @virtual
     */
    protected onDetailsButtonClicked() { }
    /** @virtual
     */
    protected onUpdatePlaylistButtonClicked() { }
}

function createTeacherPlaylistItem(container: HTMLDivElement, position: number, title: string, submittedBy: SongServer.API.Data.BasicUser, likes: number = 0): HTMLDivElement {
    let item = createPlaylistItem(container, position, title, likes);
    item.getElementsByClassName("submit-by-name")[0].textContent = submittedBy.name;
    item.getElementsByClassName("submit-by-email")[0].textContent = submittedBy.email;
    return item;
}
// @ts-ignore
function createPlaylistItem(container: HTMLDivElement, position: number, title: string, likes: number = 0): HTMLDivElement {
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




