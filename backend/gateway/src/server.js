import { loadConfig } from '../../libs/config/index.js';
import { createLogger } from '../../libs/logger/index.js';
import { createBus } from '../../services/market-ingestor/src/publish.js';
import { createProviders, startIngestor } from '../../services/market-ingestor/src/index.js';
import { attachPriceGateway } from '../../services/price-gateway/src/server.js';
import { createNewsSource } from '../../services/news/src/routes.js';
import { createAiRouter } from '../../services/ai-gateway/src/router.js';
import { createQuota } from '../../services/ai-gateway/src/quota.js';
import { buildApp } from './app.js';

const config = loadConfig();
const logger = createLogger('gateway', config.logLevel);

const providers = createProviders(config);
const bus = createBus();
const ingestor = startIngestor({ config, providers, bus, logger });
const newsSource = createNewsSource(config, logger);
const router = createAiRouter(config.ai);
const quota = createQuota({ dailyLimit: config.ai.dailyQuota });

const app = await buildApp({ config, providers, bus, ingestor, newsSource, router, quota, logger });
await app.listen({ port: config.port, host: config.host });
const prices = attachPriceGateway({ server: app.server, bus, logger });

logger.info(`listening on http://${config.host}:${config.port}  (ws at /ws)`);
for (const [name, h] of Object.entries(ingestor.health())) logger.info(`feed ${name}: ${h.status}${h.error ? ` (${h.error})` : ''}`);
if (!router.available().length) logger.warn('no AI provider configured: /v1/ai/chat will answer 503');

const shutdown = async () => { prices.close(); ingestor.stop(); await app.close(); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
