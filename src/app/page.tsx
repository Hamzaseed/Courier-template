"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layouts/PublicLayout";
import { useAppSelector } from "@/hooks/useAppSelector";
import NavIcon from "@/components/common/NavIcons";

export default function Home() {
  const s = useAppSelector((x) => x.settings);
  const [q, setQ] = useState("");
  const router = useRouter();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim())
      router.push(`/tracking?number=${encodeURIComponent(q.trim())}`);
  };
  return (
    <PublicLayout>
      <section className="hero">
        <div>
          <span className="eyebrow">Reliable nationwide logistics</span>
          <h1>Every parcel, handled with clarity.</h1>
          <p>
            {s.companyName} connects merchants, operations teams and riders in
            one reliable delivery network—from first pickup to final COD
            settlement.
          </p>
          <a href="/login" className="button">
            Open your portal
          </a>
        </div>
        <form className="track-box" onSubmit={submit}>
          <h2>Track a shipment</h2>
          <p className="muted">
            Enter the tracking number printed on your booking receipt.
          </p>
          <div className="inline-form">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`${s.trackingPrefix}-5839201`}
              required
            />
            <button className="btn">Track</button>
          </div>
        </form>
      </section>
      <section className="services">
        <span className="eyebrow">Courier services</span>
        <h2>Built for everyday delivery operations</h2>
        <div className="service-grid">
          <div className="service">
            <NavIcon name="shipments" size={28} className="service-icon" />
            <h3>Nationwide delivery</h3>
            <p>
              Connected hub operations and traceable movement between major
              Pakistani cities.
            </p>
          </div>
          <div className="service">
            <NavIcon name="cod" size={28} className="service-icon" />
            <h3>Cash on delivery</h3>
            <p>
              Clear collection records, charges and settlements for every
              delivered order.
            </p>
          </div>
          <div className="service">
            <NavIcon name="returns" size={28} className="service-icon" />
            <h3>Returns management</h3>
            <p>
              Complete delivery-failure and return-to-origin visibility for
              merchants.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
