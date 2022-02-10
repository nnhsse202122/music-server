

type APIFailResponse = {
    message: string,
    id: string,
    status: number,
    parameters: {
        [x: string]: string
    },
    success: false
};

export default APIFailResponse;