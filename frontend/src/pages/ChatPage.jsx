import { ChatsList } from "../components/ChatsList";
import { ContactList } from "../components/ContactList";
import { ProfileHeader } from "../components/ProfileHeader";
import { ChatContainer } from "../components/ChatContainer";
import { ActiveTabSwitch } from "../components/ActiveTabSwitch";
import { NoConversationPlaceholder } from "../components/NoConversationPlaceholder";
import { BorderAnimatedContainer } from "../components/common/BorderAnimatedContainer";

import { useChatStore } from "../store/useChatStore.js";

export default function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full max-w-6xl h-[600px]">
      <BorderAnimatedContainer>
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        <div className="flex-1 bg-slate-900/50 backdrop-blur-sm flex flex-col">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
