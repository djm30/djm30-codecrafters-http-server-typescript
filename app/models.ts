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
    OCTET = "application/octet-stream",
    NONE = "",
}

export interface Request {
    method: string;
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
