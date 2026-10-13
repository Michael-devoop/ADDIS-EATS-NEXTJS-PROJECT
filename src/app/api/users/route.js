import { NextResponse } from "next/server";
import { getAllUsers, addUser } from "@/lib/usersStore";
import { getSession } from "@/lib/session";

// GET /api/users - List users with search and role filters
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q");
    const role = searchParams.get("role");

    let users = getAllUsers();

    if (role && role !== "all") {
      users = users.filter((u) => u.role.toLowerCase() === role.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users", details: err.message },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (Admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body?.email || !body?.name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    const newUser = addUser(body);
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to create user", details: err.message },
      { status: 500 }
    );
  }
}
