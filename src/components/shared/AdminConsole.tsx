"use client";
import { FormEvent, useMemo, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  setShipmentStatus,
  updateShipment,
  addTrackingEvent,
} from "@/redux/slices/shipments/shipmentSlice";
import { updatePickup } from "@/redux/slices/pickups/pickupSlice";
import { addHub, deleteHub, updateHub } from "@/redux/slices/hubs/hubSlice";
import {
  addManifest,
  updateManifest,
} from "@/redux/slices/manifests/manifestSlice";
import { addRider, updateRider } from "@/redux/slices/riders/riderSlice";
import { updateMerchant } from "@/redux/slices/merchants/merchantSlice";
import { settleMerchant, updateCod } from "@/redux/slices/cod/codSlice";
import { addReturn, updateReturn } from "@/redux/slices/returns/returnSlice";
import { updateComplaint } from "@/redux/slices/complaints/complaintSlice";
import { addUser, updateUser } from "@/redux/slices/users/userSlice";
import { updateSettings } from "@/redux/slices/settings/settingsSlice";
import { useToast } from "@/components/common/ToastContext";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type {
  Hub,
  Manifest,
  Rider,
  Settings,
  Shipment,
  ShipmentStatus,
  User,
} from "@/lib/types";
import { shipmentStatuses } from "@/lib/types";
import type { RootState } from "@/redux/store";
const money = (n: number) => `PKR ${n.toLocaleString()}`;
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export default function AdminConsole({ section }: { section: string }) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const shipments = useAppSelector((s) => s.shipments);
  const pickups = useAppSelector((s) => s.pickups);
  const hubs = useAppSelector((s) => s.hubs);
  const manifests = useAppSelector((s) => s.manifests);
  const riders = useAppSelector((s) => s.riders);
  const merchants = useAppSelector((s) => s.merchants);
  const cod = useAppSelector((s) => s.cod);
  const returns = useAppSelector((s) => s.returns);
  const complaints = useAppSelector((s) => s.complaints);
  const users = useAppSelector((s) => s.users);
  const settings = useAppSelector((s) => s.settings);

  const state = useMemo(
    () => ({
      auth,
      shipments,
      pickups,
      hubs,
      manifests,
      riders,
      merchants,
      cod,
      returns,
      complaints,
      users,
      settings,
    }),
    [
      auth,
      shipments,
      pickups,
      hubs,
      manifests,
      riders,
      merchants,
      cod,
      returns,
      complaints,
      users,
      settings,
    ],
  );

  const { showToast } = useToast();
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const show = (x: string) => {
    setNotice(x);
    showToast(x);
    setTimeout(() => setNotice(""), 2500);
  };
  const merchantName = (id: string) =>
    state.merchants.find((x) => x.id === id)?.businessName || "—";
  const riderName = (id?: string) =>
    state.riders.find((x) => x.id === id)?.name || "—";
  const hubName = (id?: string) =>
    state.hubs.find((x) => x.id === id)?.name || "—";
  if (section === "dashboard")
    return (
      <Page
        title="Operations Dashboard"
        text="Live activity across the courier network."
      >
        <div className="metrics">
          <MetricCard label="Total Shipments" value={state.shipments.length} />
          <MetricCard label="Booked" value={count(state.shipments, "BOOKED")} />
          <MetricCard
            label="In Transit"
            value={count(state.shipments, "IN_TRANSIT")}
          />
          <MetricCard
            label="Out for Delivery"
            value={count(state.shipments, "OUT_FOR_DELIVERY")}
          />
          <MetricCard
            label="Delivered"
            value={count(state.shipments, "DELIVERED")}
          />
          <MetricCard
            label="Returned"
            value={count(state.shipments, "RETURNED_TO_ORIGIN")}
          />
          <MetricCard
            label="COD Pending"
            value={money(
              state.cod
                .filter((x) => x.settlementStatus === "Pending")
                .reduce((a, x) => a + x.amount, 0),
            )}
          />
        </div>
        <div className="split">
          <Panel title="Recent Shipments">
            <MiniShipments rows={state.shipments.slice(0, 6)} />
          </Panel>
          <Panel title="Pending Pickups">
            <SimpleRows
              headers={["Pickup", "Merchant", "Parcels", "Status"]}
              rows={state.pickups
                .filter((x) => x.status === "Pending")
                .map((x) => [
                  x.id.slice(0, 12),
                  merchantName(x.merchantId),
                  x.parcels,
                  <StatusBadge key="s" value={x.status} />,
                ])}
            />
          </Panel>
        </div>
        <div className="split">
          <Panel title="Active Riders">
            <SimpleRows
              headers={["Rider", "City", "Vehicle"]}
              rows={state.riders
                .filter((x) => x.status === "Active")
                .map((x) => [x.name, x.city, x.vehicleType])}
            />
          </Panel>
          <Panel title="Recent Delivery Activity">
            <SimpleRows
              headers={["Tracking", "Status", "Updated"]}
              rows={state.shipments
                .filter((x) =>
                  ["DELIVERED", "DELIVERY_FAILED", "OUT_FOR_DELIVERY"].includes(
                    x.status,
                  ),
                )
                .slice(0, 5)
                .map((x) => [
                  x.trackingNumber,
                  <StatusBadge key="s" value={x.status} />,
                  fmt(x.trackingEvents.at(-1)?.dateTime || x.createdAt),
                ])}
            />
          </Panel>
        </div>
      </Page>
    );
  if (section === "shipments") {
    const rows = state.shipments.filter(
      (x) =>
        (!search ||
          `${x.trackingNumber} ${x.receiverName} ${merchantName(x.merchantId)} ${x.destinationCity}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!filter || x.status === filter),
    );
    return (
      <Page
        title="Shipments"
        text="Assign operational resources and update tracking status."
      >
        {notice && <Notice text={notice} />}
        <div className="panel">
          <div className="toolbar">
            <input
              placeholder="Search tracking, merchant, receiver or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All statuses</option>
              {shipmentStatuses.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          {rows.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Merchant</th>
                    <th>Receiver</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>COD</th>
                    <th>Status</th>
                    <th>Assignments / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id}>
                      <td>{x.trackingNumber}</td>
                      <td>{merchantName(x.merchantId)}</td>
                      <td>{x.receiverName}</td>
                      <td>{x.originCity}</td>
                      <td>{x.destinationCity}</td>
                      <td>{money(x.codAmount)}</td>
                      <td>
                        <StatusBadge value={x.status} />
                      </td>
                      <td>
                        <div className="actions">
                          <select
                            aria-label="Status"
                            value={x.status}
                            onChange={(e) => {
                              const status = e.target.value as ShipmentStatus;
                              dispatch(
                                setShipmentStatus({
                                  id: x.id,
                                  status,
                                  location: x.destinationCity,
                                  note: `Status updated to ${status.replaceAll("_", " ")}`,
                                }),
                              );
                              if (status === "RTO_INITIATED")
                                dispatch(
                                  addReturn({
                                    id: `return-${x.id}`,
                                    shipmentId: x.id,
                                    merchantId: x.merchantId,
                                    reason: "Delivery unsuccessful",
                                    currentLocation: x.destinationCity,
                                    status: "RTO Initiated",
                                    date: new Date().toISOString(),
                                  }),
                                );
                              show("Shipment status updated.");
                            }}
                          >
                            {shipmentStatuses.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                          <select
                            aria-label="Origin hub"
                            value={x.originHubId || ""}
                            onChange={(e) => {
                              dispatch(
                                updateShipment({
                                  id: x.id,
                                  originHubId: e.target.value,
                                }),
                              );
                              show("Origin hub assigned.");
                            }}
                          >
                            <option value="">Origin hub</option>
                            {state.hubs
                              .filter((h) => h.status === "Active")
                              .map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                          </select>
                          <select
                            aria-label="Destination hub"
                            value={x.destinationHubId || ""}
                            onChange={(e) => {
                              dispatch(
                                updateShipment({
                                  id: x.id,
                                  destinationHubId: e.target.value,
                                }),
                              );
                              show("Destination hub assigned.");
                            }}
                          >
                            <option value="">Destination hub</option>
                            {state.hubs
                              .filter((h) => h.status === "Active")
                              .map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                          </select>
                          <select
                            aria-label="Rider"
                            value={x.riderId || ""}
                            onChange={(e) => {
                              dispatch(
                                updateShipment({
                                  id: x.id,
                                  riderId: e.target.value,
                                  status: "ASSIGNED_TO_RIDER",
                                }),
                              );
                              dispatch(
                                addTrackingEvent({
                                  id: x.id,
                                  event: {
                                    status: "ASSIGNED_TO_RIDER",
                                    location: x.destinationCity,
                                    dateTime: new Date().toISOString(),
                                    note: `Assigned to ${riderName(e.target.value)}`,
                                  },
                                }),
                              );
                              show("Rider assigned successfully.");
                            }}
                          >
                            <option value="">Assign rider</option>
                            {state.riders
                              .filter((r) => r.status === "Active")
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </Page>
    );
  }
  if (section === "pickups")
    return (
      <Page
        title="Pickups"
        text="Accept requests, assign riders and confirm collection."
      >
        {notice && <Notice text={notice} />}
        <Panel title="Pickup requests">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pickup #</th>
                  <th>Merchant</th>
                  <th>Address</th>
                  <th>Parcels</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Assigned Rider</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.pickups.map((x) => (
                  <tr key={x.id}>
                    <td>{x.id.slice(0, 14)}</td>
                    <td>{merchantName(x.merchantId)}</td>
                    <td>{x.pickupAddress}</td>
                    <td>{x.parcels}</td>
                    <td>{fmt(x.pickupDate)}</td>
                    <td>
                      <StatusBadge value={x.status} />
                    </td>
                    <td>
                      <select
                        value={x.riderId || ""}
                        onChange={(e) => {
                          dispatch(
                            updatePickup({
                              id: x.id,
                              riderId: e.target.value,
                              status: "Assigned",
                            }),
                          );
                          show("Rider assigned successfully.");
                        }}
                      >
                        <option value="">Assign rider</option>
                        {state.riders
                          .filter((r) => r.status === "Active")
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <div className="actions">
                        {x.status === "Pending" && (
                          <button
                            className="btn small"
                            onClick={() => {
                              dispatch(
                                updatePickup({ id: x.id, status: "Accepted" }),
                              );
                              show("Pickup accepted.");
                            }}
                          >
                            Accept
                          </button>
                        )}
                        {!["Picked Up", "Cancelled"].includes(x.status) && (
                          <button
                            className="btn secondary small"
                            onClick={() => {
                              dispatch(
                                updatePickup({ id: x.id, status: "Picked Up" }),
                              );
                              x.shipmentIds.forEach((id) =>
                                dispatch(
                                  setShipmentStatus({
                                    id,
                                    status: "PICKED_UP",
                                    location: x.pickupAddress,
                                    note: "Picked up by courier",
                                  }),
                                ),
                              );
                              show("Pickup marked as collected.");
                            }}
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {!["Picked Up", "Cancelled"].includes(x.status) && (
                          <button
                            className="btn danger small"
                            onClick={() =>
                              confirm("Cancel pickup?") &&
                              dispatch(
                                updatePickup({ id: x.id, status: "Cancelled" }),
                              )
                            }
                          >
                            Cancel
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
      </Page>
    );
  if (section === "hubs")
    return (
      <HubModule
        hubs={state.hubs}
        linkedIds={
          state.shipments
            .flatMap((x) => [x.originHubId, x.destinationHubId])
            .filter(Boolean) as string[]
        }
        onAdd={(x) => {
          dispatch(addHub(x));
          show("Hub added.");
        }}
        onUpdate={(x) => {
          dispatch(updateHub(x));
          show("Hub updated.");
        }}
        onDelete={(id) => {
          dispatch(deleteHub(id));
          show("Hub deleted.");
        }}
        notice={notice}
      />
    );
  if (section === "manifests")
    return (
      <ManifestModule
        manifests={state.manifests}
        hubs={state.hubs}
        shipments={state.shipments}
        onAdd={(x) => {
          dispatch(addManifest(x));
          x.shipmentIds.forEach((id) =>
            dispatch(updateShipment({ id, manifestId: x.id })),
          );
          show("Manifest created.");
        }}
        onStatus={(m, status) => {
          dispatch(updateManifest({ id: m.id, status }));
          m.shipmentIds.forEach((id) =>
            dispatch(
              setShipmentStatus({
                id,
                status:
                  status === "Dispatched"
                    ? "IN_TRANSIT"
                    : "RECEIVED_AT_DESTINATION_HUB",
                location: hubName(
                  status === "Dispatched" ? m.originHubId : m.destinationHubId,
                ),
                note: `Manifest ${status.toLowerCase()}`,
              }),
            ),
          );
          show(`Manifest ${status.toLowerCase()}.`);
        }}
        notice={notice}
      />
    );
  if (section === "riders")
    return (
      <RiderModule
        riders={state.riders}
        hubs={state.hubs}
        onAdd={(x) => {
          dispatch(addRider(x));
          show("Rider added.");
        }}
        onUpdate={(x) => {
          dispatch(updateRider(x));
          show("Rider updated.");
        }}
        notice={notice}
      />
    );
  if (section === "merchants")
    return (
      <Page
        title="Merchants"
        text="Manage merchant accounts and calculated performance."
      >
        {notice && <Notice text={notice} />}
        <Panel title="Merchant accounts">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Total Shipments</th>
                  <th>Delivered</th>
                  <th>Returned</th>
                  <th>Pending COD</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state.merchants.map((m) => {
                  const ms = state.shipments.filter(
                    (x) => x.merchantId === m.id,
                  );
                  return (
                    <tr key={m.id}>
                      <td>{m.businessName}</td>
                      <td>
                        {m.contactPerson}
                        <br />
                        <span className="muted">{m.email}</span>
                      </td>
                      <td>{m.city}</td>
                      <td>
                        <StatusBadge value={m.status} />
                      </td>
                      <td>{ms.length}</td>
                      <td>
                        {ms.filter((x) => x.status === "DELIVERED").length}
                      </td>
                      <td>
                        {
                          ms.filter((x) => x.status === "RETURNED_TO_ORIGIN")
                            .length
                        }
                      </td>
                      <td>
                        {money(
                          state.cod
                            .filter(
                              (x) =>
                                x.merchantId === m.id &&
                                x.settlementStatus === "Pending",
                            )
                            .reduce((a, x) => a + x.amount, 0),
                        )}
                      </td>
                      <td>
                        <button
                          className="btn secondary small"
                          onClick={() => {
                            dispatch(
                              updateMerchant({
                                id: m.id,
                                status:
                                  m.status === "Active" ? "Inactive" : "Active",
                              }),
                            );
                            show("Merchant status updated.");
                          }}
                        >
                          {m.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </Page>
    );
  if (section === "cod")
    return (
      <Page
        title="COD Management"
        text="Collect, calculate and settle cash-on-delivery balances."
      >
        {notice && <Notice text={notice} />}
        <Panel title="COD records">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Merchant</th>
                  <th>COD Amount</th>
                  <th>Collection</th>
                  <th>Settlement</th>
                  <th>Charges</th>
                  <th>Net</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.cod.map((c) => {
                  const s = state.shipments.find((x) => x.id === c.shipmentId);
                  return (
                    <tr key={c.id}>
                      <td>{s?.trackingNumber}</td>
                      <td>{merchantName(c.merchantId)}</td>
                      <td>{money(c.amount)}</td>
                      <td>
                        <StatusBadge value={c.collectionStatus} />
                      </td>
                      <td>
                        <StatusBadge value={c.settlementStatus} />
                      </td>
                      <td>
                        {money(c.charges + c.returnCharges + c.otherCharges)}
                      </td>
                      <td>
                        {money(
                          c.amount -
                            c.charges -
                            c.returnCharges -
                            c.otherCharges,
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          {c.collectionStatus === "Pending" && (
                            <button
                              className="btn small"
                              onClick={() => {
                                dispatch(
                                  updateCod({
                                    id: c.id,
                                    collectionStatus: "Collected",
                                  }),
                                );
                                show("COD marked collected.");
                              }}
                            >
                              Mark Collected
                            </button>
                          )}
                          {c.collectionStatus === "Collected" &&
                            c.settlementStatus === "Pending" && (
                              <button
                                className="btn secondary small"
                                onClick={() => {
                                  dispatch(
                                    settleMerchant({
                                      merchantId: c.merchantId,
                                      settlementId: `STL-${Date.now().toString().slice(-6)}`,
                                    }),
                                  );
                                  show("Settlement created successfully.");
                                }}
                              >
                                Create Settlement
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </Page>
    );
  if (section === "returns")
    return (
      <Page
        title="Returns / RTO"
        text="Move failed deliveries through return to origin."
      >
        {notice && <Notice text={notice} />}
        <Panel title="Return records">
          {state.returns.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Merchant</th>
                    <th>Receiver</th>
                    <th>Reason</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.returns.map((r) => {
                    const s = state.shipments.find(
                      (x) => x.id === r.shipmentId,
                    );
                    return (
                      <tr key={r.id}>
                        <td>{s?.trackingNumber}</td>
                        <td>{merchantName(r.merchantId)}</td>
                        <td>{s?.receiverName}</td>
                        <td>{r.reason}</td>
                        <td>{r.currentLocation}</td>
                        <td>
                          <StatusBadge value={r.status} />
                        </td>
                        <td>{fmt(r.date)}</td>
                        <td>
                          <select
                            value={r.status}
                            onChange={(e) => {
                              const rs = e.target.value as typeof r.status;
                              const ss =
                                rs === "RTO Initiated"
                                  ? "RTO_INITIATED"
                                  : rs === "RTO In Transit"
                                    ? "RTO_IN_TRANSIT"
                                    : "RETURNED_TO_ORIGIN";
                              dispatch(updateReturn({ id: r.id, status: rs }));
                              dispatch(
                                setShipmentStatus({
                                  id: r.shipmentId,
                                  status: ss,
                                  location: r.currentLocation,
                                  note: rs,
                                }),
                              );
                              show("Return status updated.");
                            }}
                          >
                            <option>RTO Initiated</option>
                            <option>RTO In Transit</option>
                            <option>Returned to Origin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No RTO records." />
          )}
        </Panel>
      </Page>
    );
  if (section === "complaints")
    return (
      <Page title="Complaints" text="Track shipment issues through resolution.">
        {notice && <Notice text={notice} />}
        <Panel title="Complaint records">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tracking #</th>
                  <th>Merchant</th>
                  <th>Issue</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {state.complaints.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.trackingNumber}</td>
                    <td>{merchantName(c.merchantId)}</td>
                    <td>{c.issueType}</td>
                    <td>{c.description}</td>
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => {
                          dispatch(
                            updateComplaint({
                              id: c.id,
                              status: e.target.value as typeof c.status,
                            }),
                          );
                          show("Complaint status updated.");
                        }}
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                      </select>
                    </td>
                    <td>{fmt(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Page>
    );
  if (section === "users")
    return (
      <UserModule
        users={state.users}
        onAdd={(x) => {
          dispatch(addUser(x));
          show("User added.");
        }}
        onUpdate={(x) => {
          dispatch(updateUser(x));
          show("User status updated.");
        }}
        notice={notice}
      />
    );
  if (section === "reports") return <Reports state={state} />;
  return (
    <SettingsModule
      settings={state.settings}
      onSave={(x) => {
        dispatch(updateSettings(x));
        show("Company settings updated across all portals.");
      }}
      notice={notice}
    />
  );
}
function count(rows: Shipment[], status: ShipmentStatus) {
  return rows.filter((x) => x.status === status).length;
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
function Notice({ text }: { text: string }) {
  return <div className="notice">{text}</div>;
}
function SimpleRows({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return rows.length ? (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {headers.map((x) => (
              <th key={x}>{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((x, j) => (
                <td key={j}>{x}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <EmptyState />
  );
}
function MiniShipments({ rows }: { rows: Shipment[] }) {
  return (
    <SimpleRows
      headers={["Tracking", "Destination", "Status"]}
      rows={rows.map((x) => [
        x.trackingNumber,
        x.destinationCity,
        <StatusBadge key="s" value={x.status} />,
      ])}
    />
  );
}
function HubModule({
  hubs,
  linkedIds,
  onAdd,
  onUpdate,
  onDelete,
  notice,
}: {
  hubs: Hub[];
  linkedIds: string[];
  onAdd: (x: Hub) => void;
  onUpdate: (x: Partial<Hub> & { id: string }) => void;
  onDelete: (id: string) => void;
  notice: string;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onAdd({
      id: `hub-${crypto.randomUUID()}`,
      name: String(f.get("name")),
      city: String(f.get("city")),
      address: String(f.get("address")),
      contactNumber: String(f.get("contact")),
      status: "Active",
    });
    e.currentTarget.reset();
  };
  return (
    <Page
      title="Hubs"
      text="Manage active courier sorting and distribution locations."
    >
      {notice && <Notice text={notice} />}
      <div className="split">
        <form className="panel panel-body" onSubmit={submit}>
          <h2>Add Hub</h2>
          {[
            ["Hub Name", "name"],
            ["City", "city"],
            ["Address", "address"],
            ["Contact Number", "contact"],
          ].map(([l, n]) => (
            <div className="field" key={n}>
              <label>{l}</label>
              <input name={n} required />
            </div>
          ))}
          <div className="form-actions">
            <button className="btn">Add hub</button>
          </div>
        </form>
        <Panel title="Hub records">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Hub</th>
                  <th>City</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hubs.map((h) => (
                  <tr key={h.id}>
                    <td>
                      {h.name}
                      <br />
                      <span className="muted">{h.address}</span>
                    </td>
                    <td>{h.city}</td>
                    <td>{h.contactNumber}</td>
                    <td>
                      <StatusBadge value={h.status} />
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn secondary small"
                          onClick={() =>
                            onUpdate({
                              id: h.id,
                              status:
                                h.status === "Active" ? "Inactive" : "Active",
                            })
                          }
                        >
                          {h.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        {!linkedIds.includes(h.id) && (
                          <button
                            className="btn danger small"
                            onClick={() =>
                              confirm("Delete this hub?") && onDelete(h.id)
                            }
                          >
                            Delete
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
      </div>
    </Page>
  );
}
function ManifestModule({
  manifests,
  hubs,
  shipments,
  onAdd,
  onStatus,
  notice,
}: {
  manifests: Manifest[];
  hubs: Hub[];
  shipments: Shipment[];
  onAdd: (x: Manifest) => void;
  onStatus: (x: Manifest, s: "Dispatched" | "Received") => void;
  notice: string;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ids = f.getAll("shipmentIds") as string[];
    if (!ids.length) return alert("Select at least one shipment.");
    onAdd({
      id: `manifest-${crypto.randomUUID()}`,
      number: String(f.get("number")),
      originHubId: String(f.get("origin")),
      destinationHubId: String(f.get("destination")),
      shipmentIds: ids,
      transportType: String(f.get("transport")) as Manifest["transportType"],
      status: "Created",
      createdAt: new Date().toISOString(),
    });
    e.currentTarget.reset();
  };
  return (
    <Page
      title="Manifests"
      text="Group shipments for controlled movement between hubs."
    >
      {notice && <Notice text={notice} />}
      <form className="panel panel-body" onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label>Manifest Number</label>
            <input
              name="number"
              defaultValue={`MNF-${Date.now().toString().slice(-5)}`}
              required
            />
          </div>
          <div className="field">
            <label>Transport Type</label>
            <select name="transport">
              <option>Van</option>
              <option>Truck</option>
              <option>Air</option>
            </select>
          </div>
          <div className="field">
            <label>Origin Hub</label>
            <select name="origin" required>
              <option value="">Select</option>
              {hubs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Destination Hub</label>
            <select name="destination" required>
              <option value="">Select</option>
              {hubs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label>Shipment Selection</label>
            <div className="checkbox-list">
              {shipments
                .filter((x) =>
                  ["PICKED_UP", "RECEIVED_AT_ORIGIN_HUB"].includes(x.status),
                )
                .map((x) => (
                  <label key={x.id}>
                    <input type="checkbox" name="shipmentIds" value={x.id} />
                    <span>
                      {x.trackingNumber} — {x.destinationCity}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn">Create manifest</button>
        </div>
      </form>
      <Panel title="Manifest records">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Manifest</th>
                <th>Route</th>
                <th>Shipments</th>
                <th>Transport</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {manifests.map((m) => (
                <tr key={m.id}>
                  <td>{m.number}</td>
                  <td>
                    {hubs.find((x) => x.id === m.originHubId)?.city} →{" "}
                    {hubs.find((x) => x.id === m.destinationHubId)?.city}
                  </td>
                  <td>{m.shipmentIds.length}</td>
                  <td>{m.transportType}</td>
                  <td>
                    <StatusBadge value={m.status} />
                  </td>
                  <td>
                    {m.status === "Created" ? (
                      <button
                        className="btn small"
                        onClick={() => onStatus(m, "Dispatched")}
                      >
                        Dispatch
                      </button>
                    ) : m.status === "Dispatched" ? (
                      <button
                        className="btn small"
                        onClick={() => onStatus(m, "Received")}
                      >
                        Receive
                      </button>
                    ) : (
                      "Completed"
                    )}
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
function RiderModule({
  riders,
  hubs,
  onAdd,
  onUpdate,
  notice,
}: {
  riders: Rider[];
  hubs: Hub[];
  onAdd: (x: Rider) => void;
  onUpdate: (x: Partial<Rider> & { id: string }) => void;
  notice: string;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onAdd({
      id: `rider-${crypto.randomUUID()}`,
      name: String(f.get("name")),
      phone: String(f.get("phone")),
      city: String(f.get("city")),
      hubId: String(f.get("hubId")),
      vehicleType: String(f.get("vehicle")),
      status: "Active",
    });
    e.currentTarget.reset();
  };
  return (
    <Page title="Riders" text="Manage pickup and delivery field staff.">
      {notice && <Notice text={notice} />}
      <div className="split">
        <form className="panel panel-body" onSubmit={submit}>
          <h2>Add Rider</h2>
          {[
            ["Name", "name"],
            ["Phone", "phone"],
            ["City", "city"],
            ["Vehicle Type", "vehicle"],
          ].map(([l, n]) => (
            <div className="field" key={n}>
              <label>{l}</label>
              <input name={n} required />
            </div>
          ))}
          <div className="field">
            <label>Assigned Hub</label>
            <select name="hubId" required>
              <option value="">Select</option>
              {hubs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn">Add rider</button>
          </div>
        </form>
        <Panel title="Rider records">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Hub</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.phone}</td>
                    <td>{r.city}</td>
                    <td>{hubs.find((x) => x.id === r.hubId)?.name}</td>
                    <td>{r.vehicleType}</td>
                    <td>
                      <StatusBadge value={r.status} />
                    </td>
                    <td>
                      <button
                        className="btn secondary small"
                        onClick={() =>
                          onUpdate({
                            id: r.id,
                            status:
                              r.status === "Active" ? "Inactive" : "Active",
                          })
                        }
                      >
                        {r.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </Page>
  );
}
function UserModule({
  users,
  onAdd,
  onUpdate,
  notice,
}: {
  users: User[];
  onAdd: (x: User) => void;
  onUpdate: (x: Partial<User> & { id: string }) => void;
  notice: string;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onAdd({
      id: `user-${crypto.randomUUID()}`,
      name: String(f.get("name")),
      email: String(f.get("email")),
      role: String(f.get("role")) as User["role"],
      status: "Active",
      password: "demo123",
    });
    e.currentTarget.reset();
  };
  return (
    <Page
      title="Users"
      text="Manage internal operational users with simple roles."
    >
      {notice && <Notice text={notice} />}
      <div className="split">
        <form className="panel panel-body" onSubmit={submit}>
          <h2>Add internal user</h2>
          <div className="field">
            <label>Name</label>
            <input name="name" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <div className="field">
            <label>Role</label>
            <select name="role">
              <option>Super Admin</option>
              <option>Operations</option>
              <option>Hub Manager</option>
              <option>Finance</option>
              <option>Customer Support</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn">Add user</button>
          </div>
        </form>
        <Panel title="Internal users">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <StatusBadge value={u.status} />
                    </td>
                    <td>
                      <button
                        className="btn secondary small"
                        onClick={() =>
                          onUpdate({
                            id: u.id,
                            status:
                              u.status === "Active" ? "Inactive" : "Active",
                          })
                        }
                      >
                        {u.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </Page>
  );
}
function Reports({ state }: { state: RootState }) {
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const rows = state.shipments.filter(
    (x) =>
      (!status || x.status === status) && (!city || x.destinationCity === city),
  );
  return (
    <Page
      title="Reports"
      text="Operational summaries for shipments, delivery, RTO, COD, merchants, riders and hubs."
    >
      <div className="panel">
        <div className="toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {shipmentStatuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All destinations</option>
            {[...new Set(state.shipments.map((x) => x.destinationCity))].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </div>
      </div>
      <div className="metrics">
        <MetricCard label="Shipment Report" value={rows.length} />
        <MetricCard
          label="Delivery Report"
          value={rows.filter((x) => x.status === "DELIVERED").length}
        />
        <MetricCard
          label="RTO Report"
          value={
            rows.filter(
              (x) =>
                x.status.includes("RTO") || x.status === "RETURNED_TO_ORIGIN",
            ).length
          }
        />
        <MetricCard
          label="COD Report"
          value={money(
            state.cod
              .filter((x) => x.collectionStatus === "Collected")
              .reduce((a, x) => a + x.amount, 0),
          )}
        />
        <MetricCard label="Merchant Report" value={state.merchants.length} />
        <MetricCard label="Rider Report" value={state.riders.length} />
        <MetricCard label="Hub Report" value={state.hubs.length} />
      </div>
      <Panel title="Filtered shipment report">
        <MiniShipments rows={rows} />
      </Panel>
    </Page>
  );
}
function SettingsModule({
  settings,
  onSave,
  notice,
}: {
  settings: Settings;
  onSave: (x: Partial<Settings>) => void;
  notice: string;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({
      companyName: String(f.get("companyName")),
      logo: String(f.get("logo")),
      supportPhone: String(f.get("supportPhone")),
      supportEmail: String(f.get("supportEmail")),
      officeAddress: String(f.get("officeAddress")),
      defaultCourierCharge: Number(f.get("defaultCourierCharge")),
      defaultReturnCharge: Number(f.get("defaultReturnCharge")),
      trackingPrefix: String(f.get("trackingPrefix")).toUpperCase(),
    });
  };
  return (
    <Page
      title="Settings"
      text="Changes update branding and operational defaults everywhere."
    >
      {notice && <Notice text={notice} />}
      <form className="panel panel-body" onSubmit={submit}>
        <div className="form-grid">
          {[
            ["Company Name", "companyName", settings.companyName, "text"],
            ["Logo / Initials", "logo", settings.logo, "text"],
            ["Support Phone", "supportPhone", settings.supportPhone, "tel"],
            ["Support Email", "supportEmail", settings.supportEmail, "email"],
            ["Office Address", "officeAddress", settings.officeAddress, "text"],
            [
              "Default Courier Charge",
              "defaultCourierCharge",
              settings.defaultCourierCharge,
              "number",
            ],
            [
              "Default Return Charge",
              "defaultReturnCharge",
              settings.defaultReturnCharge,
              "number",
            ],
            [
              "Tracking Prefix",
              "trackingPrefix",
              settings.trackingPrefix,
              "text",
            ],
          ].map(([l, n, v, t]) => (
            <div className="field" key={String(n)}>
              <label>{l}</label>
              <input
                name={String(n)}
                defaultValue={v}
                type={String(t)}
                required
              />
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button className="btn">Save settings</button>
        </div>
      </form>
    </Page>
  );
}
