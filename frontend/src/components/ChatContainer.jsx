import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { MessageSquareText, Clock, Ban, UserPlus } from "lucide-react";
import { axiosInstance } from "../lib/axios";

// ✅ Modular state UI for non-chat views (keep this as is)
const CenteredState = ({
  icon: Icon,
  title,
  subtitle,
  children,
  iconColor = "text-base-content/30",
  onBack,
}) => (
  <div className="flex-1 bg-base-100">
    <ChatHeader />
    <div className="relative h-full flex flex-col items-center justify-center text-center animate-fade-in max-w-sm mx-auto px-4 mt-32">
      <Icon className={`w-16 h-16 mb-4 ${iconColor}`} />
      <h2 className="text-lg font-semibold text-base-content mb-1">{title}</h2>
      <p className="text-sm text-base-content/50 mb-4">{subtitle}</p>
      {children}
    </div>
  </div>
);

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    chatPermissionStatus,
    sendChatRequest,
    isRequestSender,
    setChatPermissionStatus,
    setSelectedUser,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => {
      if (selectedUser?._id) {
        unsubscribeFromMessages();
      }
    };
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      // Ensure smooth scroll to the end of messages
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // --- Conditional Renders for Chat Status (keep as is) ---
  if (!selectedUser) {
    return (
      <CenteredState
        icon={MessageSquareText}
        title="Select a chat"
        subtitle="Choose a user to start messaging."
      />
    );
  }

  if (chatPermissionStatus === "pending") {
    return isRequestSender ? (
      <CenteredState
        icon={Clock}
        title="Waiting for approval"
        subtitle="You can't chat until your request is accepted."
        iconColor="text-yellow-500"
        onBack={() => setSelectedUser(null)}
      />
    ) : (
      <CenteredState
        icon={UserPlus}
        title="Chat request received"
        subtitle={`Respond to ${selectedUser.fullName}'s request to start chatting.`}
        iconColor="text-primary"
        onBack={() => setSelectedUser(null)}
      >
        <div className="flex gap-4 justify-center">
          <button
            onClick={async () => {
              try {
                await axiosInstance.post("/chat-request/respond", {
                  sender: selectedUser.email,
                  receiver: authUser.email,
                  response: "accepted",
                });
                setChatPermissionStatus("accepted");
                socket?.emit("chat_request_responded", {
                  toUserId: selectedUser._id,
                  response: "accepted",
                });
              } catch (error) {
                console.error("Accept error:", error);
              }
            }}
            className="btn btn-success btn-sm"
          >
            Accept
          </button>
          <button
            onClick={async () => {
              try {
                await axiosInstance.post("/chat-request/respond", {
                  sender: selectedUser.email,
                  receiver: authUser.email,
                  response: "rejected",
                });
                setChatPermissionStatus("rejected");
                socket?.emit("chat_request_responded", {
                  toUserId: selectedUser._id,
                  response: "rejected",
                });
              } catch (error) {
                console.error("Reject error:", error);
              }
            }}
            className="btn btn-error btn-sm"
          >
            Reject
          </button>
        </div>
      </CenteredState>
    );
  }

  if (chatPermissionStatus === "rejected") {
    return (
      <CenteredState
        icon={Ban}
        title="Request Rejected"
        subtitle="This user has declined your chat request."
        iconColor="text-red-500"
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  if (chatPermissionStatus !== "accepted") {
    return (
      <CenteredState
        icon={UserPlus}
        title="Send a chat request"
        subtitle={`Start chatting with ${selectedUser.fullName}`}
        iconColor="text-base-content/40"
        onBack={() => setSelectedUser(null)}
      >
        <button
          onClick={() => sendChatRequest(authUser.email, selectedUser.email)}
          className="btn btn-primary btn-sm"
        >
          Send Request
        </button>
      </CenteredState>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageSkeleton />
        {/* MessageInput still needed here to maintain layout during loading */}
        <div className="bg-base-100 border-t border-base-300">
            <MessageInput />
        </div>
      </div>
    );
  }

  // --- Main Chat Layout ---
  return (
    // This div needs to be a flex column and take up available height
    // Ensure its parent also allows it to take full height (e.g., h-screen, flex-1 in a parent flex container)
    <div className="flex-1 flex flex-col bg-base-100 h-full">
      <ChatHeader />

      {/* This is the scrollable chat messages area */}
      <div
        className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar`}
        // Removed the 'inputHeightPadding' class here
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/50 text-center">
            <MessageSquareText className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg">No messages yet</h3>
            <p className="text-xs sm:text-sm text-base-content/40 max-w-xs">
              Start the conversation with <strong>{selectedUser.fullName}</strong>
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isSentByAuthUser = message.senderId === authUser._id;
            const profilePic = isSentByAuthUser
              ? authUser.profilePic || "/avatar.png"
              : selectedUser.profilePic || "/avatar.png";

            return (
              <div
                key={message._id}
                className={`chat ${isSentByAuthUser ? "chat-end" : "chat-start"} items-end gap-1 sm:gap-1.5`}
              >
                <div className="chat-image avatar flex-shrink-0">
                  <div className="size-7 sm:size-8 md:size-10 rounded-full border border-base-300 overflow-hidden">
                    <img
                      src={profilePic}
                      alt="profile pic"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                <div
                  className={`chat-bubble relative group ${isSentByAuthUser
                    ? "bg-primary text-primary-content"
                    : "bg-base-300 text-base-content"
                    } shadow-md rounded-lg p-2 sm:p-2.5 break-words max-w-[calc(100%-3rem)] sm:max-w-[calc(100%-3.5rem)] md:max-w-[75%]`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[120px] sm:max-w-[150px] md:max-w-[200px] rounded-md mb-1 sm:mb-1.5 object-cover aspect-video cursor-pointer transition-transform duration-200 hover:scale-105"
                      onClick={() => window.open(message.image, "_blank")}
                    />
                  )}
                  {message.text && (
                    <p className="text-xs sm:text-sm">{message.text}</p>
                  )}
                  <time
                    className="absolute -bottom-2 sm:-bottom-3 text-[0.6rem] sm:text-[0.65rem] opacity-60 transition-opacity duration-300 group-hover:opacity-100 -my-2 mx-2"
                    style={isSentByAuthUser ? { right: "0.2rem" } : { left: "0.2rem" }}
                  >
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} className="pt-8" /> {/* Keep this for scroll target */}
      </div>

      {/* MessageInput area - now part of the flex column, not absolutely positioned */}
      <div className="bg-base-100 border-t border-base-300">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;