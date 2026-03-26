import React, { useState } from "react";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios"; // Import our custom Axios instance

const Generateimages = () => {
  const imageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please describe the image you want to generate");
      return;
    }

    try {
      setLoading(true);
      
      // Combine the description and style for the backend's Gemini prompt
      const formattedPrompt = `${input} (Art Style: ${selectedStyle})`;

      // Hit our custom backend route
      // Note: We send 'publish' in case you update your backend controller to save it
      const { data } = await api.post("/image/generate", { 
        prompt: formattedPrompt,
        publish 
      });

      if (data.success) {
        setContent(data.content); // This is the Cloudinary secure_url
        toast.success("Image generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate image");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while generating the image"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col md:flex-row items-start gap-4 text-slate-700 custom-scroll">
      {/* Left Col */}
      <form
        className="w-full max-w-[460px] p-4 bg-white border rounded-lg border-gray-200 shrink-0"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        
        <p className="mt-6 font-medium text-sm">Describe Your Image</p>
        <textarea
          rows={4}
          placeholder="A futuristic city floating in the clouds at sunset..."
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-green-100 transition-shadow resize-none"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        
        <p className="mt-4 text-sm font-medium">Style Category</p>
        <div className="mt-3 flex flex-wrap gap-3 sm:max-w-9/11">
          {imageStyle.map((item) => (
            <span
              key={item}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
                selectedStyle === item
                  ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setSelectedStyle(item)}
            >
              {item}
            </span>
          ))}
        </div>
        
        <div className="my-6 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setPublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300 shadow"></span>
          </label>
          <p className="text-sm font-medium text-gray-700">Make this image Public</p>
        </div>
        
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2.5 mt-2 text-sm rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          {loading ? "Processing..." : "Generate Image"}
        </button>
      </form>

      {/* Right Col */}
      <div className="w-full flex-1 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[400px] h-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 shrink-0">
          <ImageIcon className="w-5 h-5 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>

        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p>Enter a description and click "Generate Image" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 flex justify-center items-center overflow-hidden bg-gray-50 rounded-lg border border-gray-100">
            <img 
              src={content} 
              alt="Generated AI Art" 
              className="max-w-full max-h-full object-contain rounded-md shadow-sm" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Generateimages;