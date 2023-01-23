"use strict";
// abstracts a model view for the overlay.
class OverlayModelBase {
    constructor(overlay, id) {
        this.overlay = overlay;
        this._id = id;
        this._data = new Map();
    }
    get id() {
        return this._id;
    }
    /** @virtual */
    onShow() { }
    /** @virtual */
    onHide() { }
    hasData(key) {
        return this._data.has(key);
    }
    setData(key, value) {
        this._data.set(key, value);
    }
    getData(key) {
        return this._data.get(key);
    }
    resetData() {
        this._data.clear();
    }
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
