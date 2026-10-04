"use client";

import React from "react";
import { IconType } from "react-icons";
import {
  LuLayoutDashboard,
  LuPackage,
  LuPackagePlus,
  LuTruck,
  LuBuilding2,
  LuClipboardList,
  LuBike,
  LuStore,
  LuBanknote,
  LuRotateCcw,
  LuReceipt,
  LuCircleAlert,
  LuUsers,
  LuChartColumn,
  LuSettings,
  LuMapPin,
  LuHistory,
  LuLogIn,
  LuPuzzle,
  LuLogOut,
  LuCircleHelp,
} from "react-icons/lu";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, IconType> = {
  dashboard: LuLayoutDashboard,
  shipments: LuPackage,
  "create shipment": LuPackagePlus,
  pickups: LuTruck,
  hubs: LuBuilding2,
  manifests: LuClipboardList,
  riders: LuBike,
  merchants: LuStore,
  cod: LuBanknote,
  returns: LuRotateCcw,
  invoices: LuReceipt,
  complaints: LuCircleAlert,
  users: LuUsers,
  reports: LuChartColumn,
  settings: LuSettings,
  deliveries: LuMapPin,
  history: LuHistory,
  "sign in": LuLogIn,
  signin: LuLogIn,
  login: LuLogIn,
  integrations: LuPuzzle,
  integration: LuPuzzle,
  "sign out": LuLogOut,
  logout: LuLogOut,
};

export default function NavIcon({ name, className = "", size = 18 }: IconProps) {
  const IconComponent = iconMap[name.toLowerCase()] || LuCircleHelp;
  return <IconComponent size={size} className={`nav-icon ${className}`} />;
}

