const fs = require('fs');
const path = require('path');

let cloudinary = null;
try {
  ({ v2: cloudinary } = require('cloudinary'));
} catch {
  cloudinary = null;
}

const hasCloudinaryConfig = () =>
  Boolean(
    cloudinary &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

if (hasCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const isRemoteUrl = (value) => /^https?:\/\//i.test(value || '');

const uploadProfileImage = async (file) => {
  if (!file) return null;

  if (hasCloudinaryConfig()) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'library-system/profiles',
          resource_type: 'image',
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );

      stream.end(file.buffer);
    });
  }

  return file.filename;
};

const extractCloudinaryPublicId = (url) => {
  if (!isRemoteUrl(url) || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

const deleteProfileImage = async (imageRef) => {
  if (!imageRef) return;

  if (isRemoteUrl(imageRef)) {
    if (hasCloudinaryConfig()) {
      const publicId = extractCloudinaryPublicId(imageRef);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    }
    return;
  }

  const imagePath = path.join(process.env.UPLOAD_PATH || 'uploads/profiles', imageRef);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
};

module.exports = {
  hasCloudinaryConfig,
  isRemoteUrl,
  uploadProfileImage,
  deleteProfileImage,
};
