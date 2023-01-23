// abstracts a model view for the overlay.

abstract class OverlayModelBase {
    public readonly overlay: OverlayManager;
    private readonly _id: string;
    private readonly _data: Map<string, any>;

    public constructor(overlay: OverlayManager, id: string) {
        this.overlay = overlay;
        this._id = id;
        this._data = new Map();
    }

    public get id(): string {
        return this._id;
    }

    /** @virtual */
    public onShow(): void {}
    /** @virtual */
    public onHide(): void {}

    public hasData(key: string): boolean {
        return this._data.has(key);
    }

    public setData(key: string, value: any): void {
        this._data.set(key, value);
    }

    public getData<T = any>(key: string): T {
        return this._data.get(key) as T;
    }

    public resetData(): void {
        this._data.clear();
    }

    public instantiate(): HTMLDivElement {
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

    protected abstract instantiateTitle(titleDiv: HTMLDivElement): void;
    protected abstract instantiateBody(bodyDiv: HTMLDivElement): void;
    protected abstract instantiateActions(actionsDiv: HTMLDivElement): void;
}