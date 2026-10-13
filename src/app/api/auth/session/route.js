import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    if (!session || !session.isAuthenticated) {
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          session: null,
          message: "No active authenticated session found.",
        },
        { status: 200, headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        session,
        message: "Session verified successfully.",
      },
      { status: 200, headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Session verification route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify session.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
