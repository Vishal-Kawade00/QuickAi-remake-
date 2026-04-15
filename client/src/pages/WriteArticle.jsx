import React, { useState } from "react";
import { Edit, Sparkle } from "lucide-react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";
import api from "../api/axios"; // Import our custom Axios instance

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];
  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    try {
      setLoading(true);

      // Hit our custom backend route.
      // We pass the raw input and length description. The backend formats the actual AI prompt.
      const formattedPrompt = `${input} (Length of the Article ${selectedLength.text})`;
      const { data } = await api.post("/content/article", {
        prompt: formattedPrompt
      });

      if (data.success) {
        setContent(data.content);
        toast.success("Article generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate article");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while generating the article"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col md:flex-row items-start gap-4 text-slate-700 custom-scroll">
      {/* Left Col */}
      <form
        className="w-full max-w-115 p-4 bg-white border rounded-lg border-gray-200 shrink-0"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkle className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        
        <p className="mt-6 font-medium text-sm">Article Topic</p>
        <input
          type="text"
          placeholder="The future of Artificial Intelligence is..."
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-100 transition-shadow"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        
        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex flex-wrap gap-3 sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <span
              key={index}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
                selectedLength.text === item.text
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setSelectedLength(item)}
            >
              {item.text}
            </span>
          ))}
        </div>
        
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2.5 mt-6 text-sm rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Edit className="w-4 h-4" />
          )}
          {loading ? "Processing..." : "Generate Article"}
        </button>
      </form>

      {/* Right Col */}
      <div className="w-full flex-1 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-100 h-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 shrink-0">
          <Edit className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Generated Article</h1>
        </div>
        
        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full">
                <Edit className="w-8 h-8 text-gray-300" />
              </div>
              <p>Enter a topic and click "Generate Article" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-auto text-sm text-slate-700 custom-scroll pr-2">
            <div className="prose prose-sm max-w-none prose-blue">
              {/* react-markdown will safely render the output from Gemini */}
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;