import { create } from 'zustand'
import { tokenManager } from '@/lib/api'
import type { UserResponse } from '@/types/api'

interface AuthState {
  isAuthenticated: boolean
  user: UserResponse | null
  setAuthenticated: (authenticated: boolean) => void
  setUser: (user: UserResponse | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: tokenManager.verifyToken(),
  user: null,

  setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),

  setUser: (user: UserResponse | null) => set({ user }),

  logout: () => {
    tokenManager.clearAll()
    set({ isAuthenticated: false, user: null })
  },
}))
