class SongSearchManager {

    /** @private */
    m_isTeacher;
    /** @private */
    m_container;
    /** @private */
    m_results;
    /** @private */
    m_search;

    /** @private
     * @static */
    static s_current;
    /** @public
     * @static
     * @type {SongSearchManager}
     */
    static get current() {
        return SongSearchManager.s_current;
    }

    /** @public
     * @param {boolean} isTeacher 
     */
    constructor(isTeacher) {
        SongSearchManager.s_current = this;
        this.m_isTeacher = isTeacher;
        this.m_search = document.getElementById("search");
        document.getElementById("submit-search").addEventListener("click", () => this.search());
        this.m_search.addEventListener("keydown", (ev) => {
            if (ev.key == "Enter") {
                this.search();
            }
        })

        this.m_container = document.getElementById("song-search-results");
        this.m_results = [];
        let children = this.m_container.getElementsByClassName("search-result");
        for (let index = 0; index < children.length; index++) {
            this.m_results.push(new SongSearchResult(this, children[index]));
        }
    }

    /** @public
     * @type {boolean}
     */
    get isTeacher() {
        return this.m_isTeacher;
    }

    /** @public
     * @returns {Promise<void>}
     */
    async search() {
        overlayManager.show("loading");
        this.m_results.forEach((result) => result.hide());
        let query = this.m_search.value;
        let response = await SongServerAPI().youtube.search(query);
        overlayManager.hide();
        if (!response.success) {
            console.error("Failed to search:" + JSON.stringify(response));
            return;
        }
        let data = response.data;
        for (let index = 0; index < data.length && index < this.m_results.length; index++) {
            let song = data[index];
            this.m_results[index].show(song.id, "youtube", song.title, song.thumbnail);
        }
    }

    /** @public
     * @returns {void}
     */
    reset() {
        this.m_search.value = "";
        this.m_results.forEach((result) => result.hide());
    }

    /** @public
     * @static
     * @returns {void}
     */
    static resetCurrent() {
        this.current.reset();
    }
}

class SongSearchResult {
    /** @private */
    _songTitle;
    /** @private */
    _div;
    /** @private */
    _addSongButton;
    /** @private */
    _songLinkButton;
    /** @private */
    _image;
    /** @private */
    _manager;

    /** @public
     * @param {SongSearchManager} manager 
     * @param {HTMLDivElement} div 
     */
    constructor(manager, div) {
        this._div = div;
        this._songTitle = div.getElementsByClassName("song-title")[0];
        this._image = div.getElementsByClassName("song-image")[0].children[1];
        this._addSongButton = div.getElementsByClassName("song-actions")[0].getElementsByClassName("add-song")[0];
        this._addSongButton.addEventListener("click", () => this._onAddSongClick());
        this._songLinkButton = div.getElementsByClassName("song-actions")[0].getElementsByClassName("song-link")[0];
        this._manager = manager;
        this._div.style.display = "none";
    }

    /** @public
     * @returns {void}
     */
    hide() {
        this._div.style.display = "none";
        this._div.setAttribute("data-song-id", "");
        this._div.setAttribute("data-song-source", "");
        this._songTitle.textContent = "";
    }

    /** @public
     * @param {string} id 
     * @param {string} source 
     * @param {string} title 
     * @param {string|null} thumbnail 
     * @returns {void}
     */
    show(id, source, title, thumbnail) {
        this._image.src = thumbnail;
        this._div.removeAttribute("style");
        this._div.setAttribute("data-song-id", id);
        this._div.setAttribute("data-song-source", source);
        this._songTitle.textContent = title.replace(/\&quot;/gi, '"').replace(/\&#39;/gi, "'").replace(/\&amp;/gi, "&");
        this._songLinkButton.children[0].setAttribute("href", `/songs/${source}/${id}`);
    }

    /** @private */
    _onAddSongClick() {
        let data = {
            "id": this._div.getAttribute("data-song-id"),
            "source": this._div.getAttribute("data-song-source")
        };

        overlayManager.show("submit-song-" + (this._manager.isTeacher ? "teacher" : "student") + "-model", data);
    }
}