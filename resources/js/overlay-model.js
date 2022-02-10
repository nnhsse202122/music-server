
// abstracts a model view for the overlay.
/** */
class OverlayModelBase {
    /** @public
     * @readonly
     */
    overlay = undefined;
    /** @private
     * @readonly
     */
    _id = undefined;
    /** @private
     * @readonly
     */
    _data = undefined;
    /** @public */
    constructor(overlay, id) {
        this.overlay = overlay;
        this._id = id;
        this._data = new Map();
    }
    /** @public */
    get id() {
        return this._id;
    }
    /** @virtual
     * @public
     * @returns {void}
     */
    onShow() { }
    /** @virtual
     * @public
     * @returns {void}
     */
    onHide() { }
    /** @public
     * @param {string} key
     * @returns {boolean}
     */
    hasData(key) {
        return this._data.has(key);
    }
    /** @public
     * @param {string} key
     * @param {any} value
     * @returns {void}
     */
    setData(key, value) {
        this._data.set(key, value);
    }
    /** @public
     * @param {string} key
     * @returns {T}
     */
    getData(key) {
        return this._data.get(key);
    }
    /** @public
     * @returns {void}
     */
    resetData() {
        console.log(this.id + " : Reset");
        this._data.clear();
    }
    /** @public
     * @returns {HTMLDivElement}
     */
    instantiate() {
        let div = document.createElement("div");
        div.classList.add(this._id);
        let titleDiv = document.createElement("div");
        titleDiv.classList.add("title");
        this.instantiateTitle(titleDiv);
        let bodyDiv = document.createElement("div");
        bodyDiv.classList.add("body");
        this.instantiateBody(bodyDiv);
        let actionsDiv = document.createElement("div");
        actionsDiv.classList.add("actions");
        this.instantiateActions(actionsDiv);
        div.appendChild(titleDiv);
        div.appendChild(bodyDiv);
        div.appendChild(actionsDiv);
        return div;
    }
}




