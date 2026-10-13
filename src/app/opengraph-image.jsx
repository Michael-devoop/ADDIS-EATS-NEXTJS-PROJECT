import { ImageResponse } from "next/og";
import fs from "fs/promises";
import path from "path";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

export const alt = "Addis Eats — Authentic Ethiopian Restaurant & Cafe";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let imageSrc = null;
  const siteUrl = getSiteUrl();

  // Try local file first, then fallback to CDN URL
  try {
    const fullPath = path.join(process.cwd(), "public", "images", "addis-eats-og.jpg");
    const buffer = await fs.readFile(fullPath);
    imageSrc = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    try {
      const res = await fetch(`${siteUrl}/images/addis-eats-og.jpg`);
      if (res.ok) {
        const arr = await res.arrayBuffer();
        const buffer = Buffer.from(arr);
        imageSrc = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }
    } catch {
      imageSrc = null;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#111215",
          padding: "50px 60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left Column Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: "56%",
          }}
        >
          {/* Brand Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                backgroundColor: "#e39a32",
                color: "#111215",
                fontWeight: 900,
                fontSize: 16,
                padding: "6px 16px",
                borderRadius: "8px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Addis Eats
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 15,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Authentic Ethiopian Restaurant & Cafe
            </span>
          </div>

          {/* Main Title & Value Prop */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h1
              style={{
                fontSize: 50,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              We Don&apos;t Just Cook, We Create Emotions
            </h1>
            <p
              style={{
                fontSize: 21,
                color: "#d1d5db",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Savory Kitfo, sizzling Tibs, vegetarian Beyaynetu, and freshly roasted Ethiopian coffee. Delivered fresh to your doorstep.
            </p>
          </div>

          {/* Feature Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              borderTop: "1px solid #27272a",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(227, 154, 50, 0.15)",
                border: "1px solid #e39a32",
                borderRadius: "8px",
                padding: "6px 14px",
                color: "#e39a32",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              🇪🇹 100% Authentic
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid #10b981",
                borderRadius: "8px",
                padding: "6px 14px",
                color: "#10b981",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              🛵 Fast 30-Min Delivery
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                padding: "6px 14px",
                color: "#f3f4f6",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              💳 Telebirr & Cash
            </div>
          </div>
        </div>

        {/* Right Column Image Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40%",
            height: "100%",
          }}
        >
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt="Addis Eats Landing Preview"
              width={440}
              height={440}
              style={{
                objectFit: "cover",
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
                border: "3px solid #27272a",
              }}
            />
          ) : (
            <div
              style={{
                width: 440,
                height: 440,
                borderRadius: "24px",
                backgroundColor: "#27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#e39a32",
                fontSize: 36,
                fontWeight: "bold",
              }}
            >
              Addis Eats
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
