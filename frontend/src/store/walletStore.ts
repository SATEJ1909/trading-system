import { create } from 'zustand';
import api from '../api/axios';
import type { WalletState, WalletResponse, AddMoneyResponse } from '../types';

interface WalletActions {
    fetchWallet: () => Promise<void>;
    addMoney: (amount: number) => Promise<{ success: boolean; message: string }>;
    clearError: () => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>((set, get) => ({
    // Initial state
    wallet: null,
    isLoading: false,
    error: null,

    // Clear error
    clearError: () => set({ error: null }),

    // Fetch wallet balance
    fetchWallet: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get<WalletResponse>('/wallet');

            if (response.data.success && response.data.data) {
                set({
                    wallet: response.data.data,
                    isLoading: false,
                });
            } else {
                set({
                    isLoading: false,
                    error: response.data.message || 'Failed to fetch wallet',
                });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch wallet';
            set({
                isLoading: false,
                error: message,
            });
        }
    },

    // Add money to wallet
    addMoney: async (amount: number) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.post<AddMoneyResponse>('/wallet/addMoney', { amount });

            if (response.data.success) {
                // Update wallet balance locally
                const currentWallet = get().wallet;
                if (currentWallet && response.data.balance !== undefined) {
                    set({
                        wallet: {
                            ...currentWallet,
                            availableBalance: response.data.balance,
                        },
                        isLoading: false,
                    });
                } else {
                    // Refetch wallet if we don't have the balance
                    await get().fetchWallet();
                }
                return { success: true, message: response.data.message };
            }

            set({ isLoading: false });
            return { success: false, message: response.data.message || 'Failed to add money' };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add money';
            set({
                isLoading: false,
                error: message,
            });
            return { success: false, message };
        }
    },
}));
