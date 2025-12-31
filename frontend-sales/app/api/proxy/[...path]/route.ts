import { NextRequest, NextResponse } from "next/server";
import { getServerBackendUrl } from "@/lib/config";

/**
 * Server-side API Proxy
 *
 * Proxies requests from the client (browser) to the backend (Docker)
 * This avoids CORS issues and leaks of the internal backend hostname.
 *
 * Note: Next.js 16 expects `params` to be a Promise for dynamic app routes.
 * We mirror the signature used in `/app/api/v1/[...path]/route.ts`.
 */
async function proxyRequest(request: NextRequest, path: string[]) {
  const joinedPath = path?.join("/") ?? "";
  const searchParams = request.nextUrl.search;

  // Construct destination URL - ensure it hits /api/v1 prefix
  const backendUrl = getServerBackendUrl().replace(/\/$/, ""); // Remove trailing slash if exists
  const destUrl = `${backendUrl}/api/v1/${joinedPath}${searchParams}`;  // Fixed: removed trailing slash

  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}${searchParams} -> ${destUrl}`);

  try {
    const headers = new Headers();

    // Copy authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("authorization", authHeader);
    }

    // Copy content-type
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    const options: RequestInit = {
      method: request.method,
      headers,
      // Add timeout and better error handling
      signal: AbortSignal.timeout(30000), // 30 second timeout
    };

    // Body for non-GET/HEAD requests
    if (!["GET", "HEAD"].includes(request.method)) {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    console.log(`[Proxy] Fetching: ${destUrl} with method: ${request.method}`);
    const response = await fetch(destUrl, options);
    
    if (!response.ok) {
      console.error(`[Proxy] Backend returned error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.text();

    // Return response with proper headers
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", response.headers.get("content-type") || "application/json");
    // Add CORS headers for browser
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[Proxy Error]", error?.message || error);
    console.error("[Proxy Error] Stack:", error?.stack);
    return NextResponse.json(
      { 
        detail: "Backend connectivity error", 
        error: error?.message ?? String(error),
        url: destUrl,
        backendUrl: backendUrl
      },
      { 
        status: 502,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      }
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
