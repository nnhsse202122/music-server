// handles overlaying the screen with popups and the such

class OverlayManager {
    
    private readonly _element: HTMLDivElement;
    private readonly _overlays: Map<string, OverlayModelBase>;
    private readonly _overlayElements: Map<string, HTMLDivElement>;
    private _currentID: string;

    public constructor() {
        this._element = document.createElement("div");
        this._element.id = "overlay";
        this._element.classList.add("overlay");
        document.body.appendChild(this._element);
        this._element.style.display = "none";

        this._currentID = "";
        this._overlays = new Map();
        this._overlayElements = new Map();
    }

    public addOverlay(ctor: new (overlay: OverlayManager) => OverlayModelBase) {
        let createdOverlay = new ctor(this);
        this._overlays.set(createdOverlay.id, createdOverlay);

        let element = createdOverlay.instantiate();
        this._element.appendChild(element);
        element.style.display = "none";

        this._overlayElements.set(createdOverlay.id, element);
    }

    public show(id: string, data: { [x: string]: any } = {}) {
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

    public hide() {
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