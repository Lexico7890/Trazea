import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatMessage, AgentOption } from "./types";

interface DynamoChatStore {
  messages: ChatMessage[];
  sessionId: string | null;
  isPanelOpen: boolean;
  hasUnread: boolean;

  addMessage: (
    message: Pick<ChatMessage, "role" | "content"> & {
      options?: AgentOption[];
    }
  ) => void;
  updateMessageSelection: (messageId: string, selectedOption: string) => void;
  setSessionId: (id: string | null) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  clearChat: () => void;
}

export const useDynamoStore = create<DynamoChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      sessionId: null,
      isPanelOpen: false,
      hasUnread: false,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
          hasUnread: !state.isPanelOpen,
        })),

      updateMessageSelection: (messageId, selectedOption) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, selectedOption } : msg
          ),
        })),

      setSessionId: (id) => set({ sessionId: id }),

      togglePanel: () =>
        set((state) => ({
          isPanelOpen: !state.isPanelOpen,
          hasUnread: !state.isPanelOpen ? false : state.hasUnread,
        })),

      setPanelOpen: (open) =>
        set({
          isPanelOpen: open,
          hasUnread: open ? false : get().hasUnread,
        }),

      clearChat: () =>
        set({
          messages: [],
          sessionId: null,
          isPanelOpen: false,
          hasUnread: false,
        }),
    }),
    {
      name: "dynamo-chat-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
