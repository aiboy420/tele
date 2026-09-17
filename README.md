# NAWAZ-MD Telegram Pair Bot — Railway

## Railway deployment
1. Upload these project files to a GitHub repository.
2. In Railway, create a project and deploy from that GitHub repository.
3. In the Railway service's Variables, add:
   - `TELEGRAM_BOT_TOKEN` = token from BotFather
   - `API_BASE_URL` = `https://nawazmd.vercel.app/api`
   - `PAIR_ENDPOINT` = your actual pairing API route (currently `/pair` placeholder)
4. Railway uses `npm start` automatically through `railway.json`/`package.json`. No port is needed for Telegram polling.

## Pair API contract (must verify)
The bot sends `POST {API_BASE_URL}{PAIR_ENDPOINT}` with JSON `{ "number": "923001234567" }` and expects `code`, `pairingCode`, `pair_code`, `data.code`, or `data.pairingCode` in JSON response. The supplied prior script did not establish the real API route/schema; set these to match your deployed API. Until verified, bot startup can work while pairing requests fail.

## Token safety
Do not commit the real Telegram token to GitHub, especially a public repository. Put it in Railway Variables. If a token was exposed, revoke it via BotFather and generate a new one.
