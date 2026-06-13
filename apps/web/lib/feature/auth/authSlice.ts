import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '@/lib/types';

const getInitialState = (): AuthState => {
  
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return { user: JSON.parse(savedUser) };
    }
  }
  return { user: null };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const currentToken = state.user?.token;
      state.user = {
        ...action.payload,
        token: action.payload.token || currentToken || "",
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
    updateCredits: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.credits = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setUser, logout, updateCredits } = authSlice.actions;
export default authSlice.reducer;
