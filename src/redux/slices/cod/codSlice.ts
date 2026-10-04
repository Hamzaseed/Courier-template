import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedCod } from "@/lib/seed";
import type { CodRecord } from "@/lib/types";
const slice = createSlice({
  name: "cod",
  initialState: seedCod,
  reducers: {
    addCod: (s, a: PayloadAction<CodRecord>) => {
      s.push(a.payload);
    },
    updateCod: (s, a: PayloadAction<Partial<CodRecord> & { id: string }>) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
    settleMerchant: (
      s,
      a: PayloadAction<{ merchantId: string; settlementId: string }>,
    ) => {
      s.filter(
        (x) =>
          x.merchantId === a.payload.merchantId &&
          x.collectionStatus === "Collected" &&
          x.settlementStatus === "Pending",
      ).forEach((x) => {
        x.settlementStatus = "Settled";
        x.settlementId = a.payload.settlementId;
      });
    },
  },
});
export const { addCod, updateCod, settleMerchant } = slice.actions;
export default slice.reducer;
