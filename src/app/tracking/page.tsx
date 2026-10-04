"use client";
import { FormEvent, useEffect, useState } from "react";
import PublicLayout from "@/layouts/PublicLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAppSelector } from "@/hooks/useAppSelector";
import type { Shipment } from "@/lib/types";
export default function Tracking() {
  const shipments = useAppSelector((s) => s.shipments);
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<Shipment | null | undefined>(undefined);
  const search = (value: string) =>
    setResult(
      shipments.find(
        (x) => x.trackingNumber.toLowerCase() === value.trim().toLowerCase(),
      ) || null,
    );
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("number");
    if (q) {
      setNumber(q);
      search(q);
    }
  }, [shipments]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    search(number);
  };
  return (
    <PublicLayout>
      <div className="tracking-wrap">
        <div className="tracking-card">
          <h1>Track your shipment</h1>
          <p className="muted">
            Live status from the shared operations record.
          </p>
          <form className="inline-form" onSubmit={submit}>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="PKX-5839201"
              required
            />
            <button className="btn">Track</button>
          </form>
          {result === null && (
            <div className="notice text-danger">
              No shipment found for this tracking number.
            </div>
          )}
          {result && (
            <div className="public-result">
              <div className="detail-grid">
                <div>
                  <span>Tracking Number</span>
                  <strong>{result.trackingNumber}</strong>
                </div>
                <div>
                  <span>Current Status</span>
                  <StatusBadge value={result.status} />
                </div>
                <div>
                  <span>Route</span>
                  <strong>
                    {result.originCity} → {result.destinationCity}
                  </strong>
                </div>
              </div>
              <h3>Shipment timeline</h3>
              <ol className="timeline">
                {[...result.trackingEvents].reverse().map((event, i) => (
                  <li key={`${event.dateTime}-${i}`}>
                    <strong>{event.status.replaceAll("_", " ")}</strong>
                    <span>
                      {event.location} ·{" "}
                      {new Date(event.dateTime).toLocaleString("en-PK", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <span>{event.note}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
