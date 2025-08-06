const Product = require('../models/Product');
const { 
  uploadImage, 
  uploadPdf, 
  deleteResource, 
  getPdfDownloadUrl, 
  getPdfViewUrl 
} = require('../config/cloudinary');

// Get all products with filtering and pagination
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      colors,
      sizes,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true, $or: [{ isHidden: false }, { isHidden: { $exists: false } }] };
    
    if (category) {
      filter['catalog.category'] = { $regex: category, $options: 'i' };
    }
    
    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : [colors];
      filter['colors.name'] = { $in: colorArray.map(c => new RegExp(c, 'i')) };
    }
    
    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
      filter['sizes.name'] = { $in: sizeArray.map(s => new RegExp(s, 'i')) };
    }
    
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') {
      filter['availability.inStock'] = true;
      filter['availability.quantity'] = { $gt: 0 };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'catalog.catalogNumber': { $regex: search, $options: 'i' } },
        { 'catalog.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        filters: {
          category,
          colors,
          sizes,
          minPrice,
          maxPrice,
          inStock,
          search
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

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

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // For now, get latest products as featured
    // You can add a 'featured' field to Product model later
    const products = await Product.find({ 
      isActive: true,
      'availability.inStock': true 
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('catalog.category', { isActive: true });

    res.json({
      success: true,
      data: categories.filter(Boolean)
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get available colors
const getAvailableColors = async (req, res) => {
  try {
    const colors = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$colors' },
      { 
        $group: {
          _id: {
            name: '$colors.name',
            hexCode: '$colors.hexCode'
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          hexCode: '$_id.hexCode'
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      data: colors
    });

  } catch (error) {
    console.error('Get available colors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available colors'
    });
  }
};

// Get available sizes
const getAvailableSizes = async (req, res) => {
  try {
    const sizes = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$sizes' },
      { 
        $group: {
          _id: {
            name: '$sizes.name',
            code: '$sizes.code'
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          code: '$_id.code'
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      data: sizes
    });

  } catch (error) {
    console.error('Get available sizes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available sizes'
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'catalog.catalogNumber': { $regex: search, $options: 'i' } },
        { 'catalog.tags': { $in: [new RegExp(search, 'i')] } }
      ]
    })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: products,
      searchTerm: search
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category, limit = 12, page = 1 } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const filter = {
      isActive: true,
      'catalog.category': { $regex: category, $options: 'i' }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        category,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category'
    });
  }
};

// Create product (admin)
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Process uploaded images
    if (req.files && req.files.length > 0) {
      const gallery = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const uploadResult = await uploadImage(
            file.buffer,
            {
              folder: 'nissal/products',
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            }
          );
          
          gallery.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            alt: productData.title || 'Product image',
            isMain: i === 0
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
      
      productData.gallery = gallery;
    }

    // Parse JSON fields if they come as strings
    if (typeof productData.measurements === 'string') {
      productData.measurements = JSON.parse(productData.measurements);
    }
    if (typeof productData.catalog === 'string') {
      productData.catalog = JSON.parse(productData.catalog);
    }
    if (typeof productData.colors === 'string') {
      productData.colors = JSON.parse(productData.colors);
    }
    if (typeof productData.sizes === 'string') {
      productData.sizes = JSON.parse(productData.sizes);
    }
    if (typeof productData.price === 'string') {
      productData.price = JSON.parse(productData.price);
    }
    if (typeof productData.availability === 'string') {
      productData.availability = JSON.parse(productData.availability);
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update product (admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Process new uploaded images
    if (req.files && req.files.length > 0) {
      const newGallery = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const uploadResult = await uploadImage(
            file.buffer,
            {
              folder: 'nissal/products',
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            }
          );
          
          newGallery.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            alt: updateData.title || product.title,
            isMain: i === 0 && (!product.gallery || product.gallery.length === 0)
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
      
      // Combine existing and new images
      updateData.gallery = [...(product.gallery || []), ...newGallery];
    }

    // Parse JSON fields if they come as strings
    if (typeof updateData.measurements === 'string') {
      updateData.measurements = JSON.parse(updateData.measurements);
    }
    if (typeof updateData.catalog === 'string') {
      updateData.catalog = JSON.parse(updateData.catalog);
    }
    if (typeof updateData.colors === 'string') {
      updateData.colors = JSON.parse(updateData.colors);
    }
    if (typeof updateData.sizes === 'string') {
      updateData.sizes = JSON.parse(updateData.sizes);
    }
    if (typeof updateData.price === 'string') {
      updateData.price = JSON.parse(updateData.price);
    }
    if (typeof updateData.availability === 'string') {
      updateData.availability = JSON.parse(updateData.availability);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Delete product (admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.gallery && product.gallery.length > 0) {
      const publicIds = product.gallery.map(img => img.publicId).filter(Boolean);
      if (publicIds.length > 0) {
        try {
          await deleteMultipleImages(publicIds);
        } catch (deleteError) {
          console.error('Images deletion error:', deleteError);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// Upload catalog PDF for product (admin)
const uploadCatalogPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided'
      });
    }

    // Delete existing catalog PDF if exists
    if (product.catalogPdf && product.catalogPdf.publicId) {
      try {
        await deleteImage(product.catalogPdf.publicId);
      } catch (deleteError) {
        console.error('Old catalog PDF deletion error:', deleteError);
      }
    }

    // Upload new PDF to Cloudinary
    const uploadResult = await uploadImage(
      req.file.buffer,
      {
        folder: 'nissal/catalogs',
        resource_type: 'raw', // For PDF files
        format: 'pdf'
      }
    );

    // Generate proper PDF URL
    const pdfUrl = getPdfUrl(uploadResult.public_id);
    
    // Update product with catalog PDF info
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        catalogPdf: {
          url: pdfUrl,
          publicId: uploadResult.public_id,
          filename: req.file.originalname,
          uploadedAt: new Date()
        }
      },
      { new: true }
    );

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
      message: 'Failed to upload catalog PDF'
    });
  }
};

