import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: null,
  error: null,
  user: null,
};
const authSlice = createSlice({
  name: "authslice",
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    Logout: (state) => {
      (state.user = null), (state.loading = null), (state.error = null);
    },
  },
});
export const { setUser, Logout } = authSlice.actions;
export default authSlice.reducer;
