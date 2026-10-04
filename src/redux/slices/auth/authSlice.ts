import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "@/lib/types";
const slice = createSlice({
  name: "auth",
  initialState: null as AuthState,
  reducers: {
    login: (_s, a: PayloadAction<NonNullable<AuthState>>) => a.payload,
    logout: () => null,
  },
});
export const { login, logout } = slice.actions;
export default slice.reducer;
