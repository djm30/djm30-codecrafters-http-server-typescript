import { CRLF, FILE_DIR, HTTP_VER } from "./consts";
import { ContentType, ResponseStatus, type Status } from "./models";
import * as fs from "fs";

export class Response {
    private _status: Status = ResponseStatus.OK;
    private _headers: Record<string, string | number>;
    private _bodyString: string = "";
    private _contentType: ContentType = ContentType.NONE;

    constructor(headers: Record<string, any> = {}) {
        this._headers = headers;
    }

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

    public file(path: string): Response {
        const file = fs.readFileSync(`${FILE_DIR}${path}`);

        this._contentType = ContentType.OCTET;
        this._bodyString = file.toString();

        return this;
    }

    public build(): Buffer {
        let response = "";

        const { statusCode, statusText } = this._status;
        response += `${HTTP_VER} ${statusCode} ${statusText}${CRLF}`;

        this.compressBody();
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

    private compressBody() {
        const compressionType = this._headers["Content-Encoding"];

        if (!compressionType) {
            return;
        }

        switch (compressionType) {
            case "gzip":
                // Encode object here
                break;
            default:
                console.error(`Unsupported compression type: ${compressionType}`);
                delete this._headers["Content-Encoding"];
                break;
        }
    }

    private appendBodyHeaders() {
        this._headers["Content-Length"] = Buffer.from(this._bodyString).byteLength;
        if (this._contentType) {
            this._headers["Content-Type"] = this._contentType;
        }
    }
}
