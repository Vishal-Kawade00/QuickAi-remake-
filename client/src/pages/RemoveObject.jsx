import React, { useState } from "react";
import { Scissors, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios"; // Import our custom Axios instance

const RemoveObject = () => {
  const [object, setObject] = useState("");
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please select an image file");
      return;
    }

    // Ensure the user only enters a single word/object to help Cloudinary's AI
    if (object.trim().split(" ").length > 1) {
      toast.error("Please enter only one object name (e.g., 'watch', 'person')");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", input); // Matches multer upload.single('image')
      formData.append("object", object.trim());

      // Hit our custom backend route
      const { data } = await api.post(
        "/image/remove-object",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setContent(data.content); // This is the Cloudinary secure_url
        toast.success("Object removed successfully!");
      } else {
        toast.error(data.message || "Failed to remove Object");
      }
    } catch (error) {
      console.error("Remove object error:", error);
      toast.error(error.response?.data?.message || "Failed to remove Object");
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
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
        </div>
        
        <p className="mt-6 font-medium text-sm">Upload Image</p>
        <input
          type="file"
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-100 transition-shadow text-gray-700"
          onChange={(e) => setInput(e.target.files[0])}
          accept="image/*"
        />
        
        <p className="mt-6 font-medium text-sm">Describe object to remove</p>
        <textarea
          rows={2}
          placeholder="e.g., watch, spoon, or person (single object name only)"
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-100 transition-shadow resize-none"
          onChange={(e) => setObject(e.target.value)}
          value={object}
        />
        
        <button
          type="submit"
          disabled={loading || !input || !object}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2.5 mt-6 text-sm rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Scissors className="w-4 h-4" />
          )}
          {loading ? "Processing..." : "Remove Object"}
        </button>
      </form>

      {/* Right Col */}
      <div className="w-full flex-1 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[400px] h-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 shrink-0">
          <Scissors className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full">
                <Scissors className="w-8 h-8 text-gray-300" />
              </div>
              <p>Upload an image, name the object, and click "Remove Object"</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scroll">
            {/* Checkered background for consistent UI behavior with image tools */}
            <div 
              className="relative w-full min-h-75 flex-1 rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-gray-50 flex items-center justify-center"
            >
              <img 
                src={content} 
                alt="Processed image with object removed" 
                className="max-w-full max-h-full object-contain relative z-10"
              />
            </div>
            
            <a
              href={content}
              download="object-removed.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium text-sm"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveObject;