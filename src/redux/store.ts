import { combineReducers, configureStore, type Middleware } from "@reduxjs/toolkit";
import auth from "./slices/auth/authSlice";
import shipments from "./slices/shipments/shipmentSlice";
import pickups from "./slices/pickups/pickupSlice";
import riders from "./slices/riders/riderSlice";
import hubs from "./slices/hubs/hubSlice";
import manifests from "./slices/manifests/manifestSlice";
import cod from "./slices/cod/codSlice";
import returns from "./slices/returns/returnSlice";
import merchants from "./slices/merchants/merchantSlice";
import users from "./slices/users/userSlice";
import complaints from "./slices/complaints/complaintSlice";
import settings from "./slices/settings/settingsSlice";

const reducers = {
  auth,
  shipments,
  pickups,
  riders,
  hubs,
  manifests,
  cod,
  returns,
  merchants,
  users,
  complaints,
  settings,
};
const combinedReducer = combineReducers(reducers);
export type RootState = ReturnType<typeof combinedReducer>;

const rootReducer = (state: RootState | undefined, action: any): RootState => {
  if (action.type === "REHYDRATE_STORE") {
    return {
      ...state,
      ...action.payload,
    };
  }
  return combinedReducer(state, action);
};

export const getStoredState = (): Partial<RootState> => {
  if (typeof window === "undefined") return {};
  const stored: Partial<RootState> = {};
  for (const key of Object.keys(reducers) as (keyof RootState)[]) {
    const raw = localStorage.getItem(`courier_${key}`);
    if (raw) {
      try {
        (stored as Record<string, unknown>)[key] = JSON.parse(raw);
      } catch {
        localStorage.removeItem(`courier_${key}`);
      }
    }
  }
  return stored;
};

const persistence: Middleware<object, RootState> = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (typeof window !== "undefined") {
    const state = storeApi.getState();
    for (const key of Object.keys(reducers) as (keyof RootState)[])
      localStorage.setItem(`courier_${key}`, JSON.stringify(state[key]));
  }
  return result;
};

export const makeStore = () =>
  configureStore({ reducer: rootReducer, middleware: (g) => g().concat(persistence) });
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
