import React, { useState } from "react";
import { Hash, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import api from "../api/axios"; // Import our custom Axios instance

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  const [selectedCategory, setSelectedCategory] = useState("General");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    try {
      setLoading(true);
      
      // We combine the input and category so the backend's prompt wrapper 
      // ("Generate a catchy blog title for: ${prompt}") receives all the context.
      const formattedPrompt = `${input} (Target Category: ${selectedCategory})`;

      // Hit our custom backend route
      const { data } = await api.post("/content/blog-title", {
        prompt: formattedPrompt,
      });

      if (data.success) {
        setContent(data.content);
        toast.success("Titles generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate titles");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while generating titles"
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
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>
        
        <p className="mt-6 font-medium text-sm">Keyword</p>
        <input
          type="text"
          placeholder="e.g. The future of Artificial Intelligence"
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-100 transition-shadow"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        
        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex flex-wrap gap-3 sm:max-w-9/11">
          {blogCategories.map((item) => (
            <span
              key={item}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setSelectedCategory(item)}
            >
              {item}
            </span>
          ))}
        </div>
        
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2.5 mt-6 text-sm rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-4 h-4" />
          )}
          {loading ? "Processing..." : "Generate Title"}
        </button>
      </form>

      {/* Right Col */}
      <div className="w-full flex-1 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-100 h-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 shrink-0">
          <Hash className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Titles</h1>
        </div>

        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full">
                <Hash className="w-8 h-8 text-gray-300" />
              </div>
              <p>Enter a keyword and click "Generate Title" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-auto text-sm text-slate-700 custom-scroll pr-2">
            <div className="prose prose-sm max-w-none prose-purple">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;