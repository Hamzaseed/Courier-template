import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedMerchants } from "@/lib/seed";
import type { Merchant } from "@/lib/types";
const slice = createSlice({
  name: "merchants",
  initialState: seedMerchants,
  reducers: {
    addMerchant: (s, a: PayloadAction<Merchant>) => {
      s.push(a.payload);
    },
    updateMerchant: (
      s,
      a: PayloadAction<Partial<Merchant> & { id: string }>,
    ) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
  },
});
export const { addMerchant, updateMerchant } = slice.actions;
export default slice.reducer;
