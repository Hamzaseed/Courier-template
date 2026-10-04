import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedComplaints } from "@/lib/seed";
import type { Complaint } from "@/lib/types";
const slice = createSlice({
  name: "complaints",
  initialState: seedComplaints,
  reducers: {
    addComplaint: (s, a: PayloadAction<Complaint>) => {
      s.unshift(a.payload);
    },
    updateComplaint: (
      s,
      a: PayloadAction<Partial<Complaint> & { id: string }>,
    ) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
  },
});
export const { addComplaint, updateComplaint } = slice.actions;
export default slice.reducer;
