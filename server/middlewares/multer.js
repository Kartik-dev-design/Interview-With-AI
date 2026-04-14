import multer from "multer";

const storage = multer.memoryStorage(); // 🔥 IMPORTANT

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
