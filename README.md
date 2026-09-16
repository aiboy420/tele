# NAWAZ-MD Telegram Pair Bot

A small Telegram bot starter. Users run `/pair`, share their own WhatsApp number, and the bot calls your configured API endpoint and returns the response.

## Setup
1. Create a bot with Telegram's official BotFather and copy its token.
2. Extract this ZIP and open the folder in a Node.js environment.
3. Copy `.env.example` to `.env`; put your token in `TELEGRAM_BOT_TOKEN`.
4. Verify your API's actual pairing endpoint and request/response format. Defaults are `https://nawazmd.vercel.app/api` and `/code`, but these are **placeholders to confirm**, not verified API documentation.
5. Run `npm install` then `npm start`.

## API contract expected by this starter
It sends `POST {API_BASE_URL}{PAIR_ENDPOINT}` with JSON `{ "number": "..." }`.
It looks for a code in `pairCode`, `code`, or `pairingCode` in the JSON response.
If your existing API uses a different method, path, field name, or response shape, update `requestPairCode()` in `index.js`.

Never upload `.env` or expose your bot token in a public repository. This project cannot be run by uploading the ZIP into Telegram; it must be deployed to a Node.js host or run on a server. Telegram is used to chat with the bot.
