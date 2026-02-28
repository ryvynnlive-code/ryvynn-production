import { configureStore } from "@reduxjs/toolkit";
import crisisReducer from "./crisisSlice";

export const store = configureStore({
  reducer: {
    crisis: crisisReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
