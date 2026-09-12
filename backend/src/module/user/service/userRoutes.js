import { Router } from "express";
import multer from "multer";
import { extname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { addAllergy, findDoctors, getAllergies, getAppointments, getNotifications, getProfile, markNotificationRead, registerUser, removeAllergy, scheduleAppointment, updateProfile, uploadProfilePhoto } from "./controller/userController.js";

const userRouter = Router();
const uploadsDirectory = join(fileURLToPath(new URL(".", import.meta.url)), "uploads");
mkdirSync(uploadsDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
  },
});

userRouter.post("/register", registerUser);
userRouter.get("/profile", getProfile);
userRouter.patch("/profile", updateProfile);
userRouter.post("/profile/photo", upload.single("photo"), uploadProfilePhoto);
userRouter.get("/allergies", getAllergies);
userRouter.post("/allergies", addAllergy);
userRouter.delete("/allergies/:allergy", removeAllergy);
userRouter.get("/notifications", getNotifications);
userRouter.patch("/notifications/:notificationId/read", markNotificationRead);
userRouter.get("/doctors", findDoctors);
userRouter.get("/appointments", getAppointments);
userRouter.post("/appointments", scheduleAppointment);
export default userRouter;
