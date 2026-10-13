import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

// Demo user accounts database for authentication
const USERS_DB = [
  {
    userId: "usr_abebe",
    email: "demo@addiseats.com",
    name: "Abebe Bikila",
    password: "password123",
    role: "customer",
  },
  {
    userId: "usr_selam",
    email: "selam@addiseats.com",
    name: "Selamawit Kebede",
    password: "password123",
    role: "customer",
  },
  {
    userId: "usr_admin",
    email: "admin@addiseats.com",
    name: "System Admin",
    password: "admin123",
    role: "admin",
  },
];

export async function POST(request) {
  try {
    let email = "";
    let password = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body?.email?.trim();
      password = body?.password;
    } else {
      const formData = await request.formData();
      email = formData.get("email")?.toString()?.trim() || "";
      password = formData.get("password")?.toString() || "";
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are both required.",
          fieldErrors: {
            email: !email ? "Email is required" : undefined,
            password: !password ? "Password is required" : undefined,
          },
        },
        { status: 422 }
      );
    }

    // Check credentials against USERS_DB, or allow any valid email with valid 6+ char password
    const existingUser = USERS_DB.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      if (existingUser.password !== password) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email or password.",
          },
          { status: 401 }
        );
      }
    } else if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long.",
        },
        { status: 422 }
      );
    }

    // Determine user profile
    const userProfile = existingUser
      ? {
          userId: existingUser.userId,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        }
      : {
          userId: `usr_${Date.now().toString(36)}`,
          email,
          name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          role: "customer",
        };

    // Establish verified session and set cookies
    const session = await createSession(userProfile);

    return NextResponse.json(
      {
        success: true,
        message: "Signed in successfully.",
        session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal authentication server error.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
