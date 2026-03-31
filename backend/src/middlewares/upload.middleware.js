const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { hasCloudinaryConfig } = require('../services/storage.service');

const uploadDir = path.resolve(process.env.UPLOAD_PATH || 'uploads/profiles');
const useLocalDiskStorage = !hasCloudinaryConfig() && process.env.VERCEL !== '1';

if (useLocalDiskStorage && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = (hasCloudinaryConfig() || !useLocalDiskStorage)
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename:    (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
      },
    });

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
             allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = upload;
