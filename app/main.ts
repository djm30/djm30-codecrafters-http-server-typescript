import * as net from "net";

const CRLF = "\r\n";
const HTTP_VER = "HTTP/1.1";

interface Status {
    statusCode: number;
    statusText: string;
}

const RESPONSE_STATUS = {
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

enum ContentType {
    JSON = "application/json",
    TEXT = "text/plain",
    NONE = "",
}

class Response {
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

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const requestLine = request.split(CRLF)[0];

        const [method, target, httpV] = requestLine.split(" ");

        console.log(`Incoming ${method} request to ${target}. Using ${httpV}\n`);

        let response: Response;

        if (target === "/") {
            response = new Response();
        } else if (target.includes("/echo")) {
            const regex = /\/echo\/(.+)/;
            if (regex.test(target)) {
                const echo = target.match(regex)![1];
                response = new Response().body(echo);
            } else {
                response = new Response().status(RESPONSE_STATUS.BAD_REQUEST);
            }
        } else {
            response = new Response().status(RESPONSE_STATUS.NOT_FOUND);
        }

        socket.end(response.build());
    });

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
