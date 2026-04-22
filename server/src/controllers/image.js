import cloudinary from "../config/cloudinary.js";
import { genAI } from "../config/gemini.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import User from "../models/User.js";
import { ImageTask } from "../models/Creation.js";

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// 1. Generate Image
export const generateImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt } = req.body;
    const user = await User.findById(userId);

    if (!prompt)
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    if (user.plan !== "premium")
      return res
        .status(403)
        .json({ success: false, message: "Premium feature only" });

    // Instantiate the Gemini Image Generation model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // Generate the image via Gemini
    const result = await model.generateContent(prompt);

    // Extract the base64 data directly from the Gemini response
    const base64Data = result.response.parts[0].inlineData.data;
    const base64Image = `data:image/png;base64,${base64Data}`;

    // Upload the generated image to Cloudinary for permanent hosting
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "generated-images",
      resource_type: "image",
    });

    // Save the record to MongoDB
    await ImageTask.create({
      userId,
      prompt: prompt,
      processedImageUrl: secure_url,
      taskType: "generation",
    });

    res.status(200).json({ success: true, content: secure_url });
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to generate image via Gemini",
      });
  }
};

// 2. Remove Background (Kept as remove.bg - Industry Standard)
export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.user.id;
    const image = req.file;
    const user = await User.findById(userId);

    if (user.plan !== "premium")
      return res
        .status(403)
        .json({ success: false, message: "Premium feature only" });
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded" });

    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(image.path));
    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": process.env.REMOVEBG_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      },
    );

    const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "background-removed",
      resource_type: "image",
    });

    cleanupFile(image.path);
    await ImageTask.create({
      userId,
      prompt: "Remove Bacground",
      processedImageUrl: secure_url,
      taskType: "background_removal",
    });

    res.status(200).json({ success: true, content: secure_url });
  } catch (error) {
    cleanupFile(req.file?.path);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to remove background",
      });
  }
};

// 3. Remove Object (Kept as Cloudinary AI - Natively supported)
export const removeImageObject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { object } = req.body;
    const image = req.file;
    const user = await User.findById(userId);

    if (user.plan !== "premium")
      return res
        .status(403)
        .json({ success: false, message: "Premium feature only" });
    if (!image || !object) {
      cleanupFile(image?.path);
      return res
        .status(400)
        .json({ success: false, message: "Image and object required" });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path, {
      folder: "object-removed",
      resource_type: "image",
    });
    cleanupFile(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });
    await ImageTask.create({
      userId,
      prompt: `Reomve ${object}`,
      processedImageUrl: imageUrl,
      taskType: "object_removal",
    });

    res.status(200).json({ success: true, content: imageUrl });
  } catch (error) {
    cleanupFile(req.file?.path);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to remove object",
      });
  }
};