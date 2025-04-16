import { Response } from "./response";

export interface Status {
    statusCode: number;
    statusText: string;
}

export const ResponseStatus = {
    OK: {
        statusCode: 200,
        statusText: "OK",
    },
    CREATED: {
        statusCode: 201,
        statusText: "Created",
    },
    NOT_FOUND: {
        statusCode: 404,
        statusText: "Not Found",
    },
    BAD_REQUEST: {
        statusCode: 400,
        statusText: "Bad Request",
    },
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        statusText: "Internal Server Error",
    },
};

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
}

export enum ContentType {
    JSON = "application/json",
    TEXT = "text/plain",
    OCTET = "application/octet-stream",
    NONE = "",
}

export interface Request {
    method: HttpMethod;
    target: string;
    headers: Record<string, any>;
    body: string;
    httpVersion: string;
}

export type RequestHandler = (req: Request, res: Response) => Response;

export interface Route {
    matchExp: RegExp;
    handler: RequestHandler;
}

export enum EncodingType {
    GZIP = "gzip",
    NONE = "none",
}
