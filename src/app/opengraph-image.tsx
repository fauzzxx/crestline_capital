import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Crestline Capital — Structured Bulk Real Estate Buying Network";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a0a0e 60%, #0a0a0a 100%)",
          padding: "72px",
          color: "#f5e9d4",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1a0a0e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(212,175,58,0.4)",
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#d4af3a",
              }}
            >
              CC
            </span>
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              color: "#d4af3a",
              fontWeight: 600,
            }}
          >
            CRESTLINE CAPITAL
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>
            Unlock Builder-Level Pricing Through Structured Bulk Buying
          </div>
          <div style={{ fontSize: 24, color: "#d4af3a", maxWidth: 900 }}>
            {"Hyderabad's private buyer network for curated residential capital pools."}
          </div>
        </div>
        <div style={{ fontSize: 18, color: "#8a7a55" }}>
          By invitation only · Member network · Confidential
        </div>
      </div>
    ),
    { ...size },
  );
}
