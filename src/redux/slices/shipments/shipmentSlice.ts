import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedShipments } from "@/lib/seed";
import type { Shipment, ShipmentStatus, TrackingEvent } from "@/lib/types";

const initialState: Shipment[] = seedShipments;
const slice = createSlice({
  name: "shipments",
  initialState,
  reducers: {
    addShipment: (state, action: PayloadAction<Shipment>) => {
      state.unshift(action.payload);
    },
    updateShipment: (
      state,
      action: PayloadAction<Partial<Shipment> & { id: string }>,
    ) => {
      const item = state.find((x) => x.id === action.payload.id);
      if (item) Object.assign(item, action.payload);
    },
    cancelShipment: (state, action: PayloadAction<string>) => {
      const item = state.find((x) => x.id === action.payload);
      if (item && ["BOOKED", "PICKUP_REQUESTED"].includes(item.status)) {
        item.status = "CANCELLED";
        item.trackingEvents.push({
          status: "CANCELLED",
          location: item.originCity,
          dateTime: new Date().toISOString(),
          note: "Shipment cancelled by merchant",
        });
      }
    },
    setShipmentStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: ShipmentStatus;
        location: string;
        note: string;
      }>,
    ) => {
      const item = state.find((x) => x.id === action.payload.id);
      if (!item) return;
      item.status = action.payload.status;
      item.trackingEvents.push({
        status: action.payload.status,
        location: action.payload.location,
        dateTime: new Date().toISOString(),
        note: action.payload.note,
      });
      if (action.payload.status === "DELIVERED")
        item.deliveryDate = new Date().toISOString();
    },
    addTrackingEvent: (
      state,
      action: PayloadAction<{ id: string; event: TrackingEvent }>,
    ) => {
      const item = state.find((x) => x.id === action.payload.id);
      if (item) item.trackingEvents.push(action.payload.event);
    },
  },
});
export const {
  addShipment,
  updateShipment,
  cancelShipment,
  setShipmentStatus,
  addTrackingEvent,
} = slice.actions;
export default slice.reducer;
