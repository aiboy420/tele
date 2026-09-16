import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiBase = (process.env.API_BASE_URL || "https://nawazmd.vercel.app/api").replace(/\/+$/, "");
const endpoint = "/" + (process.env.PAIR_ENDPOINT || "/code").replace(/^\/+/, "");

if (!token || token === "PASTE_YOUR_BOT_TOKEN_HERE") {
  console.error("Missing TELEGRAM_BOT_TOKEN. Copy .env.example to .env and add your token.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const waitingForNumber = new Set();

bot.onText(/^\/start(?:@\w+)?$/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    "Welcome to NAWAZ-MD Pair Bot.\\nUse /pair to request a WhatsApp pairing code. Only submit a number you control."
  );
});

bot.onText(/^\/pair(?:@\w+)?$/, async (msg) => {
  waitingForNumber.add(msg.from.id);
  await bot.sendMessage(msg.chat.id, "Send your WhatsApp number with country code (digits only). Example: 923001234567");
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/") || !waitingForNumber.has(msg.from?.id)) return;
  waitingForNumber.delete(msg.from.id);

  const number = msg.text.replace(/[+\s()-]/g, "");
  if (!/^\d{8,15}$/.test(number)) {
    await bot.sendMessage(msg.chat.id, "That number format doesn't look valid. Use country code and digits only, then try /pair again.");
    return;
  }

  const status = await bot.sendMessage(msg.chat.id, "Requesting pairing code…");
  try {
    const result = await requestPairCode(number);
    const code = result?.pairCode ?? result?.code ?? result?.pairingCode;
    if (!code) {
      console.error("API response did not contain a recognized code field:", result);
      await bot.sendMessage(msg.chat.id, "The API replied, but no pairing code field was found. Check the API response format in index.js.");
      return;
    }
    await bot.sendMessage(msg.chat.id, `Your pairing code: ${code}\n\nEnter it only in the official WhatsApp linking flow. Never share it with anyone.`);
  } catch (err) {
    console.error("Pair API error:", err.response?.data || err.message);
    await bot.sendMessage(msg.chat.id, "Could not get a pairing code right now. Please try again later or contact support.");
  }
});

async function requestPairCode(number) {
  // Adjust this request to match the actual API contract for your NAWAZ-MD website.
  const { data } = await axios.post(`${apiBase}${endpoint}`, { number }, { timeout: 20000 });
  return data;
}

bot.on("polling_error", (err) => console.error("Telegram polling error:", err.message));
console.log("NAWAZ-MD Telegram Pair Bot is running.");
