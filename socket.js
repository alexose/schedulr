const WebSocket = require("ws");

let wss;
function init(server) {
    wss = new WebSocket.Server({server, path: "/api"});
    wss.on("connection", ws => {
        ws.on("message", message => {
            console.log(`received: %s`, message);
            ws.send(`Hello, you sent -> ${message}`);
        });
        console.log("connected");
    });
}

function broadcast(obj) {
    if (wss) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(obj));
            }
        });
    }
}

module.exports = {
    init,
    broadcast,
};
