import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING as string)
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Define schema and model
const messageSchema = new mongoose.Schema({
    text: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema, 'messages');

wss.on('connection', async (ws) => {
    console.log('New WebSocket connection');

    // Send message history to the new client
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(10);
        ws.send(JSON.stringify({
            type: 'history',
            data: messages.map(m => ({ text: m.text, date: m.timestamp }))
        }));
    } catch (err) {
        console.error('Failed to retrieve message history', err);
    }

    // Handle incoming messages from this client
    ws.on('message', async (data) => {
        try {
            const parsed = JSON.parse(data.toString());
            if (parsed.type === 'announcement') {
                // Save to database
                const newMessage = new Message({ text: parsed.data });
                await newMessage.save();

                // Broadcast to all clients
                const announcement = JSON.stringify({
                    type: 'announcement',
                    data: { text: parsed.data, date: new Date() }
                });
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(announcement);
                    }
                });
            }
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on port 8080');