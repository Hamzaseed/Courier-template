"use client";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  addShipment,
  cancelShipment,
  updateShipment,
} from "@/redux/slices/shipments/shipmentSlice";
import { addPickup, cancelPickup } from "@/redux/slices/pickups/pickupSlice";
import { updateMerchant } from "@/redux/slices/merchants/merchantSlice";
import { addCod } from "@/redux/slices/cod/codSlice";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/common/ToastContext";
import { LuX } from "react-icons/lu";
import type { CodRecord, Merchant, Pickup, Shipment } from "@/lib/types";
const money = (n: number) => `PKR ${n.toLocaleString()}`;
const date = (d: string) =>
  new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export default function MerchantConsole({ section }: { section: string }) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const { showToast } = useToast();
  const merchantId = auth?.linkedId || "merchant-1";
  const all = useAppSelector((s) => s.shipments);
  const shipments = all.filter((x) => x.merchantId === merchantId);
  const pickups = useAppSelector((s) => s.pickups).filter(
    (x) => x.merchantId === merchantId,
  );
  const returns = useAppSelector((s) => s.returns).filter(
    (x) => x.merchantId === merchantId,
  );
  const cod = useAppSelector((s) => s.cod).filter(
    (x) => x.merchantId === merchantId,
  );
  const merchant = useAppSelector((s) =>
    s.merchants.find((x) => x.id === merchantId),
  )!;
  const settings = useAppSelector((s) => s.settings);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const show = (m: string) => {
    showToast(m);
  };
  const filtered = useMemo(
    () =>
      shipments.filter(
        (x) =>
          (!search ||
            `${x.trackingNumber} ${x.receiverName} ${x.destinationCity}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (!status || x.status === status),
      ),
    [shipments, search, status],
  );
  if (section === "dashboard")
    return (
      <Page
        title="Dashboard"
        text="A live overview of your delivery operations."
      >
        <div className="metrics">
          <MetricCard label="Total Shipments" value={shipments.length} />
          <MetricCard
            label="In Transit"
            value={shipments.filter((x) => x.status === "IN_TRANSIT").length}
          />
          <MetricCard
            label="Delivered"
            value={shipments.filter((x) => x.status === "DELIVERED").length}
          />
          <MetricCard
            label="Returned"
            value={
              shipments.filter((x) => x.status === "RETURNED_TO_ORIGIN").length
            }
          />
          <MetricCard
            label="Pending COD"
            value={money(
              cod
                .filter((x) => x.settlementStatus === "Pending")
                .reduce((a, x) => a + x.amount, 0),
            )}
          />
        </div>
        <Panel title="Recent shipments">
          <ShipmentTable rows={shipments.slice(0, 5)} onView={setSelected} />
        </Panel>
        <Panel title="Recent COD settlements">
          <CodTable rows={cod.slice(0, 5)} />
        </Panel>
        {selected && (
          <ShipmentModal item={selected} close={() => setSelected(null)} />
        )}
      </Page>
    );
  if (section === "create")
    return (
      <CreateShipment
        merchantId={merchantId}
        prefix={settings.trackingPrefix}
        originCity={merchant.city}
        charge={settings.defaultCourierCharge}
        done={() => show("Shipment created successfully.")}
      />
    );
  if (section === "shipments")
    return (
      <Page
        title="Shipments"
        text="Search, review and manage your shipment bookings."
        action={
          <Link className="button" href="/merchant/shipments/create">
            Create shipment
          </Link>
        }
      >
        <div className="panel">
          <div className="toolbar">
            <input
              placeholder="Search tracking, receiver or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {[...new Set(shipments.map((x) => x.status))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <ShipmentTable
            rows={filtered}
            onView={setSelected}
            onEdit={(item) => setEditingShipment(item)}
            onCancel={(item) => {
              dispatch(cancelShipment(item.id));
              show("Shipment cancelled.");
            }}
          />
        </div>
        {selected && (
          <ShipmentModal item={selected} close={() => setSelected(null)} />
        )}
        {editingShipment && (
          <EditShipmentModal
            item={editingShipment}
            close={() => setEditingShipment(null)}
            onSave={(updated) => {
              dispatch(updateShipment(updated));
              show("Shipment updated successfully.");
            }}
          />
        )}
      </Page>
    );
  if (section === "pickups")
    return (
      <Pickups
        merchantId={merchantId}
        pickups={pickups}
        onCancel={(id) => {
          dispatch(cancelPickup(id));
          show("Pickup cancelled.");
        }}
        onCreated={() => show("Pickup request submitted.")}
      />
    );
  if (section === "returns")
    return (
      <Page
        title="Returns"
        text="Track shipments moving through the return-to-origin process."
      >
        <Panel title="Return shipments">
          {returns.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Receiver</th>
                    <th>Destination</th>
                    <th>Return Reason</th>
                    <th>Return Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r) => {
                    const s = shipments.find((x) => x.id === r.shipmentId);
                    return (
                      <tr key={r.id}>
                        <td>{s?.trackingNumber}</td>
                        <td>{s?.receiverName}</td>
                        <td>{s?.destinationCity}</td>
                        <td>{r.reason}</td>
                        <td>
                          <StatusBadge value={r.status} />
                        </td>
                        <td>{date(r.date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No returns found."
              text="RTO records will appear here automatically."
            />
          )}
        </Panel>
      </Page>
    );
  if (section === "cod")
    return (
      <Page
        title="COD"
        text="Collected amounts, charges and settlement status."
      >
        <div className="metrics">
          <MetricCard
            label="Collected COD"
            value={money(
              cod
                .filter((x) => x.collectionStatus === "Collected")
                .reduce((a, x) => a + x.amount, 0),
            )}
          />
          <MetricCard
            label="Pending COD"
            value={money(
              cod
                .filter((x) => x.collectionStatus === "Pending")
                .reduce((a, x) => a + x.amount, 0),
            )}
          />
          <MetricCard
            label="Settled COD"
            value={money(
              cod
                .filter((x) => x.settlementStatus === "Settled")
                .reduce((a, x) => a + x.amount, 0),
            )}
          />
          <MetricCard
            label="Courier Charges"
            value={money(cod.reduce((a, x) => a + x.charges, 0))}
          />
          <MetricCard
            label="Net Settlement"
            value={money(
              cod
                .filter((x) => x.collectionStatus === "Collected")
                .reduce(
                  (a, x) =>
                    a + x.amount - x.charges - x.returnCharges - x.otherCharges,
                  0,
                ),
            )}
          />
        </div>
        <Panel title="COD records">
          <CodTable rows={cod} />
        </Panel>
      </Page>
    );
  if (section === "invoices") {
    const delivered = shipments.filter((x) => x.status === "DELIVERED");
    return (
      <Page title="Invoices" text="Simple shipment charge invoices.">
        <Panel title="Invoices">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Period</th>
                  <th>Shipments</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>INV-{new Date().getFullYear()}-001</td>
                  <td>Current month</td>
                  <td>{delivered.length}</td>
                  <td>
                    {money(delivered.length * settings.defaultCourierCharge)}
                  </td>
                  <td>
                    <StatusBadge value="Pending" />
                  </td>
                  <td>{date(new Date().toISOString())}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Page>
    );
  }
  if (section === "reports")
    return (
      <Reports shipments={shipments} charge={settings.defaultCourierCharge} />
    );
  if (section === "integrations")
    return <MerchantIntegrations showToast={showToast} />;
  return (
    <MerchantSettings
      merchant={merchant}
      onSave={(value) => {
        dispatch(updateMerchant(value));
        show("Merchant settings updated.");
      }}
    />
  );
}
function Page({
  title,
  text,
  action,
  children,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        {action}
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
function ShipmentTable({
  rows,
  onView,
  onEdit,
  onCancel,
}: {
  rows: Shipment[];
  onView: (x: Shipment) => void;
  onEdit?: (x: Shipment) => void;
  onCancel?: (x: Shipment) => void;
}) {
  return rows.length ? (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Tracking #</th>
            <th>Order Reference</th>
            <th>Receiver</th>
            <th>Destination</th>
            <th>COD</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td>
                <button className="link icon-btn" onClick={() => onView(x)}>
                  {x.trackingNumber}
                </button>
              </td>
              <td>{x.orderReference}</td>
              <td>{x.receiverName}</td>
              <td>{x.destinationCity}</td>
              <td>{money(x.codAmount)}</td>
              <td>
                <StatusBadge value={x.status} />
              </td>
              <td>{date(x.createdAt)}</td>
              <td>
                <div className="actions">
                  <button
                    className="btn secondary small"
                    onClick={() => onView(x)}
                  >
                    View
                  </button>
                  {onEdit &&
                    ["BOOKED", "PICKUP_REQUESTED"].includes(x.status) && (
                      <button
                        className="btn secondary small"
                        onClick={() => onEdit(x)}
                      >
                        Edit
                      </button>
                    )}
                  {onCancel &&
                    ["BOOKED", "PICKUP_REQUESTED"].includes(x.status) && (
                      <button
                        className="btn danger small"
                        onClick={() => onCancel(x)}
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
  ) : (
    <EmptyState
      title="No shipments found."
      text="Create your first shipment to get started."
    />
  );
}
function ShipmentModal({ item, close }: { item: Shipment; close: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>{item.trackingNumber}</h2>
          <button className="icon-btn" onClick={close}>
            <LuX size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <span>Receiver</span>
              <strong>
                {item.receiverName}
                <br />
                {item.receiverPhone}
              </strong>
            </div>
            <div>
              <span>Address</span>
              <strong>
                {item.receiverAddress}, {item.destinationCity}
              </strong>
            </div>
            <div>
              <span>Weight / Pieces</span>
              <strong>
                {item.weight} kg / {item.pieces}
              </strong>
            </div>
            <div>
              <span>COD Amount</span>
              <strong>{money(item.codAmount)}</strong>
            </div>
            <div>
              <span>Order Reference</span>
              <strong>{item.orderReference}</strong>
            </div>
            <div>
              <span>Status</span>
              <StatusBadge value={item.status} />
            </div>
          </div>
          <h3>Shipment timeline</h3>
          <ol className="timeline">
            {[...item.trackingEvents].reverse().map((e, i) => (
              <li key={i}>
                <strong>{e.status.replaceAll("_", " ")}</strong>
                <span>
                  {e.location} · {new Date(e.dateTime).toLocaleString("en-PK")}
                </span>
                <span>{e.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function EditShipmentModal({
  item,
  close,
  onSave,
}: {
  item: Shipment;
  close: () => void;
  onSave: (updated: Partial<Shipment> & { id: string }) => void;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({
      id: item.id,
      receiverName: String(f.get("receiverName")),
      receiverPhone: String(f.get("receiverPhone")),
      receiverAddress: String(f.get("receiverAddress")),
      destinationCity: String(f.get("destinationCity")),
      codAmount: Number(f.get("codAmount")),
      orderReference: String(f.get("orderReference")),
    });
    close();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Edit Shipment - {item.trackingNumber}</h2>
          <button type="button" className="icon-btn" onClick={close}>
            <LuX size={18} />
          </button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Receiver Name</label>
              <input name="receiverName" defaultValue={item.receiverName} required />
            </div>
            <div className="field">
              <label>Receiver Phone</label>
              <input name="receiverPhone" defaultValue={item.receiverPhone} required />
            </div>
            <div className="field full">
              <label>Receiver Address</label>
              <input name="receiverAddress" defaultValue={item.receiverAddress} required />
            </div>
            <div className="field">
              <label>Destination City</label>
              <input name="destinationCity" defaultValue={item.destinationCity} required />
            </div>
            <div className="field">
              <label>COD Amount (PKR)</label>
              <input name="codAmount" type="number" defaultValue={item.codAmount} min="0" required />
            </div>
            <div className="field full">
              <label>Order Reference</label>
              <input name="orderReference" defaultValue={item.orderReference} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="button secondary" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function CodTable({ rows }: { rows: CodRecord[] }) {
  return rows.length ? (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Settlement ID</th>
            <th>Shipment</th>
            <th>Gross COD</th>
            <th>Charges</th>
            <th>Net Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td>{x.settlementId || "—"}</td>
              <td>{x.shipmentId.replace("shipment-", "PKX Ref ")}</td>
              <td>{money(x.amount)}</td>
              <td>{money(x.charges + x.returnCharges + x.otherCharges)}</td>
              <td>
                {money(x.amount - x.charges - x.returnCharges - x.otherCharges)}
              </td>
              <td>
                <StatusBadge value={x.settlementStatus} />
              </td>
              <td>{date(x.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <EmptyState />
  );
}
function CreateShipment({
  merchantId,
  prefix,
  originCity,
  charge,
  done,
  notice,
}: {
  merchantId: string;
  prefix: string;
  originCity: string;
  charge: number;
  done: () => void;
  notice?: string;
}) {
  const dispatch = useAppDispatch();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const item: Shipment = {
      id,
      trackingNumber: `${prefix}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      merchantId,
      receiverName: String(f.get("receiverName")),
      receiverPhone: String(f.get("receiverPhone")),
      receiverAddress: String(f.get("receiverAddress")),
      originCity,
      destinationCity: String(f.get("destinationCity")),
      weight: Number(f.get("weight")),
      pieces: Number(f.get("pieces")),
      codAmount: Number(f.get("codAmount")),
      orderReference: String(f.get("orderReference")),
      specialInstructions: String(f.get("specialInstructions")),
      status: "BOOKED",
      createdAt: now,
      trackingEvents: [
        {
          status: "BOOKED",
          location: originCity,
          dateTime: now,
          note: "Shipment booked",
        },
      ],
    };
    dispatch(addShipment(item));
    dispatch(
      addCod({
        id: `cod-${id}`,
        shipmentId: id,
        merchantId,
        amount: item.codAmount,
        collectionStatus: "Pending",
        settlementStatus: "Pending",
        charges: charge,
        returnCharges: 0,
        otherCharges: 0,
        date: now,
      }),
    );
    e.currentTarget.reset();
    done();
  };
  return (
    <Page
      title="Create Shipment"
      text="Book a new delivery using only the required operational details."
    >
      <form className="panel panel-body" onSubmit={submit}>
        <div className="form-grid">
          {[
            ["Receiver Name", "receiverName", "text"],
            ["Receiver Phone", "receiverPhone", "tel"],
            ["Receiver Address", "receiverAddress", "text"],
            ["Destination City", "destinationCity", "text"],
            ["Weight (kg)", "weight", "number"],
            ["Number of Pieces", "pieces", "number"],
            ["COD Amount", "codAmount", "number"],
            ["Order Reference", "orderReference", "text"],
          ].map(([label, name, type]) => (
            <div className="field" key={name}>
              <label>{label}</label>
              <input
                name={name}
                type={type}
                min={type === "number" ? "0" : undefined}
                step={name === "weight" ? "0.1" : undefined}
                required
              />
            </div>
          ))}
          <div className="field full">
            <label>Special Instructions</label>
            <textarea name="specialInstructions" />
          </div>
        </div>
        <div className="form-actions">
          <Link href="/merchant/shipments" className="btn secondary">
            Cancel
          </Link>
          <button className="btn">Create shipment</button>
        </div>
      </form>
    </Page>
  );
}
function Pickups({
  merchantId,
  pickups,
  onCancel,
  onCreated,
  notice,
}: {
  merchantId: string;
  pickups: Pickup[];
  onCancel: (id: string) => void;
  onCreated: () => void;
  notice?: string;
}) {
  const dispatch = useAppDispatch();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    dispatch(
      addPickup({
        id: `pickup-${crypto.randomUUID()}`,
        merchantId,
        pickupDate: String(f.get("pickupDate")),
        pickupAddress: String(f.get("pickupAddress")),
        parcels: Number(f.get("parcels")),
        contactPerson: String(f.get("contactPerson")),
        contactNumber: String(f.get("contactNumber")),
        status: "Pending",
        shipmentIds: [],
        createdAt: new Date().toISOString(),
      }),
    );
    e.currentTarget.reset();
    onCreated();
  };
  return (
    <Page title="Pickups" text="Request and monitor parcel collection.">
      <div className="split">
        <form className="panel panel-body" onSubmit={submit}>
          <h2>New pickup request</h2>
          <div className="form-grid">
            {[
              ["Pickup Date", "pickupDate", "date"],
              ["Pickup Address", "pickupAddress", "text"],
              ["Number of Parcels", "parcels", "number"],
              ["Contact Person", "contactPerson", "text"],
              ["Contact Number", "contactNumber", "tel"],
            ].map(([l, n, t]) => (
              <div
                className={`field ${n === "pickupAddress" ? "full" : ""}`}
                key={n}
              >
                <label>{l}</label>
                <input
                  name={n}
                  type={t}
                  min={t === "number" ? "1" : undefined}
                  required
                />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn">Submit request</button>
          </div>
        </form>
        <Panel title="Pickup requests">
          {pickups.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pickup #</th>
                    <th>Date</th>
                    <th>Parcels</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.map((x) => (
                    <tr key={x.id}>
                      <td>{x.id.slice(0, 14)}</td>
                      <td>{date(x.pickupDate)}</td>
                      <td>{x.parcels}</td>
                      <td>
                        <StatusBadge value={x.status} />
                      </td>
                      <td>
                        {!["Picked Up", "Cancelled"].includes(x.status) && (
                          <button
                            className="btn danger small"
                            onClick={() =>
                              confirm("Cancel pickup request?") &&
                              onCancel(x.id)
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </Panel>
      </div>
    </Page>
  );
}
function Reports({
  shipments,
  charge,
}: {
  shipments: Shipment[];
  charge: number;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const rows = shipments.filter(
    (x) =>
      (!from || x.createdAt >= from) &&
      (!to || x.createdAt.slice(0, 10) <= to) &&
      (!status || x.status === status) &&
      (!city || x.destinationCity === city),
  );
  return (
    <Page
      title="Reports"
      text="Filter operational performance by date, status and destination."
    >
      <div className="panel">
        <div className="toolbar">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {[...new Set(shipments.map((x) => x.status))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All destinations</option>
            {[...new Set(shipments.map((x) => x.destinationCity))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="metrics">
        <MetricCard label="Total Shipments" value={rows.length} />
        <MetricCard
          label="Delivered"
          value={rows.filter((x) => x.status === "DELIVERED").length}
        />
        <MetricCard
          label="Returned"
          value={rows.filter((x) => x.status === "RETURNED_TO_ORIGIN").length}
        />
        <MetricCard
          label="COD Collected"
          value={money(
            rows
              .filter((x) => x.status === "DELIVERED")
              .reduce((a, x) => a + x.codAmount, 0),
          )}
        />
        <MetricCard
          label="Courier Charges"
          value={money(rows.length * charge)}
        />
      </div>
    </Page>
  );
}
function MerchantSettings({
  merchant,
  onSave,
  notice,
}: {
  merchant: Merchant;
  onSave: (m: Partial<Merchant> & { id: string }) => void;
  notice?: string;
}) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    onSave({
      id: merchant.id,
      businessName: String(f.get("businessName")),
      contactPerson: String(f.get("contactPerson")),
      phone: String(f.get("phone")),
      email: String(f.get("email")),
      pickupAddress: String(f.get("pickupAddress")),
      bankName: String(f.get("bankName")),
      accountTitle: String(f.get("accountTitle")),
      iban: String(f.get("iban")),
    });
  };
  return (
    <Page
      title="Settings"
      text="Manage business, pickup and settlement details."
    >
      <form className="panel panel-body" onSubmit={submit}>
        <div className="form-grid">
          {[
            ["Business Name", "businessName", merchant.businessName],
            ["Contact Person", "contactPerson", merchant.contactPerson],
            ["Phone", "phone", merchant.phone],
            ["Email", "email", merchant.email],
            ["Pickup Address", "pickupAddress", merchant.pickupAddress],
            ["Bank Name", "bankName", merchant.bankName],
            ["Account Title", "accountTitle", merchant.accountTitle],
            ["Account / IBAN", "iban", merchant.iban],
          ].map(([l, n, v]) => (
            <div className="field" key={n}>
              <label>{l}</label>
              <input name={n} defaultValue={v} required />
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

function MerchantIntegrations({ showToast }: { showToast: (m: string) => void }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("sk_live_9f837a284e910283b");
  const [webhookUrl, setWebhookUrl] = useState("https://my-brand.com/api/courier-webhook");
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({
    shopify: true,
    woocommerce: true,
    daraz: false,
    magento: false,
    webhooks: true,
    zapier: false,
  });

  const toggleConnect = (id: string, name: string) => {
    const next = !connectedApps[id];
    setConnectedApps({ ...connectedApps, [id]: next });
    showToast(`${name} integration ${next ? "connected" : "disconnected"}.`);
    setActiveModal(null);
  };

  const copyKey = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(apiKey);
      showToast("API Key copied to clipboard.");
    }
  };

  const generateNewKey = () => {
    const newKey = "sk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    showToast("New API Key generated successfully.");
  };

  const platforms = [
    {
      id: "shopify",
      name: "Shopify",
      desc: "Automatically import orders, generate shipping labels, and sync tracking details back to your Shopify store.",
      connected: connectedApps.shopify,
      detail: "Store: my-brand.myshopify.com",
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      desc: "Seamless order fulfillment and status updates for your WordPress WooCommerce store.",
      connected: connectedApps.woocommerce,
      detail: "Store: store.mybrand.pk",
    },
    {
      id: "daraz",
      name: "Daraz Seller Center",
      desc: "Sync orders and arrange pickup requests directly with your Daraz seller account.",
      connected: connectedApps.daraz,
      detail: "Not connected",
    },
    {
      id: "magento",
      name: "Magento / Adobe Commerce",
      desc: "Enterprise order management, inventory sync, and real-time tracking webhooks.",
      connected: connectedApps.magento,
      detail: "Not connected",
    },
    {
      id: "webhooks",
      name: "Custom REST API & Webhooks",
      desc: "Full developer access to create shipments, fetch tracking status, and receive HTTP webhooks.",
      connected: connectedApps.webhooks,
      detail: "Endpoint: Active",
    },
    {
      id: "zapier",
      name: "Zapier / Make",
      desc: "Connect your courier portal to 5,000+ business applications with automated triggers.",
      connected: connectedApps.zapier,
      detail: "Not connected",
    },
  ];

  return (
    <Page
      title="Integrations & API"
      text="Connect your e-commerce platforms, manage API credentials and configure automated order sync."
    >
      <div className="metrics">
        <MetricCard label="Active Integrations" value={Object.values(connectedApps).filter(Boolean).length} />
        <MetricCard label="Auto-Synced Orders" value="128 Today" />
        <MetricCard label="API Status" value="99.9% Uptime" />
        <MetricCard label="Webhook Health" value="Active (0 Errors)" />
      </div>

      <Panel title="E-Commerce Platforms & Channels">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", padding: "20px" }}>
          {platforms.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "16px", color: "var(--primary)" }}>{p.name}</strong>
                  <span
                    className="badge"
                    style={{
                      background: p.connected ? "#eff6ff" : "#f1f5f9",
                      color: p.connected ? "#1d4ed8" : "#64748b",
                      borderColor: p.connected ? "#bfdbfe" : "#cbd5e1",
                    }}
                  >
                    {p.connected ? "Connected" : "Available"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>{p.desc}</p>
                <small style={{ display: "block", marginTop: "10px", fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                  {p.detail}
                </small>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className={p.connected ? "button secondary small" : "button small"}
                  style={{ flex: 1 }}
                  onClick={() => setActiveModal(p.id)}
                >
                  {p.connected ? "Configure" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="split">
        <Panel title="Developer API Credentials">
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="field">
              <label>Live API Secret Key</label>
              <div className="inline-form">
                <input value={apiKey} readOnly style={{ fontFamily: "monospace" }} />
                <button type="button" className="button secondary small" onClick={copyKey}>
                  Copy
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" className="button small" onClick={generateNewKey}>
                Generate New Key
              </button>
              <small className="muted">Keep your API key private to protect your account.</small>
            </div>
          </div>
        </Panel>

        <Panel title="Webhook Endpoints">
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="field">
              <label>Webhook URL (Order & Tracking Events)</label>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourdomain.com/webhooks"
              />
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="button secondary small"
                onClick={() => showToast("Test webhook ping sent successfully (HTTP 200 OK).")}
              >
                Send Test Event
              </button>
              <button
                type="button"
                className="button small"
                onClick={() => showToast("Webhook settings saved.")}
              >
                Save Webhook
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Configure {platforms.find((x) => x.id === activeModal)?.name}</h2>
              <button type="button" className="icon-btn" onClick={() => setActiveModal(null)}>
                <LuX size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "13.5px" }}>
                Enter your credentials to manage automatic order sync with {platforms.find((x) => x.id === activeModal)?.name}.
              </p>
              <div className="field">
                <label>Store Domain / Account ID</label>
                <input placeholder="e.g. store.mybrand.com" defaultValue="my-brand.myshopify.com" />
              </div>
              <div className="field">
                <label>Access Token / API Key</label>
                <input type="password" defaultValue="shpat_abcdef1234567890" />
              </div>
              <div className="field" style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                <input type="checkbox" defaultChecked style={{ width: "auto" }} id="autoFulfill" />
                <label htmlFor="autoFulfill" style={{ fontWeight: 500, cursor: "pointer" }}>
                  Automatically fulfill orders upon courier pickup confirmation
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => toggleConnect(activeModal, platforms.find((x) => x.id === activeModal)?.name || "")}
                >
                  {connectedApps[activeModal] ? "Save Settings" : "Connect Integration"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
