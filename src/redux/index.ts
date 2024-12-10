import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
// Example slice
import salesReducer from '@/redux/sales';
import meetReducer from '@/redux/meet';

export const store = configureStore({
  reducer: {
    sales: salesReducer,
    meet: meetReducer,
  },
});

// Infer types for TypeScript
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// its better use these hook for state manipulation and 
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
