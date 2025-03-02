import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

// Initialize WebSocket server
const wss = new WebSocketServer({
    port: 8080
});

const messageHistory: string[] = [];

wss.on('connection', (ws: any) => {
    console.log('New WebSocket connection');

    // Send message history to new clients
    // TODO: Switch to MongoDB :D
    if (messageHistory.length > 0) {
        ws.send(JSON.stringify({ type: 'history', data: messageHistory }));
    }

    ws.on('message', (message: any) => {
        const messageText = message.toString();
        console.log('Received message from client:', messageText);

        messageHistory.push(messageText);

        wss.clients!.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', data: messageText }));
            }
        });
    });

    // Handle WebSocket connection close
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

console.log('WebSocket server is running on port 8080');