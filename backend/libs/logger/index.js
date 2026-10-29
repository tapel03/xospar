const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
export function createLogger(name, level = process.env.LOG_LEVEL || 'info') {
  const min = LEVELS[level] ?? 20;
  const out = (lvl, msg, extra) => {
    if (LEVELS[lvl] < min) return;
    const line = `${new Date().toISOString()} ${lvl.toUpperCase()} [${name}] ${msg}`;
    (lvl === 'error' || lvl === 'warn' ? console.error : console.log)(extra ? `${line} ${JSON.stringify(extra)}` : line);
  };
  return { debug: (m, e) => out('debug', m, e), info: (m, e) => out('info', m, e), warn: (m, e) => out('warn', m, e), error: (m, e) => out('error', m, e) };
}
