const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const propertyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'domivault/properties',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'domivault/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

const uploadPropertyImages = multer({ storage: propertyStorage });
const uploadDocuments = multer({ storage: documentStorage });

console.log('Cloudinary configured:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('uploadDocuments type:', typeof uploadDocuments);

module.exports = { cloudinary, uploadPropertyImages, uploadDocuments };