import DataBase from "./DataBase";

export default abstract class CollectionDataBase2D<TKey, TInnerKey, TValue> implements DataBase {
    public abstract get(key: TKey, innerKey: TInnerKey): Promise<TValue>;
    public abstract set(key: TKey, innerKey: TInnerKey, value: TValue): Promise<boolean>;
    public abstract contains(key: TKey, innerKey: TInnerKey): Promise<boolean>;
    public abstract add(key: TKey, innerKey: TInnerKey, value: TValue): Promise<boolean>;
    public abstract delete(key: TKey, innerKey: TInnerKey): Promise<boolean>;
    public async put(key: TKey, innerKey: TInnerKey, value: TValue): Promise<boolean> {
        if (await this.contains(key, innerKey)) {
            return await this.set(key, innerKey, value);
        }
        return await this.add(key, innerKey, value);
    }
}