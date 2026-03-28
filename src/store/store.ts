import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';

const localStorageSyncMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  const state = store.getState();
  localStorage.setItem('idleGameState', JSON.stringify(state.game));
  return result;
};

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For ignoring the deeply nested Dates if any, although we shouldn't have any
    }).concat(localStorageSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
