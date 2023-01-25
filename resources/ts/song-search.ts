class SongSearchManager {

    private m_isTeacher: boolean;
    private m_container: HTMLDivElement;
    private m_results: SongSearchResult[];
    private m_search: HTMLInputElement;

    private static s_current: SongSearchManager = null!;

    static get current(): SongSearchManager {
        return SongSearchManager.s_current;
    }

    public constructor(isTeacher: boolean) {
        SongSearchManager.s_current = this;
        this.m_isTeacher = isTeacher;
        this.m_search = document.getElementById("search") as HTMLInputElement;
        document.getElementById("submit-search")!.addEventListener("click", () => this.search());
        this.m_search.addEventListener("keydown", (ev) => {
            if (ev.key == "Enter") {
                this.search();
            }
        })

        this.m_container = document.getElementById("song-search-results") as HTMLDivElement;
        this.m_results = [];
        let children = this.m_container.getElementsByClassName("search-result");
        for (let index = 0; index < children.length; index++) {
            this.m_results.push(new SongSearchResult(this, children[index] as HTMLDivElement));
        }
    }

    public get isTeacher(): boolean {
        return this.m_isTeacher;
    }

    public async search() {
        overlayManager.show("loading");
        this.m_results.forEach((result) => result.hide());
        let query = this.m_search.value;
        let response = await SongServerAPI().youtube.search(query);
        overlayManager.hide();
        if (!response.success) {
            console.error("Failed to search:" + JSON.stringify(response));
            overlayManager.show("search-song-fail-model");
            return;
        }
        let data = response.data;
        for (let index = 0; index < data.length && index < this.m_results.length; index++) {
            let song = data[index];
            this.m_results[index].show(song.id, "youtube", song.title, song.thumbnail, song.author, song.duration);
        }
    }

    public reset() {
        this.m_search.value = "";
        this.m_results.forEach((result) => result.hide());
    }

    public static resetCurrent() {
        this.current.reset();
    }
}

class SongSearchResult {
    private _songTitle: HTMLSpanElement;
    private _songAuthor: HTMLSpanElement;
    private _songDuration: HTMLSpanElement;
    private _div: HTMLDivElement;
    private _addSongButton: HTMLButtonElement;
    private _songLinkButton: HTMLButtonElement;
    private _imageTemp: HTMLImageElement;
    private _image: HTMLImageElement;
    private _manager: SongSearchManager;

    constructor(manager: SongSearchManager, div: HTMLDivElement) {
        this._div = div;
        this._songTitle = div.getElementsByClassName("song-title")[0] as HTMLSpanElement;
        this._songAuthor = div.getElementsByClassName("song-author")[0] as HTMLSpanElement;
        this._songDuration = div.getElementsByClassName("song-duration")[0] as HTMLSpanElement;
        this._image = div.getElementsByClassName("song-image")[0].children[1] as HTMLImageElement;
        this._imageTemp = div.getElementsByClassName("song-image")[0].children[0] as HTMLImageElement;
        this._addSongButton = div.getElementsByClassName("song-actions")[0].getElementsByClassName("add-song")[0] as HTMLButtonElement;
        this._addSongButton.addEventListener("click", () => this._onAddSongClick());
        this._songLinkButton = div.getElementsByClassName("song-actions")[0].getElementsByClassName("song-link")[0] as HTMLButtonElement;
        this._manager = manager;
        this._div.style.display = "none";
    }

    public hide() {
        this._div.style.display = "none";
        this._div.setAttribute("data-song-id", "");
        this._div.setAttribute("data-song-source", "");
        this._songTitle.textContent = "";
    }

    public show(id: string, source: string, title: string, thumbnail: string | null, author: string, duration: string) {
        this._image.src = thumbnail!;
        this._imageTemp.style.display = thumbnail == null ? "block" : "none";
        this._div.removeAttribute("style");
        this._div.setAttribute("data-song-id", id);
        this._div.setAttribute("data-song-source", source);
        this._songAuthor.textContent = author;
        this._songDuration.textContent = duration;
        this._songTitle.textContent = title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'").replace(/\&amp;/gi, "&");
        this._songLinkButton.children[0].setAttribute("href", `/songs/${source}/${id}`);
    }

    private _onAddSongClick() {
        let data = {
            "id": this._div.getAttribute("data-song-id"),
            "source": this._div.getAttribute("data-song-source")
        };

        overlayManager.show("submit-song-" + (this._manager.isTeacher ? "teacher" : "student") + "-model", data);
    }
}