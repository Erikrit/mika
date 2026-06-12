import { NextRequest } from 'next/server';
import { getInternalApiUrl } from '@/lib/api-config';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

const FORWARD_REQUEST_HEADERS = ['authorization', 'content-type', 'accept'];

export async function proxyToApi(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const url = `${getInternalApiUrl()}/${path}${search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';

  const init: RequestInit & { duplex?: 'half' } = {
    method,
    headers,
  };

  if (hasBody) {
    init.body = request.body;
    init.duplex = 'half';
  }

  const upstream = await fetch(url, init);

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
