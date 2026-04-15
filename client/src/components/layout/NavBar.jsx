import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets"; 
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed z-50 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 border-b border-gray-100 bg-white/70">
      <img
        src={assets.logo}
        alt="logo"
        className="w-32 sm:w-44 cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      />

      {user ? (
        <div className="relative" ref={dropdownRef}>
          {/* Custom User Avatar Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 focus:outline-none ring-2 ring-transparent hover:ring-blue-100 rounded-full transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          </button>

          {/* Custom User Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
              
              <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50">
                <span className="text-xs text-gray-600">Plan</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wide">
                  {user.plan || "PREMIUM"}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 rounded-full text-sm font-medium cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 transition-all shadow-sm hover:shadow-md"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default NavBar;