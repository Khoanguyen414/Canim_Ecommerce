import { create } from "zustand"

export type AuthModalTab = "login" | "register"

type AuthModalState = {
  open: boolean
  tab: AuthModalTab
  openModal: (tab?: AuthModalTab) => void
  closeModal: () => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  open: false,
  tab: "login",
  openModal: (tab = "login") => set({ open: true, tab }),
  closeModal: () => set({ open: false }),
}))
