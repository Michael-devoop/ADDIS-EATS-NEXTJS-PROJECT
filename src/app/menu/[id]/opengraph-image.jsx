import { ImageResponse } from "next/og";
import { getDish } from "@/data/menuData";
import { formatETB } from "@/lib/format";
import { getSiteUrl } from "@/lib/siteUrl";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export const alt = "Addis Eats Dish Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }) {
  const { id } = await params;
  const item = await getDish(id);

  if (!item) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111215",
            color: "#ffffff",
            fontSize: 48,
            fontWeight: "bold",
          }}
        >
          Addis Eats - Dish Not Found
        </div>
      ),
      { ...size }
    );
  }

  // Read local dish image from public/ or fallback to site URL
  let imageSrc = null;
  const cleanPath = item.image ? item.image.replace(/^\//, "") : "";
  try {
    const fullPath = path.join(process.cwd(), "public", cleanPath);
    const buffer = await fs.readFile(fullPath);
    const ext = path.extname(cleanPath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : "image/jpeg";
    imageSrc = `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    try {
      const siteUrl = getSiteUrl();
      const res = await fetch(`${siteUrl}/${cleanPath}`);
      if (res.ok) {
        const arr = await res.arrayBuffer();
        const buffer = Buffer.from(arr);
        const ext = path.extname(cleanPath).toLowerCase();
        const mime = ext === ".png" ? "image/png" : "image/jpeg";
        imageSrc = `data:${mime};base64,${buffer.toString("base64")}`;
      }
    } catch {
      imageSrc = null;
    }
  }

  const formattedPrice = formatETB(item.price);
  const categoryText = (item.categories || []).join(" | ").toUpperCase();

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
        {/* Left Content Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: "58%",
          }}
        >
          {/* Top Brand & Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
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
                {categoryText || "AUTHENTIC CUISINE"}
              </span>
            </div>
          </div>

          {/* Dish Title & Price */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h1
              style={{
                fontSize: 50,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.15,
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "-0.5px",
              }}
            >
              {item.name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(227, 154, 50, 0.15)",
                  border: "2px solid #e39a32",
                  borderRadius: "12px",
                  padding: "10px 22px",
                }}
              >
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    color: "#e39a32",
                  }}
                >
                  {formattedPrice}
                </span>
              </div>
              <span
                style={{
                  fontSize: 18,
                  color: "#10b981",
                  fontWeight: 600,
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  padding: "8px 14px",
                  borderRadius: "8px",
                }}
              >
                Freshly Prepared
              </span>
            </div>

            <p
              style={{
                fontSize: 20,
                color: "#9ca3af",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {item.desc || "Traditional Ethiopian recipe cooked with authentic spices."}
            </p>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              borderTop: "1px solid #27272a",
              paddingTop: "20px",
            }}
          >
            <span style={{ fontSize: 16, color: "#d1d5db" }}>
              Authentic Ethiopian Restaurant & Cafe
            </span>
            <span style={{ fontSize: 16, color: "#6b7280" }}>|</span>
            <span style={{ fontSize: 16, color: "#e39a32", fontWeight: 600 }}>
              Order Online for Delivery
            </span>
          </div>
        </div>

        {/* Right Image Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38%",
            height: "100%",
          }}
        >
          {imageSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt={item.name}
              width={420}
              height={420}
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
                width: 420,
                height: 420,
                borderRadius: "24px",
                backgroundColor: "#27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#e39a32",
                fontSize: 32,
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
