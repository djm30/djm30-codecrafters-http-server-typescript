import { CRLF } from "./consts";
import type { Request } from "./models";

export const parseRequest = (data: Buffer): Request => {
    const request: Request = {} as Request;

    const requestString = data.toString();
    const splitUpRequest = requestString.split(CRLF);

    const requestLine = splitUpRequest[0];
    const headersAndBody = splitUpRequest.slice(1);

    const [method, target, httpVersion] = requestLine.split(" ");

    const { headers, body } = parseHeadersAndBody(headersAndBody);

    request.method = method;
    request.target = target;
    request.headers = headers;
    request.body = body;
    request.httpVersion = httpVersion;

    return request;
};

const parseHeadersAndBody = (headersAndBody: string[]) => {
    const rawHeaders = headersAndBody.slice(0, headersAndBody.length - 1).filter((header) => header !== "");
    const rawBody = headersAndBody[headersAndBody.length - 1];

    const headers = parseHeaders(rawHeaders);
    const body = parseBody(rawBody);
    return { headers, body };
};

const parseHeaders = (rawHeaders: string[]) => {
    const headers: Record<string, any> = {};

    rawHeaders.forEach((rawHeader) => {
        const [headerName, headerValue] = rawHeader.split(": ");
        headers[headerName] = headerValue;
    });

    return headers;
};

const parseBody = (rawBody: string) => {
    return rawBody;
};
