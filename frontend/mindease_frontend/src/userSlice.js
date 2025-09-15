import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  // will hold everything (id, name, email, token, etc.)
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;  // store everything directly
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
