const isProd = process.env.NODE_ENV === 'production';

function emit(level, msg, meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(meta || {}),
  };

  if (isProd) {
    // JSON lines — one object per line
    const line = JSON.stringify(entry);
    if (level === 'error') process.stderr.write(line + '\n');
    else process.stdout.write(line + '\n');
  } else {
    // Human-readable in dev
    const prefix = `[${entry.ts}] [${level.toUpperCase()}]`;
    const args = meta ? [prefix, msg, meta] : [prefix, msg];
    if (level === 'error') console.error(...args);
    else if (level === 'warn') console.warn(...args);
    else console.log(...args);
  }
}

export const log = {
  info: (msg, meta) => emit('info', msg, meta),
  warn: (msg, meta) => emit('warn', msg, meta),
  error: (msg, meta) => emit('error', msg, meta),
};