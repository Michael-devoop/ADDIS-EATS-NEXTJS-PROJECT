"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Addis Ababa Fallback Coordinates
const DEFAULT_RESTAURANT = [8.9954, 38.7892]; // Bole Medhanialem
const DEFAULT_DESTINATION = [9.0182, 38.7698]; // Kazanchis
const DEFAULT_COURIER = [9.0068, 38.7795]; // Midpoint on route

/**
 * Creates custom HTML div-icon with modern SVG pin styling
 */
function createCustomIcon({ bg = "#f95738", emoji = "🛵", pulse = false, size = 42 }) {
  const pulseHtml = pulse
    ? `<span class="absolute -inset-1.5 rounded-full bg-orange-500/30 animate-ping"></span>`
    : "";

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        ${pulseHtml}
        <div style="background-color: ${bg};" class="relative z-10 flex h-full w-full items-center justify-center rounded-2xl shadow-lg border-2 border-white text-lg">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Leaflet Client Component for Live Order Telemetry
 * - Shows Restaurant Origin, Live Moving Courier, and Customer Destination
 * - Updates courier position dynamically from SSE feed without re-rendering map
 */
export default function DeliveryMapClient({
  telemetry = null,
  order = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Determine positions
  const restaurantPos = telemetry?.restaurant
    ? [telemetry.restaurant.lat, telemetry.restaurant.lng]
    : DEFAULT_RESTAURANT;

  const destinationPos = telemetry?.destination
    ? [telemetry.destination.lat, telemetry.destination.lng]
    : DEFAULT_DESTINATION;

  const courierPos = telemetry?.courierPosition
    ? telemetry.courierPosition
    : DEFAULT_COURIER;

  const waypoints = telemetry?.routeWaypoints || [
    restaurantPos,
    courierPos,
    destinationPos,
  ];

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center between restaurant and destination
    const centerLat = (restaurantPos[0] + destinationPos[0]) / 2;
    const centerLng = (restaurantPos[1] + destinationPos[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // 1. Restaurant Marker
    const restaurantIcon = createCustomIcon({ bg: "#111827", emoji: "🏪", size: 38 });
    L.marker(restaurantPos, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup("<b>Addis Eats Kitchen</b><br>Bole Medhanialem Branch");

    // 2. Delivery Destination Marker
    const destIcon = createCustomIcon({ bg: "#10b981", emoji: "🏠", size: 38 });
    L.marker(destinationPos, { icon: destIcon })
      .addTo(map)
      .bindPopup(`<b>Delivery Destination</b><br>${order?.customer?.address || "Customer Location"}`);

    // 3. Route Polyline
    const routeLine = L.polyline(waypoints, {
      color: "#f95738",
      weight: 4,
      opacity: 0.85,
      dashArray: "8, 8",
      lineCap: "round",
    }).addTo(map);
    routePolylineRef.current = routeLine;

    // 4. Moving Courier Marker
    const courierIcon = createCustomIcon({ bg: "#f95738", emoji: "🛵", pulse: true, size: 44 });
    const courierMarker = L.marker(courierPos, { icon: courierIcon })
      .addTo(map)
      .bindPopup("<b>Kidus (Courier)</b><br>Live GPS Telemetry");
    courierMarkerRef.current = courierMarker;

    // Fit map bounds to show route
    const bounds = L.latLngBounds([restaurantPos, destinationPos, courierPos]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;
    setMapLoaded(true);

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Smoothly update courier marker when SSE telemetries arrive
  useEffect(() => {
    if (!courierMarkerRef.current || !telemetry?.courierPosition) return;

    const newPos = telemetry.courierPosition;
    courierMarkerRef.current.setLatLng(newPos);

    // Optionally gently pan map to follow courier if out of view
    if (mapInstanceRef.current && !mapInstanceRef.current.getBounds().contains(newPos)) {
      mapInstanceRef.current.panTo(newPos, { animate: true });
    }
  }, [telemetry?.courierPosition]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[420px] sm:h-[480px] bg-[#f8fafc] z-0"
        aria-label="Interactive Leaflet Map showing courier and delivery destination"
      />

      {/* Map Floating HUD Pill */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-[#111827] shadow-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Addis Ababa Live Dispatch</span>
        </span>
        <span className="bg-[#111827]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-semibold shadow-sm">
          🛵 Courier on Route
        </span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-200 shadow-md text-[11px] flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-bold text-gray-700">
          <span className="h-3 w-3 rounded-full bg-[#111827]" /> Kitchen
        </span>
        <span className="flex items-center gap-1.5 font-bold text-[#f95738]">
          <span className="h-3 w-3 rounded-full bg-[#f95738]" /> Courier
        </span>
        <span className="flex items-center gap-1.5 font-bold text-emerald-600">
          <span className="h-3 w-3 rounded-full bg-emerald-500" /> Destination
        </span>
      </div>
    </div>
  );
}
