import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { seedUsers } from "@/lib/seed";
import type { User } from "@/lib/types";
const slice = createSlice({
  name: "users",
  initialState: seedUsers,
  reducers: {
    addUser: (s, a: PayloadAction<User>) => {
      s.push(a.payload);
    },
    updateUser: (s, a: PayloadAction<Partial<User> & { id: string }>) => {
      const x = s.find((i) => i.id === a.payload.id);
      if (x) Object.assign(x, a.payload);
    },
    resetUsers: () => {
      return seedUsers.map((u) => ({ ...u, status: "Active" as const }));
    },
  },
});
export const { addUser, updateUser, resetUsers } = slice.actions;
export default slice.reducer;
