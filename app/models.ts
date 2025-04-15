export interface Status {
    statusCode: number;
    statusText: string;
}

export const RESPONSE_STATUS = {
    OK: {
        statusCode: 200,
        statusText: "OK",
    },
    NOT_FOUND: {
        statusCode: 404,
        statusText: "Not Found",
    },
    BAD_REQUEST: {
        statusCode: 400,
        statusText: "Bad Request",
    },
};

export enum ContentType {
    JSON = "application/json",
    TEXT = "text/plain",
    NONE = "",
}
