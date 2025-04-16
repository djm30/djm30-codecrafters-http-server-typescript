import { HttpMethod, type RequestHandler, type Route } from "./models";

export class RouteController {
    private _methodRoutes: Record<HttpMethod, Route[]> = {
        GET: [],
        POST: [],
    };

    private _defaultHandler: RequestHandler | undefined;

    public onGet(matchExp: RegExp, handler: RequestHandler): RouteController {
        this._methodRoutes[HttpMethod.GET].push({ matchExp, handler });
        return this;
    }

    public onPost(matchExp: RegExp, handler: RequestHandler): RouteController {
        this._methodRoutes[HttpMethod.POST].push({ matchExp, handler });
        return this;
    }

    public addDefaultHandler(handler: RequestHandler): RouteController {
        this._defaultHandler = handler;
        return this;
    }

    public;

    public findHandlerForRoute(method: HttpMethod, target: string): RequestHandler | undefined {
        const matchingRoute = this._methodRoutes[method].find((route) => {
            return route.matchExp.test(target);
        });
        if (!matchingRoute) {
            return this._defaultHandler;
        }
        return matchingRoute.handler;
    }
}
