
// handles overlaying the screen with popups and the such
/** */
class Overlay {
    /** @private
     * @readonly
     */
    _element = undefined;
    /** @private
     * @readonly
     */
    _overlays = undefined;
    /** @private
     * @readonly
     */
    _overlayElements = undefined;
    /** @private */
    _currentID = undefined;
    /** @public */
    constructor() {
        this._element = document.createElement("div");
        this._element.id = "overlay";
        this._element.classList.add("overlay");
        document.body.appendChild(this._element);
        this._element.style.display = "none";
        this._currentID = "";
        this._overlays = new Map();
        this._overlayElements = new Map();
    }
    /** @public
     * @param {new (overlay: Overlay) => OverlayModelBase} ctor
     * @returns {void}
     */
    addOverlay(ctor) {
        let createdOverlay = new ctor(this);
        this._overlays.set(createdOverlay.id, createdOverlay);
        let element = createdOverlay.instantiate();
        this._element.appendChild(element);
        element.style.display = "none";
        this._overlayElements.set(createdOverlay.id, element);
    }
    /** @public
     * @param {string} id
     * @param {{ [x: string]: any }} data
     * @returns {void}
     */
    show(id, data = {}) {
        let current = this._overlayElements.get(this._currentID);
        let currentOverlay = this._overlays.get(this._currentID);
        if (current != null) {
            currentOverlay?.onHide();
            current.style.display = "none";
        }
        let found = this._overlayElements.get(id);
        if (found != null) {
            let keys = Object.keys(data);
            let foundOverlay = this._overlays.get(id);
            console.log("Reset " + id);
            foundOverlay?.resetData();
            for (let index = 0; index < keys.length; index++) {
                foundOverlay?.setData(keys[index], data[keys[index]]);
            }
            foundOverlay?.onShow();
            this._element.style.display = "grid";
            found.style.display = "grid";
        }
        this._currentID = id;
    }
    /** @public
     * @returns {void}
     */
    hide() {
        let current = this._overlayElements.get(this._currentID);
        let currentOverlay = this._overlays.get(this._currentID);
        if (current != null) {
            currentOverlay?.onHide();
            current.style.display = "none";
        }
        this._element.style.display = "none";
        this._currentID = "";
    }
}




