import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const reservations = [];

// GET /api/reservation - View authenticated user's reservations (or all if admin)
export async function GET() {
  const session = await getSession();
  if (!session || !session.isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Active session required to view reservations.",
      },
      { status: 401 }
    );
  }

  const userReservations =
    session.user?.role === "admin"
      ? reservations
      : reservations.filter(
          (r) =>
            r.sessionId === session.sessionId ||
            (r.ownerEmail &&
              r.ownerEmail.toLowerCase() === session.user?.email?.toLowerCase())
        );

  return NextResponse.json({
    success: true,
    count: userReservations.length,
    reservations: userReservations,
  });
}

// POST /api/reservation - Book a table (requires active session)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active session required to book a table reservation.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, guests, date, time, notes } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    const newReservation = {
      reservationId: "RES-" + Math.floor(1000 + Math.random() * 9000),
      sessionId: session.sessionId,
      userId: session.user.id,
      ownerEmail: session.user.email,
      name,
      email,
      phone,
      guests: guests || 2,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "19:00",
      notes: notes || "",
      status: "Confirmed",
      bookedAt: new Date().toISOString(),
    };

    reservations.unshift(newReservation);

    return NextResponse.json(
      {
        success: true,
        message: "Table reserved successfully",
        reservation: newReservation,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
