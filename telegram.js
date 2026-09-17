const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const config = require('./config');

const token = process.env.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN;
const apiBase = (process.env.API_BASE_URL || config.API_BASE_URL).replace(/\\/+$/, '');
const endpoint = '/' + (process.env.PAIR_ENDPOINT || config.PAIR_ENDPOINT).replace(/^\\/+/, '');

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Add it in Railway Variables.');
  process.exit(1);
}
const bot = new Telegraf(token);
const cooldown = new Map();
const menu = Markup.inlineKeyboard([
  [Markup.button.callback('📱 Pair WhatsApp', 'pair'), Markup.button.callback('❓ Help', 'help')],
  [Markup.button.callback('📊 Status', 'status')],
  [Markup.button.url('🌐 NAWAZ-MD Website', config.WEB_PAIR_URL)]
]);
const back = Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'back')]]);

bot.start(ctx => ctx.reply(`👑 ${config.BOT_NAME} Pair Bot\\n\\nPair your WhatsApp through the NAWAZ-MD API.\\nTap Pair WhatsApp and send your number with country code (digits only).\\n\\n${config.BOT_FOOTER}`, menu));
bot.action('pair', async ctx => { await ctx.answerCbQuery(); await ctx.reply('اپنا WhatsApp نمبر ملک کے کوڈ کے ساتھ بھیجیں۔ مثال: 923001234567 (صرف ہندسے)', back); });
bot.action('help', async ctx => { await ctx.answerCbQuery(); await ctx.reply(`طریقہ: Pair WhatsApp دبائیں، نمبر بھیجیں، پھر موصولہ کوڈ WhatsApp → Linked Devices → Link with phone number میں درج کریں۔\\nWebsite: ${config.WEB_PAIR_URL}`, back); });
bot.action('status', async ctx => { await ctx.answerCbQuery(); await ctx.reply(`✅ ${config.BOT_NAME} is running.\\nAPI: ${apiBase}${endpoint}` , back); });
bot.action('back', async ctx => { await ctx.answerCbQuery(); await ctx.reply(`${config.BOT_NAME} — Main Menu`, menu); });

bot.on('text', async ctx => {
  const number = ctx.message.text.trim();
  if (number.startsWith('/')) return;
  if (!/^\\d{10,15}$/.test(number)) return ctx.reply('❌ درست نمبر بھیجیں، country code سمیت، صرف 10–15 ہندسے۔');
  const id = ctx.from.id, now = Date.now(), last = cooldown.get(id) || 0;
  if (now - last < 30000) return ctx.reply(`⏳ ${Math.ceil((30000-(now-last))/1000)} سیکنڈ انتظار کریں۔`);
  cooldown.set(id, now);
  const loading = await ctx.reply('🔄 NAWAZ-MD API سے کوڈ حاصل کیا جا رہا ہے…');
  try {
    const { data = {} } = await axios.post(`${apiBase}${endpoint}`, { number }, { timeout: 20000, headers: {'Content-Type':'application/json'} });
    const code = data.code || data.pairingCode || data.pair_code || data.data?.code || data.data?.pairingCode;
    if (!code) throw new Error(data.message || 'API response میں code نہیں ملا؛ endpoint/response format چیک کریں۔');
    await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, undefined,
      `✅ *آپ کا Pairing Code*\\n\\nنمبر: \`${number}\`\\nکوڈ: \`${String(code)}\`\\n\\nWhatsApp → Linked Devices → Link with phone number میں درج کریں۔\\n\\n${config.BOT_FOOTER}`,
      { parse_mode:'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔄 نیا کوڈ','pair')],[Markup.button.url('🌐 Website',config.WEB_PAIR_URL)]]) });
  } catch (e) {
    const detail = e.response?.data?.message || e.response?.data?.error || e.message;
    console.error('Pair API error:', detail);
    await ctx.telegram.editMessageText(ctx.chat.id, loading.message_id, undefined,
      `❌ کوڈ حاصل نہیں ہوا۔ Railway Variables میں API_BASE_URL اور PAIR_ENDPOINT، اور API کا request/response format چیک کریں۔\\nتفصیل: ${String(detail).slice(0,200)}\\n${config.WEB_PAIR_URL}`, back);
  }
});
bot.catch(err => console.error('Telegram error:', err.message));
bot.launch().then(()=>console.log('NAWAZ-MD Telegram bot started.')).catch(err=>{console.error('Bot launch failed:',err.message);process.exit(1)});
process.once('SIGINT',()=>bot.stop('SIGINT'));
process.once('SIGTERM',()=>bot.stop('SIGTERM'));
