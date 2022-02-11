import APIFailResponse from "./APIFailResponse";
import APISuccessReponse from "./APISuccessResponse";

type APIResponse<TData> = APISuccessReponse<TData> | APIFailResponse;

export default APIResponse;