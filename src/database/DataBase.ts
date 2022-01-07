

/**
 * Representation of a database
 */
export default interface DataBase<TKey, TValue> {
    
    /**
     * Checks whether an entry with the specific key exists in the database.
     * @param key The key of the object in the database
     * @returns A promise when resolved, is whether or not the database contains the value.
     */
    contains(key: TKey): Promise<boolean>

    /**
     * Adds an entry to the database
     * @param key The key of the object to add to the database
     * @param value The associated data with this object
     * @returns A promise when resolved, is whether or not the item was added successfully;
     */
    add(key: TKey, value: TValue): Promise<boolean>;

    /**
     * Updates an existing entry in the database
     * @param key The key of the object to update in the database
     * @param value The new data for the object
     * @returns A promise when resolved, is whether or not the entry was updated.
     */
    set(key: TKey, value: TValue): Promise<boolean>;

    /**
     * Deletes an entry from the database
     * @param key The key of the object to delete from the database
     * @returns A promise when resolved, is whether or not the item was successfully deleted.
     */
    delete(key: TKey): Promise<boolean>

    /**
     * Clears all entries from the database
     * @returns A promise when resolved, is whether or not the database was cleared successfully.
     */
    clear(): Promise<boolean>
}