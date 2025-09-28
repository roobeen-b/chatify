import { useRef, useState } from "react";
import {
  Loader2Icon,
  LogOutIcon,
  Volume2Icon,
  VolumeOffIcon,
} from "lucide-react";

import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

export const ProfileHeader = () => {
  const { authUser, logout, onlineUsers, updateProfile, isUpdatingProfile } =
    useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`avatar ${
              onlineUsers.includes(authUser._id) ? "online" : ""
            }`}
          >
            <button
              onClick={() => fileInputRef.current.click()}
              className="size-14 rounded-full overflow-hidden relative group"
            >
              <img
                alt="User Image"
                className="size-full object-cover"
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
              />
              {isUpdatingProfile ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2Icon className="size-5 animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs">Change</span>
                </div>
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              disabled={isUpdatingProfile}
              onChange={handleImageUpload}
            />
          </div>

          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[100px] truncate">
              {authUser.fullName}
            </h3>
            <p className="text-slate-400 text-xs">
              {onlineUsers.includes(authUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOutIcon />
          </button>
          <button
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play();
              toggleSound();
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
