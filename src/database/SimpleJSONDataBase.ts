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

    public get(key: TKey): Promise<TValue> {
        if (!this._data.has(key)) {
            return Promise.reject("Object with specified key not found!");
        }

        return Promise.resolve(this._data.get(key)!);
    }

    public getOrDefault(key: TKey, defaultValue: TValue): Promise<TValue> {
        if (!this._data.has(key)) {
            return Promise.resolve(defaultValue);
        }

        return Promise.resolve(this._data.get(key)!);
    }

    public keys(): Promise<Iterable<TKey>> {
        return Promise.resolve(this._data.keys());
    }

    public values(): Promise<Iterable<TValue>> {
        return Promise.resolve(this._data.values());
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