// Delete catalog PDF for product (admin)
const deleteCatalogPdf = async (req, res) => {
  try {
    const { id } = req.params;

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
      await deleteImage(product.catalogPdf.publicId);
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

    res.json({
      success: true,
      message: 'Catalog PDF deleted successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Delete catalog PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete catalog PDF'
    });
  }
};

// Hide product (admin)
const hideProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isHidden: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product hidden successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Hide product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to hide product'
    });
  }
};

// Show product (admin)
const showProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isHidden: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product shown successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Show product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to show product'
    });
  }
};

// Get all products for admin (including hidden)
const getAllProductsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 12, includeHidden = false } = req.query;
    
    const filter = { isActive: true };
    if (!includeHidden || includeHidden === 'false') {
      filter.$or = [{ isHidden: false }, { isHidden: { $exists: false } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all products for admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Fix existing PDF URLs (one-time utility function)
const fixPdfUrls = async (req, res) => {
  try {
    const products = await Product.find({ 
      'catalogPdf.publicId': { $exists: true },
      'catalogPdf.url': { $exists: true }
    });
    
    let updatedCount = 0;
    
    for (const product of products) {
      if (product.catalogPdf && product.catalogPdf.publicId) {
        const correctedUrl = getPdfUrl(product.catalogPdf.publicId);
        
        await Product.findByIdAndUpdate(product._id, {
          'catalogPdf.url': correctedUrl
        });
        
        updatedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Fixed PDF URLs for ${updatedCount} products`,
      updatedCount
    });
    
  } catch (error) {
    console.error('Fix PDF URLs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix PDF URLs'
    });
  }
};

// Associate image with color (admin)
const associateImageWithColor = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { imageIndex, colorName } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate image index
    if (imageIndex < 0 || imageIndex >= product.gallery.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    // Validate color name (if provided, it should exist in colors array)
    if (colorName && colorName !== '') {
      const colorExists = product.colors.some(color => color.name === colorName);
      if (!colorExists) {
        return res.status(400).json({
          success: false,
          message: 'Color not found in product colors'
        });
      }
    }

    // Update the specific image's color association
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          [`gallery.${imageIndex}.colorAssociation`]: colorName || null
        }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Image-color association updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Associate image with color error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to associate image with color'
    });
  }
};

// Get images by color for a product
const getImagesByColor = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { color } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let filteredImages;
    if (color && color !== '') {
      // Get images associated with the specific color
      filteredImages = product.gallery.filter(img => img.colorAssociation === color);
      
      // If no color-specific images found, fall back to generic images
      if (filteredImages.length === 0) {
        filteredImages = product.gallery.filter(img => !img.colorAssociation);
      }
    } else {
      // Get generic images (no color association)
      filteredImages = product.gallery.filter(img => !img.colorAssociation);
    }

    // If still no images found, return all images as fallback
    if (filteredImages.length === 0) {
      filteredImages = product.gallery;
    }

    res.json({
      success: true,
      data: {
        images: filteredImages,
        color: color,
        hasColorSpecificImages: product.gallery.some(img => img.colorAssociation),
        totalImages: product.gallery.length
      }
    });

  } catch (error) {
    console.error('Get images by color error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get images by color'
    });
  }
};

// Download catalog PDF (proxy endpoint)
const downloadCatalogPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ 
      _id: id, 
      isActive: true, 
      $or: [{ isHidden: false }, { isHidden: { $exists: false } }] 
    });

    if (!product || !product.catalogPdf || !product.catalogPdf.publicId) {
      return res.status(404).json({
        success: false,
        message: 'Catalog PDF not found'
      });
    }

    // Generate download URL with attachment flag
    const downloadUrl = getPdfUrl(product.catalogPdf.publicId, true);
    
    // Return redirect to the download URL
    res.redirect(downloadUrl);

  } catch (error) {
    console.error('Download catalog PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download catalog PDF'
    });
  }
};

// Reorder gallery images (admin)
const reorderGalleryImages = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { imageOrder } = req.body; // array of { imageUrl, newPosition, colorAssociation }

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({
        success: false,
        message: 'imageOrder must be an array'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create new gallery array based on provided order
    const newGallery = [];
    
    // Map existing images by URL for easy lookup
    const imageMap = new Map();
    product.gallery.forEach(img => {
      imageMap.set(img.url, img);
    });

    // Build new gallery in specified order
    imageOrder.forEach((orderItem, index) => {
      const existingImage = imageMap.get(orderItem.imageUrl);
      if (existingImage) {
        newGallery.push({
          ...existingImage.toObject(),
          colorAssociation: orderItem.colorAssociation || existingImage.colorAssociation
        });
      }
    });

    // Update product with new gallery order
    product.gallery = newGallery;
    await product.save();

    res.json({
      success: true,
      message: 'Gallery images reordered successfully',
      data: product
    });

  } catch (error) {
    console.error('Error reordering gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete specific image from gallery (admin)
const deleteImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params; // product id and image index

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate image index
    const index = parseInt(imageIndex);
    if (isNaN(index) || index < 0 || index >= product.gallery.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    // Get the image to delete
    const imageToDelete = product.gallery[index];
    
    // Delete image from Cloudinary if it has a publicId
    if (imageToDelete.publicId) {
      try {
        await deleteResource(imageToDelete.publicId);
      } catch (deleteError) {
        console.error('Cloudinary deletion error:', deleteError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Remove image from gallery array
    product.gallery.splice(index, 1);
    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        deletedImage: imageToDelete,
        remainingImages: product.gallery.length,
        product: product
      }
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
  getAvailableColors,
  getAvailableSizes,
  searchProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadCatalogPdf,
  deleteCatalogPdf,
  hideProduct,
  showProduct,
  getAllProductsForAdmin,
  fixPdfUrls,
  downloadCatalogPdf,
  associateImageWithColor,
  getImagesByColor,
  reorderGalleryImages,
  deleteImage
};