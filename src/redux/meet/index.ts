import { createSlice } from '@reduxjs/toolkit';

interface MeetState {
    isVideo: boolean;
    isMute: boolean;
    name: string;
}

const initialState: MeetState = {
    isVideo: true,
    isMute: true,
    name: '',
};
// Async thunk for fetching user data
// export const fetchUserData = createAsyncThunk(
//   'sales/fetchUserData',
//   async (userId: string, thunkAPI) => {
   
//   }
// );

export const meetSlice = createSlice({
  name: 'meet',
  initialState,
  reducers: {
    muteAction: (state) => {
      state.isMute = !state.isMute;
    },
    videoActions: (state) => {
      state.isVideo = !state.isVideo;
    },
    setUserName: (state, action) => {
        state.name = action.payload;
    }

  },
});

export const { setUserName, videoActions, muteAction} = meetSlice.actions;
export default meetSlice.reducer;
