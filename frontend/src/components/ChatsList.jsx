import { useEffect } from "react";
import { NoChatsFound } from "./NoChatsFound.jsx";
import { useChatStore } from "../store/useChatStore.js";
import { UsersLoadingSkeleton } from "./common/UsersLoadingSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNotifications } from "../hooks/useNotifications";

export const ChatsList = () => {
  const { onlineUsers, authUser } = useAuthStore();
  const {
    chats,
    unreadCounts,
    isUsersLoading,
    setSelectedUser,
    getMyChatPartners,
  } = useChatStore();
  useNotifications();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => setSelectedUser(chat)}
          className="relative bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${
                onlineUsers.includes(chat._id) ? "online" : ""
              }`}
            >
              <div className="size-12 rounded-full">
                <img
                  alt={chat.fullName}
                  src={chat.profilePic || "/avatar.png"}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate">
                {chat.fullName}
              </h4>
              {unreadCounts[`${[authUser._id, chat._id].sort().join("_")}`] >
                0 && (
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-cyan-600 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center animate-pulse"
                  aria-label={`${
                    unreadCounts[`${[authUser._id, chat._id].sort().join("_")}`]
                  } unread messages`}
                >
                  {unreadCounts[
                    `${[authUser._id, chat._id].sort().join("_")}`
                  ] > 9
                    ? "9+"
                    : unreadCounts[
                        `${[authUser._id, chat._id].sort().join("_")}`
                      ]}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
