"use client";
import { FormEvent, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { updatePickup } from "@/redux/slices/pickups/pickupSlice";
import {
  setShipmentStatus,
  updateShipment,
} from "@/redux/slices/shipments/shipmentSlice";
import { updateCod } from "@/redux/slices/cod/codSlice";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/common/ToastContext";
import { LuX } from "react-icons/lu";
import type { Shipment } from "@/lib/types";
const money = (n: number) => `PKR ${n.toLocaleString()}`;
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export default function RiderConsole({ section }: { section: string }) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const { showToast } = useToast();
  const riderId = auth?.linkedId || "rider-1";
  const shipments = useAppSelector((s) => s.shipments).filter(
    (x) => x.riderId === riderId,
  );
  const pickups = useAppSelector((s) => s.pickups).filter(
    (x) => x.riderId === riderId,
  );
  const cod = useAppSelector((s) => s.cod);
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<{
    type: "deliver" | "fail";
    shipment: Shipment;
  } | null>(null);
  const show = (x: string) => {
    setNotice(x);
    showToast(x);
    setTimeout(() => setNotice(""), 2500);
  };
  const deliveryRows = shipments.filter((x) =>
    ["ASSIGNED_TO_RIDER", "OUT_FOR_DELIVERY", "DELIVERY_FAILED"].includes(
      x.status,
    ),
  );
  const history = shipments.filter((x) =>
    ["DELIVERED", "DELIVERY_FAILED", "RETURNED_TO_ORIGIN"].includes(x.status),
  );
  if (section === "dashboard")
    return (
      <Page
        title="Rider Dashboard"
        text="Today’s assigned field work and completed activity."
      >
        <div className="metrics">
          <MetricCard
            label="Today's Pickups"
            value={
              pickups.filter(
                (x) =>
                  x.pickupDate === new Date().toISOString().slice(0, 10) &&
                  x.status !== "Picked Up",
              ).length
            }
          />
          <MetricCard label="Today's Deliveries" value={deliveryRows.length} />
          <MetricCard
            label="Completed Deliveries"
            value={shipments.filter((x) => x.status === "DELIVERED").length}
          />
          <MetricCard
            label="Failed Deliveries"
            value={
              shipments.filter((x) => x.status === "DELIVERY_FAILED").length
            }
          />
          <MetricCard
            label="COD Collected"
            value={money(
              cod
                .filter(
                  (c) =>
                    shipments.some((s) => s.id === c.shipmentId) &&
                    c.collectionStatus === "Collected",
                )
                .reduce((a, x) => a + x.amount, 0),
            )}
          />
        </div>
        <Panel title="Current deliveries">
          <DeliveryTable
            rows={deliveryRows}
            onStart={(id) =>
              dispatch(
                setShipmentStatus({
                  id,
                  status: "OUT_FOR_DELIVERY",
                  location: "Delivery route",
                  note: "Rider started delivery",
                }),
              )
            }
            onDeliver={(x) => setAction({ type: "deliver", shipment: x })}
            onFail={(x) => setAction({ type: "fail", shipment: x })}
          />
        </Panel>
        {action && (
          <DeliveryModal
            action={action}
            close={() => setAction(null)}
            submit={(values) => {
              if (action.type === "deliver") {
                dispatch(
                  setShipmentStatus({
                    id: action.shipment.id,
                    status: "DELIVERED",
                    location: action.shipment.destinationCity,
                    note: `Delivered to ${values.recipientName}. ${values.note || ""}`,
                  }),
                );
                dispatch(
                  updateShipment({
                    id: action.shipment.id,
                    deliveryNote: values.note,
                  }),
                );
                const record = cod.find(
                  (x) => x.shipmentId === action.shipment.id,
                );
                if (record && values.codCollected)
                  dispatch(
                    updateCod({ id: record.id, collectionStatus: "Collected" }),
                  );
                show("Shipment marked as delivered.");
              } else {
                dispatch(
                  setShipmentStatus({
                    id: action.shipment.id,
                    status: "DELIVERY_FAILED",
                    location: action.shipment.destinationCity,
                    note: `${values.reason}. ${values.note || ""}`,
                  }),
                );
                show("Failed delivery recorded.");
              }
              setAction(null);
            }}
          />
        )}
      </Page>
    );
  if (section === "pickups")
    return (
      <Page
        title="Assigned Pickups"
        text="Start and complete merchant parcel collections."
      >
        {notice && <div className="notice">{notice}</div>}
        {pickups.length ? (
          <Panel title="Pickup assignments">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pickup #</th>
                    <th>Date</th>
                    <th>Address</th>
                    <th>Parcels</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.map((x) => (
                    <tr key={x.id}>
                      <td>{x.id.slice(0, 14)}</td>
                      <td>{fmt(x.pickupDate)}</td>
                      <td>{x.pickupAddress}</td>
                      <td>{x.parcels}</td>
                      <td>
                        {x.contactPerson}
                        <br />
                        {x.contactNumber}
                      </td>
                      <td>
                        <StatusBadge value={x.status} />
                      </td>
                      <td>
                        <div className="actions">
                          {["Assigned", "Accepted"].includes(x.status) && (
                            <button
                              className="btn secondary small"
                              onClick={() => {
                                dispatch(
                                  updatePickup({
                                    id: x.id,
                                    status: "Assigned",
                                  }),
                                );
                                show("Pickup started.");
                              }}
                            >
                              Start Pickup
                            </button>
                          )}
                          {x.status !== "Picked Up" &&
                            x.status !== "Cancelled" && (
                              <button
                                className="btn small"
                                onClick={() => {
                                  dispatch(
                                    updatePickup({
                                      id: x.id,
                                      status: "Picked Up",
                                    }),
                                  );
                                  x.shipmentIds.forEach((id) =>
                                    dispatch(
                                      setShipmentStatus({
                                        id,
                                        status: "PICKED_UP",
                                        location: x.pickupAddress,
                                        note: "Picked up by rider",
                                      }),
                                    ),
                                  );
                                  show("Pickup marked as collected.");
                                }}
                              >
                                Mark Picked Up
                              </button>
                            )}
                          {x.status !== "Picked Up" &&
                            x.status !== "Cancelled" && (
                              <button
                                className="btn danger small"
                                onClick={() => {
                                  dispatch(
                                    updatePickup({
                                      id: x.id,
                                      status: "Failed",
                                    }),
                                  );
                                  show("Pickup failure recorded.");
                                }}
                              >
                                Pickup Failed
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : (
          <EmptyState title="No assigned pickups." />
        )}
      </Page>
    );
  if (section === "deliveries")
    return (
      <Page
        title="Deliveries"
        text="Complete deliveries and record COD or failure reasons."
      >
        {notice && <div className="notice">{notice}</div>}
        <Panel title="Assigned deliveries">
          <DeliveryTable
            rows={deliveryRows}
            onStart={(id) => {
              dispatch(
                setShipmentStatus({
                  id,
                  status: "OUT_FOR_DELIVERY",
                  location: "Delivery route",
                  note: "Rider started delivery",
                }),
              );
              show("Delivery started.");
            }}
            onDeliver={(x) => setAction({ type: "deliver", shipment: x })}
            onFail={(x) => setAction({ type: "fail", shipment: x })}
          />
        </Panel>
        {action && (
          <DeliveryModal
            action={action}
            close={() => setAction(null)}
            submit={(values) => {
              if (action.type === "deliver") {
                dispatch(
                  setShipmentStatus({
                    id: action.shipment.id,
                    status: "DELIVERED",
                    location: action.shipment.destinationCity,
                    note: `Delivered to ${values.recipientName}. ${values.note || ""}`,
                  }),
                );
                const record = cod.find(
                  (x) => x.shipmentId === action.shipment.id,
                );
                if (record && values.codCollected)
                  dispatch(
                    updateCod({ id: record.id, collectionStatus: "Collected" }),
                  );
                show("Shipment marked as delivered.");
              } else {
                dispatch(
                  setShipmentStatus({
                    id: action.shipment.id,
                    status: "DELIVERY_FAILED",
                    location: action.shipment.destinationCity,
                    note: `${values.reason}. ${values.note || ""}`,
                  }),
                );
                show("Failed delivery recorded.");
              }
              setAction(null);
            }}
          />
        )}
      </Page>
    );
  return (
    <Page
      title="Delivery History"
      text="Completed, failed and returned delivery activity."
    >
      <Panel title="History">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking</th>
                <th>Receiver</th>
                <th>Destination</th>
                <th>COD</th>
                <th>Status</th>
                <th>Last update</th>
              </tr>
            </thead>
            <tbody>
              {history.map((x) => (
                <tr key={x.id}>
                  <td>{x.trackingNumber}</td>
                  <td>{x.receiverName}</td>
                  <td>{x.destinationCity}</td>
                  <td>{money(x.codAmount)}</td>
                  <td>
                    <StatusBadge value={x.status} />
                  </td>
                  <td>
                    {fmt(x.trackingEvents.at(-1)?.dateTime || x.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Page>
  );
}
function Page({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </div>
      {children}
    </>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
function DeliveryTable({
  rows,
  onStart,
  onDeliver,
  onFail,
}: {
  rows: Shipment[];
  onStart: (id: string) => void;
  onDeliver: (x: Shipment) => void;
  onFail: (x: Shipment) => void;
}) {
  return rows.length ? (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Tracking Number</th>
            <th>Receiver</th>
            <th>Phone</th>
            <th>Address</th>
            <th>COD Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td>{x.trackingNumber}</td>
              <td>{x.receiverName}</td>
              <td>{x.receiverPhone}</td>
              <td>
                {x.receiverAddress}, {x.destinationCity}
              </td>
              <td>{money(x.codAmount)}</td>
              <td>
                <StatusBadge value={x.status} />
              </td>
              <td>
                <div className="actions">
                  {x.status !== "OUT_FOR_DELIVERY" && (
                    <button
                      className="btn secondary small"
                      onClick={() => onStart(x.id)}
                    >
                      Start Delivery
                    </button>
                  )}
                  <button className="btn small" onClick={() => onDeliver(x)}>
                    Delivered
                  </button>
                  <button
                    className="btn danger small"
                    onClick={() => onFail(x)}
                  >
                    Failed
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <EmptyState title="No assigned deliveries." />
  );
}
function DeliveryModal({
  action,
  close,
  submit,
}: {
  action: { type: "deliver" | "fail"; shipment: Shipment };
  close: () => void;
  submit: (v: {
    recipientName: string;
    codCollected: boolean;
    reason: string;
    note: string;
  }) => void;
}) {
  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    submit({
      recipientName: String(f.get("recipientName") || ""),
      codCollected: f.get("codCollected") === "on",
      reason: String(f.get("reason") || ""),
      note: String(f.get("note") || ""),
    });
  };
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={send}>
        <div className="modal-head">
          <h2>
            {action.type === "deliver"
              ? "Complete delivery"
              : "Record failed delivery"}
          </h2>
          <button type="button" className="icon-btn" onClick={close}>
            <LuX size={18} />
          </button>
        </div>
        <div className="modal-body">
          {action.type === "deliver" ? (
            <>
              <div className="field">
                <label>Recipient Name</label>
                <input name="recipientName" required />
              </div>
              <label style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <input
                  style={{ width: "auto" }}
                  type="checkbox"
                  name="codCollected"
                  defaultChecked={action.shipment.codAmount > 0}
                />{" "}
                COD Collected ({money(action.shipment.codAmount)})
              </label>
            </>
          ) : (
            <div className="field">
              <label>Reason</label>
              <select name="reason" required>
                <option>Customer Unavailable</option>
                <option>Customer Refused</option>
                <option>Incorrect Address</option>
                <option>Phone Unreachable</option>
                <option>Reschedule Requested</option>
                <option>Other</option>
              </select>
            </div>
          )}
          <div className="field" style={{ marginTop: 16 }}>
            <label>Optional Note</label>
            <textarea name="note" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={close}>
              Cancel
            </button>
            <button className="btn">Save update</button>
          </div>
        </div>
      </form>
    </div>
  );
}
