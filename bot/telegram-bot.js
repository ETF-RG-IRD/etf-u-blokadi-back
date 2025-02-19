"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var ws_1 = require("ws");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// Initialize Telegraf bot
var bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_API_KEY);
// Connect to WebSocket server
var ws = new ws_1.WebSocket("ws://".concat(process.env.WEB_SOCKET_URI));
ws.on('open', function () {
    console.log('Connected to WebSocket server');
});
ws.on('error', function (error) {
    console.error('WebSocket error:', error);
});
// Listen for the /announce command
bot.command('announce', function (ctx) {
    var message = ctx.message.text.replace('/announce', '').trim();
    if (message) {
        // Send the message to the WebSocket server
        ws.send(JSON.stringify({ type: 'announcement', data: message }));
        ctx.reply("Announcement sent: ".concat(message));
    }
    else {
        ctx.reply('Please provide a message after /announce.');
    }
});
// Start the bot
bot.launch();
console.log('Telegram bot is running');
