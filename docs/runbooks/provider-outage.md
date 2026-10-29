# Provider outage

`GET /health` lists every feed with `status`, `lastTickAt` and `error`.

| Symptom | Meaning | What to do |
|---|---|---|
| `binance: disconnected` | Crypto stream is down | Nothing, it reconnects (1s doubling to 30s). If Twelve Data is configured, crypto falls back to polling it while Binance is stale. |
| `twelvedata: error` with a quota message | Out of credits | Prices for forex/commodities freeze at their last value. Only watched symbols are polled, so fewer open screens means fewer credits. Raise `TWELVE_DATA_POLL_INTERVAL_MS` or upgrade the plan. |
| `finnhub: disconnected` | Stock trade stream is down | It reconnects on its own. REST quotes still work through `/v1/quotes`. |
| `/v1/news` 502 | GDELT unreachable and nothing cached | Once one batch has loaded, the last good batch is served with `stale: true`. |
| `/v1/ai/chat` 503 | No AI provider key configured | Set `ANTHROPIC_API_KEY` or `FREE_AI_API_KEY`. The app falls back to its sample mentor answers. |
