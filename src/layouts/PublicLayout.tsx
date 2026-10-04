"use client";
import Link from "next/link";
import { useAppSelector } from "@/hooks/useAppSelector";
import SwiftLineLogo from "@/components/common/SwiftLineLogo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = useAppSelector((x) => x.settings);
  return (
    <>
      <header className="public-nav">
        <Link href="/" className="brand" aria-label="CourierFlow Home">
          <SwiftLineLogo variant="full" theme="light" height={38} />
        </Link>
        <nav>
          <Link href="/tracking">Track shipment</Link>
          <Link className="button small" href="/login">
            Portal login
          </Link>
        </nav>
      </header>
      {children}
      <footer>
        <div>
          <Link href="/" aria-label="CourierFlow Home" style={{ marginBottom: "6px" }}>
            <SwiftLineLogo variant="full" theme="light" height={32} />
          </Link>
          <span>{s.officeAddress}</span>
        </div>
        <div>
          <span>{s.supportPhone}</span>
          <span>{s.supportEmail}</span>
        </div>
      </footer>
    </>
  );
}
