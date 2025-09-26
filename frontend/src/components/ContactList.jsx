import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { UsersLoadingSkeleton } from "./common/UsersLoadingSkeleton.jsx";

export const ContactList = () => {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          onClick={() => setSelectedUser(contact)}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`avatar`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
};
