import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Initialize WebSocket server
const wss = new WebSocketServer({
    port: 8080
});

// Connect to MongoDB
mongoose.connect(`${process.env.DB_CONNECTION_STRING as string}`).then(() => {
    console.log('Connected to DB');
}).catch((err: any) => {
    console.error('Failed to connect to MongoDB', err);
});

// Define a schema for messages
const messageSchema = new mongoose.Schema({
    text: String,
    timestamp: { type: Date, default: Date.now }
});

// Create a model from the schema
const Message = mongoose.model('Message', messageSchema, 'messages');

wss.on('connection', async (ws: any) => {
    console.log('New WebSocket connection, sending history...');

    // Retrieve message history from MongoDB
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(10).exec();
        if (messages.length > 0) {
            // Send history as an array of { text, date } objects
            ws.send(JSON.stringify({
                type: 'history',
                data: messages.map(m => ({
                    text: m.text,
                    date: m.timestamp
                }))
            }));
        }
    } catch (err) {
        console.error('Failed to retrieve message history', err);
    }
});

wss.on('message', async (message: any) => {
    const messageText = message.toString();
    console.log('Received message from client:', messageText);

    // Parse the incoming message (assuming it's JSON)
    const parsedMessage = JSON.parse(messageText);

    // Save the new message to MongoDB
    const newMessage = new Message({ text: parsedMessage.data });
    try {
        await newMessage.save();
    } catch (err) {
        console.error('Failed to save message to MongoDB', err);
    }

    // Broadcast the new message to all clients
    wss.clients!.forEach((client: any) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'announcement',
                data: {
                    text: parsedMessage.data,
                    date: new Date() // Use the current timestamp
                }
            }));
        }
    });
});

// Handle WebSocket connection close
wss.on('close', () => {
    console.log('WebSocket connection closed');
});

console.log('WebSocket server is running on port 8080');