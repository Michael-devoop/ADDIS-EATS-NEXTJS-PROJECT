import dynamic from "next/dynamic";

/**
 * Server/Client Boundary Wrapper for Leaflet Map
 * Disables SSR to prevent Leaflet "window is not defined" hydration errors.
 */
const DeliveryMapClient = dynamic(() => import("./DeliveryMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-[440px] w-full rounded-3xl bg-gray-50 flex flex-col items-center justify-center border border-gray-200/80 p-6 text-center animate-pulse">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[#f95738] mb-3 shadow-inner shadow-orange-200">
        <span className="h-6 w-6 rounded-full border-2 border-orange-300 border-t-[#f95738] animate-spin" />
      </div>
      <p className="text-xs font-black uppercase tracking-wider text-[#111827]">
        Loading Addis Ababa Delivery Map
      </p>
      <p className="text-[11px] text-[#6b7280] mt-1">
        Establishing live telemetry connection with courier GPS...
      </p>
    </div>
  ),
});

export default function DeliveryMap(props) {
  return <DeliveryMapClient {...props} />;
}
