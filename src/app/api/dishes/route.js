import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getAllDishes,
  getDishesByCategory,
  searchDishes,
  addDish,
} from "@/lib/dishStorage";

// GET /api/dishes - Retrieve all dishes or filter by category / search query
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || searchParams.get("q");
    const limit = searchParams.get("limit");

    let results = getAllDishes();

    if (category && category !== "all") {
      results = getDishesByCategory(category);
    }

    if (search) {
      const lowerQuery = search.toLowerCase().trim();
      results = results.filter(
        (dish) =>
          dish.name.toLowerCase().includes(lowerQuery) ||
          dish.desc?.toLowerCase().includes(lowerQuery) ||
          (Array.isArray(dish.categories) &&
            dish.categories.some((c) => c.toLowerCase().includes(lowerQuery)))
      );
    }

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit)) {
        results = results.slice(0, parsedLimit);
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: results.length,
        dishes: results,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve dishes",
        details: error.message || null,
      },
      { status: 500 }
    );
  }
}

// POST /api/dishes - Create or add a new dish to the menu (Admin only)
export async function POST(request) {
  try {
    // 1. Strictly verify user authentication
    const session = await getSession();
    if (!session || !session.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active session required to modify menu catalog.",
        },
        { status: 401 }
      );
    }

    // 2. Strictly verify administrator permissions
    if (session.user?.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: Administrator privileges required to add menu dishes.",
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { name, price, categories, desc, image } = body;

    // Validate required fields
    if (!name || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and price are required fields",
          details: { name: !name ? "Required" : undefined, price: price === undefined ? "Required" : undefined },
        },
        { status: 400 }
      );
    }

    const newDish = addDish({ name, price, categories, desc, image });

    return NextResponse.json(
      {
        success: true,
        message: "Dish added successfully",
        dish: newDish,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON request body",
        details: error.message || null,
      },
      { status: 400 }
    );
  }
}
