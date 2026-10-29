import { WS_URL } from '../../app/config';

/**
 * One reconnecting WebSocket to the backend price gateway, shared by every screen.
 * subscribe(syms, onQuote) -> unsubscribe(). The socket opens on the first subscriber and
 * closes when the last one leaves. All symbols use the app format ("EUR/USD").
 */
class PriceSocket {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.attempts = 0;
    this.timer = null;
    this.listeners = new Map(); // id -> { syms:Set, onQuote }
    this.counts = new Map();    // sym -> subscriber count
    this.nextId = 1;
    this.status = 'idle';
    this.statusListeners = new Set();
  }

  _setStatus(s) { this.status = s; this.statusListeners.forEach((fn) => fn(s)); }
  onStatus(fn) { this.statusListeners.add(fn); return () => this.statusListeners.delete(fn); }

  _send(obj) { if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj)); }

  _open() {
    if (this.ws) return;
    this._setStatus('connecting');
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.attempts = 0;
      this._setStatus('connected');
      const syms = [...this.counts.keys()];
      if (syms.length) this._send({ type: 'subscribe', syms });
    };
    ws.onmessage = (event) => {
      let msg; try { msg = JSON.parse(event.data); } catch { return; }
      const quotes = msg.type === 'tick' ? [msg.data] : msg.type === 'snapshot' ? msg.data : [];
      for (const q of quotes) for (const l of this.listeners.values()) if (l.syms.has(q.sym)) l.onQuote(q);
    };
    ws.onerror = () => {};
    ws.onclose = () => {
      this.ws = null;
      this._setStatus('disconnected');
      if (this.counts.size) {
        const delay = Math.min(1000 * 2 ** this.attempts, 30000);
        this.attempts += 1;
        this.timer = setTimeout(() => this._open(), delay);
      }
    };
  }

  subscribe(syms, onQuote) {
    const id = this.nextId++;
    const set = new Set(syms);
    this.listeners.set(id, { syms: set, onQuote });
    const fresh = [];
    for (const s of set) { const n = (this.counts.get(s) || 0) + 1; this.counts.set(s, n); if (n === 1) fresh.push(s); }
    if (!this.ws) this._open();
    else if (fresh.length) this._send({ type: 'subscribe', syms: fresh });

    return () => {
      this.listeners.delete(id);
      const gone = [];
      for (const s of set) { const n = (this.counts.get(s) || 0) - 1; if (n <= 0) { this.counts.delete(s); gone.push(s); } else this.counts.set(s, n); }
      if (gone.length) this._send({ type: 'unsubscribe', syms: gone });
      if (this.counts.size === 0) { clearTimeout(this.timer); const ws = this.ws; this.ws = null; try { ws?.close(); } catch { /* already closed */ } this._setStatus('idle'); }
    };
  }
}

export const priceSocket = new PriceSocket(WS_URL);
