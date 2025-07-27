const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  getFeaturedProjects,
  getCategories,
  getAvailableYears,
  searchProjects,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/categories', getCategories);
router.get('/years', getAvailableYears);
router.get('/search', searchProjects);
router.get('/category', getProjectsByCategory);
router.get('/:id', getProjectById);

// Protected admin routes
router.post('/', auth, upload.array('images', 10), createProject);
router.put('/:id', auth, upload.array('images', 10), updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;