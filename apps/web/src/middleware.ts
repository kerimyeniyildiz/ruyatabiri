import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

export function middleware(request: NextRequest) {
  if (!adminUsername || !adminPassword) {
    return new NextResponse("Admin credentials not configured.", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const decoded = decodeBasic(authHeader.replace("Basic ", ""));
  if (!decoded) {
    return unauthorizedResponse();
  }

  const [username, password] = decoded;
  if (username !== adminUsername || password !== adminPassword) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

function decodeBasic(encoded: string) {
  try {
    const decoded = atob(encoded);
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return [username, password] as const;
  } catch {
    return null;
  }
}

function unauthorizedResponse() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
