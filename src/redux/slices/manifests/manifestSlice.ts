import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedManifests } from "@/lib/seed";
import type { Manifest } from "@/lib/types";
const slice = createSlice({
  name: "manifests",
  initialState: seedManifests,
  reducers: {
    addManifest: (s, a: PayloadAction<Manifest>) => {
      s.unshift(a.payload);
    },
    updateManifest: (
      s,
      a: PayloadAction<Partial<Manifest> & { id: string }>,
    ) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
  },
});
export const { addManifest, updateManifest } = slice.actions;
export default slice.reducer;
