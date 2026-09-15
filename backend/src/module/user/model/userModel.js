import mongoose from "mongoose";

let databaseReady = false;

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email:  {
  type: String,
  unique: true,
  sparse: true, // Allows multiple documents to have missing/null email fields
  trim: true,
  lowercase: true,
},
  phone: { type: String, default: "" },
  dateOfBirth: { type: Date },
  gender: { type: String, default: "" },
  address: { type: String, default: "" },
  bloodGroup: { type: String, default: "" },
  photoUrl: { type: String, default: null },
  allergies: { type: [String], default: [] },
  isDemoUser: { type: Boolean, default: false, index: true },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true, index: true },
  hospital: { type: String, required: true, trim: true },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String, default: "", trim: true },
  status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export function buildMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Add it to backend/.env.");
  // Atlas templates may contain placeholders; never log the completed URI.
  return uri
    .replace(/<db_username>|<username>/gi, encodeURIComponent(process.env.MONGODB_USERNAME || ""))
    .replace(/<db_password>|<password>/gi, encodeURIComponent(process.env.MONGODB_PASSWORD || ""));
}

export async function connectUserDatabase() {
  if (databaseReady && mongoose.connection.readyState === 1) return;
  await mongoose.connect("mongodb+srv://ayushpanther_db_user:K0dEyxPngLRn5i9B@aesix-db.85x9avh.mongodb.net");
  databaseReady = true;
}

/**
 * DEMO SEED DATA — delete or replace this function when production data is ready.
 * It runs only when the user and doctor collections are empty.
 */
export async function seedUserDemoData() {
  if (await Doctor.countDocuments() === 0) {
    await Doctor.insertMany([
      { name: "Dr. Meera Iyer", specialty: "General Physician", hospital: "City Care Hospital" },
      { name: "Dr. Kabir Singh", specialty: "Cardiologist", hospital: "Metro Heart Centre" },
      { name: "Dr. Naina Gupta", specialty: "Dermatologist", hospital: "Wellness Clinic" },
    ]);
  }
  let user = await User.findOne({ isDemoUser: true });
  if (!user) {
    user = await User.create({
      fullName: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "+91 98765 43210",
      dateOfBirth: new Date("1998-04-18"), bloodGroup: "O+", allergies: ["Penicillin", "Peanuts"], isDemoUser: true,
    });
  }
  if (await Notification.countDocuments({ userId: user._id }) === 0) {
    await Notification.create({ userId: user._id, title: "Annual check-up due", message: "Book your annual check-up when convenient." });
  }
}
