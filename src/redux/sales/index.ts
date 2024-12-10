import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface SalesState {
  value: number;
}

const initialState: SalesState = {
  value: 0,
};
// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  'sales/fetchUserData',
  async (userId: string, thunkAPI) => {
    try {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data || 'Failed to fetch user');
    }
  }
);

export const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    login: (state) => {
      state.value += 1;
    },
    logout: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    }
  },
});

export const { login, logout } = salesSlice.actions;
export default salesSlice.reducer;
