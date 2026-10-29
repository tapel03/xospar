// WebSocket fan-out. Clients connect to /ws and send {type:"subscribe", syms:["EUR/USD", ...]}.
import { WebSocketServer } from 'ws';
import { WS_CLIENT, WS_SERVER } from '@edgeline/shared-types';
import { createSubscriptions } from './subscriptions.js';
import { createThrottler } from './throttle.js';

export function attachPriceGateway({ server, bus, logger, throttleMs = 400, path = '/ws' }) {
  const wss = new WebSocketServer({ server, path });
  const subs = createSubscriptions(bus);
  const throttlers = new Map();

  // One bus listener fans out to every interested socket.
  const unsubscribeBus = bus.subscribe((quote) => {
    for (const [socket, t] of throttlers) if (subs.has(socket, quote.sym)) t.push(quote);
  });

  wss.on('connection', (socket) => {
    subs.open(socket);
    const send = (obj) => { if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(obj)); };
    const throttler = createThrottler((q) => send({ type: WS_SERVER.TICK, data: q }), throttleMs);
    throttlers.set(socket, throttler);
    send({ type: WS_SERVER.HELLO, maxSubscriptions: 60 });

    socket.on('message', (buf) => {
      let msg;
      try { msg = JSON.parse(buf.toString()); } catch { return send({ type: WS_SERVER.ERROR, error: 'bad_json' }); }
      const syms = Array.isArray(msg.syms) ? msg.syms.map(String) : [];
      if (msg.type === WS_CLIENT.SUBSCRIBE) {
        const { added, rejected } = subs.add(socket, syms);
        if (rejected.length) send({ type: WS_SERVER.ERROR, error: 'rejected_symbols', syms: rejected });
        const snapshot = bus.getMany(added);
        if (snapshot.length) send({ type: WS_SERVER.SNAPSHOT, data: snapshot });
      } else if (msg.type === WS_CLIENT.UNSUBSCRIBE) {
        subs.remove(socket, syms); syms.forEach((s) => throttler.drop(s));
      } else if (msg.type === WS_CLIENT.PING) send({ type: WS_SERVER.PONG, t: Date.now() });
    });

    socket.on('close', () => { subs.close(socket); throttler.dispose(); throttlers.delete(socket); });
    socket.on('error', (e) => logger.debug(`ws client error: ${e.message}`));
  });

  return { close: () => { unsubscribeBus(); for (const c of wss.clients) c.terminate(); wss.close(); }, wss };
}
