import type {
  CodRecord,
  Complaint,
  Hub,
  Manifest,
  Merchant,
  Pickup,
  Rider,
  Settings,
  Shipment,
  User,
} from "./types";

const d = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();

export const seedSettings: Settings = {
  companyName: "CourierFlow",
  logo: "CourierFlow",
  supportPhone: "+92 51 111 794 385",
  supportEmail: "support@courierflow.pk",
  officeAddress: "I-9 Industrial Area, Islamabad",
  defaultCourierCharge: 250,
  defaultReturnCharge: 180,
  trackingPrefix: "CFLOW",
};
export const seedHubs: Hub[] = [
  {
    id: "hub-1",
    name: "Islamabad Central Hub",
    city: "Islamabad",
    address: "I-9 Industrial Area",
    contactNumber: "+92 51 444 2200",
    status: "Active",
  },
  {
    id: "hub-2",
    name: "Lahore Distribution Hub",
    city: "Lahore",
    address: "Gulberg III",
    contactNumber: "+92 42 444 3300",
    status: "Active",
  },
];
export const seedMerchants: Merchant[] = [
  {
    id: "merchant-1",
    businessName: "Northstar Goods",
    contactPerson: "Hamza Saeed",
    phone: "+92 300 1112233",
    email: "merchant@demo.com",
    city: "Islamabad",
    pickupAddress: "Blue Area, Islamabad",
    bankName: "Meezan Bank",
    accountTitle: "Northstar Goods",
    iban: "PK00MEZN000000000000",
    status: "Active",
  },
  {
    id: "merchant-2",
    businessName: "Lahore Living",
    contactPerson: "Ayesha Khan",
    phone: "+92 301 7788990",
    email: "ayesha@demo.com",
    city: "Lahore",
    pickupAddress: "DHA Phase 4, Lahore",
    bankName: "HBL",
    accountTitle: "Lahore Living",
    iban: "PK00HABB000000000000",
    status: "Active",
  },
];
export const seedRiders: Rider[] = [
  {
    id: "rider-1",
    name: "Ali Raza",
    phone: "+92 311 2223344",
    city: "Islamabad",
    hubId: "hub-1",
    vehicleType: "Motorbike",
    status: "Active",
  },
  {
    id: "rider-2",
    name: "Usman Tariq",
    phone: "+92 312 3334455",
    city: "Lahore",
    hubId: "hub-2",
    vehicleType: "Motorbike",
    status: "Active",
  },
  {
    id: "rider-3",
    name: "Bilal Ahmed",
    phone: "+92 313 4445566",
    city: "Lahore",
    hubId: "hub-2",
    vehicleType: "Van",
    status: "Inactive",
  },
];

