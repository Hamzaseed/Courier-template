"use client";

import React from "react";

interface SwiftLineLogoProps {
  variant?: "full" | "mark";
  theme?: "light" | "dark";
  className?: string;
  height?: number | string;
}

export default function SwiftLineLogo({
  variant = "full",
  theme = "light",
  className = "",
  height = 36,
}: SwiftLineLogoProps) {
  const navyColor = theme === "dark" ? "#FFFFFF" : "#1E3147";
  const orangeColor = "#EE5922";
  const subtextColor = theme === "dark" ? "#94A3B8" : "#88939D";

  return (
    <div
      className={`swiftline-logo ${className}`}
      style={{ display: "inline-flex", alignItems: "center", height }}
    >
      <svg
        viewBox={variant === "full" ? "0 0 540 120" : "0 0 150 120"}
        height="100%"
        style={{ width: "auto", overflow: "visible" }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LOGO MARK */}
        <g id="swiftline-mark">
          {/* Top Navy Wing */}
          <path
            d="M 28 10 L 144 10 L 110 50 L 16 50 Z"
            fill={navyColor}
          />
          {/* Bottom Left Orange Arrow */}
          <path
            d="M 4 56 L 98 56 L 82 82 L 34 82 Z"
            fill={orangeColor}
          />
          {/* Bottom Right Navy Wedge */}
          <path
            d="M 106 56 L 90 82 L 38 82 Z"
            fill={navyColor}
          />
        </g>

        {/* LOGO TEXT (Full variant only) */}
        {variant === "full" && (
          <g id="swiftline-text">
            {/* Main Title: CourierFlow */}
            <text
              x="165"
              y="74"
              fill={navyColor}
              style={{
                fontFamily: "'Inter', 'Geist', 'Segoe UI', sans-serif",
                fontWeight: 800,
                fontSize: "66px",
                fontStyle: "italic",
                letterSpacing: "-0.03em",
              }}
            >
              Courier<tspan style={{ fontStyle: "normal", fontWeight: 700 }}>Flow</tspan>
            </text>

            {/* Subtitle: EXPRESS */}
            <text
              x="167"
              y="112"
              fill={subtextColor}
              style={{
                fontFamily: "'Inter', 'Geist', 'Segoe UI', sans-serif",
                fontWeight: 600,
                fontSize: "24px",
                letterSpacing: "0.52em",
              }}
            >
              EXPRESS
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
