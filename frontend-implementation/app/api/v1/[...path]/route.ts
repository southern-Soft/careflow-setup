import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, getServerBackendUrl } from '@/lib/config';

async function proxyRequest(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const targetPath = `/api/v1/${path.join('/')}${url.search}`;
  const backendUrl = getServerBackendUrl().replace(/\/$/, "");
  const targetUrl = `${backendUrl}${targetPath}`;

  try {
    // Get headers from the incoming request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip host header and other headers that shouldn't be forwarded
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      signal: controller.signal,
    };

    // Include body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    try {
      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      // Get response body
      const responseBody = await response.text();

      // Create response headers
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        // Skip headers that Next.js will handle
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      return new NextResponse(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Check if it's an abort error (timeout)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[API Proxy] Request timeout:', targetUrl);
        return NextResponse.json(
          { detail: 'Request timeout - operation may have completed' },
          { status: 504 } // Gateway Timeout
        );
      }

      throw fetchError; // Re-throw for outer catch block
    }
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { detail: 'Backend service unavailable' },
      { status: 503 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
