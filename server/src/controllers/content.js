import { genAI } from "../config/gemini.js";
import User from "../models/User.js";
import { TextContent } from "../models/Creation.js";

const updateFreeUsage = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { dailyUsageCount: 1 } });
};

export const generateArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, length } = req.body;
    const user = await User.findById(userId);

    if (!prompt)
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    if (user.plan !== "premium" && user.dailyUsageCount >= 10) {
      return res.status(403).json({
        success: false,
        message: "Limit reached. Upgrade to premium.",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(
      `Generate an article about: ${prompt}. Desired length: ${length || "Standard"}`,
    );
    const content = result.response.text();

    await TextContent.create({
      userId,
      title: prompt,
      content,
      type: "article",
    });
    if (user.plan !== "premium") await updateFreeUsage(userId);

    res.status(200).json({ success: true, content });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate article",
    });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt } = req.body;
    const user = await User.findById(userId);

    if (!prompt)
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    if (user.plan !== "premium" && user.dailyUsageCount >= 10) {
      return res.status(403).json({
        success: false,
        message: "Limit reached. Upgrade to premium.",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(
      `Generate a catchy blog title for: ${prompt}`,
    );
    const content = result.response.text();

    await TextContent.create({
      userId,
      title: prompt,
      content,
      type: "blog-title",
    });
    if (user.plan !== "premium") await updateFreeUsage(userId);

    res.status(200).json({ success: true, content });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate blog title",
    });
  }
};