import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Image Display with bounce */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center animate-bounce">
            <img
              src="/pic.png"
              alt="Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Chatly!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
