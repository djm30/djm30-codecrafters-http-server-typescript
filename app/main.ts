import * as net from "net";
import { ResponseStatus } from "./models";
import { Response } from "./response";
import { FILE_DIR, HTTP_VER } from "./consts";
import { parseRequest } from "./request";
import { RouteController } from "./controller";
import * as fs from "fs";
import { error } from "console";

const controller = new RouteController();

controller
    .onGet(/^\/$/, (req, res) => {
        return res;
    })

    .onGet(/\/echo.*/, (req, res) => {
        const regex = /\/echo\/(.+)/;
        const { target } = req;

        if (!target.match(regex)) {
            return res.status(ResponseStatus.BAD_REQUEST);
        }

        const echo = req.target.match(regex)![1];
        return res.body(echo);
    })

    .onGet(/\/files.*/, (req, res) => {
        const regex = /\/files\/(.+)/;

        if (!regex.test(req.target)) {
            return res.status(ResponseStatus.BAD_REQUEST);
        }

        try {
            const fileName = req.target.match(regex)![1];
            return res.file(fileName);
        } catch (error) {
            console.log(error);
            return res.status(ResponseStatus.NOT_FOUND);
        }
    })

    .onGet(/\/user-agent$/, (req, res) => {
        const userAgent = req.headers["User-Agent"];
        return res.body(userAgent);
    })

    .onPost(/\/files.*/, (req, res) => {
        const regex = /\/files\/(.+)/;

        if (!regex.test(req.target)) {
            return res.status(ResponseStatus.BAD_REQUEST);
        }

        try {
            const fileName = req.target.match(regex)![1];

            const filePath = `${FILE_DIR}${fileName}`;
            const fileContent = req.body;

            fs.writeFileSync(filePath, fileContent);

            return res.status(ResponseStatus.CREATED);
        } catch (error) {
            const mesasge = (error as any).mesasge;
            return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).body(mesasge);
        }
    })

    .addDefaultHandler((req, res) => {
        return res.status(ResponseStatus.NOT_FOUND);
    });

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = parseRequest(data);

        console.log(`Incoming ${request.method} request to ${request.target} -- Using ${HTTP_VER}\n`);

        const handler = controller.findHandlerForRoute(request.method, request.target);

        if (!handler) {
            throw new Error("No handler setup to handle this request");
        }

        const baseResponseHeaders: Record<string, string> = {};

        const connectionHeader = request.headers["Connection"];
        const shouldCloseConnection = connectionHeader === "close";

        if (shouldCloseConnection) {
            baseResponseHeaders["Connection"] = "close";
        }

        const response = handler(request, new Response(request.headers["Accept-Encoding"], baseResponseHeaders));

        shouldCloseConnection ? socket.end(response.build()) : socket.write(response.build());
    });

    socket.on("close", () => {
        socket.end();
    });

    socket.on("error", (error) => {
        console.log(error);
        console.log("Error has occured, closing connection");
        socket.end();
    });
});

server.listen(4221, "localhost");
