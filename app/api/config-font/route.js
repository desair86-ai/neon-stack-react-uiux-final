import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("url");
    if (!raw) return new NextResponse("Missing font URL", { status: 400 });

    const target = new URL(raw);
    if (!["http:", "https:"].includes(target.protocol)) return new NextResponse("Invalid font URL", { status: 400 });

    let wp = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL || "";
    if (wp && !wp.startsWith("http")) wp = `https://${wp}`;
    const allowedOrigin = wp ? new URL(wp).origin : "";
    if (!allowedOrigin || target.origin !== allowedOrigin) return new NextResponse("Font origin not allowed", { status: 403 });

    const response = await fetch(target.toString(), { headers: { Accept: "font/woff2,font/woff,font/ttf,application/octet-stream,*/*" }, next: { revalidate: 86400 } });
    if (!response.ok) return new NextResponse("Font fetch failed", { status: response.status });

    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("content-type") || "font/woff2");
    headers.set("Cache-Control", "public, max-age=86400, immutable");
    return new NextResponse(response.body, { status: 200, headers });
  } catch (error) {
    return new NextResponse(error?.message || "Font proxy error", { status: 500 });
  }
}
