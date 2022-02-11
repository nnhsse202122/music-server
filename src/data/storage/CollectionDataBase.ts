import DataBase from "./DataBase";


export default abstract class CollectionDataBase<TKey, TValue> implements DataBase {
    public abstract get(key: TKey): Promise<TValue>;
    public abstract set(key: TKey, value: TValue): Promise<boolean>;
    public abstract contains(key: TKey): Promise<boolean>;
    public abstract add(key: TKey, value: TValue): Promise<boolean>;
    public abstract delete(key: TKey): Promise<boolean>;
    public async put(key: TKey, value: TValue): Promise<boolean> {
        if (await this.contains(key)) {
            return await this.set(key, value);
        }
        return await this.add(key, value);
    }
}