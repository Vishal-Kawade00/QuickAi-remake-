import cloudinary from "../config/cloudinary.js";

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted:", result);
  } catch (error) {
    console.error("Delete failed:", error.message);
  }
};