import { create } from 'zustand';
import { initSocket, disconnectSocket, getSocket } from '../hooks/useSocket';
import { useToastStore } from './toastStore';
import type {
    OrderBook,
    Order,
    PlaceOrderData,
    OrderConfirmation,
    OrderUpdate,
    OrderRejection,
    MarketState,
} from '../types';

interface MarketActions {
    // Connection
    connect: (token: string) => void;
    disconnect: () => void;
    setConnected: (connected: boolean) => void;

    // Market subscription
    subscribeToMarket: (assetId: string) => void;
    unsubscribeFromMarket: () => void;

    // Order book updates
    setOrderBook: (book: OrderBook) => void;
    updateOrderBook: (book: OrderBook) => void;

    // Order management
    placeOrder: (orderData: PlaceOrderData) => void;
    addUserOrder: (order: Order) => void;
    updateUserOrder: (update: OrderUpdate) => void;

    // Error handling
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;

    // Reset
    reset: () => void;
}

type MarketStore = MarketState & MarketActions;

const initialState: MarketState = {
    currentAssetId: null,
    orderBook: { bids: [], asks: [] },
    userOrders: [],
    isConnected: false,
    isLoading: false,
    error: null,
};

export const useMarketStore = create<MarketStore>((set, get) => ({
    ...initialState,

    connect: (token: string) => {
        const socket = initSocket(token);

        socket.on('connect', () => {
            set({ isConnected: true, error: null });
            console.log('[MarketStore] Socket connected');

            // Re-subscribe to market if we were subscribed before
            const { currentAssetId } = get();
            if (currentAssetId) {
                socket.emit('SUBSCRIBE_MARKET', currentAssetId);
            }
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
            console.log('[MarketStore] Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            set({ isConnected: false, error: error.message });
            console.error('[MarketStore] Connection error:', error.message);
        });

        // Order book events
        socket.on('INITIAL_BOOK', (book: OrderBook) => {
            console.log('[MarketStore] Received INITIAL_BOOK:', book);
            set({ orderBook: book, isLoading: false });
        });

        socket.on('MARKET_UPDATE', (book: OrderBook) => {
            console.log('[MarketStore] Received MARKET_UPDATE:', book);
            set({ orderBook: book });
        });

        // Order events
        socket.on('ORDER_CONFIRMED', (confirmation: OrderConfirmation) => {
            console.log('[MarketStore] ORDER_CONFIRMED:', confirmation);

            // Show success toast
            useToastStore.getState().addToast('Order placed successfully!', 'success');

            const { userOrders } = get();

            // First try to find by the confirmation ID (in case of updates)
            const existingIndex = userOrders.findIndex((o) => o.id === confirmation.id);

            if (existingIndex >= 0) {
                // Update existing order
                const updated = [...userOrders];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    status: confirmation.status,
                    filledQuantity: confirmation.filledQuantity,
                };
                set({ userOrders: updated, isLoading: false });
            } else {
                // Find the pending order (starts with 'pending-') and update it with real ID
                const pendingIndex = userOrders.findIndex((o) => o.id.startsWith('pending-'));

                if (pendingIndex >= 0) {
                    const updated = [...userOrders];
                    updated[pendingIndex] = {
                        ...updated[pendingIndex],
                        id: confirmation.id,
                        status: confirmation.status,
                        filledQuantity: confirmation.filledQuantity,
                    };
                    set({ userOrders: updated, isLoading: false });
                } else {
                    // Fallback: create new order from current asset context
                    const newOrder: Order = {
                        id: confirmation.id,
                        assetId: get().currentAssetId || '',
                        userId: '',
                        side: 'BUY',
                        orderType: 'LIMIT',
                        price: null,
                        quantity: 0,
                        filledQuantity: confirmation.filledQuantity,
                        status: confirmation.status,
                    };
                    set({ userOrders: [newOrder, ...userOrders], isLoading: false });
                }
            }
        });

        socket.on('ORDER_UPDATE', (update: OrderUpdate) => {
            console.log('[MarketStore] ORDER_UPDATE:', update);
            const { userOrders } = get();
            const updated = userOrders.map((order) =>
                order.id === update.id
                    ? { ...order, status: update.status, filledQuantity: update.filledQuantity }
                    : order
            );
            set({ userOrders: updated });

            // Notify on fill
            if (update.status === 'FILLED') {
                useToastStore.getState().addToast('Order filled successfully!', 'success');
            }
        });

        socket.on('ORDER_REJECTED', (rejection: OrderRejection) => {
            console.error('[MarketStore] ORDER_REJECTED:', rejection.reason);
            const errorMsg = `Order rejected: ${rejection.reason.replace(/_/g, ' ')}`;

            // Show error toast
            useToastStore.getState().addToast(errorMsg, 'error');

            // Remove the pending order on rejection
            const { userOrders } = get();
            const filteredOrders = userOrders.filter((o) => !o.id.startsWith('pending-'));
            set({
                userOrders: filteredOrders,
                error: errorMsg,
                isLoading: false
            });
        });
    },

    disconnect: () => {
        disconnectSocket();
        set({ isConnected: false });
    },

    setConnected: (connected: boolean) => set({ isConnected: connected }),

    subscribeToMarket: (assetId: string) => {
        const socket = getSocket();
        if (socket?.connected) {
            set({ currentAssetId: assetId, isLoading: true, orderBook: { bids: [], asks: [] } });
            socket.emit('SUBSCRIBE_MARKET', assetId);
            console.log('[MarketStore] Subscribing to market:', assetId);
        } else {
            set({ error: 'Socket not connected' });
        }
    },

    unsubscribeFromMarket: () => {
        set({ currentAssetId: null, orderBook: { bids: [], asks: [] } });
    },

    setOrderBook: (book: OrderBook) => set({ orderBook: book }),

    updateOrderBook: (book: OrderBook) => set({ orderBook: book }),

    placeOrder: (orderData: PlaceOrderData) => {
        const socket = getSocket();
        if (socket?.connected) {
            set({ isLoading: true, error: null });

            // Create a pending order to track until confirmation
            const pendingOrder: Order = {
                id: `pending-${Date.now()}`,
                assetId: orderData.assetId,
                userId: '',
                side: orderData.side,
                orderType: orderData.orderType,
                price: orderData.price,
                quantity: orderData.quantity,
                filledQuantity: 0,
                status: 'OPEN',
            };

            // Store pending order - will be updated when ORDER_CONFIRMED arrives
            set((state) => ({
                userOrders: [pendingOrder, ...state.userOrders]
            }));

            socket.emit('PLACE_ORDER', orderData);
            console.log('[MarketStore] Placing order:', orderData);
        } else {
            set({ error: 'Socket not connected' });
        }
    },

    addUserOrder: (order: Order) => {
        set((state) => ({ userOrders: [order, ...state.userOrders] }));
    },

    updateUserOrder: (update: OrderUpdate) => {
        set((state) => ({
            userOrders: state.userOrders.map((order) =>
                order.id === update.id
                    ? { ...order, status: update.status, filledQuantity: update.filledQuantity }
                    : order
            ),
        }));
    },

    setError: (error: string | null) => set({ error }),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    reset: () => set(initialState),
}));
