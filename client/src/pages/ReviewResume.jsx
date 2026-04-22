import React, { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import api from "../api/axios"; // Import our custom Axios instance

const ReviewResume = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a resume file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file); // Matches upload.single('resume') in backend

      // Hit our custom backend route
      const { data } = await api.post(
        "/document/resume-review",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Resume analyzed successfully!");
      } else {
        toast.error(data.message || "Failed to analyze resume");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to analyze resume"
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
          <Sparkles className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>
        
        <p className="mt-6 font-medium text-sm">Upload Resume</p>
        <input
          type="file"
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-100 transition-shadow text-gray-700"
          onChange={(e) => setFile(e.target.files[0])}
          accept="application/pdf"
        />
        <p className="text-xs text-gray-500 font-light mt-2">
          Supports PDF resume only. (Max 5MB)
        </p>
        
        <button
          disabled={loading || !file}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD83] to-[#009BB3] text-white px-4 py-2.5 mt-6 text-sm rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {loading ? "Processing..." : "Review Resume"}
        </button>
      </form>

      {/* Right Col */}
      <div className="w-full flex-1 p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-100 h-full overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 shrink-0">
          <FileText className="w-5 h-5 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Analysis Results</h1>
        </div>

        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-400">
              <div className="p-4 bg-gray-50 rounded-full">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p>Upload a resume and click "Review Resume" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-y-auto text-sm text-slate-700 custom-scroll pr-2">
            <div className="prose prose-sm max-w-none prose-teal">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;