const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const pdfController = require('../controllers/pdfController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/colors', productController.getAvailableColors);
router.get('/sizes', productController.getAvailableSizes);
router.get('/search', productController.searchProducts);
router.get('/category', productController.getProductsByCategory);
router.get('/:id/catalog/download', pdfController.downloadCatalogPdf);
router.get('/:id/images/by-color', productController.getImagesByColor);
router.get('/:id', productController.getProductById);

// Admin routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

router.get('/admin/all', productController.getAllProductsForAdmin);
router.post('/', upload.array('images', 10), productController.createProduct);
router.put('/:id', upload.array('images', 10), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Catalog PDF management  
router.post('/:id/catalog', upload.single('catalogPdf'), pdfController.uploadCatalogPdf);
router.delete('/:id/catalog', pdfController.deleteCatalogPdf);

// Hide/Show product management
router.patch('/:id/hide', productController.hideProduct);
router.patch('/:id/show', productController.showProduct);

// Image-Color association management
router.patch('/:id/images/associate-color', productController.associateImageWithColor);

// Image-Category association management
router.patch('/:id/images/associate-category', productController.associateImageWithCategory);

// Image reordering management
router.patch('/:id/images/reorder', productController.reorderGalleryImages);

// Delete specific image from gallery
router.delete('/:id/images/:imageIndex', productController.deleteImage);

// Utility endpoint to fix existing PDF URLs
router.post('/fix-pdf-urls', productController.fixPdfUrls);

module.exports = router;