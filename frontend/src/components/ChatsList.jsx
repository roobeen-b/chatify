import { useEffect } from "react";
import { NoChatsFound } from "./NoChatsFound.jsx";
import { useChatStore } from "../store/useChatStore.js";
import { UsersLoadingSkeleton } from "./common/UsersLoadingSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";

export const ChatsList = () => {
  const { onlineUsers } = useAuthStore();
  const { chats, isUsersLoading, setSelectedUser, getMyChatPartners } =
    useChatStore();

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
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
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
            <h4 className="text-slate-200 font-medium truncate">
              {chat.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
};
