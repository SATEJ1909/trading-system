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

// Asset types
export interface Asset {
    _id: string;
    symbol: string;
    name: string;
    source: 'COINGECKO' | 'BINANCE' | 'MANUAL';
    isActive: boolean;
    createdAt: string;
}

export interface AssetsResponse {
    success: boolean;
    count?: number;
    data?: Asset[];
    message?: string;
}

// ===== Trading Types =====

// Order Book types
export interface OrderBookEntry {
    id: string;
    price: number;
    quantity: number;
    filledQuantity: number;
    side: 'BUY' | 'SELL';
    userId: string;
}

export interface OrderBook {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}

// Order types
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';

export interface PlaceOrderData {
    assetId: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    price: number | null;
}

export interface Order {
    id: string;
    assetId: string;
    userId: string;
    side: OrderSide;
    orderType: OrderType;
    price: number | null;
    quantity: number;
    filledQuantity: number;
    status: OrderStatus;
    createdAt?: string;
}

// Socket.IO event payloads
export interface OrderConfirmation {
    id: string;
    status: OrderStatus;
    filledQuantity: number;
}

export interface OrderUpdate {
    id: string;
    status: OrderStatus;
    filledQuantity: number;
}

export interface OrderRejection {
    reason: 'RATE_LIMIT_EXCEEDED' | 'INVALID_ORDER' | 'ORDER_FAILED' | 'INSUFFICIENT_FUNDS' | 'INSUFFICIENT_ASSET';
}

// Market state
export interface MarketState {
    currentAssetId: string | null;
    orderBook: OrderBook;
    userOrders: Order[];
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
}
