import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
      if (user) {
          navigate('/ai');
      } else {
          navigate('/login');
      }
  };

  return (
    <div className="px-4 sm:px-20 xl:px-32 pt-24 relative inline-flex flex-col w-full justify-center bg-[url('/gradientBackground.png')] bg-cover bg-center bg-no-repeat min-h-screen">
      <div className="text-center mb-6 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2] text-gray-900">
          Create amazing content & <br /> master videos with <br/>
          <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">AI tools</span>
        </h1>
        <p className="mt-6 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto text-sm sm:text-base text-gray-600">
          Transform your workflow with our premium AI suite. Generate articles, design images, and turn any YouTube video into a 60-page interactive study guide instantly.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs z-10 mt-4">
        <button 
            onClick={handleStart} 
            className="bg-blue-600 text-white px-10 py-3.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
        >
          {user ? "Go to Dashboard" : "Start Creating Now"}
        </button>
        <button className="bg-white px-10 py-3.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer font-medium">
          Watch Demo
        </button>
      </div>
      
      <div className="flex items-center gap-4 mt-12 mx-auto text-gray-600 z-10 bg-white/50 px-6 py-2 rounded-full backdrop-blur-sm border border-gray-100">
        <img src={assets.user_group} alt="user-group" className="h-8" /> 
        <span className="font-medium text-sm">Trusted by 10k+ creators & students</span>
      </div>
    </div>
  );
};

export default Hero;