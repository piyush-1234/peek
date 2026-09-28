import crypto from 'crypto';

export function getIceServers() {
  const secret = process.env.TURN_SECRET;
  const host = process.env.TURN_HOST || 'peekmoment.com';
  const port = process.env.TURN_PORT || '3478';

  if (!secret) {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
    ];
  }

  const ttl = 24 * 60 * 60;
  const username = `${Math.floor(Date.now() / 1000) + ttl}`;
  const credential = crypto
    .createHmac('sha1', secret)
    .update(username)
    .digest('base64');

  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: `stun:${host}:${port}` },
    {
      urls: [
        `turn:${host}:${port}?transport=udp`,
        `turn:${host}:${port}?transport=tcp`,
      ],
      username,
      credential,
    },
  ];
}