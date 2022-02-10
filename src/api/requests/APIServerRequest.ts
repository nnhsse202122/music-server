type APIServerRequest<TData> = {
    [x in keyof TData]: any;
} | TData;

export default APIServerRequest;