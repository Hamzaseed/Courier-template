import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReturnRecord } from "@/lib/types";
const slice = createSlice({
  name: "returns",
  initialState: [] as ReturnRecord[],
  reducers: {
    addReturn: (s, a: PayloadAction<ReturnRecord>) => {
      if (!s.some((x) => x.shipmentId === a.payload.shipmentId))
        s.unshift(a.payload);
    },
    updateReturn: (
      s,
      a: PayloadAction<Partial<ReturnRecord> & { id: string }>,
    ) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
  },
});
export const { addReturn, updateReturn } = slice.actions;
export default slice.reducer;
