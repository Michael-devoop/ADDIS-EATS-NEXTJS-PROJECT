import { NextResponse } from "next/server";
import { getDishById, updateDish, deleteDish } from "@/lib/dishStorage";
import { getSession } from "@/lib/session";

// GET /api/dishes/[id] - Fetch a single dish by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const dish = getDishById(id);

    if (!dish) {
      return NextResponse.json(
        {
          success: false,
          error: "Dish not found",
          details: `Dish with ID '${id}' does not exist in the menu catalog`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      dish,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve dish",
        details: error.message || null,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/dishes/[id] - Update dish details (Admin only)
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
    const updated = updateDish(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dish updated successfully",
      dish: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update dish", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/dishes/[id] - Delete a dish (Admin only)
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
    const deleted = deleteDish(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Dish not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete dish", details: error.message },
      { status: 500 }
    );
  }
}
