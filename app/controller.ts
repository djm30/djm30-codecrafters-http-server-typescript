import type { RequestHandler, Route } from "./models";

export class RouteController {
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
