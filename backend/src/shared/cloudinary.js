import { v2 as cloudinary } from 'cloudinary';

// Never hardcode secrets here — read from backend/.env only.
// The previous fallback used the API *key* as the *secret*, which makes
// Cloudinary reject every signed upload with:
//   401 "Invalid Signature ... String to sign - 'folder=...&public_id=...&timestamp=...'"
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const isCloudinaryConfigured = () =>
  Boolean(cloudName && apiKey && apiSecret);

export const uploadBufferToCloudinary = (buffer, filename, folder = 'aesix_socrates_docs') => {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new Error(
        'Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET missing in backend/.env). File kept as local fallback.'
      )
    );
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
