import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  title: string;
  description: string;
  openModal: (options?: { title?: string; description?: string }) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  title: 'Make EngineerPath yours',
  description: 'Create a free account to save your progress, internships and roadmap.',
  openModal: (options) =>
    set({
      isOpen: true,
      title: options?.title || 'Make EngineerPath yours',
      description:
        options?.description || 'Create a free account to save your progress, internships and roadmap.',
    }),
  closeModal: () => set({ isOpen: false }),
}));

export default useAuthModalStore;
