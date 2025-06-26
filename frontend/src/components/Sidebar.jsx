import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    chatPermissionStatus,
  } = useChatStore();

  const { onlineUsers, authUser, socket } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [newMessageUserIds, setNewMessageUserIds] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // 📨 New message received
    socket.on("message_received", (message) => {
      const fromUserId = message.senderId;

      if (!selectedUser || selectedUser._id !== fromUserId) {
        setNewMessageUserIds((prev) =>
          prev.includes(fromUserId) ? prev : [...prev, fromUserId]
        );
      }
    });

    // 📩 Chat request notification
    socket.on("chat_request_received", () => {
      toast("📩 You have a new chat request!");
      getUsers(); // Optional refresh
    });

    return () => {
      socket.off("message_received");
      socket.off("chat_request_received");
    };
  }, [socket, selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setNewMessageUserIds((prev) => prev.filter((id) => id !== user._id));
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full border-r border-base-300 flex flex-col">
      {/* Sidebar Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium">Contacts</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const hasNewMessage = newMessageUserIds.includes(user._id);

          return (
            <button
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-9 rounded-full object-cover"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>

              {/* User Info */}
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium truncate flex justify-between items-center">
                  {user.fullName}
                </div>

                <div className="text-sm text-zinc-400">
                  {hasNewMessage
                    ? "New message"
                    : chatPermissionStatus === "pending" &&
                      selectedUser?._id !== user._id
                    ? "New request"
                    : isOnline
                    ? "Online"
                    : "Offline"}
                </div>

                {selectedUser?._id === user._id && chatPermissionStatus && (
                  <div className="text-xs mt-1 text-zinc-400">
                    {chatPermissionStatus === "pending" && "Request Pending"}
                    {chatPermissionStatus === "rejected" && "Request Rejected"}
                    {chatPermissionStatus === "accepted" && "Chat Accepted"}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
