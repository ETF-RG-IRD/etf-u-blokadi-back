require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

const TARGET_GROUP_ID = -1002437231029;
const TARGET_THREAD_ID = 2; // Update this after checking logs

bot.on('message', async (ctx) => {    
  const chatId = ctx.chat.id;
  const messageThreadId = ctx.message.message_thread_id;

  // Log full message for debugging
  console.log('--- Received Message ---');
  console.log(JSON.stringify(ctx.message, null, 2)); // Pretty print JSON
  console.log('------------------------');

  console.log('Received message in chat:', chatId);
  console.log('Thread ID:', messageThreadId, 'Type:', typeof messageThreadId);

  if (chatId === TARGET_GROUP_ID) {
    try {
      // Send initial reply
      await console.log('PASS - 1');

      // Check if the message is in the target thread
      if (messageThreadId === TARGET_THREAD_ID) {
        // Send thread-specific reply
        await console.log('Message received in the target thread.');
      } else {
        console.log(`Not in target thread. Expected: ${TARGET_THREAD_ID}, Received: ${messageThreadId}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  } else {
    console.log('ERROR - 2');
  }
});

bot.launch();
console.log('Bot is running...');
