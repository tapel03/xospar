/** Client -> server */
export const WS_CLIENT = { SUBSCRIBE: 'subscribe', UNSUBSCRIBE: 'unsubscribe', PING: 'ping' };
/** Server -> client */
export const WS_SERVER = { HELLO: 'hello', TICK: 'tick', SNAPSHOT: 'snapshot', STATUS: 'status', PONG: 'pong', ERROR: 'error' };
/** Max symbols one connection may subscribe to. */
export const WS_MAX_SUBSCRIPTIONS = 60;
