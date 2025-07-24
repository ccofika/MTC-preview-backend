const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOptions = {
  products: {
    folder: 'nissal/products',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  },
  projects: {
    folder: 'nissal/projects',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  },
  attachments: {
    folder: 'nissal/attachments',
    resource_type: 'auto'
  }
};

const uploadImage = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          ...options,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary batch delete failed: ${error.message}`);
  }
};

const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

module.exports = {
  cloudinary,
  uploadOptions,
  uploadImage,
  deleteImage,
  deleteMultipleImages,
  getImageUrl
};