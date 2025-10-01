import { useEffect, useRef, useState } from "react";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { NoChatHistoryPlaceholder } from "./NoChatHistoryPlaceholder";
import { MessagesLoadingSkeleton } from "./common/MessagesLoadingSkeleton";

export const ChatContainer = () => {
  const {
    messages,
    markAsRead,
    selectedUser,
    isMessagesLoading,
    getMessagesByUserId,
  } = useChatStore();
  const messageEndRef = useRef(null);
  const { authUser, socket } = useAuthStore();
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (selectedUser && authUser) {
      getMessagesByUserId(selectedUser._id);

      // Mark messages as read when chat is opened
      const chatId = [authUser._id, selectedUser._id].sort().join("_");
      markAsRead(chatId);
    }
  }, [selectedUser, getMessagesByUserId, authUser, markAsRead]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) {
      console.error("Socket is not available");
      return;
    }

    const handleUserTyping = (data) => {
      if (data.receiverId === authUser._id) {
        setTypingUsers((prev) => {
          const newState = {
            ...prev,
            [data.senderId]: data.userName,
          };
          return newState;
        });
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.receiverId === authUser._id) {
        setTypingUsers((prev) => {
          const newState = { ...prev };
          delete newState[data.senderId];
          return newState;
        });
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      socket.offAny();
    };
  }, [socket, authUser?._id]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  msg.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      alt="Shared"
                      src={msg.image}
                      className="rounded-lg h-48 object-cover"
                    />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div className="text-white text-xs px-8">
              {Object.keys(typingUsers).length > 0 && (
                <>
                  {Object.entries(typingUsers).map(([id, name], index, arr) => (
                    <span key={id} className="font-semibold">
                      {name}
                      {index < arr.length - 2
                        ? ", "
                        : index === arr.length - 2 && arr.length > 1
                        ? " and "
                        : ""}
                    </span>
                  ))}
                  <span>
                    {Object.keys(typingUsers).length === 1
                      ? " is typing..."
                      : " are typing..."}
                  </span>
                </>
              )}
            </div>

            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
};
