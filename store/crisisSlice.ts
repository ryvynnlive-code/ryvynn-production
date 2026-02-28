/**
 * Redux crisis slice — client-side FSM state mirror
 * Server is authoritative. This drives UI only.
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CrisisState } from "@/lib/crisisFSM";

interface CrisisSliceState {
  fsmState:     CrisisState;
  severity:     number;
  triggers:     string[];
  safeModeActive: boolean;
  // SafeMode locks: feed disabled, upsells disabled, hotline only
  feedLocked:   boolean;
  upsellLocked: boolean;
}

const initial: CrisisSliceState = {
  fsmState:       "IDLE",
  severity:       0,
  triggers:       [],
  safeModeActive: false,
  feedLocked:     false,
  upsellLocked:   false,
};

const crisisSlice = createSlice({
  name: "crisis",
  initialState: initial,
  reducers: {
    setFSMResult(state, action: PayloadAction<{
      fsmState: CrisisState;
      severity: number;
      triggers: string[];
      shouldBlock: boolean;
    }>) {
      const { fsmState, severity, triggers, shouldBlock } = action.payload;
      state.fsmState       = fsmState;
      state.severity       = severity;
      state.triggers       = triggers;
      state.safeModeActive = shouldBlock;
      state.feedLocked     = shouldBlock;
      state.upsellLocked   = shouldBlock;
      // SAFE_MODE is terminal on client — cannot be cleared without page reload
    },
    // Resolution path — only valid from INTERVENE or DETECT
    resolveIfSafe(state) {
      if (state.fsmState === "SAFE_MODE") return; // terminal, no-op
      state.fsmState   = "RESOLVE";
      state.severity   = 0;
      state.triggers   = [];
      state.feedLocked = false;
      // upsellLocked stays true until explicit user action
    },
    clearUpsellLock(state) {
      if (state.fsmState === "SAFE_MODE") return; // ethics > revenue
      state.upsellLocked = false;
    },
  },
});

export const { setFSMResult, resolveIfSafe, clearUpsellLock } = crisisSlice.actions;
export default crisisSlice.reducer;
