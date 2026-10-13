import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully. Session cookies cleared.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to log out.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
