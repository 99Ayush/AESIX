import { Appointment, Doctor, Notification, User } from "../model/userModel.js";

const serializeUser = (user) => ({ id: user._id.toString(), fullName: user.fullName, email: user.email, phone: user.phone, gender: user.gender, address: user.address, dateOfBirth: user.dateOfBirth, bloodGroup: user.bloodGroup, photoUrl: user.photoUrl, allergies: user.allergies });
async function getDemoUser() {
  const user = await User.findOne({ isDemoUser: true });
  if (!user) throw new Error("Demo user is unavailable. Check the database connection.");
  return user;
}
export async function getProfile() { return serializeUser(await getDemoUser()); }
export async function getUserById(userId) {
  if (!userId) throw new Error("User ID is required.");
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");
  return serializeUser(user);
}
export async function registerUser({ fullName, email, password, phone = "", dateOfBirth, bloodGroup = "", photoUrl = null, allergies = [] }) {
  if (!fullName?.trim() || !email?.trim() || !password) throw new Error("fullName, email, and password are required.");
  if (password.length < 8) throw new Error("Password must contain at least 8 characters.");
  try {
    const user = await User.create({
      fullName: fullName.trim(), email: email.trim(), phone, dateOfBirth, bloodGroup, photoUrl,
      allergies: Array.isArray(allergies) ? allergies : [], isDemoUser: false,
    });
    // Password handling is intentionally not persisted until authentication is implemented.
    return serializeUser(user);
  } catch (error) {
    if (error?.code === 11000) throw new Error("An account with this email already exists.", { cause: error });
    throw error;
  }
}
export async function updateProfile(updates) {
  const allowed = ["fullName", "email", "phone", "gender", "address", "dateOfBirth", "bloodGroup", "photoUrl"];
  const safeUpdates = Object.fromEntries(allowed.filter((key) => updates[key] !== undefined).map((key) => [key, updates[key]]));
  const user = await User.findOneAndUpdate({ isDemoUser: true }, safeUpdates, { new: true, runValidators: true });
  if (!user) throw new Error("Demo user is unavailable.");
  return serializeUser(user);
}
export async function getAllergies() { return (await getDemoUser()).allergies; }
export async function addAllergy(allergy) {
  const value = allergy?.trim();
  if (!value) throw new Error("Allergy is required.");
  const user = await getDemoUser();
  if (!user.allergies.some((item) => item.toLowerCase() === value.toLowerCase())) { user.allergies.push(value); await user.save(); }
  return user.allergies;
}
export async function removeAllergy(allergy) {
  const user = await getDemoUser();
  const before = user.allergies.length;
  user.allergies = user.allergies.filter((item) => item.toLowerCase() !== allergy.toLowerCase());
  if (user.allergies.length === before) throw new Error("Allergy not found.");
  await user.save();
  return user.allergies;
}
export async function getNotifications() {
  const user = await getDemoUser();
  return Notification.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
}
export async function markNotificationRead(notificationId) {
  const user = await getDemoUser();
  const notification = await Notification.findOneAndUpdate({ _id: notificationId, userId: user._id }, { read: true }, { new: true }).lean();
  if (!notification) throw new Error("Notification not found.");
  return notification;
}
export async function findDoctors({ specialty, search } = {}) {
  const filters = {};
  if (specialty?.trim()) filters.specialty = { $regex: specialty.trim(), $options: "i" };
  if (search?.trim()) { const query = { $regex: search.trim(), $options: "i" }; filters.$or = [{ name: query }, { specialty: query }, { hospital: query }]; }
  return Doctor.find(filters).sort({ name: 1 }).lean();
}
export async function scheduleAppointment({ doctorId, date, time, reason = "" }) {
  if (!doctorId || !date || !time) throw new Error("doctorId, date, and time are required.");
  const [user, doctor] = await Promise.all([getDemoUser(), Doctor.findById(doctorId).lean()]);
  if (!doctor) throw new Error("Doctor not found.");
  try { const appointment = await Appointment.create({ userId: user._id, doctorId, date, time, reason }); return { ...appointment.toObject(), doctor }; }
  catch (error) { if (error?.code === 11000) throw new Error("This time slot is already booked.", { cause: error }); throw error; }
}
export async function getAppointments() {
  const user = await getDemoUser();
  return Appointment.find({ userId: user._id }).populate("doctorId", "name specialty hospital").sort({ date: 1, time: 1 }).lean();
}
