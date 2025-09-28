import toast from "react-hot-toast";
import { useState, useRef } from "react";
import { XIcon, SendIcon, ImageIcon } from "lucide-react";

import { useChatStore } from "../store/useChatStore.js";
import { useKeyboardSounds } from "../hooks/useKeyboardSounds.js";

export const MessageInput = () => {
  const { playRandomSound } = useKeyboardSounds();
  const { sendMessage, isSoundEnabled, isSendingMessage } = useChatStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    const messageData = { text: text.trim(), image: imagePreview };

    if (isSoundEnabled) playRandomSound();
    await sendMessage(messageData);
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.onerror = () => toast.error("Error reading image");
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Image Preview"
              className="max-w-full w-16 h-16 p-1 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <XIcon className="w-2 h-2" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex space-x-4"
      >
        <input
          type="text"
          value={text}
          placeholder="Type your message..."
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-slate-700/50 rounded-full focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
        <button
          type="submit"
          disabled={(!text.trim() && !imagePreview) || isSendingMessage}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-4 h-4 rotate-45" />
        </button>
        <button
          type="button"
          disabled={isSendingMessage}
          onClick={() => fileInputRef.current?.click()}
          className="text-white py-2 px-4 rounded-md bg-slate-800 hover:bg-slate-700"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
