export interface User {
  _id: string;
  name: string;
  email: string;
  credits: number;
  role: string;
  token: string;
}

export interface AuthState {
  user: User | null;
}
