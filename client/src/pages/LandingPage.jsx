import React from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react"; // Using lucide-react as a placeholder for assets.user_group

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-20 xl:px-32 relative flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2] text-gray-900">
          The Ultimate Workspace for <br />
          <span className="text-primary">AI Generation</span>
        </h1>
        <p className="mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl mx-auto max-sm:text-xs text-gray-600">
          Transform your workflow with our suite of premium AI tools.
          Generate articles, process images, review resumes, and summarize YouTube videos instantly.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs mt-2">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer"
        >
          Start Creating Now
        </button>
        <button className="bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer text-gray-700">
          Watch Demo
        </button>
        
      </div>

      <div className="flex items-center justify-center gap-4 mt-12 mx-auto text-gray-600">
        <Users className="h-6 w-6 text-primary" />
        <span className="font-medium text-sm sm:text-base">Trusted by 10k+ creators</span>
      </div>
    </div>
  );
};

export default LandingPage;