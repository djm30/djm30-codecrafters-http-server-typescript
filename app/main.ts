import * as net from "net";
import { ResponseStatus, type RequestHandler, type Route } from "./models";
import { Response } from "./response";
import { HTTP_VER } from "./consts";
import { parseRequest } from "./request";
import { RouteController } from "./controller";

const controller = new RouteController();

controller
    .addRoute(/^\/$/, (req, res) => {
        return res;
    })

    .addRoute(/\/echo.*/, (req, res) => {
        const regex = /\/echo\/(.+)/;
        const { target } = req;

        if (!target.match(regex)) {
            return res.status(ResponseStatus.BAD_REQUEST);
        }

        const echo = req.target.match(regex)![1];
        return res.body(echo);
    })

    .addRoute(/\/files.*/, (req, res) => {
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

    .addRoute(/\/user-agent$/, (req, res) => {
        const userAgent = req.headers["User-Agent"];
        return res.body(userAgent);
    })

    .addDefaultHandler((req, res) => {
        return res.status(ResponseStatus.NOT_FOUND);
    });

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = parseRequest(data);

        console.log(`Incoming ${request.method} request to ${request.target} -- Using ${HTTP_VER}\n`);

        const handler = controller.findHandlerForRoute(request.target);

        if (!handler) {
            throw new Error("No handler setup to handle this request");
        }

        const response = handler(request, new Response());

        socket.end(response.build());
    });

    socket.on("close", () => {
        socket.end();
    });

    socket.on("error", () => {
        console.log("Error has occured, closing connection");
        socket.end();
    });
});

server.listen(4221, "localhost");
