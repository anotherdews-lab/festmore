// utils/upload.js
// Cloudinary upload middleware using multer

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── EVENT PHOTOS STORAGE ───
const eventStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'festmore/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
  },
});

// ─── VENDOR PHOTOS STORAGE ───
const vendorStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'festmore/vendors',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
  },
});

// ─── UPLOAD HANDLERS ───
const uploadEventPhotos  = multer({ storage: eventStorage,  limits: { fileSize: 10 * 1024 * 1024 } }).array('photos', 6);
const uploadVendorPhotos = multer({ storage: vendorStorage, limits: { fileSize: 10 * 1024 * 1024 } }).array('photos', 6);

// ─── HELPER: wrap multer in promise ───
function handleUpload(uploadFn, req, res) {
  return new Promise((resolve, reject) => {
    uploadFn(req, res, (err) => {
      if (err) reject(err);
      else resolve(req.files || []);
    });
  });
}

module.exports = { uploadEventPhotos, uploadVendorPhotos, handleUpload, cloudinary };