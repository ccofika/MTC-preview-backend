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

// Upload regular images
const uploadImage = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          ...options
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

// Upload PDF files specifically
const uploadPdf = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'nissal/catalogs',
          ...options
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
    throw new Error(`PDF upload failed: ${error.message}`);
  }
};

// Delete any resource (image or PDF)
const deleteResource = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Generate image URL
const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

// Generate PDF download URL with proper filename
const getPdfDownloadUrl = (publicId, filename = null) => {
  const options = {
    resource_type: 'raw',
    secure: true,
    flags: 'attachment'
  };
  
  // Add filename if provided to ensure .pdf extension
  if (filename) {
    // Ensure filename has .pdf extension
    const cleanFilename = filename.endsWith('.pdf') ? filename : filename + '.pdf';
    options.flags = `attachment:${cleanFilename}`;
  }
  
  return cloudinary.url(publicId, options);
};

// Generate PDF view URL (for direct access)
const getPdfViewUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true
  });
};

module.exports = {
  cloudinary,
  uploadOptions,
  uploadImage,
  uploadPdf,
  deleteResource,
  getImageUrl,
  getPdfDownloadUrl,
  getPdfViewUrl
};