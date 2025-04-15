import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const response = "HTTP/1.1 200 OK\r\n\r\n";

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    console.log("Connection has been established");

    socket.end(response);

    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
