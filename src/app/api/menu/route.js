import { NextResponse } from "next/server";
import { menuItems } from "@/data/menuData";

// GET /api/menu - Canonical /api/menu endpoint matching specification
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || searchParams.get("q");
    const limit = searchParams.get("limit");

    let results = [...menuItems];

    if (category && category !== "all") {
      results = results.filter((dish) =>
        dish.categories?.includes(category.toLowerCase())
      );
    }

    if (search) {
      const query = search.toLowerCase().trim();
      results = results.filter(
        (dish) =>
          dish.name.toLowerCase().includes(query) ||
          dish.desc?.toLowerCase().includes(query)
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
        menu: results,
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
        error: "Failed to retrieve menu",
        details: error.message || null,
      },
      { status: 500 }
    );
  }
}
