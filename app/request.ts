import { CRLF } from "./consts";
import { ContentType, HttpMethod, type Request } from "./models";

export const parseRequest = (data: Buffer): Request => {
    const request: Request = {} as Request;

    const requestString = data.toString();
    const splitUpRequest = requestString.split(CRLF);

    const requestLine = splitUpRequest[0];
    const headersAndBody = splitUpRequest.slice(1);

    const [method, target, httpVersion] = requestLine.split(" ");

    const headers = parseHeaders(headersAndBody);
    const body = parseBody(headersAndBody, headers);

    request.method = mapHttpMethod(method);
    request.target = target;
    request.headers = headers;
    request.body = body;
    request.httpVersion = httpVersion;

    return request;
};

const parseHeaders = (headersAndBody: string[]) => {
    const rawHeaders = headersAndBody.slice(0, headersAndBody.length - 1).filter((header) => header !== "");
    const headers: Record<string, any> = {};

    rawHeaders.forEach((rawHeader) => {
        const [headerName, headerValue] = rawHeader.split(": ");
        headers[headerName] = headerValue;
    });

    return headers;
};

const parseBody = (headersAndBody: string[], headers: Record<string, any>) => {
    const rawBody = headersAndBody[headersAndBody.length - 1];

    if (!headers["Content-Type"] || !headers["Content-Length"]) return "";

    const contentType = mapContentType(headers["Content-Type"]);

    switch (contentType) {
        case ContentType.JSON:
            return JSON.parse(rawBody);
        default:
            return rawBody;
    }
};

const mapHttpMethod = (method: string): HttpMethod => {
    switch (method) {
        case "GET":
            return HttpMethod.GET;
        case "POST":
            return HttpMethod.POST;
        default:
            throw new Error(`Unsupported HTTP Method: ${method}`);
    }
};

const mapContentType = (contentType: string): ContentType => {
    switch (contentType) {
        case "text/plain":
            return ContentType.TEXT;
        case "application/json":
            return ContentType.JSON;
        case "application/octet":
            return ContentType.OCTET;
        default:
            return ContentType.NONE;
    }
};
