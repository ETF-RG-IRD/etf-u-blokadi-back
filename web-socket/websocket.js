"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var ws_1 = require("ws");
// Initialize WebSocket server
var wss = new ws_1.WebSocketServer({
    port: 8080,
    cert: (0, fs_1.readFileSync)('cert.pem'),
    key: (0, fs_1.readFileSync)('key.pem'),
});
var messageHistory = [];
wss.on('connection', function (ws) {
    console.log('New WebSocket connection');
    // Send message history to new clients
    if (messageHistory.length > 0) {
        ws.send(JSON.stringify({ type: 'history', data: messageHistory }));
    }
    ws.on('message', function (message) {
        var messageText = message.toString();
        console.log('Received message from client:', messageText);
        messageHistory.push(messageText);
        wss.clients.forEach(function (client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', data: messageText }));
            }
        });
    });
    // Handle WebSocket connection close
    ws.on('close', function () {
        console.log('WebSocket connection closed');
    });
});
console.log('WebSocket server is running on port 8080');
