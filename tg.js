require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

const TARGET_GROUP_ID = -1002437231029;
const TARGET_THREAD_ID = 2; // Update this after checking logs

bot.on('message', async (ctx) => {    
  const chatId = ctx.chat.id;
  const messageThreadId = ctx.message.message_thread_id;

  // Log details for debugging
  console.log('Received message in chat:', chatId);
  console.log('Thread ID:', messageThreadId, 'Type:', typeof messageThreadId);

  if (chatId === TARGET_GROUP_ID) {
    try {
      // Send initial reply
      await ctx.reply('PASS - 1');

      // Check if the message is in the target thread
      if (messageThreadId === TARGET_THREAD_ID) {
        // Send thread-specific reply
        await ctx.reply('Message received in the target thread.');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  } else {
    ctx.reply('ERROR - 2');
  }
});

bot.launch();
console.log('Bot is running...');   