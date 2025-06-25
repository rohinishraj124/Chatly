import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    // Increased height to h-20 for more space, added shadow and changed background opacity
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/90 shadow-md" /* Added shadow-md and slightly increased opacity */
    >
      {/* Changed h-16 to h-full to occupy the new header height, added py-4 for vertical padding */}
      <div className="container mx-auto px-4 h-full py-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all">
              <div className="size-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src="/pic.png"
                  alt="Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <h1 className="text-xl font-extrabold text-primary">Chatly</h1>
            </Link>


          </div>

          <div className="flex items-center gap-3"> {/* Adjusted gap to 3 */}
            <Link
              to={"/settings"}
              className={`
              btn btn-ghost btn-sm gap-2 transition-colors text-base-content/70 hover:text-primary hover:bg-base-200
              `} /* Changed to btn-ghost for a cleaner look, added hover effects */
            >
              <Settings className="w-5 h-5" /> {/* Larger icon */}
              <span className="hidden sm:inline font-medium">Settings</span> {/* Added font-medium */}
            </Link>

            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className={`btn btn-ghost btn-sm gap-2 transition-colors text-base-content/70 hover:text-primary hover:bg-base-200`} /* Consistent ghost style */
                >
                  <User className="w-5 h-5" /> {/* Consistent icon size */}
                  <span className="hidden sm:inline font-medium">Profile</span> {/* Consistent font-medium */}
                </Link>

                <button
                  className="btn btn-ghost btn-sm gap-2 transition-colors text-error hover:bg-error/10" /* logout button styled with error color and hover */
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" /> {/* Consistent icon size */}
                  <span className="hidden sm:inline font-medium">Logout</span> {/* Consistent font-medium */}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;