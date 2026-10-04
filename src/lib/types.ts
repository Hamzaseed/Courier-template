export const shipmentStatuses = [
  "BOOKED",
  "PICKUP_REQUESTED",
  "PICKED_UP",
  "RECEIVED_AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "RECEIVED_AT_DESTINATION_HUB",
  "ASSIGNED_TO_RIDER",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RTO_INITIATED",
  "RTO_IN_TRANSIT",
  "RETURNED_TO_ORIGIN",
  "CANCELLED",
] as const;

export type ShipmentStatus = (typeof shipmentStatuses)[number];
export type Role = "Admin" | "Merchant" | "Rider";

export type TrackingEvent = {
  status: ShipmentStatus;
  location: string;
  dateTime: string;
  note: string;
};
export type Shipment = {
  id: string;
  trackingNumber: string;
  merchantId: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  originCity: string;
  destinationCity: string;
  weight: number;
  pieces: number;
  codAmount: number;
  orderReference: string;
  specialInstructions: string;
  status: ShipmentStatus;
  createdAt: string;
  riderId?: string;
  originHubId?: string;
  destinationHubId?: string;
  manifestId?: string;
  trackingEvents: TrackingEvent[];
  deliveryDate?: string;
  deliveryNote?: string;
};
export type Pickup = {
  id: string;
  merchantId: string;
  pickupDate: string;
  pickupAddress: string;
  parcels: number;
  contactPerson: string;
  contactNumber: string;
  status:
    "Pending" | "Accepted" | "Assigned" | "Picked Up" | "Failed" | "Cancelled";
  riderId?: string;
  shipmentIds: string[];
  createdAt: string;
};
export type Rider = {
  id: string;
  name: string;
  phone: string;
  city: string;
  hubId: string;
  vehicleType: string;
  status: "Active" | "Inactive";
};
export type Hub = {
  id: string;
  name: string;
  city: string;
  address: string;
  contactNumber: string;
  status: "Active" | "Inactive";
};
export type Manifest = {
  id: string;
  number: string;
  originHubId: string;
  destinationHubId: string;
  shipmentIds: string[];
  transportType: "Van" | "Truck" | "Air";
  status: "Created" | "Dispatched" | "Received";
  createdAt: string;
};
export type Merchant = {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  pickupAddress: string;
  bankName: string;
  accountTitle: string;
  iban: string;
  status: "Active" | "Inactive";
};
export type CodRecord = {
  id: string;
  shipmentId: string;
  merchantId: string;
  amount: number;
  collectionStatus: "Pending" | "Collected";
  settlementStatus: "Pending" | "Settled";
  charges: number;
  returnCharges: number;
  otherCharges: number;
  settlementId?: string;
  date: string;
};
export type ReturnRecord = {
  id: string;
  shipmentId: string;
  merchantId: string;
  reason: string;
  currentLocation: string;
  status: "RTO Initiated" | "RTO In Transit" | "Returned to Origin";
  date: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  role:
    | Role
    | "Super Admin"
    | "Operations"
    | "Hub Manager"
    | "Finance"
    | "Customer Support";
  status: "Active" | "Inactive";
  password: string;
  linkedId?: string;
};
export type Complaint = {
  id: string;
  trackingNumber: string;
  merchantId: string;
  issueType: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
};
export type Settings = {
  companyName: string;
  logo: string;
  supportPhone: string;
  supportEmail: string;
  officeAddress: string;
  defaultCourierCharge: number;
  defaultReturnCharge: number;
  trackingPrefix: string;
};
export type AuthState = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  linkedId?: string;
} | null;
