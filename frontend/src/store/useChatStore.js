import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  chatPermissionStatus: null,
  isRequestSender: false,

  // ✅ New filter state
  showAcceptedOnly: false,
  setShowAcceptedOnly: (value) => set({ showAcceptedOnly: value }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

sendMessage: async (messageData) => {
  const { selectedUser, messages } = get();
  try {
    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
    set({ messages: [...messages, res.data] });

    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("send_message", {
        toUserId: selectedUser._id,
        message: res.data,
      });
    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
},


  sendChatRequest: async (senderEmail, receiverEmail) => {
    try {
      await axiosInstance.post("/chat-request/send", { sender: senderEmail, receiver: receiverEmail });
      set({ chatPermissionStatus: "pending", isRequestSender: true });

      const receiver = get().users.find((u) => u.email === receiverEmail);
      const socket = useAuthStore.getState().socket;
      if (socket && receiver?._id) {
        socket.emit("chat_request_sent", { toUserId: receiver._id });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  },

  checkChatPermissionStatus: async (currentEmail, targetEmail) => {
    try {
      const res = await axiosInstance.post("/chat-request/status", {
        sender: currentEmail,
        receiver: targetEmail,
      });

      const { status, isSender } = res.data;

      set({
        chatPermissionStatus: status || null,
        isRequestSender: isSender,
      });
    } catch (err) {
      console.error("Error checking chat request status:", err);
      set({ chatPermissionStatus: null, isRequestSender: false });
    }
  },

  setSelectedUser: async (selectedUser) => {
    const { authUser } = useAuthStore.getState();
    set({ selectedUser });

    if (authUser && selectedUser?.email) {
      await get().checkChatPermissionStatus(authUser.email, selectedUser.email);
    }
  },

  setChatPermissionStatus: (status) => set({ chatPermissionStatus: status }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });

    socket.on("chat_request_status_updated", ({ status, fromUserId }) => {
      const currentSelected = get().selectedUser;
      const authUser = useAuthStore.getState().authUser;

      if (currentSelected && fromUserId === currentSelected._id) {
        set({
          chatPermissionStatus: status,
          isRequestSender: true,
        });

        toast.success(`Request ${status}`);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("chat_request_status_updated");
  },
}));
