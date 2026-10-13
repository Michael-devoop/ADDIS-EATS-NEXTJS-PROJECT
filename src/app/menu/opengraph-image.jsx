import { ImageResponse } from "next/og";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export const alt = "Addis Eats Full Menu Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let imageSrc = null;
  try {
    const fullPath = path.join(process.cwd(), "public", "images", "addis-eats-og.jpg");
    const buffer = await fs.readFile(fullPath);
    imageSrc = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    imageSrc = null;
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
        {/* Left Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: "56%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                backgroundColor: "#e39a32",
                color: "#111215",
                fontWeight: 800,
                fontSize: 16,
                padding: "6px 14px",
                borderRadius: "6px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Addis Eats
            </span>
            <span
              style={{
                color: "#9ca3af",
                fontSize: 16,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Authentic Restaurant & Cafe
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h1
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.15,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              Explore Our Authentic Menu
            </h1>
            <p
              style={{
                fontSize: 22,
                color: "#d1d5db",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              From savory Kitfo and sizzling Tibs to vegetarian Beyaynetu, freshly roasted coffee, and house desserts.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              borderTop: "1px solid #27272a",
              paddingTop: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: 16, color: "#10b981", fontWeight: 700 }}>
                40+ Fresh Dishes
              </span>
            </div>
            <span style={{ fontSize: 16, color: "#6b7280" }}>|</span>
            <span style={{ fontSize: 16, color: "#e39a32", fontWeight: 600 }}>
              Order Online for Fast Delivery
            </span>
          </div>
        </div>

        {/* Right Image */}
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
              alt="Addis Eats Menu"
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
              Addis Eats Menu
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
