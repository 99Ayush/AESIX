import * as userService from "../service/userService.js";

function sendError(res, error) {
  const notFound = ["Doctor not found.", "Notification not found.", "Allergy not found."].includes(error.message);
  return res.status(notFound ? 404 : 400).json({ success: false, error: error.message || "Request failed." });
}
const handle = (operation, successStatus = 200) => async (req, res) => {
  try { return res.status(successStatus).json({ success: true, data: await operation(req) }); }
  catch (error) { return sendError(res, error); }
};
export const getProfile = handle(() => userService.getProfile());
export const getUserById = handle((req) => userService.getUserById(req.params.id));
export const registerUser = handle((req) => userService.registerUser(req.body || {}), 201);
export const updateProfile = handle((req) => userService.updateProfile(req.body || {}));
export const uploadProfilePhoto = handle((req) => {
  if (!req.file) throw new Error("An image file is required in the photo field.");
  return userService.updateProfile({ photoUrl: `/api/users/uploads/${req.file.filename}` });
});
export const getAllergies = handle(() => userService.getAllergies());
export const addAllergy = handle((req) => userService.addAllergy(req.body?.allergy), 201);
export const removeAllergy = handle((req) => userService.removeAllergy(req.params.allergy));
export const getNotifications = handle(() => userService.getNotifications());
export const markNotificationRead = handle((req) => userService.markNotificationRead(req.params.notificationId));
export const findDoctors = handle((req) => userService.findDoctors(req.query));
export const getAppointments = handle(() => userService.getAppointments());
export const scheduleAppointment = handle((req) => userService.scheduleAppointment(req.body || {}), 201);
