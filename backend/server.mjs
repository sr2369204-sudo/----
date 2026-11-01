import { createServer } from 'node:http';
import { createServerClient } from '@quranjs/api/server';

import { getSurah, listSurahs } from './content-service.mjs';

const port = readPort(process.env.PORT);
const host = process.env.HOST ?? '127.0.0.1';
const environment = process.env.QF_ENV ?? 'prelive';

if (environment !== 'prelive' && environment !== 'production') {
  throw new Error('QF_ENV must be either "prelive" or "production".');
}
if (!process.env.QF_CLIENT_ID || !process.env.QF_CLIENT_SECRET) {
  throw new Error(
    'Set QF_CLIENT_ID and QF_CLIENT_SECRET in backend/.env. Keep these credentials on this backend only.',
  );
}

const services = environment === 'prelive'
  ? {
      gatewayUrl: 'https://apis-prelive.quran.foundation',
      oauth2BaseUrl: 'https://prelive-oauth2.quran.foundation',
    }
  : {
      gatewayUrl: 'https://apis.quran.foundation',
      oauth2BaseUrl: 'https://oauth2.quran.foundation',
    };

const client = createServerClient({
  clientId: process.env.QF_CLIENT_ID,
  clientSecret: process.env.QF_CLIENT_SECRET,
  services,
});
const allowedOrigins = new Set(
  (process.env.EXPO_WEB_ORIGINS ?? 'http://localhost:8081,http://127.0.0.1:8081')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const responseCache = new Map();
const cacheDurationMs = 5 * 60 * 1000;

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed.' });
    return;
  }

  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/healthz') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (pathname !== '/quran/surahs' && !/^\/quran\/surahs\/\d+$/.test(pathname)) {
    sendJson(response, 404, { error: 'Route not found.' });
    return;
  }

  const cached = responseCache.get(pathname);
  if (cached && cached.expiresAt > Date.now()) {
    sendJson(response, 200, cached.body);
    return;
  }

  try {
    const body = pathname === '/quran/surahs'
      ? {
          sourceId: 'quran-foundation-content-api',
          contentVersion: 'api-v4',
          surahs: await listSurahs(client, environment),
        }
      : await getSurah(client, environment, Number(pathname.split('/').at(-1)));

    if (!body) {
      sendJson(response, 404, { error: 'Surah is not available in the configured environment.' });
      return;
    }

    responseCache.set(pathname, { body, expiresAt: Date.now() + cacheDurationMs });
    sendJson(response, 200, body);
  } catch (error) {
    console.error(
      'Quran Foundation content request failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    sendJson(response, 502, { error: 'Quran Foundation content is temporarily unavailable.' });
  }
});

server.listen(port, host, () => {
  console.log(`Mushaf content backend listening on http://${host}:${port} (${environment}).`);
});

function readPort(value) {
  if (value === undefined) {
    return 3001;
  }
  const portNumber = Number(value);
  if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return portNumber;
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}
