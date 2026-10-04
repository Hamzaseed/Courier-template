import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedHubs } from "@/lib/seed";
import type { Hub } from "@/lib/types";
const slice = createSlice({
  name: "hubs",
  initialState: seedHubs,
  reducers: {
    addHub: (s, a: PayloadAction<Hub>) => {
      s.push(a.payload);
    },
    updateHub: (s, a: PayloadAction<Partial<Hub> & { id: string }>) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
    deleteHub: (s, a: PayloadAction<string>) => {
      const i = s.findIndex((x) => x.id === a.payload);
      if (i >= 0) s.splice(i, 1);
    },
  },
});
export const { addHub, updateHub, deleteHub } = slice.actions;
export default slice.reducer;
