import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedSettings } from "@/lib/seed";
import type { Settings } from "@/lib/types";
const slice = createSlice({
  name: "settings",
  initialState: seedSettings,
  reducers: {
    updateSettings: (s, a: PayloadAction<Partial<Settings>>) => {
      Object.assign(s, a.payload);
    },
  },
});
export const { updateSettings } = slice.actions;
export default slice.reducer;
