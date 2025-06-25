import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-200 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Main chat window container */}
      <div
        className="bg-base-100 rounded-2xl shadow-xl w-full max-w-7xl
                   h-[calc(100vh-6rem)] md:h-[calc(100vh-9rem)] overflow-hidden flex flex-col
                   mt-10"
      >
        {/* Flex container for sidebar and chat area */}
        <div className="flex flex-1 h-full relative">
          {/*
            Sidebar (Contact List) Visibility:
            - On small screens: full screen when no user selected, hidden otherwise.
            - On medium screens and up: fixed width, always visible.
          */}
          <div
            className={`
              absolute top-0 left-0 w-full h-full
              md:relative md:w-80 md:flex-shrink-0
              ${selectedUser ? "hidden" : "block"} // On mobile: Show if no user, hide if user selected
              md:block // On desktop: Always show
            `}
          >
            <Sidebar />
          </div>

          {/*
            Chat Container / No Chat Selected Visibility:
            - On small screens: full screen when user selected, hidden otherwise.
            - On medium screens and up: takes remaining space, always visible.
          */}
          <div
            className={`
              absolute top-0 left-0 w-full h-full
              md:relative md:flex-1 
              ${selectedUser ? "block" : "hidden"} // On mobile: Show if user selected, hide if no user
              md:block // On desktop: Always show
            `}
          >
            {/* Renders ChatContainer if user is selected, otherwise NoChatSelected */}
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;