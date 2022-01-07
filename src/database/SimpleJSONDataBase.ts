import DataBase from "./DataBase";


export default class SimpleJSONDataBase<TKey, TValue> implements DataBase<TKey, TValue> {

    private _data: Map<TKey, TValue>

    public constructor() {
        this._data = new Map();
    }

    public clear(): Promise<boolean> {
        this._data.clear();
        return Promise.resolve(true);
    }

    public contains(key: TKey): Promise<boolean> {
        return Promise.resolve(this._data.has(key));
    }

    public async set(key: TKey, value: TValue): Promise<boolean> {
        if (!(await this.contains(key))) {
            return false;
        }

        this._data.set(key, value);
        return true;
    }

    public async add(key: TKey, value: TValue): Promise<boolean> {
        if (await this.contains(key)) {
            return false;
        }

        this._data.set(key, value);
        return true;
    }

    public delete(key: TKey): Promise<boolean> {
        return Promise.resolve(this._data.delete(key));
    }

    public toJSON(): string {
        let jsonOBJ = {};
        for (let key of this._data.keys()) {
            // @ts-ignore
            jsonOBJ[key] = this._data.get(key);
        }

        return JSON.stringify(jsonOBJ);
    }
}