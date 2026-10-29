// Tracks which symbols each socket watches, and tells the bus so pollers only fetch what is in demand.
import { WS_MAX_SUBSCRIPTIONS } from '@edgeline/shared-types';
import { getAsset } from '../../../db/seeds/assets.js';

export function createSubscriptions(bus) {
  const bySocket = new Map(); // socket -> Set<sym>
  return {
    open(socket) { bySocket.set(socket, new Set()); },
    close(socket) { for (const s of bySocket.get(socket) || []) bus.removeDemand(s); bySocket.delete(socket); },
    /** @returns {{added: string[], rejected: string[]}} */
    add(socket, syms) {
      const set = bySocket.get(socket);
      const added = [], rejected = [];
      for (const sym of syms) {
        if (!getAsset(sym) || set.size >= WS_MAX_SUBSCRIPTIONS) { rejected.push(sym); continue; }
        if (!set.has(sym)) { set.add(sym); bus.addDemand(sym); }
        added.push(sym);
      }
      return { added, rejected };
    },
    remove(socket, syms) { const set = bySocket.get(socket); for (const s of syms) if (set.delete(s)) bus.removeDemand(s); },
    has: (socket, sym) => bySocket.get(socket)?.has(sym) ?? false,
    count: (socket) => bySocket.get(socket)?.size ?? 0,
  };
}
