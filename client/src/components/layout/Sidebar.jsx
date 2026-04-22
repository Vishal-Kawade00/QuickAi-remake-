import React from "react";
import { NavLink } from "react-router-dom";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  Users,
  PlaySquare // Added for the new YouTube feature
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: "/ai", label: "Dashboard", Icon: House },
    // New QuickAi YouTube Feature
    { to: "/ai/study-sessions", label: "Study Sessions", Icon: PlaySquare },
    // Standard Tools
    { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
    { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
    { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
    { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
    { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
    { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
    { to: "/ai/community", label: "Community", Icon: Users },
  ];

  // Helper to generate a consistent avatar 
  const Avatar = ({ size = "w-12 h-12", textSize = "text-xl" }) => (
    <div className={`${size} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm mx-auto`}>
      <span className={textSize}>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
    </div>
  );

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between max-sm:absolute top-14 bottom-0 z-40 ${
        sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="my-7 w-full overflow-y-auto">
        <Avatar />
        <h1 className="mt-2 text-center font-medium text-gray-800">{user?.name}</h1>
        
        <div className="mt-6 flex flex-col gap-1 px-3">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={() => setSidebar && setSidebar(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span className="text-sm font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-gray-200 p-4 flex justify-between items-center bg-gray-50/50">
        <div className="flex gap-3 items-center">
          <Avatar size="w-9 h-9" textSize="text-sm" />
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-gray-800 truncate w-24">{user?.name}</h1>
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              {user?.plan || "Premium"} Plan
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors group"
          title="Sign out"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;