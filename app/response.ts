import { CompressionStream } from "stream/web";
import { CRLF, FILE_DIR, HTTP_VER } from "./consts";
import { ContentType, EncodingType, ResponseStatus, type Status } from "./models";
import * as fs from "fs";

export class Response {
    private _status: Status = ResponseStatus.OK;
    private _headers: Record<string, string | number>;
    private _bodyString: string | Uint8Array<ArrayBufferLike> = "";
    private _contentType: ContentType = ContentType.NONE;
    private _acceptedEncodings: string;

    constructor(acceptedEncodings: string, headers: Record<string, any> = {}) {
        this._acceptedEncodings = acceptedEncodings;
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

        const binaryPartialResponse = Buffer.from(response, "utf-8");

        // Append body to response
        const binaryResponse =
            typeof this._bodyString === "string"
                ? Buffer.concat([binaryPartialResponse, Buffer.from(this._bodyString, "utf-8")])
                : Buffer.concat([binaryPartialResponse, this._bodyString]);

        return binaryResponse;
    }

    private compressBody() {
        if (!this._acceptedEncodings) {
            console.log("No encoding provided");
            return;
        }

        const acceptedCompressionTypes = this._acceptedEncodings.split(", ").map(mapEncoding);

        if (acceptedCompressionTypes.filter((encodingType) => encodingType !== EncodingType.NONE).length === 0) {
            return;
        }

        const chosenEncodingType = acceptedCompressionTypes.find((encodingType) => encodingType !== EncodingType.NONE)!;

        this._headers = { ...this._headers, "Content-Encoding": chosenEncodingType };

        switch (chosenEncodingType) {
            case EncodingType.GZIP:
                const compressedBody = Bun.gzipSync(Buffer.from(this._bodyString as string));
                this._bodyString = compressedBody;
                break;
            default:
                console.error(`Unsupported compression type: ${chosenEncodingType}`);
                break;
        }
    }

    private appendBodyHeaders() {
        const contentLength = typeof this._bodyString === "string" ? Buffer.from(this._bodyString).byteLength : this._bodyString.byteLength;
        this._headers["Content-Length"] = contentLength;
        if (this._contentType) {
            this._headers["Content-Type"] = this._contentType;
        }
    }
}

const mapEncoding = (encodingType: string): EncodingType => {
    switch (encodingType) {
        case "gzip":
            return EncodingType.GZIP;
        default:
            console.log(`No support for encoding type: ${encodingType}`);
            return EncodingType.NONE;
    }
};
