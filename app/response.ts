import { CRLF, HTTP_VER } from "./consts";
import { ContentType, RESPONSE_STATUS, type Status } from "./models";

export class Response {
    private _status: Status = RESPONSE_STATUS.OK;
    private _headers: Record<string, string | number> = {};
    private _bodyString: string = "";
    private _contentType: ContentType = ContentType.NONE;

    public status(status: Status): Response {
        this._status = status;
        return this;
    }

    public body(body: object | string): Response {
        if (typeof body === "string") {
            this._bodyString = body;
            this._contentType = ContentType.TEXT;
        }
        if (typeof body === "object") {
            this._bodyString = JSON.stringify(body);
            this._contentType = ContentType.JSON;
        }
        return this;
    }

    public build(): Buffer {
        let response = "";

        const { statusCode, statusText } = this._status;
        response += `${HTTP_VER} ${statusCode} ${statusText}${CRLF}`;

        this.appendBodyHeaders();

        Object.entries(this._headers).forEach((header) => {
            const [headerName, headerValue] = header;
            response += `${headerName}: ${headerValue}${CRLF}`;
        });

        response += CRLF;
        response += this._bodyString;

        console.log(response);

        return Buffer.from(response, "utf-8");
    }

    private appendBodyHeaders() {
        this._headers["Content-Length"] = Buffer.from(this._bodyString).byteLength;
        if (this._contentType) {
            this._headers["Content-Type"] = this._contentType;
        }
    }
}
