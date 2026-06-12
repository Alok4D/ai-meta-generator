export interface User {
  _id: string;
  name: string;
  email: string;
  credits: number;
  role: string;
  avatar?: string;
  phone?: string;
  activePlan?: any;
  planExpireDate?: string;
  hasClaimedWelcomeBonus?: boolean;
  token: string;
}

export interface AuthState {
  user: User | null;
}
