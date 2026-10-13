import { NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/usersStore";
import { getSession } from "@/lib/session";

// PATCH /api/users/[id] - Update user details or role
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = updateUser(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to update user", details: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = deleteUser(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to delete user", details: err.message },
      { status: 500 }
    );
  }
}
