import * as net from "net";
import { ResponseStatus, type RequestHandler, type Route } from "./models";
import { Response } from "./response";
import { HTTP_VER } from "./consts";
import { parseRequest } from "./request";

class RouteController {
    private _routes: Route[] = [];
    private _defaultHandler: RequestHandler | undefined;

    public addRoute(matchExp: RegExp, handler: RequestHandler): RouteController {
        this._routes.push({ matchExp, handler });
        return this;
    }

    public addDefaultHandler(handler: RequestHandler): RouteController {
        this._defaultHandler = handler;
        return this;
    }

    public findHandlerForRoute(target: string): RequestHandler | undefined {
        const matchingRoute = this._routes.find((route) => {
            return route.matchExp.test(target);
        });
        if (!matchingRoute) {
            return this._defaultHandler;
        }
        return matchingRoute.handler;
    }
}

const controller = new RouteController();

controller
    .addRoute(/\/$/, (req, res) => {
        return res;
    })

    .addRoute(/\/echo.*/, (req, res) => {
        const regex = /\/echo\/(.+)/;
        const { target } = req;

        if (target.match(regex)) {
            const echo = req.target.match(regex)![1];
            return res.body(echo);
        }

        return res.status(ResponseStatus.BAD_REQUEST);
    })

    .addRoute(/\/user-agent$/, (req, res) => {
        const userAgent = req.headers["User-Agent"];
        return res.body(userAgent);
    })

    .addRoute(/\/file\/.+/, (req, res) => {
        const regex = /\/file\/(.+)/;
        if (!regex.test(req.target)) {
            return res.status(ResponseStatus.BAD_REQUEST);
        }
        console.log("File route");
        return res;
    })

    .addDefaultHandler((req, res) => {
        return res.status(ResponseStatus.NOT_FOUND);
    });

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = parseRequest(data);

        console.log(`Incoming ${request.method} request to ${request.target}. Using ${HTTP_VER}\n`);

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
