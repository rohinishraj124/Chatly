import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, ArrowLeft } from "lucide-react"; // Import ArrowLeft icon
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate(); // Initialize useNavigate

  // Optional: Ensure 'light' is the default if not already handled in your store
  // You might not need this if your useThemeStore already defaults to 'light'
  // React.useEffect(() => {
  //   if (!theme) { // If theme is not set, default to 'light'
  //     setTheme('light');
  //   }
  // }, [theme, setTheme]);


  return (
    <div className="min-h-screen bg-base-300 text-base-content py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-5xl w-full bg-base-100 rounded-3xl shadow-xl p-8 space-y-10 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)} // Navigate back one step in history
          className="absolute top-6 left-6 p-2 rounded-full bg-base-200 hover:bg-base-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-base-content" />
        </button>

        <div className="text-center mt-6"> {/* Adjusted margin-top for title to clear button */}
          <h1 className="text-3xl font-extrabold text-primary">Settings</h1>
          <p className="mt-2 text-lg text-base-content/80">Personalize your chat experience</p>
        </div>

        {/* Theme Selection Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Theme</h2>
            <p className="text-base-content/70 text-sm">Choose a visual theme for your chat interface</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ease-in-out
                  shadow-md
                  ${theme === t ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100 bg-base-200" : "bg-base-100 hover:bg-base-200/60"}
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-10 w-full rounded-lg overflow-hidden border border-base-content/10" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Theme Preview</h3>
          <p className="text-base-content/70 text-sm">See how your chosen theme looks in action</p>
          <div className="rounded-2xl border border-base-300 overflow-hidden bg-base-100 shadow-xl">
            <div className="p-6 bg-base-200"> {/* Increased padding slightly */}
              <div className="max-w-md mx-auto"> {/* Adjusted max-w for a slightly narrower preview */}
                {/* Mock Chat UI */}
                <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden border border-base-300">
                  {/* Chat Header */}
                  <div className="px-5 py-4 border-b border-base-300 bg-base-100"> {/* Increased padding */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-semibold text-lg">
                        J
                      </div>
                      <div>
                        <h3 className="font-medium text-base">John Doe</h3>
                        <p className="text-sm text-base-content/70">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 min-h-[220px] max-h-[220px] overflow-y-auto bg-base-100 custom-scrollbar"> {/* Added custom-scrollbar */}
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`
                            max-w-[75%] rounded-2xl p-3 shadow-md
                            ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}
                          `}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`
                              text-[11px] mt-1.5
                              ${message.isSent ? "text-primary-content/80" : "text-base-content/70"}
                            `}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-5 border-t border-base-300 bg-base-100"> {/* Increased padding */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text-sm h-11 rounded-full px-4"
                        placeholder="Type a message..."
                        value="This is a preview"
                        readOnly
                      />
                      <button className="btn btn-primary h-11 w-11 min-h-0 rounded-full">
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;