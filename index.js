import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('❌ BOT_TOKEN is missing in .env');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const WEBSITE = 'https://nawazmd.vercel.app';
const HOW_TO_CONNECT = 'https://youtu.be/CUYwhw7SKx0?si=R_1clxYTJZPJw_Ra';

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'User';

    const message = `
👋 Hello ${firstName}!

🤖 *NAWAZ MD BOT*

Welcome to the official Nawaz MD Bot.

Use the buttons below to open the official website and learn how to connect your bot.

⚡ Fast • Simple • Secure
    `;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '🌐 Open Nawaz MD',
                        url: WEBSITE
                    }
                ],
                [
                    {
                        text: '📖 How to Connect Bot',
                        url: HOW_TO_CONNECT
                    }
                ]
            ]
        }
    });
});

bot.onText(/\/help/, async (msg) => {
    await bot.sendMessage(
        msg.chat.id,
        `🤖 *NAWAZ MD BOT HELP*\n\n/start - Open Nawaz MD\n/help - Show help`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🌐 Open Website',
                            url: WEBSITE
                        }
                    ]
                ]
            }
        }
    );
});

bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error.message);
});

console.log('✅ NAWAZ MD Telegram Bot is running...');
