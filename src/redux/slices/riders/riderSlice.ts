import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedRiders } from "@/lib/seed";
import type { Rider } from "@/lib/types";
const slice = createSlice({
  name: "riders",
  initialState: seedRiders,
  reducers: {
    addRider: (s, a: PayloadAction<Rider>) => {
      s.push(a.payload);
    },
    updateRider: (s, a: PayloadAction<Partial<Rider> & { id: string }>) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
  },
});
export const { addRider, updateRider } = slice.actions;
export default slice.reducer;
