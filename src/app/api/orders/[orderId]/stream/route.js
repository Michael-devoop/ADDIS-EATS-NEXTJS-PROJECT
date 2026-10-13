import { getOrderById } from "@/lib/ordersStore";

export const dynamic = "force-dynamic";

// Key landmarks in Addis Ababa for realistic courier routing
const ADDIS_LOCATIONS = {
  restaurant: {
    name: "Addis Eats Downtown (Bole Medhanialem)",
    lat: 8.9954,
    lng: 38.7892,
  },
  destinations: [
    { name: "Kazanchis", lat: 9.0182, lng: 38.7698 },
    { name: "Old Airport", lat: 8.9805, lng: 38.7391 },
    { name: "Sarbet", lat: 8.9922, lng: 38.7314 },
    { name: "Piazza", lat: 9.0345, lng: 38.7516 },
    { name: "CMC Michael", lat: 9.0227, lng: 38.8354 },
  ],
};

/**
 * Generate interpolated waypoints between two coordinates
 */
function generateWaypoints(start, end, steps = 12) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    // Add small realistic road curvature jitter
    const jitterLat = Math.sin(ratio * Math.PI) * 0.002;
    const jitterLng = Math.cos(ratio * Math.PI) * 0.002;
    points.push([
      start.lat + (end.lat - start.lat) * ratio + jitterLat,
      start.lng + (end.lng - start.lng) * ratio + jitterLng,
    ]);
  }
  return points;
}

/**
 * Server-Sent Events (SSE) Route for live delivery and courier tracking
 * Stream updates courier location, progress, and status changes in real-time.
 */
export async function GET(request, { params }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    return new Response(
      JSON.stringify({ error: `Order #${orderId} not found` }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Pick destination coordinates based on order or hash
  const destIndex = Math.abs(orderId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % ADDIS_LOCATIONS.destinations.length;
  const destination = {
    name: order.customer?.address || ADDIS_LOCATIONS.destinations[destIndex].name,
    lat: ADDIS_LOCATIONS.destinations[destIndex].lat,
    lng: ADDIS_LOCATIONS.destinations[destIndex].lng,
  };

  const restaurant = ADDIS_LOCATIONS.restaurant;
  const waypoints = generateWaypoints(restaurant, destination, 15);

  const encoder = new TextEncoder();
  let step = 3; // start already on route
  let currentStatus = order.status || "Out for Delivery";

  const stream = new ReadableStream({
    start(controller) {
      // 1. Immediately emit seed / initial state event
      const initialPayload = {
        orderId,
        status: currentStatus,
        progress: Math.round((step / waypoints.length) * 100),
        etaMinutes: Math.max(3, 18 - step),
        courier: {
          name: "Kidus Tadesse",
          phone: "+251 91 199 8877",
          vehicle: "TVS Motorbike (Plate: AA-3-48291)",
          rating: 4.9,
          photo: "/images/service-1.jpg",
        },
        restaurant: {
          name: restaurant.name,
          lat: restaurant.lat,
          lng: restaurant.lng,
        },
        destination: {
          address: destination.name,
          lat: destination.lat,
          lng: destination.lng,
        },
        courierPosition: waypoints[step],
        routeWaypoints: waypoints,
        timestamp: new Date().toISOString(),
      };

      controller.enqueue(encoder.encode(`event: initial\ndata: ${JSON.stringify(initialPayload)}\n\n`));

      // 2. Stream periodic location & status updates every 3 seconds
      const interval = setInterval(() => {
        if (request.signal.aborted) {
          clearInterval(interval);
          controller.close();
          return;
        }

        step = Math.min(step + 1, waypoints.length - 1);
        const progress = Math.round((step / (waypoints.length - 1)) * 100);

        if (progress >= 100) {
          currentStatus = "Delivered";
        } else if (progress > 15) {
          currentStatus = "Out for Delivery";
        }

        const updatePayload = {
          orderId,
          status: currentStatus,
          progress,
          etaMinutes: Math.max(1, 15 - Math.round(step * 0.9)),
          courierPosition: waypoints[step],
          timestamp: new Date().toISOString(),
        };

        controller.enqueue(encoder.encode(`event: update\ndata: ${JSON.stringify(updatePayload)}\n\n`));

        // If completed delivery, close stream after notification
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            try {
              controller.enqueue(encoder.encode(`event: completed\ndata: {"message":"Delivered"}\n\n`));
              controller.close();
            } catch {
              // ignore
            }
          }, 1000);
        }
      }, 3000);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
