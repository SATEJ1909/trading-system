// User type matching backend response
export interface User {
    id: string;
    name: string;
    email: string;
}

// API Response types
export interface AuthResponse {
    success: boolean;
    message: string;
    data?: User;
    token?: string;
}

export interface ProfileResponse {
    success: boolean;
    data?: User;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
}

// Auth store state type
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Login/Signup form types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    name: string;
    email: string;
    password: string;
}

// Wallet types
export interface Wallet {
    userId: string;
    availableBalance: number;
    lockedBalance: number;
    currency: 'VIRTUAL_INR' | 'USD';
}

export interface WalletResponse {
    success: boolean;
    data?: Wallet;
    message?: string;
}

export interface AddMoneyResponse {
    success: boolean;
    message: string;
    balance?: number;
}

export interface WalletState {
    wallet: Wallet | null;
    isLoading: boolean;
    error: string | null;
}
