const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
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
router.get('/:id', productController.getProductById);

// Admin routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

router.post('/', upload.array('images', 10), productController.createProduct);
router.put('/:id', upload.array('images', 10), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;