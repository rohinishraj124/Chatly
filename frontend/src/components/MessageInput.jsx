import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-3 sm:p-4 w-full"> {/* Adjusted padding */}
      {imagePreview && (
        <div className="mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2"> {/* Adjusted margin and gap */}
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-zinc-700" // Scaled preview image
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-base-300
              flex items-center justify-center" // Scaled close button
              type="button"
            >
              <X className="size-2.5" /> {/* Scaled close icon */}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex-1 flex gap-1.5 sm:gap-2 items-center">
          {/* Input field: ONLY input-md, no input-sm */}
          <input
            type="text"
            className="input input-bordered rounded-lg input-md flex-1" // <-- CHANGED: Removed input-sm
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Image upload button: Explicitly sized to match input-md height (h-10) */}
          <button
            type="button"
            className={`btn btn-circle flex-shrink-0 size-10`} // <-- CHANGED: Removed sm:size-10, kept size-10
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} /> {/* Only size={20}, no sm:size */}
          </button>
        </div>
        {/* Send button: Explicitly sized to match input-md height (h-10) */}
        <button
          type="submit"
          className="btn btn-circle flex-shrink-0 size-10" // <-- CHANGED: Removed sm:size-10, kept size-10
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} /> {/* Only size={22}, no sm:size */}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;