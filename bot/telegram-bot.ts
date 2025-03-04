import { Telegraf } from 'telegraf';
import { WebSocket } from 'ws';
import dotenv from 'dotenv'

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY as string);

const ws = new WebSocket(`ws://localhost:8080`);

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});


// Listen for the /announce command
bot.command('announce', (ctx) => {
    // if(ctx.chat.id.toString() != process.env.GROUP_ID?.toString()) {
    //     ctx.reply('Invalid group ID, not authorized.')
    //     console.log(`Unauthorized use from group with id: ${ctx.chat.id}`)
    //     ctx.leaveChat()
    //     return;
    // }
    const message = ctx.message.text.replace('/announce', '').trim();

    if (message) {
        // Send the message to the WebSocket server
        ws.send(JSON.stringify({ type: 'announcement', data: message }));
        ctx.reply(`Announcement sent: ${message}`);
    } else {
        ctx.reply('Please provide a message after /announce.');
    }
});

bot.launch();

console.log('Listening for announcements...');