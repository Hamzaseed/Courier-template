"use client";
import React from "react";
import NavIcon from "@/components/common/NavIcons";

function getIconName(label: string, customIcon?: string): string {
  if (customIcon) return customIcon;
  const l = label.toLowerCase();
  if (l.includes("shipment") || l.includes("booked") || l.includes("transit") || l.includes("order")) return "shipments";
  if (l.includes("pickup")) return "pickups";
  if (l.includes("delivery") || l.includes("deliveries") || l.includes("delivered")) return "deliveries";
  if (l.includes("cod") || l.includes("revenue") || l.includes("collection") || l.includes("settle") || l.includes("amount") || l.includes("balance") || l.includes("payment") || l.includes("cost") || l.includes("fee")) return "cod";
  if (l.includes("return")) return "returns";
  if (l.includes("complaint")) return "complaints";
  if (l.includes("hub")) return "hubs";
  if (l.includes("rider")) return "riders";
  if (l.includes("merchant")) return "merchants";
  if (l.includes("user")) return "users";
  if (l.includes("manifest")) return "manifests";
  if (l.includes("invoice")) return "invoices";
  if (l.includes("report")) return "reports";
  return "dashboard";
}

export default function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: string;
}) {
  const iconName = getIconName(label, icon);
  return (
    <div className="metric">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{label}</span>
        <NavIcon name={iconName} size={20} className="metric-icon" />
      </div>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
