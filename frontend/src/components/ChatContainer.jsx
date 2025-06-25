import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { MessageSquareText } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
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
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base-100">
        <MessageSquareText className="w-24 h-24 text-base-content/30 mb-4" />
        <p className="text-xl text-base-content/60">Select a chat to start messaging</p>
      </div>
    );
  }

  // Calculate padding dynamically based on MessageInput height to prevent content from being hidden
  // The MessageInput has a default height due to input-md and btn-circle size-10 classes.
  // p-3 (12px) + 2*p-4 (16px) for image preview + input height (40px) = 12+16+40 = 68px approx
  // sm:p-4 (16px) + 2*p-4 (16px) for image preview + input height (40px) = 16+16+40 = 72px approx
  // Added a little extra for good measure to ensure full visibility.
  const inputHeightPadding = "pb-[4.5rem] sm:pb-[5.5rem]"; // Using rem for better responsiveness

  return (
    <div className="flex-1 flex flex-col relative">
      <ChatHeader />

      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar ${inputHeightPadding} min-h-[78vh]`}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/50">
            <MessageSquareText className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg">Say hello!</p>
            <p className="text-xs sm:text-sm text-center max-w-xs">
              No messages yet with {selectedUser.fullName}. Start a conversation!
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
                  <div className="size-6 sm:size-7 md:size-9 rounded-full border border-base-300 overflow-hidden">
                    <img src={profilePic} alt="profile pic" className="object-cover w-full h-full" />
                  </div>
                </div>

                <div className={`chat-bubble relative group ${isSentByAuthUser ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"} shadow-md rounded-lg p-2 sm:p-2.5 break-words
                  max-w-[calc(100%-3rem)] sm:max-w-[calc(100%-3.5rem)] md:max-w-[75%]`}>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[120px] sm:max-w-[150px] md:max-w-[200px] rounded-md mb-1 sm:mb-1.5 object-cover aspect-video cursor-pointer transition-transform duration-200 hover:scale-105"
                      onClick={() => window.open(message.image, '_blank')}
                    />
                  )}
                  {message.text && <p className="text-xs sm:text-sm">{message.text}</p>}
                  {/* Timestamp - Adjusted bottom offset and font size */}
                  <time className="absolute -bottom-2 sm:-bottom-3 text-[0.6rem] sm:text-[0.65rem] opacity-60 transition-opacity duration-300 group-hover:opacity-100 -my-2 mx-2 " // <-- CHANGED
                        style={isSentByAuthUser ? { right: '0.2rem' } : { left: '0.2rem' }}> {/* <-- CHANGED */}
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} className="pt-8" />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-base-100 border-t border-base-300">
        <MessageInput />
      </div>
    </div>
  );
};
export default ChatContainer;