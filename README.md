[![progress-banner](https://backend.codecrafters.io/progress/http-server/8ca54531-107b-4365-8871-3cb8a5fc5815)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

# Codecrafters HTTP server

This repo contains my implementation of a simple HTTP server built using Codecrafters, built on top of a TCP server

The web server features

- Regex based routing
- Ability to define RequestHandler methods with a format somewhat similar to the Node.js HTTPServer / Express JS

```typescript
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

```
- Support for GET and POST requests, with other methods being easily implementible
- Support for text, json and file body return types
- Support for body compression
- Concurrent and persistent connection


Overall a very fun and interesting challenge, helping me learn more about the HTTP Spec, TCP, and the request response cycle.

**Note**: If you're viewing this repo on GitHub, head over to
[codecrafters.io](https://codecrafters.io) to try the challenge.