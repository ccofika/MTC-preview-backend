const express = require('express');
const router = express.Router();
const translationService = require('../services/translationService');

// Translate a product
router.post('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { languages = ['en', 'de'] } = req.body;

    const result = await translationService.translateProduct(id, languages);
    
    res.json({
      success: true,
      message: 'Product translated successfully',
      data: result
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Translation failed'
    });
  }
});

// Translate a project
router.post('/project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { languages = ['en', 'de'] } = req.body;

    const result = await translationService.translateProject(id, languages);
    
    res.json({
      success: true,
      message: 'Project translated successfully',
      data: result
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Translation failed'
    });
  }
});

// Translate all products
router.post('/products/all', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const { languages = ['en', 'de'] } = req.body;
    
    const products = await Product.find({});
    const results = [];
    
    for (const product of products) {
      try {
        const result = await translationService.translateProduct(product._id, languages);
        results.push({ productId: product._id, success: true, result });
      } catch (error) {
        results.push({ productId: product._id, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: 'Batch translation completed',
      results
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Batch translation failed'
    });
  }
});

// Translate all projects
router.post('/projects/all', async (req, res) => {
  try {
    const Project = require('../models/Project');
    const { languages = ['en', 'de'] } = req.body;
    
    const projects = await Project.find({});
    const results = [];
    
    for (const project of projects) {
      try {
        const result = await translationService.translateProject(project._id, languages);
        results.push({ projectId: project._id, success: true, result });
      } catch (error) {
        results.push({ projectId: project._id, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: 'Batch translation completed',
      results
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Batch translation failed'
    });
  }
});

module.exports = router;