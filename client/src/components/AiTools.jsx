import React from "react";
import { useNavigate } from "react-router-dom";
import { AiToolsData } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const AiTools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      <div className="text-center mb-16">
        <h2 className="text-slate-800 text-3xl sm:text-[42px] font-bold mb-4">
          Powerful AI Tools
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Everything you need to create, enhance, and optimize your content with cutting-edge AI technology, including our new enterprise video chunking engine.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6">
        {AiToolsData.map((tool, index) => (
          <div
            key={index}
            className="p-8 w-full sm:w-[320px] rounded-2xl bg-white shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            onClick={() => {
              if (user) {
                navigate(tool.path);
              } else {
                navigate("/login");
              }
            }}
          >
            <div className="mb-6 inline-block rounded-2xl p-0.5 transition-transform group-hover:scale-110 duration-300" style={{ background: `linear-gradient(to bottom right, ${tool.bg.from}, ${tool.bg.to})` }}>
                <tool.Icon className="w-14 h-14 p-3.5 text-white" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-800">{tool.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTools;