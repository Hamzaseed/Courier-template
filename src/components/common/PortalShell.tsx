"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { logout } from "@/redux/slices/auth/authSlice";
import { LuMenu, LuX } from "react-icons/lu";
import SwiftLineLogo from "@/components/common/SwiftLineLogo";
import NavIcon from "@/components/common/NavIcons";

const links = {
  admin: [
    ["Dashboard", "/admin"],
    ["Shipments", "/admin/shipments"],
    ["Pickups", "/admin/pickups"],
    ["Hubs", "/admin/hubs"],
    ["Manifests", "/admin/manifests"],
    ["Riders", "/admin/riders"],
    ["Merchants", "/admin/merchants"],
    ["COD", "/admin/cod"],
    ["Returns", "/admin/returns"],
    ["Complaints", "/admin/complaints"],
    ["Users", "/admin/users"],
    ["Reports", "/admin/reports"],
    ["Settings", "/admin/settings"],
  ],
  merchant: [
    ["Dashboard", "/merchant"],
    ["Shipments", "/merchant/shipments"],
    ["Create Shipment", "/merchant/shipments/create"],
    ["Pickups", "/merchant/pickups"],
    ["Returns", "/merchant/returns"],
    ["COD", "/merchant/cod"],
    ["Invoices", "/merchant/invoices"],
    ["Integrations", "/merchant/integrations"],
    ["Reports", "/merchant/reports"],
    ["Settings", "/merchant/settings"],
  ],
  rider: [
    ["Dashboard", "/rider"],
    ["Pickups", "/rider/pickups"],
    ["Deliveries", "/rider/deliveries"],
    ["History", "/rider/history"],
  ],
};
export default function PortalShell({
  portal,
  children,
}: {
  portal: keyof typeof links;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const settings = useAppSelector((s) => s.settings);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const signOut = () => {
    dispatch(logout());
    router.push("/login");
  };
  return (
    <div className="portal-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <SwiftLineLogo variant="full" theme="dark" height={36} />
          </Link>
        </div>
        <nav>
          {links[portal].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={path === href ? "active" : ""}
            >
              <NavIcon name={label} size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button className="signout" onClick={signOut}>
          <NavIcon name="sign out" size={18} />
          <span>Sign out</span>
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <button
            className="menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <LuX size={20} /> : <LuMenu size={20} />}
          </button>
          <div className="topbar-user">
            <div className="user-avatar">
              <NavIcon name="users" size={18} />
            </div>
            <div className="topbar-user-info">
              <strong>{mounted ? (auth?.name || "Demo User") : "Demo User"}</strong>
              <span className="muted">
                {portal === "admin" ? "System Admin Portal" : `${portal[0].toUpperCase() + portal.slice(1)} Portal`}
              </span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
      {open && (
        <button
          className="scrim"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
    </div>
  );
}
