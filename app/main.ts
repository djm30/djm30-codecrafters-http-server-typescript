import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const CRLF = "\r\n";
const HTTP_VER = "HTTP/1.1";

// Two CRLF for empty headers section
const okResponse = `${HTTP_VER} 200 OK${CRLF}${CRLF}`;
const notFoundResponse = `${HTTP_VER} 404 Not Found${CRLF}${CRLF}`;

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const requestLine = request.split(CRLF)[0];

        const [method, target, httpV] = requestLine.split(" ");

        console.log(`Incoming ${method} request to ${target}. Using ${httpV}`);

        let response: string;

        if (target === "/") {
            response = okResponse;
        } else {
            response = notFoundResponse;
        }

        socket.end(response);
    });

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
