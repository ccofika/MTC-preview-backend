const Product = require('../models/Product');
const { 
  uploadPdf, 
  deleteResource, 
  getPdfDownloadUrl, 
  getPdfViewUrl 
} = require('../config/cloudinary');

// Upload catalog PDF for product (admin)
const uploadCatalogPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Starting PDF upload for product:', id);
    
    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided'
      });
    }

    console.log('File received:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    // Delete existing catalog PDF if exists
    if (product.catalogPdf && product.catalogPdf.publicId) {
      try {
        await deleteResource(product.catalogPdf.publicId, 'raw');
        console.log('Old catalog PDF deleted:', product.catalogPdf.publicId);
      } catch (deleteError) {
        console.error('Old catalog PDF deletion error:', deleteError);
      }
    }

    // Upload new PDF to Cloudinary
    console.log('Uploading PDF to Cloudinary...');
    const uploadResult = await uploadPdf(req.file.buffer, {
      public_id: `catalog_${id}_${Date.now()}`
    });
    
    console.log('Upload successful:', {
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url
    });

    // Generate URLs with proper filename
    const downloadUrl = getPdfDownloadUrl(uploadResult.public_id, req.file.originalname);
    const viewUrl = getPdfViewUrl(uploadResult.public_id);
    
    console.log('Generated URLs:', {
      downloadUrl,
      viewUrl
    });
    
    // Update product with catalog PDF info
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        catalogPdf: {
          url: viewUrl,
          downloadUrl: downloadUrl,
          publicId: uploadResult.public_id,
          filename: req.file.originalname,
          uploadedAt: new Date()
        }
      },
      { new: true }
    );

    console.log('Product updated with PDF info');

    res.json({
      success: true,
      message: 'Catalog PDF uploaded successfully',
      data: {
        catalogPdf: updatedProduct.catalogPdf
      }
    });

  } catch (error) {
    console.error('Upload catalog PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload catalog PDF'
    });
  }
};

// Delete catalog PDF for product (admin)
const deleteCatalogPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Starting PDF deletion for product:', id);
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.catalogPdf || !product.catalogPdf.publicId) {
      return res.status(404).json({
        success: false,
        message: 'No catalog PDF found for this product'
      });
    }

    // Delete PDF from Cloudinary
    try {
      const deleteResult = await deleteResource(product.catalogPdf.publicId, 'raw');
      console.log('Cloudinary deletion result:', deleteResult);
    } catch (deleteError) {
      console.error('Catalog PDF deletion error:', deleteError);
    }

    // Remove catalog PDF info from product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $unset: { catalogPdf: 1 }
      },
      { new: true }
    );

    console.log('Product updated - PDF info removed');

    res.json({
      success: true,
      message: 'Catalog PDF deleted successfully',
      data: {
        product: updatedProduct
      }
    });

  } catch (error) {
    console.error('Delete catalog PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete catalog PDF'
    });
  }
};

// Download catalog PDF (public endpoint)
const downloadCatalogPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('PDF download requested for product:', id);
    
    // Find product (including non-hidden ones)
    const product = await Product.findOne({ 
      _id: id, 
      isActive: true, 
      $or: [{ isHidden: false }, { isHidden: { $exists: false } }] 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.catalogPdf || !product.catalogPdf.publicId) {
      return res.status(404).json({
        success: false,
        message: 'Catalog PDF not found for this product'
      });
    }

    // Generate download URL
    const downloadUrl = getPdfDownloadUrl(product.catalogPdf.publicId);
    
    console.log('Redirecting to download URL:', downloadUrl);
    
    // Redirect to Cloudinary download URL
    res.redirect(downloadUrl);

  } catch (error) {
    console.error('Download catalog PDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download catalog PDF'
    });
  }
};

module.exports = {
  uploadCatalogPdf,
  deleteCatalogPdf,
  downloadCatalogPdf
};