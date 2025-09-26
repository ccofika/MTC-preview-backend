const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  getFeaturedProjects,
  getAvailableYears,
  searchProjects,
  createProject,
  updateProject,
  deleteProject,
  reorderGalleryImages,
  deleteProjectImage
} = require('../controllers/projectController');

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/years', getAvailableYears);
router.get('/search', searchProjects);
router.get('/:id', getProjectById);

// Protected admin routes
router.post('/', auth, upload.array('images', 25), createProject);
router.put('/:id', auth, upload.array('images', 25), updateProject);
router.put('/:id/reorder-images', auth, reorderGalleryImages);
router.delete('/:id/images/:imageIndex', auth, deleteProjectImage);
router.delete('/:id', auth, deleteProject);

module.exports = router;