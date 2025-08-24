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
    // Try different approaches based on file size
    const fileSize = buffer.length;
    console.log(`Uploading PDF of size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // For files larger than 10MB, we need to check Cloudinary account limits
    if (fileSize > 10 * 1024 * 1024) {
      console.log('Large file detected, using alternative upload strategy');
      
      // Try with unsigned upload preset (if configured)
      try {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.unsigned_upload_stream(
            process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default',
            {
              resource_type: 'raw',
              folder: 'nissal/catalogs',
              ...options
            },
            (error, result) => {
              if (error) {
                console.error('Unsigned upload failed:', error);
                // Fall back to regular upload
                fallbackUpload(buffer, options, resolve, reject);
              } else {
                console.log('Unsigned upload success:', { 
                  publicId: result.public_id, 
                  bytes: result.bytes 
                });
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
        });
      } catch (unsignedError) {
        console.log('Unsigned upload not available, trying regular upload');
        return regularUpload(buffer, options);
      }
    } else {
      return regularUpload(buffer, options);
    }
  } catch (error) {
    throw new Error(`PDF upload failed: ${error.message}`);
  }
};

// Helper function for regular upload
const regularUpload = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'nissal/catalogs',
        timeout: 120000,
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Regular upload error:', error);
          reject(error);
        } else {
          console.log('Regular upload success:', { 
            publicId: result.public_id, 
            bytes: result.bytes 
          });
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Fallback upload function
const fallbackUpload = (buffer, options, resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      resource_type: 'raw',
      folder: 'nissal/catalogs',
      timeout: 120000,
      ...options
    },
    (error, result) => {
      if (error) {
        console.error('Fallback upload error:', error);
        reject(error);
      } else {
        console.log('Fallback upload success:', { 
          publicId: result.public_id, 
          bytes: result.bytes 
        });
        resolve(result);
      }
    }
  );
  uploadStream.end(buffer);
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
  // For PDFs, we'll use a different approach - serve through our backend with proper headers
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true
  });
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