const shipment = (
  n: number,
  merchantId: string,
  status: Shipment["status"],
  destinationCity: string,
  riderId?: string,
): Shipment => ({
  id: `shipment-${n}`,
  trackingNumber: `PKX-58392${String(n).padStart(2, "0")}`,
  merchantId,
  receiverName: ["Zain Malik", "Sara Ahmed", "Omar Farooq", "Maha Ali"][n % 4],
  receiverPhone: `+92 30${n} 55566${n}${n}`,
  receiverAddress: `House ${20 + n}, Main Boulevard`,
  originCity: merchantId === "merchant-1" ? "Islamabad" : "Lahore",
  destinationCity,
  weight: 1 + (n % 4) * 0.5,
  pieces: 1 + (n % 2),
  codAmount: 1200 + n * 350,
  orderReference: `ORD-${20260 + n}`,
  specialInstructions: n % 3 === 0 ? "Call before delivery" : "",
  status,
  createdAt: d(10 - n),
  riderId,
  originHubId: "hub-1",
  destinationHubId: destinationCity === "Lahore" ? "hub-2" : "hub-1",
  trackingEvents: [
    {
      status: "BOOKED",
      location: merchantId === "merchant-1" ? "Islamabad" : "Lahore",
      dateTime: d(10 - n),
      note: "Shipment booked",
    },
    ...(status !== "BOOKED"
      ? [
          {
            status,
            location: destinationCity,
            dateTime: d(Math.max(0, 8 - n)),
            note: status.replaceAll("_", " "),
          },
        ]
      : []),
  ],
  ...(status === "DELIVERED"
    ? {
        deliveryDate: d(Math.max(0, 8 - n)),
        deliveryNote: "Received in good condition",
      }
    : {}),
});
export const seedShipments: Shipment[] = [
  shipment(1, "merchant-1", "BOOKED", "Lahore"),
  shipment(2, "merchant-1", "PICKED_UP", "Rawalpindi"),
  shipment(3, "merchant-1", "IN_TRANSIT", "Lahore"),
  shipment(4, "merchant-1", "OUT_FOR_DELIVERY", "Lahore", "rider-2"),
  shipment(5, "merchant-1", "DELIVERED", "Rawalpindi", "rider-1"),
  shipment(6, "merchant-2", "DELIVERY_FAILED", "Islamabad", "rider-1"),
  shipment(7, "merchant-2", "RTO_IN_TRANSIT", "Islamabad", "rider-1"),
  shipment(8, "merchant-2", "DELIVERED", "Lahore", "rider-2"),
  shipment(9, "merchant-2", "RECEIVED_AT_DESTINATION_HUB", "Lahore"),
  shipment(10, "merchant-1", "ASSIGNED_TO_RIDER", "Lahore", "rider-2"),
];
export const seedPickups: Pickup[] = [
  {
    id: "pickup-1",
    merchantId: "merchant-1",
    pickupDate: d(0).slice(0, 10),
    pickupAddress: "Blue Area, Islamabad",
    parcels: 3,
    contactPerson: "Hamza Saeed",
    contactNumber: "+92 300 1112233",
    status: "Assigned",
    riderId: "rider-1",
    shipmentIds: ["shipment-1", "shipment-2"],
    createdAt: d(1),
  },
  {
    id: "pickup-2",
    merchantId: "merchant-2",
    pickupDate: d(1).slice(0, 10),
    pickupAddress: "DHA Phase 4, Lahore",
    parcels: 2,
    contactPerson: "Ayesha Khan",
    contactNumber: "+92 301 7788990",
    status: "Pending",
    shipmentIds: [],
    createdAt: d(0),
  },
];
export const seedManifests: Manifest[] = [
  {
    id: "manifest-1",
    number: "MNF-1001",
    originHubId: "hub-1",
    destinationHubId: "hub-2",
    shipmentIds: ["shipment-3"],
    transportType: "Truck",
    status: "Dispatched",
    createdAt: d(2),
  },
];
export const seedCod: CodRecord[] = seedShipments
  .filter((s) => s.codAmount > 0)
  .map((s) => ({
    id: `cod-${s.id}`,
    shipmentId: s.id,
    merchantId: s.merchantId,
    amount: s.codAmount,
    collectionStatus: s.status === "DELIVERED" ? "Collected" : "Pending",
    settlementStatus: "Pending",
    charges: 250,
    returnCharges: 0,
    otherCharges: 0,
    date: s.deliveryDate || s.createdAt,
  }));
export const seedUsers: User[] = [
  {
    id: "user-admin",
    name: "System Admin",
    email: "admin@demo.com",
    role: "Admin",
    status: "Active",
    password: "demo123",
  },
  {
    id: "user-merchant",
    name: "Hamza Saeed",
    email: "merchant@demo.com",
    role: "Merchant",
    status: "Active",
    password: "demo123",
    linkedId: "merchant-1",
  },
  {
    id: "user-rider",
    name: "Ali Raza",
    email: "rider@demo.com",
    role: "Rider",
    status: "Active",
    password: "demo123",
    linkedId: "rider-1",
  },
];
export const seedComplaints: Complaint[] = [
  {
    id: "CMP-1001",
    trackingNumber: "PKX-5839206",
    merchantId: "merchant-2",
    issueType: "Delivery delay",
    description: "Customer requested a delivery update.",
    status: "Open",
    createdAt: d(1),
  },
];
