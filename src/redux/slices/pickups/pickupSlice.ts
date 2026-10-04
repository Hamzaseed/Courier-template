import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedPickups } from "@/lib/seed";
import type { Pickup } from "@/lib/types";
const slice = createSlice({
  name: "pickups",
  initialState: seedPickups,
  reducers: {
    addPickup: (s, a: PayloadAction<Pickup>) => {
      s.unshift(a.payload);
    },
    updatePickup: (s, a: PayloadAction<Partial<Pickup> & { id: string }>) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
    cancelPickup: (s, a: PayloadAction<string>) => {
      const x = s.find((i) => i.id === a.payload);
      if (x && !["Picked Up", "Cancelled"].includes(x.status))
        x.status = "Cancelled";
    },
  },
});
export const { addPickup, updatePickup, cancelPickup } = slice.actions;
export default slice.reducer;
