import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// Define a type for the slice state
interface AuthState {
  user: any;
  expired: boolean;
  uploadToken: string | null;
}

// Define the initial state using that type
const initialState: AuthState = {
  user: null,
  expired: false,
  uploadToken: null,
};

export const authSlice = createSlice({
  name: "auth",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.expired = false;
    },
    logout: (state) => {
      state.user = null;
      state.expired = true;
      localStorage.clear();
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
