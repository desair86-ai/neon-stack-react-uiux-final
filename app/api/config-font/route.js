import { NextResponse } from "next/server";

// Font files are immutable assets from the WordPress media library.
// Keep this route edge/CDN friendly and cache the proxied result aggressively.
export const runtime = "edge";

const ONE_YEAR = 60 * 60 * 24 * 365;

function responseHeaders(contentType, contentLength) {
  const headers = new Headers();
  headers.set("Content-Type", contentType || "font/woff2");
  headers.set(
    "Cache-Control",
    `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, stale-while-revalidate=86400, immutable`
  );
  headers.set("CDN-Cache-Control", `public, max-age=${ONE_YEAR}, stale-while-revalidate=86400`);
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("Access-Control-Allow-Origin", "*");
  if (contentLength) headers.set("Content-Length", contentLength);
  return headers;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("url");
    if (!raw) return new NextResponse("Missing font URL", { status: 400 });

    const target = new URL(raw);
    if (!["http:", "https:"].includes(target.protocol)) {
      return new NextResponse("Invalid font URL", { status: 400 });
    }

    let wp = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL || "";
    if (wp && !wp.startsWith("http")) wp = `https://${wp}`;
    const allowedOrigin = wp ? new URL(wp).origin : "";

    // Keep the proxy locked to the WordPress origin configured in Vercel.
    if (!allowedOrigin || target.origin !== allowedOrigin) {
      return new NextResponse("Font origin not allowed", { status: 403 });
    }

    const response = await fetch(target.toString(), {
      headers: {
        Accept: "font/woff2,font/woff,font/ttf,application/octet-stream,*/*",
      },
      // Let Next/Vercel cache the upstream font independently of the browser.
      next: { revalidate: ONE_YEAR },
    });

    if (!response.ok) {
      return new NextResponse("Font fetch failed", { status: response.status });
    }

    const headers = responseHeaders(
      response.headers.get("content-type") || "font/woff2",
      response.headers.get("content-length")
    );

    return new NextResponse(response.body, { status: 200, headers });
  } catch (error) {
    return new NextResponse(error?.message || "Font proxy error", { status: 500 });
  }
}
