import * as net from "net";
import { ContentType, RESPONSE_STATUS, type Status } from "./models";
import { Response } from "./response";
import { CRLF } from "./consts";

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const requestLine = request.split(CRLF)[0];

        const headersAndBody = request.split(CRLF).slice(1);
        console.log(headersAndBody);
        const headers = headersAndBody.slice(0, headersAndBody.length - 1);
        const body = headersAndBody[headersAndBody.length - 1];
        console.log(headers);
        console.log(body);

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
